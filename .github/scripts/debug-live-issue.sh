#!/bin/bash

# Live Issue Debug Script - Comprehensive CloudFront Access Denied Troubleshooting
set -euo pipefail

# Function to log messages with timestamp and color
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "\033[0;32m[$timestamp] ℹ️  $message\033[0m" ;;
        "WARN")  echo -e "\033[0;33m[$timestamp] ⚠️  $message\033[0m" ;;
        "ERROR") echo -e "\033[0;31m[$timestamp] ❌ $message\033[0m" ;;
        "SUCCESS") echo -e "\033[0;32m[$timestamp] ✅ $message\033[0m" ;;
        "DEBUG") echo -e "\033[0;36m[$timestamp] 🔍 $message\033[0m" ;;
    esac
}

# Function to check if required tools are available
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log "ERROR" "Missing required tools: ${missing_tools[*]}"
        log "INFO" "Please install: sudo apt-get install awscli curl jq"
        return 1
    fi
    
    log "SUCCESS" "All prerequisites available"
}

# Function to get AWS account info
check_aws_credentials() {
    log "INFO" "Checking AWS credentials..."
    
    local account_id
    if account_id=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null); then
        log "SUCCESS" "AWS credentials valid - Account: $account_id"
        return 0
    else
        log "ERROR" "AWS credentials not configured or invalid"
        log "INFO" "Please run: aws configure"
        return 1
    fi
}

# Function to find resources automatically
discover_resources() {
    log "INFO" "Discovering AWS resources..."
    
    # Find S3 buckets that might be the website bucket
    log "DEBUG" "Looking for website S3 buckets..."
    local buckets
    buckets=$(aws s3api list-buckets --query 'Buckets[?contains(Name, `novacorevectra`) || contains(Name, `website`) || contains(Name, `production`) || contains(Name, `staging`)].Name' --output text 2>/dev/null || echo "")
    
    if [[ -n "$buckets" ]]; then
        log "INFO" "Found potential website buckets:"
        echo "$buckets" | tr '\t' '\n' | while read -r bucket; do
            if [[ -n "$bucket" ]]; then
                log "INFO" "  - $bucket"
            fi
        done
        
        # Use the first bucket as default
        BUCKET_NAME=$(echo "$buckets" | awk '{print $1}')
        log "INFO" "Using bucket: $BUCKET_NAME"
    else
        log "WARN" "No website buckets found automatically"
    fi
    
    # Find CloudFront distributions
    log "DEBUG" "Looking for CloudFront distributions..."
    local distributions
    distributions=$(aws cloudfront list-distributions --query 'DistributionList.Items[?Comment && (contains(Comment, `novacorevectra`) || contains(Comment, `website`) || contains(Comment, `production`) || contains(Comment, `staging`))].{Id:Id,Domain:DomainName,Comment:Comment}' --output json 2>/dev/null || echo "[]")
    
    if [[ "$distributions" != "[]" && "$distributions" != "" ]]; then
        log "INFO" "Found CloudFront distributions:"
        echo "$distributions" | jq -r '.[] | "  - ID: \(.Id), Domain: \(.Domain), Comment: \(.Comment)"'
        
        # Use the first distribution
        DISTRIBUTION_ID=$(echo "$distributions" | jq -r '.[0].Id')
        CLOUDFRONT_DOMAIN=$(echo "$distributions" | jq -r '.[0].Domain')
        log "INFO" "Using distribution: $DISTRIBUTION_ID ($CLOUDFRONT_DOMAIN)"
    else
        log "WARN" "No CloudFront distributions found automatically"
    fi
}

# Function to check S3 bucket in detail
check_s3_bucket_detailed() {
    local bucket_name="$1"
    
    log "INFO" "=== S3 BUCKET ANALYSIS ==="
    log "INFO" "Bucket: $bucket_name"
    
    # Check if bucket exists
    if ! aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        log "ERROR" "Bucket does not exist or is not accessible: $bucket_name"
        return 1
    fi
    
    log "SUCCESS" "Bucket exists and is accessible"
    
    # Check bucket contents
    log "DEBUG" "Checking bucket contents..."
    local object_count
    object_count=$(aws s3 ls "s3://$bucket_name/" --recursive 2>/dev/null | wc -l)
    log "INFO" "Total objects in bucket: $object_count"
    
    if [[ "$object_count" -eq 0 ]]; then
        log "ERROR" "Bucket is empty! No files deployed."
        return 1
    fi
    
    # Check for index.html
    if aws s3api head-object --bucket "$bucket_name" --key "index.html" >/dev/null 2>&1; then
        local size
        size=$(aws s3api head-object --bucket "$bucket_name" --key "index.html" --query 'ContentLength' --output text)
        log "SUCCESS" "index.html exists (size: $size bytes)"
        
        if [[ "$size" -eq 0 ]]; then
            log "ERROR" "index.html is empty!"
        fi
    else
        log "ERROR" "index.html not found in bucket"
        log "INFO" "Available files:"
        aws s3 ls "s3://$bucket_name/" --recursive | head -10
        return 1
    fi
    
    # Check public access block
    log "DEBUG" "Checking public access block settings..."
    local pab
    pab=$(aws s3api get-public-access-block --bucket "$bucket_name" --query 'PublicAccessBlockConfiguration' --output json 2>/dev/null || echo '{}')
    
    local block_policy
    local restrict_buckets
    block_policy=$(echo "$pab" | jq -r '.BlockPublicPolicy // true')
    restrict_buckets=$(echo "$pab" | jq -r '.RestrictPublicBuckets // true')
    
    log "INFO" "Public Access Block Settings:"
    log "INFO" "  BlockPublicPolicy: $block_policy"
    log "INFO" "  RestrictPublicBuckets: $restrict_buckets"
    
    if [[ "$block_policy" == "true" ]]; then
        log "ERROR" "BlockPublicPolicy=true prevents CloudFront OAC access"
        return 1
    fi
    
    if [[ "$restrict_buckets" == "true" ]]; then
        log "ERROR" "RestrictPublicBuckets=true prevents CloudFront OAC access"
        return 1
    fi
    
    log "SUCCESS" "Public access block settings are correct for OAC"
    
    # Check bucket policy
    log "DEBUG" "Checking bucket policy..."
    if aws s3api get-bucket-policy --bucket "$bucket_name" >/dev/null 2>&1; then
        local policy
        policy=$(aws s3api get-bucket-policy --bucket "$bucket_name" --query 'Policy' --output text)
        log "SUCCESS" "Bucket policy exists"
        
        # Check if policy allows CloudFront
        if echo "$policy" | jq -r '.Statement[].Principal.Service' 2>/dev/null | grep -q "cloudfront.amazonaws.com"; then
            log "SUCCESS" "Bucket policy allows CloudFront service principal"
        else
            log "ERROR" "Bucket policy does not allow CloudFront service principal"
            log "DEBUG" "Policy: $policy"
            return 1
        fi
    else
        log "ERROR" "No bucket policy found"
        return 1
    fi
    
    return 0
}

# Function to check CloudFront distribution in detail
check_cloudfront_detailed() {
    local distribution_id="$1"
    local cloudfront_domain="$2"
    
    log "INFO" "=== CLOUDFRONT ANALYSIS ==="
    log "INFO" "Distribution ID: $distribution_id"
    log "INFO" "Domain: $cloudfront_domain"
    
    # Get distribution details
    local dist_info
    if ! dist_info=$(aws cloudfront get-distribution --id "$distribution_id" 2>/dev/null); then
        log "ERROR" "Cannot access CloudFront distribution: $distribution_id"
        return 1
    fi
    
    log "SUCCESS" "CloudFront distribution accessible"
    
    # Check distribution status
    local status
    status=$(echo "$dist_info" | jq -r '.Distribution.Status')
    log "INFO" "Distribution Status: $status"
    
    if [[ "$status" != "Deployed" ]]; then
        log "WARN" "Distribution is not fully deployed (Status: $status)"
        log "INFO" "This may cause access issues. Wait for deployment to complete."
    fi
    
    # Check origin configuration
    log "DEBUG" "Checking origin configuration..."
    local origin_domain
    local oac_id
    origin_domain=$(echo "$dist_info" | jq -r '.Distribution.DistributionConfig.Origins.Items[0].DomainName')
    oac_id=$(echo "$dist_info" | jq -r '.Distribution.DistributionConfig.Origins.Items[0].OriginAccessControlId // "none"')
    
    log "INFO" "Origin Domain: $origin_domain"
    log "INFO" "OAC ID: $oac_id"
    
    if [[ "$oac_id" == "none" || "$oac_id" == "null" ]]; then
        log "ERROR" "No Origin Access Control configured!"
        return 1
    fi
    
    log "SUCCESS" "Origin Access Control is configured"
    
    # Check default root object
    local root_object
    root_object=$(echo "$dist_info" | jq -r '.Distribution.DistributionConfig.DefaultRootObject // "none"')
    log "INFO" "Default Root Object: $root_object"
    
    if [[ "$root_object" != "index.html" ]]; then
        log "WARN" "Default root object is not index.html"
    fi
    
    # Check if origin domain matches bucket
    if [[ -n "$BUCKET_NAME" ]]; then
        local expected_origin="${BUCKET_NAME}.s3.${AWS_REGION:-us-east-1}.amazonaws.com"
        if [[ "$origin_domain" == "$expected_origin" ]]; then
            log "SUCCESS" "Origin domain matches bucket"
        else
            log "WARN" "Origin domain mismatch. Expected: $expected_origin, Got: $origin_domain"
        fi
    fi
    
    return 0
}

# Function to test website access
test_website_access() {
    local cloudfront_domain="$1"
    
    log "INFO" "=== WEBSITE ACCESS TEST ==="
    
    # Test root path
    log "DEBUG" "Testing root path: https://$cloudfront_domain/"
    local response
    response=$(curl -s -w "HTTPSTATUS:%{http_code}\nSIZE:%{size_download}\nTIME:%{time_total}\n" "https://$cloudfront_domain/" 2>/dev/null || echo "HTTPSTATUS:000\nSIZE:0\nTIME:0")
    
    local http_code
    local size
    local time
    http_code=$(echo "$response" | grep "HTTPSTATUS:" | cut -d: -f2)
    size=$(echo "$response" | grep "SIZE:" | cut -d: -f2)
    time=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    
    log "INFO" "Root Path Test Results:"
    log "INFO" "  HTTP Status: $http_code"
    log "INFO" "  Response Size: $size bytes"
    log "INFO" "  Response Time: ${time}s"
    
    if [[ "$http_code" == "200" ]]; then
        log "SUCCESS" "Website is accessible!"
        return 0
    elif [[ "$http_code" == "403" ]]; then
        log "ERROR" "Access Denied (403) - OAC or bucket policy issue"
        
        # Get error details
        local error_body
        error_body=$(curl -s "https://$cloudfront_domain/" 2>/dev/null | head -5)
        log "DEBUG" "Error response body: $error_body"
        
        # Check if it's an S3 error or CloudFront error
        if echo "$error_body" | grep -q "AccessDenied"; then
            log "ERROR" "S3 Access Denied - Check bucket policy and OAC configuration"
        elif echo "$error_body" | grep -q "CloudFront"; then
            log "ERROR" "CloudFront error - Check distribution configuration"
        fi
        
        return 1
    elif [[ "$http_code" == "404" ]]; then
        log "ERROR" "Not Found (404) - Check if index.html exists"
        return 1
    else
        log "ERROR" "Unexpected HTTP status: $http_code"
        return 1
    fi
}

# Function to provide specific fix recommendations
provide_fix_recommendations() {
    log "INFO" "=== FIX RECOMMENDATIONS ==="
    
    if [[ -z "$BUCKET_NAME" ]]; then
        log "ERROR" "Cannot provide specific recommendations without bucket name"
        return 1
    fi
    
    log "INFO" "Based on the analysis, here are the recommended fixes:"
    
    # Check current Terraform state
    if [[ -d "terraform" ]]; then
        log "INFO" "1. Apply Terraform fixes:"
        log "INFO" "   cd terraform"
        log "INFO" "   terraform plan -var-file=terraform.tfvars.production"
        log "INFO" "   terraform apply"
        log "INFO" ""
    fi
    
    log "INFO" "2. Manual AWS CLI fixes (if Terraform not available):"
    log "INFO" "   # Fix public access block"
    log "INFO" "   aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"
    log "INFO" ""
    
    if [[ -n "$DISTRIBUTION_ID" ]]; then
        log "INFO" "3. Verify CloudFront OAC:"
        log "INFO" "   aws cloudfront get-distribution --id $DISTRIBUTION_ID"
        log "INFO" ""
    fi
    
    log "INFO" "4. Wait for propagation (5-15 minutes) then test again"
    log "INFO" ""
    
    log "INFO" "5. Re-run this diagnostic:"
    log "INFO" "   ./.github/scripts/debug-live-issue.sh $BUCKET_NAME $DISTRIBUTION_ID $CLOUDFRONT_DOMAIN"
}

# Main function
main() {
    local bucket_name="${1:-}"
    local distribution_id="${2:-}"
    local cloudfront_domain="${3:-}"
    
    log "INFO" "🚀 CloudFront Access Denied - Live Issue Debug"
    log "INFO" "=============================================="
    
    # Check prerequisites
    if ! check_prerequisites; then
        exit 1
    fi
    
    # Check AWS credentials
    if ! check_aws_credentials; then
        exit 1
    fi
    
    # Set AWS region if not set
    export AWS_REGION="${AWS_REGION:-us-east-1}"
    log "INFO" "Using AWS Region: $AWS_REGION"
    
    # Auto-discover resources if not provided
    if [[ -z "$bucket_name" || -z "$distribution_id" ]]; then
        log "INFO" "Auto-discovering AWS resources..."
        discover_resources
        
        # Use discovered values if parameters not provided
        bucket_name="${bucket_name:-$BUCKET_NAME}"
        distribution_id="${distribution_id:-$DISTRIBUTION_ID}"
        cloudfront_domain="${cloudfront_domain:-$CLOUDFRONT_DOMAIN}"
    fi
    
    # Validate we have required information
    if [[ -z "$bucket_name" ]]; then
        log "ERROR" "Bucket name is required"
        log "INFO" "Usage: $0 <bucket-name> [distribution-id] [cloudfront-domain]"
        log "INFO" "Or run without parameters for auto-discovery"
        exit 1
    fi
    
    log "INFO" "Target Resources:"
    log "INFO" "  Bucket: ${bucket_name:-'Not specified'}"
    log "INFO" "  Distribution: ${distribution_id:-'Not specified'}"
    log "INFO" "  Domain: ${cloudfront_domain:-'Not specified'}"
    log "INFO" ""
    
    # Store for global access
    BUCKET_NAME="$bucket_name"
    DISTRIBUTION_ID="$distribution_id"
    CLOUDFRONT_DOMAIN="$cloudfront_domain"
    
    local overall_success=true
    
    # Check S3 bucket
    if ! check_s3_bucket_detailed "$bucket_name"; then
        overall_success=false
    fi
    
    log "INFO" ""
    
    # Check CloudFront if provided
    if [[ -n "$distribution_id" && -n "$cloudfront_domain" ]]; then
        if ! check_cloudfront_detailed "$distribution_id" "$cloudfront_domain"; then
            overall_success=false
        fi
        
        log "INFO" ""
        
        # Test website access
        if ! test_website_access "$cloudfront_domain"; then
            overall_success=false
        fi
    else
        log "WARN" "CloudFront details not provided, skipping CloudFront tests"
    fi
    
    log "INFO" ""
    
    # Provide recommendations
    provide_fix_recommendations
    
    if [[ "$overall_success" == "true" ]]; then
        log "SUCCESS" "🎉 All checks passed! Website should be accessible."
    else
        log "ERROR" "❌ Issues found. Please apply the recommended fixes."
        exit 1
    fi
}

# Run main function with all arguments
main "$@"