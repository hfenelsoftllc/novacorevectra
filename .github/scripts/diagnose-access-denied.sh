#!/bin/bash

# Diagnostic script for CloudFront Access Denied issues
set -euo pipefail

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >&2
}

# Function to check S3 bucket contents and permissions
check_s3_bucket() {
    local bucket_name="$1"
    
    log "🔍 Checking S3 bucket: $bucket_name"
    
    # Check if bucket exists and is accessible
    if ! aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        log "❌ Cannot access S3 bucket: $bucket_name"
        return 1
    fi
    
    log "✅ S3 bucket is accessible"
    
    # List bucket contents
    log "📁 Bucket contents:"
    aws s3 ls "s3://$bucket_name/" --recursive | head -20
    
    # Check for index.html specifically
    if aws s3api head-object --bucket "$bucket_name" --key "index.html" >/dev/null 2>&1; then
        log "✅ index.html exists in bucket"
        
        # Get object metadata
        local size
        size=$(aws s3api head-object --bucket "$bucket_name" --key "index.html" --query 'ContentLength' --output text)
        log "📄 index.html size: $size bytes"
        
        # Check if file is empty
        if [[ "$size" == "0" ]]; then
            log "⚠️  WARNING: index.html is empty!"
        fi
    else
        log "❌ index.html NOT found in bucket"
        return 1
    fi
    
    # Check bucket policy
    log "🔒 Checking bucket policy..."
    if aws s3api get-bucket-policy --bucket "$bucket_name" >/dev/null 2>&1; then
        log "✅ Bucket policy exists"
        
        # Show policy (truncated)
        local policy
        policy=$(aws s3api get-bucket-policy --bucket "$bucket_name" --query 'Policy' --output text)
        log "📋 Bucket policy preview:"
        echo "$policy" | jq '.' | head -20
    else
        log "❌ No bucket policy found"
        return 1
    fi
    
    # Check public access block
    log "🚫 Checking public access block..."
    local pab
    pab=$(aws s3api get-public-access-block --bucket "$bucket_name" --query 'PublicAccessBlockConfiguration' --output json 2>/dev/null || echo '{}')
    log "🔒 Public access block: $pab"
    
    # Validate OAC-compatible settings
    local block_policy
    local restrict_buckets
    block_policy=$(echo "$pab" | jq -r '.BlockPublicPolicy // true')
    restrict_buckets=$(echo "$pab" | jq -r '.RestrictPublicBuckets // true')
    
    if [[ "$block_policy" == "true" ]]; then
        log "❌ BlockPublicPolicy is true - this blocks CloudFront OAC access"
    else
        log "✅ BlockPublicPolicy is false - allows CloudFront OAC"
    fi
    
    if [[ "$restrict_buckets" == "true" ]]; then
        log "❌ RestrictPublicBuckets is true - this blocks CloudFront OAC access"
    else
        log "✅ RestrictPublicBuckets is false - allows CloudFront OAC"
    fi
}

# Function to check CloudFront distribution
check_cloudfront() {
    local distribution_id="$1"
    
    log "🌐 Checking CloudFront distribution: $distribution_id"
    
    # Get distribution details
    local dist_info
    if ! dist_info=$(aws cloudfront get-distribution --id "$distribution_id" 2>/dev/null); then
        log "❌ Cannot access CloudFront distribution: $distribution_id"
        return 1
    fi
    
    log "✅ CloudFront distribution is accessible"
    
    # Check distribution status
    local status
    status=$(echo "$dist_info" | jq -r '.Distribution.Status')
    log "📡 Distribution status: $status"
    
    if [[ "$status" != "Deployed" ]]; then
        log "⚠️  Distribution is not fully deployed yet"
    fi
    
    # Check origin configuration
    log "🎯 Checking origin configuration..."
    local origin_domain
    local oac_id
    origin_domain=$(echo "$dist_info" | jq -r '.Distribution.DistributionConfig.Origins.Items[0].DomainName')
    oac_id=$(echo "$dist_info" | jq -r '.Distribution.DistributionConfig.Origins.Items[0].OriginAccessControlId // "none"')
    
    log "📍 Origin domain: $origin_domain"
    log "🔐 OAC ID: $oac_id"
    
    if [[ "$oac_id" == "none" || "$oac_id" == "null" ]]; then
        log "❌ No Origin Access Control configured!"
        return 1
    else
        log "✅ Origin Access Control is configured"
    fi
    
    # Check default root object
    local root_object
    root_object=$(echo "$dist_info" | jq -r '.Distribution.DistributionConfig.DefaultRootObject // "none"')
    log "🏠 Default root object: $root_object"
    
    if [[ "$root_object" != "index.html" ]]; then
        log "⚠️  Default root object is not index.html"
    fi
}

# Function to test CloudFront access
test_cloudfront_access() {
    local cloudfront_domain="$1"
    
    log "🧪 Testing CloudFront access: https://$cloudfront_domain"
    
    # Test root path
    local response
    response=$(curl -s -w "HTTPSTATUS:%{http_code}\nSIZE:%{size_download}\n" "https://$cloudfront_domain/" || echo "HTTPSTATUS:000\nSIZE:0")
    
    local http_code
    local size
    http_code=$(echo "$response" | grep "HTTPSTATUS:" | cut -d: -f2)
    size=$(echo "$response" | grep "SIZE:" | cut -d: -f2)
    
    log "📊 HTTP Status: $http_code"
    log "📏 Response Size: $size bytes"
    
    if [[ "$http_code" == "200" ]]; then
        log "✅ CloudFront is serving content successfully"
    elif [[ "$http_code" == "403" ]]; then
        log "❌ Access Denied (403) - OAC or bucket policy issue"
        
        # Get response body for more details
        local error_body
        error_body=$(curl -s "https://$cloudfront_domain/" | head -5)
        log "🔍 Error response: $error_body"
    elif [[ "$http_code" == "404" ]]; then
        log "❌ Not Found (404) - index.html missing or path issue"
    else
        log "❌ Unexpected HTTP status: $http_code"
    fi
    
    # Test a specific file if it exists
    log "🧪 Testing specific file access..."
    local file_response
    file_response=$(curl -s -w "HTTPSTATUS:%{http_code}\n" "https://$cloudfront_domain/index.html" || echo "HTTPSTATUS:000")
    local file_code
    file_code=$(echo "$file_response" | grep "HTTPSTATUS:" | cut -d: -f2)
    log "📄 index.html HTTP Status: $file_code"
}

# Main diagnostic function
main() {
    local bucket_name="${1:-}"
    local distribution_id="${2:-}"
    local cloudfront_domain="${3:-}"
    
    if [[ -z "$bucket_name" ]]; then
        echo "Usage: $0 <bucket_name> [distribution_id] [cloudfront_domain]"
        echo ""
        echo "Example:"
        echo "  $0 novacorevectra-production E1234567890ABC d1234567890abc.cloudfront.net"
        exit 1
    fi
    
    log "🚀 Starting Access Denied diagnostic..."
    log "Bucket: $bucket_name"
    log "Distribution: ${distribution_id:-'Not provided'}"
    log "Domain: ${cloudfront_domain:-'Not provided'}"
    log ""
    
    # Check S3 bucket
    if ! check_s3_bucket "$bucket_name"; then
        log "❌ S3 bucket check failed - this is likely the root cause"
        exit 1
    fi
    
    log ""
    
    # Check CloudFront if provided
    if [[ -n "$distribution_id" ]]; then
        if ! check_cloudfront "$distribution_id"; then
            log "❌ CloudFront check failed"
        fi
    fi
    
    log ""
    
    # Test access if domain provided
    if [[ -n "$cloudfront_domain" ]]; then
        test_cloudfront_access "$cloudfront_domain"
    fi
    
    log ""
    log "🎯 Diagnostic Summary:"
    log "1. Check if S3 bucket policy allows CloudFront service principal"
    log "2. Verify public access block settings allow bucket policies"
    log "3. Ensure CloudFront OAC is properly configured"
    log "4. Confirm index.html exists and is not empty"
    log "5. Wait for CloudFront deployment to complete"
    
    log ""
    log "🔧 Common fixes:"
    log "• Set BlockPublicPolicy=false and RestrictPublicBuckets=false in S3"
    log "• Ensure bucket policy includes CloudFront service principal"
    log "• Verify OAC is attached to CloudFront origin"
    log "• Re-deploy Terraform configuration if needed"
}

# Run main function with all arguments
main "$@"