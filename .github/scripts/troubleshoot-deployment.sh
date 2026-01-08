#!/bin/bash

# Deployment Troubleshooting Script
# This script helps diagnose common deployment issues

set -euo pipefail

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >&2
}

# Function to check S3 bucket configuration
check_s3_bucket() {
    local bucket_name="$1"
    
    log "Checking S3 bucket configuration: $bucket_name"
    
    # Check if bucket exists
    if aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        log "✅ S3 bucket exists: $bucket_name"
    else
        log "❌ S3 bucket does not exist or is not accessible: $bucket_name"
        return 1
    fi
    
    # Check bucket contents
    local object_count
    object_count=$(aws s3 ls "s3://$bucket_name/" --recursive | wc -l)
    log "📁 S3 bucket contains $object_count objects"
    
    # Check for index.html
    if aws s3api head-object --bucket "$bucket_name" --key "index.html" >/dev/null 2>&1; then
        log "✅ index.html exists in bucket"
    else
        log "⚠️  index.html not found in bucket"
    fi
    
    # Check bucket policy
    if aws s3api get-bucket-policy --bucket "$bucket_name" >/dev/null 2>&1; then
        log "✅ Bucket policy is configured"
    else
        log "⚠️  No bucket policy found (may be expected for OAC setup)"
    fi
    
    # Check public access block
    local pab_config
    pab_config=$(aws s3api get-public-access-block --bucket "$bucket_name" --query 'PublicAccessBlockConfiguration' --output json 2>/dev/null || echo '{}')
    log "🔒 Public access block configuration: $pab_config"
}

# Function to check CloudFront distribution
check_cloudfront() {
    local distribution_id="$1"
    local cloudfront_domain="$2"
    
    log "Checking CloudFront distribution: $distribution_id"
    
    # Check distribution status
    local status
    status=$(aws cloudfront get-distribution --id "$distribution_id" --query 'Distribution.Status' --output text 2>/dev/null || echo "NOT_FOUND")
    log "📡 CloudFront distribution status: $status"
    
    if [[ "$status" == "Deployed" ]]; then
        log "✅ CloudFront distribution is deployed"
    elif [[ "$status" == "InProgress" ]]; then
        log "⏳ CloudFront distribution deployment is in progress"
    else
        log "❌ CloudFront distribution issue: $status"
        return 1
    fi
    
    # Test CloudFront domain
    if [[ -n "$cloudfront_domain" ]]; then
        log "Testing CloudFront domain: https://$cloudfront_domain"
        local http_status
        http_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$cloudfront_domain" || echo "000")
        
        if [[ "$http_status" == "200" ]]; then
            log "✅ CloudFront domain is accessible (HTTP $http_status)"
        else
            log "⚠️  CloudFront domain returned HTTP $http_status"
        fi
    fi
}

# Function to check deployment metadata
check_deployment_metadata() {
    local bucket_name="$1"
    local version="$2"
    
    log "Checking deployment metadata for version: $version"
    
    local metadata_key="deployments/$version/metadata.json"
    
    if aws s3api head-object --bucket "$bucket_name" --key "$metadata_key" >/dev/null 2>&1; then
        log "✅ Deployment metadata exists: s3://$bucket_name/$metadata_key"
        
        # Download and show metadata
        local temp_file="/tmp/metadata-check-$version.json"
        if aws s3 cp "s3://$bucket_name/$metadata_key" "$temp_file" 2>/dev/null; then
            local status
            status=$(jq -r '.status' "$temp_file" 2>/dev/null || echo "unknown")
            log "📊 Deployment status: $status"
            rm -f "$temp_file"
        fi
    else
        log "❌ Deployment metadata not found: s3://$bucket_name/$metadata_key"
    fi
}

# Main troubleshooting function
main() {
    local bucket_name="${1:-}"
    local distribution_id="${2:-}"
    local cloudfront_domain="${3:-}"
    local version="${4:-}"
    
    if [[ -z "$bucket_name" ]]; then
        echo "Usage: $0 <bucket_name> [distribution_id] [cloudfront_domain] [version]"
        echo ""
        echo "Examples:"
        echo "  $0 my-website-bucket"
        echo "  $0 my-website-bucket E1234567890ABC d1234567890abc.cloudfront.net"
        echo "  $0 my-website-bucket E1234567890ABC d1234567890abc.cloudfront.net v2026.01.08-production-12345678-1234567890"
        exit 1
    fi
    
    log "🔍 Starting deployment troubleshooting..."
    log "Bucket: $bucket_name"
    log "Distribution ID: ${distribution_id:-'Not provided'}"
    log "CloudFront Domain: ${cloudfront_domain:-'Not provided'}"
    log "Version: ${version:-'Not provided'}"
    log ""
    
    # Check S3 bucket
    if ! check_s3_bucket "$bucket_name"; then
        log "❌ S3 bucket check failed"
        exit 1
    fi
    
    log ""
    
    # Check CloudFront if provided
    if [[ -n "$distribution_id" ]]; then
        if ! check_cloudfront "$distribution_id" "$cloudfront_domain"; then
            log "❌ CloudFront check failed"
        fi
    else
        log "⏭️  Skipping CloudFront check (no distribution ID provided)"
    fi
    
    log ""
    
    # Check deployment metadata if version provided
    if [[ -n "$version" ]]; then
        check_deployment_metadata "$bucket_name" "$version"
    else
        log "⏭️  Skipping deployment metadata check (no version provided)"
    fi
    
    log ""
    log "🎯 Troubleshooting completed!"
    
    # Common issues and solutions
    log ""
    log "💡 Common Issues and Solutions:"
    log "   • HTTP 403 on S3 website endpoint: Expected with OAC setup, use CloudFront instead"
    log "   • CloudFront returns 403/404: Wait for propagation (up to 15 minutes)"
    log "   • Deployment metadata missing: Check if deployment completed successfully"
    log "   • Objects not in S3: Check if build artifacts were uploaded correctly"
}

# Run main function with all arguments
main "$@"