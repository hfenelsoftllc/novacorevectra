#!/bin/bash

# Fix Common Deployment Issues Script
# This script provides automated fixes for common deployment problems

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
    esac
}

# Function to fix artifact structure
fix_artifact_structure() {
    local artifacts_dir="${1:-./artifacts}"
    
    print_status "INFO" "Fixing artifact structure in: $artifacts_dir"
    
    # Check if artifacts were downloaded to wrong location
    if [[ -d "$artifacts_dir" && ! -d "$artifacts_dir/out" ]]; then
        # Check if files are directly in artifacts directory
        if [[ -f "$artifacts_dir/index.html" ]]; then
            print_status "INFO" "Files found directly in artifacts directory, creating out subdirectory"
            mkdir -p "$artifacts_dir/out"
            mv "$artifacts_dir"/*.html "$artifacts_dir/out/" 2>/dev/null || true
            mv "$artifacts_dir"/*.txt "$artifacts_dir/out/" 2>/dev/null || true
            mv "$artifacts_dir"/*.xml "$artifacts_dir/out/" 2>/dev/null || true
            mv "$artifacts_dir"/_next "$artifacts_dir/out/" 2>/dev/null || true
            print_status "SUCCESS" "Artifact structure fixed"
        else
            print_status "WARNING" "No HTML files found in artifacts directory"
        fi
    elif [[ -d "$artifacts_dir/out" ]]; then
        print_status "SUCCESS" "Artifact structure is correct"
    else
        print_status "ERROR" "Artifacts directory not found: $artifacts_dir"
        return 1
    fi
}

# Function to fix S3 bucket policy
fix_s3_bucket_policy() {
    local bucket_name="$1"
    local cloudfront_distribution_arn="$2"
    
    print_status "INFO" "Fixing S3 bucket policy for: $bucket_name"
    
    # Create bucket policy for CloudFront OAC
    local policy=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${bucket_name}/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "${cloudfront_distribution_arn}"
                }
            }
        }
    ]
}
EOF
    )
    
    # Apply the policy
    if echo "$policy" | aws s3api put-bucket-policy --bucket "$bucket_name" --policy file:///dev/stdin; then
        print_status "SUCCESS" "S3 bucket policy updated"
    else
        print_status "ERROR" "Failed to update S3 bucket policy"
        return 1
    fi
}

# Function to fix public access block settings
fix_public_access_block() {
    local bucket_name="$1"
    
    print_status "INFO" "Fixing public access block settings for: $bucket_name"
    
    # Configure public access block for CloudFront OAC
    if aws s3api put-public-access-block \
        --bucket "$bucket_name" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"; then
        print_status "SUCCESS" "Public access block settings updated"
    else
        print_status "ERROR" "Failed to update public access block settings"
        return 1
    fi
}

# Function to re-upload files with correct content types
fix_s3_content_types() {
    local bucket_name="$1"
    local artifacts_dir="${2:-./artifacts/out}"
    
    print_status "INFO" "Fixing S3 content types for: $bucket_name"
    
    if [[ ! -d "$artifacts_dir" ]]; then
        print_status "ERROR" "Artifacts directory not found: $artifacts_dir"
        return 1
    fi
    
    # Upload HTML files with correct content type
    find "$artifacts_dir" -name "*.html" -type f | while read -r file; do
        local key="${file#$artifacts_dir/}"
        if aws s3 cp "$file" "s3://$bucket_name/$key" \
            --content-type "text/html" \
            --cache-control "public, max-age=3600"; then
            print_status "SUCCESS" "Uploaded $key with correct content type"
        else
            print_status "ERROR" "Failed to upload $key"
        fi
    done
    
    # Upload CSS files with correct content type
    find "$artifacts_dir" -name "*.css" -type f | while read -r file; do
        local key="${file#$artifacts_dir/}"
        if aws s3 cp "$file" "s3://$bucket_name/$key" \
            --content-type "text/css" \
            --cache-control "public, max-age=31536000"; then
            print_status "SUCCESS" "Uploaded $key with correct content type"
        else
            print_status "ERROR" "Failed to upload $key"
        fi
    done
    
    # Upload JS files with correct content type
    find "$artifacts_dir" -name "*.js" -type f | while read -r file; do
        local key="${file#$artifacts_dir/}"
        if aws s3 cp "$file" "s3://$bucket_name/$key" \
            --content-type "application/javascript" \
            --cache-control "public, max-age=31536000"; then
            print_status "SUCCESS" "Uploaded $key with correct content type"
        else
            print_status "ERROR" "Failed to upload $key"
        fi
    done
}

# Function to create CloudFront invalidation
fix_cloudfront_cache() {
    local distribution_id="$1"
    
    print_status "INFO" "Creating CloudFront invalidation for: $distribution_id"
    
    local invalidation_id
    if invalidation_id=$(aws cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text); then
        print_status "SUCCESS" "CloudFront invalidation created: $invalidation_id"
        print_status "INFO" "Invalidation may take 5-15 minutes to complete"
    else
        print_status "ERROR" "Failed to create CloudFront invalidation"
        return 1
    fi
}

# Function to verify deployment after fixes
verify_deployment_after_fixes() {
    local bucket_name="$1"
    local cloudfront_domain="$2"
    
    print_status "INFO" "Verifying deployment after fixes..."
    
    # Wait a moment for changes to propagate
    sleep 5
    
    # Check if index.html exists in S3
    if aws s3api head-object --bucket "$bucket_name" --key "index.html" >/dev/null 2>&1; then
        print_status "SUCCESS" "index.html exists in S3"
    else
        print_status "ERROR" "index.html still missing from S3"
        return 1
    fi
    
    # Test CloudFront access
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "https://$cloudfront_domain" || echo "000")
    
    case $http_code in
        200)
            print_status "SUCCESS" "CloudFront domain is accessible (HTTP $http_code)"
            ;;
        403)
            print_status "WARNING" "CloudFront still returns 403 - may need more time to propagate"
            ;;
        404)
            print_status "WARNING" "CloudFront returns 404 - check if invalidation is complete"
            ;;
        *)
            print_status "WARNING" "CloudFront returns HTTP $http_code - may need more time"
            ;;
    esac
}

# Function to run Terraform apply to fix infrastructure
fix_terraform_infrastructure() {
    local terraform_dir="${1:-./terraform}"
    local environment="${2:-staging}"
    
    print_status "INFO" "Fixing Terraform infrastructure in: $terraform_dir"
    
    if [[ ! -d "$terraform_dir" ]]; then
        print_status "ERROR" "Terraform directory not found: $terraform_dir"
        return 1
    fi
    
    cd "$terraform_dir"
    
    # Initialize Terraform if needed
    if [[ ! -f ".terraform.lock.hcl" ]]; then
        print_status "INFO" "Initializing Terraform..."
        if ! terraform init; then
            print_status "ERROR" "Terraform initialization failed"
            cd - >/dev/null
            return 1
        fi
    fi
    
    # Plan and apply changes
    print_status "INFO" "Planning Terraform changes..."
    if terraform plan -var-file="terraform.tfvars.$environment" -out="fix.tfplan"; then
        print_status "SUCCESS" "Terraform plan completed"
        
        print_status "INFO" "Applying Terraform changes..."
        if terraform apply -auto-approve "fix.tfplan"; then
            print_status "SUCCESS" "Terraform apply completed"
        else
            print_status "ERROR" "Terraform apply failed"
            cd - >/dev/null
            return 1
        fi
    else
        print_status "ERROR" "Terraform plan failed"
        cd - >/dev/null
        return 1
    fi
    
    cd - >/dev/null
}

# Main function
main() {
    local action="${1:-all}"
    local bucket_name="${2:-}"
    local cloudfront_id="${3:-}"
    local cloudfront_domain="${4:-}"
    local artifacts_dir="${5:-./artifacts}"
    
    echo "🔧 Deployment Issue Fixes"
    echo "========================="
    echo ""
    
    # Get Terraform outputs if parameters not provided
    if [[ -z "$bucket_name" || -z "$cloudfront_id" ]] && [[ -d "./terraform" ]]; then
        print_status "INFO" "Getting Terraform outputs..."
        cd terraform
        if terraform show >/dev/null 2>&1; then
            local outputs=$(terraform output -json 2>/dev/null || echo '{}')
            bucket_name="${bucket_name:-$(echo "$outputs" | jq -r '.s3_bucket_name.value // "")}"
            cloudfront_id="${cloudfront_id:-$(echo "$outputs" | jq -r '.cloudfront_distribution_id.value // "")}"
            cloudfront_domain="${cloudfront_domain:-$(echo "$outputs" | jq -r '.cloudfront_domain_name.value // "")}"
        fi
        cd - >/dev/null
    fi
    
    case $action in
        "artifacts"|"all")
            fix_artifact_structure "$artifacts_dir"
            echo ""
            ;;
    esac
    
    case $action in
        "s3"|"all")
            if [[ -n "$bucket_name" ]]; then
                # Get CloudFront distribution ARN for bucket policy
                local cf_arn=""
                if [[ -n "$cloudfront_id" ]]; then
                    cf_arn=$(aws cloudfront get-distribution --id "$cloudfront_id" --query 'Distribution.ARN' --output text 2>/dev/null || echo "")
                fi
                
                if [[ -n "$cf_arn" ]]; then
                    fix_s3_bucket_policy "$bucket_name" "$cf_arn"
                fi
                fix_public_access_block "$bucket_name"
                fix_s3_content_types "$bucket_name" "$artifacts_dir/out"
                echo ""
            else
                print_status "WARNING" "S3 bucket name not provided, skipping S3 fixes"
            fi
            ;;
    esac
    
    case $action in
        "cloudfront"|"all")
            if [[ -n "$cloudfront_id" ]]; then
                fix_cloudfront_cache "$cloudfront_id"
                echo ""
            else
                print_status "WARNING" "CloudFront distribution ID not provided, skipping CloudFront fixes"
            fi
            ;;
    esac
    
    case $action in
        "terraform")
            local environment="${6:-staging}"
            fix_terraform_infrastructure "./terraform" "$environment"
            echo ""
            ;;
    esac
    
    case $action in
        "all")
            if [[ -n "$bucket_name" && -n "$cloudfront_domain" ]]; then
                verify_deployment_after_fixes "$bucket_name" "$cloudfront_domain"
            fi
            ;;
    esac
    
    print_status "SUCCESS" "Deployment fixes completed!"
    print_status "INFO" "Wait 5-15 minutes for CloudFront propagation, then test your website"
}

# Show usage if no arguments
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <action> [bucket_name] [cloudfront_id] [cloudfront_domain] [artifacts_dir] [environment]"
    echo ""
    echo "Actions:"
    echo "  all        - Fix all common issues (default)"
    echo "  artifacts  - Fix artifact structure"
    echo "  s3         - Fix S3 bucket policy and content types"
    echo "  cloudfront - Fix CloudFront cache"
    echo "  terraform  - Run terraform apply to fix infrastructure"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 s3 my-bucket-staging cf-dist-id cf-domain.cloudfront.net"
    echo "  $0 terraform ./terraform staging"
    exit 1
fi

# Run main function with all arguments
main "$@"