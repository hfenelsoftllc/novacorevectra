#!/bin/bash

# Comprehensive Deployment Issue Diagnosis Script
# This script helps diagnose common deployment issues with S3 and CloudFront

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check AWS CLI configuration
check_aws_cli() {
    print_status "INFO" "Checking AWS CLI configuration..."
    
    if ! command_exists aws; then
        print_status "ERROR" "AWS CLI is not installed"
        return 1
    fi
    
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_status "ERROR" "AWS credentials are not configured or invalid"
        return 1
    fi
    
    local identity=$(aws sts get-caller-identity --output json)
    local account_id=$(echo "$identity" | jq -r '.Account')
    local user_arn=$(echo "$identity" | jq -r '.Arn')
    
    print_status "SUCCESS" "AWS CLI is configured"
    print_status "INFO" "Account ID: $account_id"
    print_status "INFO" "User/Role: $user_arn"
}

# Function to check build artifacts
check_build_artifacts() {
    local artifacts_dir="${1:-./artifacts/out}"
    
    print_status "INFO" "Checking build artifacts in: $artifacts_dir"
    
    if [[ ! -d "$artifacts_dir" ]]; then
        print_status "ERROR" "Artifacts directory not found: $artifacts_dir"
        return 1
    fi
    
    local file_count=$(find "$artifacts_dir" -type f | wc -l)
    print_status "INFO" "Found $file_count files in artifacts directory"
    
    # Check for essential files
    local essential_files=("index.html" "404.html" "robots.txt" "sitemap.xml")
    local missing_files=()
    
    for file in "${essential_files[@]}"; do
        if [[ -f "$artifacts_dir/$file" ]]; then
            local size=$(stat -c%s "$artifacts_dir/$file" 2>/dev/null || stat -f%z "$artifacts_dir/$file" 2>/dev/null || echo "unknown")
            print_status "SUCCESS" "$file exists (${size} bytes)"
        else
            missing_files+=("$file")
            print_status "WARNING" "$file is missing"
        fi
    done
    
    # Check for Next.js static assets
    if [[ -d "$artifacts_dir/_next" ]]; then
        local next_files=$(find "$artifacts_dir/_next" -type f | wc -l)
        print_status "SUCCESS" "_next directory exists with $next_files files"
    else
        print_status "WARNING" "_next directory is missing"
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        print_status "WARNING" "Some essential files are missing: ${missing_files[*]}"
    fi
    
    # Show directory structure
    print_status "INFO" "Directory structure:"
    find "$artifacts_dir" -type f | head -20 | while read -r file; do
        echo "  $file"
    done
    
    if [[ $file_count -gt 20 ]]; then
        echo "  ... and $((file_count - 20)) more files"
    fi
}

# Function to check S3 bucket
check_s3_bucket() {
    local bucket_name="$1"
    
    print_status "INFO" "Checking S3 bucket: $bucket_name"
    
    # Check if bucket exists
    if ! aws s3api head-bucket --bucket "$bucket_name" >/dev/null 2>&1; then
        print_status "ERROR" "S3 bucket does not exist or is not accessible: $bucket_name"
        return 1
    fi
    
    print_status "SUCCESS" "S3 bucket exists and is accessible"
    
    # Check bucket region
    local bucket_region=$(aws s3api get-bucket-location --bucket "$bucket_name" --query 'LocationConstraint' --output text)
    if [[ "$bucket_region" == "None" ]]; then
        bucket_region="us-east-1"
    fi
    print_status "INFO" "Bucket region: $bucket_region"
    
    # Check bucket contents
    local object_count=$(aws s3 ls "s3://$bucket_name/" --recursive | wc -l)
    print_status "INFO" "Bucket contains $object_count objects"
    
    # Check for essential files in bucket
    local essential_files=("index.html" "404.html")
    for file in "${essential_files[@]}"; do
        if aws s3api head-object --bucket "$bucket_name" --key "$file" >/dev/null 2>&1; then
            local size=$(aws s3api head-object --bucket "$bucket_name" --key "$file" --query 'ContentLength' --output text)
            local content_type=$(aws s3api head-object --bucket "$bucket_name" --key "$file" --query 'ContentType' --output text)
            print_status "SUCCESS" "$file exists in S3 (${size} bytes, ${content_type})"
        else
            print_status "ERROR" "$file is missing from S3 bucket"
        fi
    done
    
    # Check bucket policy
    print_status "INFO" "Checking bucket policy..."
    if aws s3api get-bucket-policy --bucket "$bucket_name" >/dev/null 2>&1; then
        print_status "SUCCESS" "Bucket policy exists"
        local policy=$(aws s3api get-bucket-policy --bucket "$bucket_name" --query 'Policy' --output text)
        if echo "$policy" | grep -q "cloudfront.amazonaws.com"; then
            print_status "SUCCESS" "Bucket policy allows CloudFront access"
        else
            print_status "WARNING" "Bucket policy may not allow CloudFront access"
        fi
    else
        print_status "WARNING" "No bucket policy found"
    fi
    
    # Check public access block
    print_status "INFO" "Checking public access block settings..."
    local pab=$(aws s3api get-public-access-block --bucket "$bucket_name" --query 'PublicAccessBlockConfiguration' --output json 2>/dev/null || echo '{}')
    local block_public_policy=$(echo "$pab" | jq -r '.BlockPublicPolicy // false')
    local restrict_public_buckets=$(echo "$pab" | jq -r '.RestrictPublicBuckets // false')
    
    if [[ "$block_public_policy" == "false" && "$restrict_public_buckets" == "false" ]]; then
        print_status "SUCCESS" "Public access block configured for CloudFront OAC"
    else
        print_status "WARNING" "Public access block may prevent CloudFront access"
        print_status "INFO" "BlockPublicPolicy: $block_public_policy, RestrictPublicBuckets: $restrict_public_buckets"
    fi
}

# Function to check CloudFront distribution
check_cloudfront_distribution() {
    local distribution_id="$1"
    local domain_name="${2:-}"
    
    print_status "INFO" "Checking CloudFront distribution: $distribution_id"
    
    # Check if distribution exists
    if ! aws cloudfront get-distribution --id "$distribution_id" >/dev/null 2>&1; then
        print_status "ERROR" "CloudFront distribution does not exist or is not accessible: $distribution_id"
        return 1
    fi
    
    print_status "SUCCESS" "CloudFront distribution exists"
    
    # Get distribution details
    local dist_info=$(aws cloudfront get-distribution --id "$distribution_id" --query 'Distribution' --output json)
    local status=$(echo "$dist_info" | jq -r '.Status')
    local domain=$(echo "$dist_info" | jq -r '.DomainName')
    local enabled=$(echo "$dist_info" | jq -r '.DistributionConfig.Enabled')
    
    print_status "INFO" "Distribution status: $status"
    print_status "INFO" "Distribution domain: $domain"
    print_status "INFO" "Distribution enabled: $enabled"
    
    if [[ "$status" == "Deployed" ]]; then
        print_status "SUCCESS" "Distribution is deployed"
    else
        print_status "WARNING" "Distribution is not fully deployed (status: $status)"
    fi
    
    # Check origins
    local origins=$(echo "$dist_info" | jq -r '.DistributionConfig.Origins.Items[0].DomainName')
    print_status "INFO" "Origin domain: $origins"
    
    # Check OAC
    local oac_id=$(echo "$dist_info" | jq -r '.DistributionConfig.Origins.Items[0].OriginAccessControlId // "none"')
    if [[ "$oac_id" != "none" && "$oac_id" != "null" ]]; then
        print_status "SUCCESS" "Origin Access Control is configured: $oac_id"
    else
        print_status "WARNING" "Origin Access Control is not configured"
    fi
    
    # Test CloudFront domain
    if [[ -n "$domain_name" ]]; then
        test_url_access "https://$domain_name" "Custom domain"
    fi
    
    test_url_access "https://$domain" "CloudFront domain"
}

# Function to test URL access
test_url_access() {
    local url="$1"
    local description="$2"
    
    print_status "INFO" "Testing access to $description: $url"
    
    local http_code
    local response_time
    local start_time=$(date +%s%3N)
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$url" 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    case $http_code in
        200)
            print_status "SUCCESS" "$description is accessible (HTTP $http_code, ${response_time}ms)"
            ;;
        403)
            print_status "ERROR" "$description returns 403 Forbidden - check OAC configuration"
            ;;
        404)
            print_status "ERROR" "$description returns 404 Not Found - check if files are uploaded"
            ;;
        000)
            print_status "ERROR" "$description is not reachable - connection timeout"
            ;;
        *)
            print_status "WARNING" "$description returns HTTP $http_code (${response_time}ms)"
            ;;
    esac
}

# Function to check Terraform state
check_terraform_state() {
    local terraform_dir="${1:-./terraform}"
    
    print_status "INFO" "Checking Terraform state in: $terraform_dir"
    
    if [[ ! -d "$terraform_dir" ]]; then
        print_status "WARNING" "Terraform directory not found: $terraform_dir"
        return 0
    fi
    
    cd "$terraform_dir"
    
    if [[ ! -f ".terraform.lock.hcl" ]]; then
        print_status "WARNING" "Terraform not initialized in $terraform_dir"
        return 0
    fi
    
    # Check if terraform state exists
    if terraform show >/dev/null 2>&1; then
        print_status "SUCCESS" "Terraform state is accessible"
        
        # Get outputs
        local outputs=$(terraform output -json 2>/dev/null || echo '{}')
        
        local s3_bucket=$(echo "$outputs" | jq -r '.s3_bucket_name.value // "not_found"')
        local cloudfront_id=$(echo "$outputs" | jq -r '.cloudfront_distribution_id.value // "not_found"')
        local cloudfront_domain=$(echo "$outputs" | jq -r '.cloudfront_domain_name.value // "not_found"')
        
        print_status "INFO" "Terraform outputs:"
        print_status "INFO" "  S3 bucket: $s3_bucket"
        print_status "INFO" "  CloudFront ID: $cloudfront_id"
        print_status "INFO" "  CloudFront domain: $cloudfront_domain"
        
        # Return to original directory
        cd - >/dev/null
        
        # Export for use by other functions
        export TF_S3_BUCKET="$s3_bucket"
        export TF_CLOUDFRONT_ID="$cloudfront_id"
        export TF_CLOUDFRONT_DOMAIN="$cloudfront_domain"
    else
        print_status "WARNING" "Cannot access Terraform state"
        cd - >/dev/null
    fi
}

# Function to provide recommendations
provide_recommendations() {
    print_status "INFO" "Recommendations based on diagnosis:"
    
    echo ""
    echo "🔧 Common fixes:"
    echo "1. If artifacts are missing:"
    echo "   - Check if 'npm run build' completed successfully"
    echo "   - Verify Next.js configuration has 'output: export'"
    echo "   - Ensure GitHub Actions artifact upload/download paths are correct"
    echo ""
    echo "2. If S3 access is denied:"
    echo "   - Run: terraform apply to update bucket policy"
    echo "   - Check if CloudFront OAC is properly configured"
    echo "   - Verify AWS credentials have S3 permissions"
    echo ""
    echo "3. If CloudFront returns 403/404:"
    echo "   - Wait 5-15 minutes for CloudFront propagation"
    echo "   - Create CloudFront invalidation: aws cloudfront create-invalidation --distribution-id <ID> --paths '/*'"
    echo "   - Check if index.html exists in S3 bucket"
    echo ""
    echo "4. If deployment script fails:"
    echo "   - Check AWS credentials and permissions"
    echo "   - Verify environment configuration files exist"
    echo "   - Run deployment script manually with debug output"
    echo ""
    echo "🔍 Debug commands:"
    echo "  aws s3 ls s3://\$BUCKET_NAME/ --recursive"
    echo "  aws cloudfront get-distribution --id \$DISTRIBUTION_ID"
    echo "  curl -I https://\$CLOUDFRONT_DOMAIN"
    echo ""
}

# Main function
main() {
    local artifacts_dir="${1:-./artifacts/out}"
    local bucket_name="${2:-}"
    local cloudfront_id="${3:-}"
    local domain_name="${4:-}"
    
    echo "🔍 Deployment Issue Diagnosis"
    echo "============================="
    echo ""
    
    # Check AWS CLI
    if ! check_aws_cli; then
        print_status "ERROR" "Cannot proceed without valid AWS configuration"
        exit 1
    fi
    
    echo ""
    
    # Check build artifacts
    check_build_artifacts "$artifacts_dir"
    
    echo ""
    
    # Check Terraform state if no parameters provided
    if [[ -z "$bucket_name" || -z "$cloudfront_id" ]]; then
        check_terraform_state
        bucket_name="${bucket_name:-$TF_S3_BUCKET}"
        cloudfront_id="${cloudfront_id:-$TF_CLOUDFRONT_ID}"
        domain_name="${domain_name:-$TF_CLOUDFRONT_DOMAIN}"
    fi
    
    # Check S3 bucket
    if [[ -n "$bucket_name" && "$bucket_name" != "not_found" ]]; then
        echo ""
        check_s3_bucket "$bucket_name"
    else
        print_status "WARNING" "S3 bucket name not provided or found"
    fi
    
    # Check CloudFront distribution
    if [[ -n "$cloudfront_id" && "$cloudfront_id" != "not_found" ]]; then
        echo ""
        check_cloudfront_distribution "$cloudfront_id" "$domain_name"
    else
        print_status "WARNING" "CloudFront distribution ID not provided or found"
    fi
    
    echo ""
    provide_recommendations
}

# Run main function with all arguments
main "$@"