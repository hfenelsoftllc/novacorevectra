#!/bin/bash

# AWS CI/CD Deployment Script with Comprehensive Logging
# This script handles environment-specific deployment configuration

set -euo pipefail

# Source the comprehensive logging system
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/pipeline-logger.sh"

# Function to load environment configuration
load_environment_config() {
    local env_name="$1"
    local config_file=".github/config/${env_name}.env"
    
    log_step_start "load_environment_config" "deployment" "{\"environment\": \"$env_name\"}"
    
    if [[ ! -f "$config_file" ]]; then
        log_step_failure "load_environment_config" "Environment configuration file not found: $config_file" "deployment"
        exit 1
    fi
    
    log_info "Loading environment configuration for: $env_name" "deployment" "load_environment_config"
    set -a  # automatically export all variables
    source "$config_file"
    set +a
    
    log_step_complete "load_environment_config" "deployment" "unknown" "{\"config_file\": \"$config_file\"}"
}

# Function to validate required environment variables
validate_environment() {
    local required_vars=(
        "ENVIRONMENT"
        "AWS_REGION"
        "DOMAIN_NAME"
        "PROJECT_NAME"
        "S3_BUCKET_PREFIX"
    )
    
    log_step_start "validate_environment" "deployment"
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_step_failure "validate_environment" "Required environment variable $var is not set" "deployment"
            exit 1
        fi
        log_debug "Environment variable $var is set" "deployment" "validate_environment"
    done
    
    log_step_complete "validate_environment" "deployment" "unknown" "{\"validated_vars\": ${#required_vars[@]}}"
}

# Function to sync files to S3 with proper headers
sync_to_s3() {
    local bucket_name="$1"
    local source_dir="$2"
    local start_time=$(date +%s)
    
    log_step_start "sync_to_s3" "deployment" "{\"bucket\": \"$bucket_name\", \"source\": \"$source_dir\"}"
    
    # Count files to be synced
    local total_files
    total_files=$(find "$source_dir" -type f | wc -l)
    log_info "Found $total_files files to sync" "deployment" "sync_to_s3"
    
    # Sync static assets (CSS, JS, images) with long cache
    log_info "Syncing static assets with long cache control" "deployment" "sync_to_s3"
    if ! aws s3 sync "$source_dir" "s3://$bucket_name/" \
        --delete \
        --cache-control "$STATIC_CACHE_CONTROL" \
        --metadata-directive REPLACE \
        --exclude "*.html" \
        --exclude "*.xml" \
        --exclude "*.txt" \
        --exclude "*.json"; then
        log_step_failure "sync_to_s3" "Failed to sync static assets" "deployment"
        return 1
    fi
    
    # Sync HTML files with short cache
    log_info "Syncing HTML files with short cache control" "deployment" "sync_to_s3"
    if ! aws s3 sync "$source_dir" "s3://$bucket_name/" \
        --cache-control "$HTML_CACHE_CONTROL" \
        --content-type "text/html" \
        --metadata-directive REPLACE \
        --include "*.html" \
        --exclude "*"; then
        log_step_failure "sync_to_s3" "Failed to sync HTML files" "deployment"
        return 1
    fi
    
    # Sync API and metadata files
    log_info "Syncing API and metadata files" "deployment" "sync_to_s3"
    if ! aws s3 sync "$source_dir" "s3://$bucket_name/" \
        --cache-control "$API_CACHE_CONTROL" \
        --metadata-directive REPLACE \
        --include "*.xml" \
        --include "*.txt" \
        --include "*.json" \
        --exclude "*"; then
        log_step_failure "sync_to_s3" "Failed to sync API and metadata files" "deployment"
        return 1
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_performance_metric "s3_sync_duration" "$duration" "seconds" "deployment"
    log_performance_metric "files_synced" "$total_files" "count" "deployment"
    
    log_step_complete "sync_to_s3" "deployment" "$duration" "{\"files_synced\": $total_files}"
}

# Function to set content types for specific file extensions
set_content_types() {
    local bucket_name="$1"
    local start_time=$(date +%s)
    
    log_step_start "set_content_types" "deployment" "{\"bucket\": \"$bucket_name\"}"
    
    local file_types=("css" "js" "json" "jpg" "jpeg" "png" "gif" "ico" "svg" "webp")
    local processed_count=0
    
    # Set content type for CSS files
    if aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.css" \
        --content-type "text/css" \
        --cache-control "$STATIC_CACHE_CONTROL" \
        --metadata-directive REPLACE; then
        ((processed_count++))
        log_debug "Set content type for CSS files" "deployment" "set_content_types"
    fi
    
    # Set content type for JS files
    if aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.js" \
        --content-type "application/javascript" \
        --cache-control "$STATIC_CACHE_CONTROL" \
        --metadata-directive REPLACE; then
        ((processed_count++))
        log_debug "Set content type for JS files" "deployment" "set_content_types"
    fi
    
    # Set content type for JSON files
    if aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.json" \
        --content-type "application/json" \
        --cache-control "$API_CACHE_CONTROL" \
        --metadata-directive REPLACE; then
        ((processed_count++))
        log_debug "Set content type for JSON files" "deployment" "set_content_types"
    fi
    
    # Set content type for image files
    for ext in jpg jpeg png gif ico svg webp; do
        if aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
            --recursive \
            --exclude "*" \
            --include "*.$ext" \
            --content-type "image/$ext" \
            --cache-control "$STATIC_CACHE_CONTROL" \
            --metadata-directive REPLACE 2>/dev/null; then
            ((processed_count++))
            log_debug "Set content type for $ext files" "deployment" "set_content_types"
        fi
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_performance_metric "content_type_setting_duration" "$duration" "seconds" "deployment"
    log_performance_metric "file_types_processed" "$processed_count" "count" "deployment"
    
    log_step_complete "set_content_types" "deployment" "$duration" "{\"file_types_processed\": $processed_count}"
}

# Function to invalidate CloudFront cache
invalidate_cloudfront() {
    local distribution_id="$1"
    local start_time=$(date +%s)
    
    if [[ -z "$distribution_id" ]]; then
        log_warn "No CloudFront distribution ID provided, skipping invalidation" "deployment" "invalidate_cloudfront"
        return 0
    fi
    
    log_step_start "invalidate_cloudfront" "deployment" "{\"distribution_id\": \"$distribution_id\"}"
    
    local invalidation_id
    if ! invalidation_id=$(aws cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text); then
        log_step_failure "invalidate_cloudfront" "Failed to create CloudFront invalidation" "deployment"
        return 1
    fi
    
    log_info "CloudFront invalidation created with ID: $invalidation_id" "deployment" "invalidate_cloudfront"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "Waiting for invalidation to complete (production environment)" "deployment" "invalidate_cloudfront"
        if timeout "$INVALIDATION_TIMEOUT" aws cloudfront wait invalidation-completed \
            --distribution-id "$distribution_id" \
            --id "$invalidation_id"; then
            log_info "CloudFront cache invalidation completed" "deployment" "invalidate_cloudfront"
        else
            log_warn "Invalidation wait timed out, but invalidation is still in progress" "deployment" "invalidate_cloudfront"
        fi
    else
        log_info "Invalidation started for staging environment (not waiting for completion)" "deployment" "invalidate_cloudfront"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_performance_metric "cloudfront_invalidation_duration" "$duration" "seconds" "deployment"
    
    log_step_complete "invalidate_cloudfront" "deployment" "$duration" "{\"invalidation_id\": \"$invalidation_id\"}"
}

# Function to verify deployment
verify_deployment() {
    local bucket_name="$1"
    local cloudfront_domain="${2:-}"
    local start_time=$(date +%s)
    
    log_step_start "verify_deployment" "deployment" "{\"bucket\": \"$bucket_name\", \"cloudfront_domain\": \"$cloudfront_domain\"}"
    
    # Test S3 website endpoint
    local s3_url="http://$bucket_name.s3-website-$AWS_REGION.amazonaws.com"
    log_info "Testing S3 website endpoint: $s3_url" "deployment" "verify_deployment"
    
    local http_status
    local response_time
    local start_request=$(date +%s%3N)
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "$s3_url" || echo "000")
    local end_request=$(date +%s%3N)
    response_time=$((end_request - start_request))
    
    log_performance_metric "s3_response_time" "$response_time" "milliseconds" "deployment"
    
    if [[ "$http_status" == "200" ]]; then
        log_info "✅ S3 website endpoint is accessible (HTTP $http_status)" "deployment" "verify_deployment"
    else
        log_step_failure "verify_deployment" "S3 website endpoint verification failed (HTTP $http_status)" "deployment"
        return 1
    fi
    
    # Test CloudFront domain if provided
    if [[ -n "$cloudfront_domain" ]]; then
        local cf_url="https://$cloudfront_domain"
        log_info "Testing CloudFront domain: $cf_url" "deployment" "verify_deployment"
        
        start_request=$(date +%s%3N)
        http_status=$(curl -s -o /dev/null -w "%{http_code}" "$cf_url" || echo "000")
        end_request=$(date +%s%3N)
        response_time=$((end_request - start_request))
        
        log_performance_metric "cloudfront_response_time" "$response_time" "milliseconds" "deployment"
        
        if [[ "$http_status" == "200" ]]; then
            log_info "✅ CloudFront domain is accessible (HTTP $http_status)" "deployment" "verify_deployment"
        else
            log_warn "⚠️  CloudFront domain verification failed (HTTP $http_status) - may need time to propagate" "deployment" "verify_deployment"
        fi
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_step_complete "verify_deployment" "deployment" "$duration"
}

# Main deployment function
main() {
    local environment="${1:-}"
    local artifacts_dir="${2:-./artifacts/out}"
    local bucket_name="${3:-}"
    local cloudfront_id="${4:-}"
    local cloudfront_domain="${5:-}"
    local start_time=$(date +%s)
    
    if [[ -z "$environment" ]]; then
        log_error "Environment parameter is required" "deployment" "main"
        echo "Usage: $0 <environment> [artifacts_dir] [bucket_name] [cloudfront_id] [cloudfront_domain]"
        exit 1
    fi
    
    log_deployment_event "deployment_started" "started" "$environment" "unknown" "{\"artifacts_dir\": \"$artifacts_dir\"}"
    
    # Load environment-specific configuration
    load_environment_config "$environment"
    
    # Validate environment
    validate_environment
    
    # Use provided bucket name or construct from environment config
    if [[ -z "$bucket_name" ]]; then
        bucket_name="$S3_BUCKET_PREFIX"
    fi
    
    # Verify artifacts directory exists
    if [[ ! -d "$artifacts_dir" ]]; then
        log_step_failure "main" "Artifacts directory not found: $artifacts_dir" "deployment"
        exit 1
    fi
    
    # Create deployment version and metadata
    local commit_sha="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
    local timestamp=$(date +%s)
    
    log_info "Creating deployment version and metadata" "deployment" "main"
    local deployment_version
    deployment_version=$(.github/scripts/deployment-versioning.sh create \
        "$environment" \
        "$commit_sha" \
        "$timestamp" \
        "$bucket_name" \
        "$artifacts_dir" \
        "$cloudfront_id")
    
    log_info "Deployment version created: $deployment_version" "deployment" "main"
    
    local deployment_config
    deployment_config=$(cat <<EOF
{
    "environment": "$ENVIRONMENT",
    "version": "$deployment_version",
    "commit_sha": "$commit_sha",
    "aws_region": "$AWS_REGION",
    "s3_bucket": "$bucket_name",
    "artifacts_dir": "$artifacts_dir",
    "cloudfront_id": "${cloudfront_id:-null}",
    "cloudfront_domain": "${cloudfront_domain:-null}"
}
EOF
    )
    
    log_info "Deployment configuration loaded" "deployment" "main" "$deployment_config"
    
    # Update deployment status to in-progress
    .github/scripts/deployment-versioning.sh update-status \
        "$bucket_name" \
        "$deployment_version" \
        "in-progress"
    
    log_deployment_event "deployment_in_progress" "in_progress" "$environment" "$deployment_version"
    
    # Perform deployment steps
    if sync_to_s3 "$bucket_name" "$artifacts_dir" && \
       set_content_types "$bucket_name"; then
        
        if [[ -n "$cloudfront_id" ]]; then
            invalidate_cloudfront "$cloudfront_id"
        fi
        
        if verify_deployment "$bucket_name" "$cloudfront_domain"; then
            # Update deployment status to success
            .github/scripts/deployment-versioning.sh update-status \
                "$bucket_name" \
                "$deployment_version" \
                "success"
            
            local end_time=$(date +%s)
            local total_duration=$((end_time - start_time))
            
            log_performance_metric "total_deployment_duration" "$total_duration" "seconds" "deployment"
            log_deployment_event "deployment_completed" "success" "$environment" "$deployment_version" "{\"duration_seconds\": $total_duration}"
            
            log_info "🎉 Deployment completed successfully for $environment environment!" "deployment" "main"
            log_info "Deployment version: $deployment_version" "deployment" "main"
            
            # Export deployment version for use in subsequent steps
            echo "DEPLOYMENT_VERSION=$deployment_version" >> "${GITHUB_ENV:-/dev/null}"
        else
            # Update deployment status to failed
            .github/scripts/deployment-versioning.sh update-status \
                "$bucket_name" \
                "$deployment_version" \
                "failed"
            
            log_deployment_event "deployment_failed" "failed" "$environment" "$deployment_version" "{\"reason\": \"verification_failed\"}"
            log_error "❌ Deployment verification failed" "deployment" "main"
            exit 1
        fi
    else
        # Update deployment status to failed
        .github/scripts/deployment-versioning.sh update-status \
            "$bucket_name" \
            "$deployment_version" \
            "failed"
        
        log_deployment_event "deployment_failed" "failed" "$environment" "$deployment_version" "{\"reason\": \"sync_or_content_type_failed\"}"
        log_error "❌ Deployment failed during S3 sync or content type setting" "deployment" "main"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"

# Function to load environment configuration
load_environment_config() {
    local env_name="$1"
    local config_file=".github/config/${env_name}.env"
    
    if [[ ! -f "$config_file" ]]; then
        log "ERROR: Environment configuration file not found: $config_file"
        exit 1
    fi
    
    log "Loading environment configuration for: $env_name"
    set -a  # automatically export all variables
    source "$config_file"
    set +a
    
    log "Environment configuration loaded successfully"
}

# Function to validate required environment variables
validate_environment() {
    local required_vars=(
        "ENVIRONMENT"
        "AWS_REGION"
        "DOMAIN_NAME"
        "PROJECT_NAME"
        "S3_BUCKET_PREFIX"
    )
    
    log "Validating required environment variables..."
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log "ERROR: Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log "All required environment variables are set"
}

# Function to sync files to S3 with proper headers
sync_to_s3() {
    local bucket_name="$1"
    local source_dir="$2"
    
    log "Starting S3 sync to bucket: $bucket_name"
    
    # Sync static assets (CSS, JS, images) with long cache
    log "Syncing static assets with long cache control..."
    aws s3 sync "$source_dir" "s3://$bucket_name/" \
        --delete \
        --cache-control "$STATIC_CACHE_CONTROL" \
        --metadata-directive REPLACE \
        --exclude "*.html" \
        --exclude "*.xml" \
        --exclude "*.txt" \
        --exclude "*.json"
    
    # Sync HTML files with short cache
    log "Syncing HTML files with short cache control..."
    aws s3 sync "$source_dir" "s3://$bucket_name/" \
        --cache-control "$HTML_CACHE_CONTROL" \
        --content-type "text/html" \
        --metadata-directive REPLACE \
        --include "*.html" \
        --exclude "*"
    
    # Sync API and metadata files
    log "Syncing API and metadata files..."
    aws s3 sync "$source_dir" "s3://$bucket_name/" \
        --cache-control "$API_CACHE_CONTROL" \
        --metadata-directive REPLACE \
        --include "*.xml" \
        --include "*.txt" \
        --include "*.json" \
        --exclude "*"
    
    log "S3 sync completed successfully"
}

# Function to set content types for specific file extensions
set_content_types() {
    local bucket_name="$1"
    
    log "Setting proper content types and headers..."
    
    # Set content type for CSS files
    aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.css" \
        --content-type "text/css" \
        --cache-control "$STATIC_CACHE_CONTROL" \
        --metadata-directive REPLACE
    
    # Set content type for JS files
    aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.js" \
        --content-type "application/javascript" \
        --cache-control "$STATIC_CACHE_CONTROL" \
        --metadata-directive REPLACE
    
    # Set content type for JSON files
    aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.json" \
        --content-type "application/json" \
        --cache-control "$API_CACHE_CONTROL" \
        --metadata-directive REPLACE
    
    # Set content type for image files
    for ext in jpg jpeg png gif ico svg webp; do
        aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
            --recursive \
            --exclude "*" \
            --include "*.$ext" \
            --content-type "image/$ext" \
            --cache-control "$STATIC_CACHE_CONTROL" \
            --metadata-directive REPLACE || true
    done
    
    log "Content types set successfully"
}

# Function to invalidate CloudFront cache
invalidate_cloudfront() {
    local distribution_id="$1"
    
    if [[ -z "$distribution_id" ]]; then
        log "WARNING: No CloudFront distribution ID provided, skipping invalidation"
        return 0
    fi
    
    log "Creating CloudFront invalidation for distribution: $distribution_id"
    
    local invalidation_id
    invalidation_id=$(aws cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    log "CloudFront invalidation created with ID: $invalidation_id"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Waiting for invalidation to complete (production environment)..."
        timeout "$INVALIDATION_TIMEOUT" aws cloudfront wait invalidation-completed \
            --distribution-id "$distribution_id" \
            --id "$invalidation_id" || {
            log "WARNING: Invalidation wait timed out, but invalidation is still in progress"
        }
        log "CloudFront cache invalidation completed"
    else
        log "Invalidation started for staging environment (not waiting for completion)"
    fi
}

# Function to verify deployment
verify_deployment() {
    local bucket_name="$1"
    local cloudfront_domain="${2:-}"
    
    log "Verifying deployment..."
    
    # Test S3 website endpoint
    local s3_url="http://$bucket_name.s3-website-$AWS_REGION.amazonaws.com"
    log "Testing S3 website endpoint: $s3_url"
    
    local http_status
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "$s3_url" || echo "000")
    
    if [[ "$http_status" == "200" ]]; then
        log "✅ S3 website endpoint is accessible (HTTP $http_status)"
    else
        log "❌ S3 website endpoint verification failed (HTTP $http_status)"
        return 1
    fi
    
    # Test CloudFront domain if provided
    if [[ -n "$cloudfront_domain" ]]; then
        local cf_url="https://$cloudfront_domain"
        log "Testing CloudFront domain: $cf_url"
        
        http_status=$(curl -s -o /dev/null -w "%{http_code}" "$cf_url" || echo "000")
        
        if [[ "$http_status" == "200" ]]; then
            log "✅ CloudFront domain is accessible (HTTP $http_status)"
        else
            log "⚠️  CloudFront domain verification failed (HTTP $http_status) - may need time to propagate"
        fi
    fi
    
    log "Deployment verification completed"
}

# Main deployment function
main() {
    local environment="${1:-}"
    local artifacts_dir="${2:-./artifacts/out}"
    local bucket_name="${3:-}"
    local cloudfront_id="${4:-}"
    local cloudfront_domain="${5:-}"
    
    if [[ -z "$environment" ]]; then
        log "ERROR: Environment parameter is required"
        echo "Usage: $0 <environment> [artifacts_dir] [bucket_name] [cloudfront_id] [cloudfront_domain]"
        exit 1
    fi
    
    log "Starting deployment for environment: $environment"
    
    # Load environment-specific configuration
    load_environment_config "$environment"
    
    # Validate environment
    validate_environment
    
    # Use provided bucket name or construct from environment config
    if [[ -z "$bucket_name" ]]; then
        bucket_name="$S3_BUCKET_PREFIX"
    fi
    
    # Verify artifacts directory exists
    if [[ ! -d "$artifacts_dir" ]]; then
        log "ERROR: Artifacts directory not found: $artifacts_dir"
        exit 1
    fi
    
    # Create deployment version and metadata
    local commit_sha="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
    local timestamp=$(date +%s)
    
    log "Creating deployment version and metadata..."
    local deployment_version
    deployment_version=$(.github/scripts/deployment-versioning.sh create \
        "$environment" \
        "$commit_sha" \
        "$timestamp" \
        "$bucket_name" \
        "$artifacts_dir" \
        "$cloudfront_id")
    
    log "Deployment version created: $deployment_version"
    
    log "Deployment configuration:"
    log "  Environment: $ENVIRONMENT"
    log "  Version: $deployment_version"
    log "  Commit SHA: $commit_sha"
    log "  AWS Region: $AWS_REGION"
    log "  S3 Bucket: $bucket_name"
    log "  Artifacts: $artifacts_dir"
    log "  CloudFront ID: ${cloudfront_id:-'Not provided'}"
    log "  CloudFront Domain: ${cloudfront_domain:-'Not provided'}"
    
    # Update deployment status to in-progress
    .github/scripts/deployment-versioning.sh update-status \
        "$bucket_name" \
        "$deployment_version" \
        "in-progress"
    
    # Perform deployment steps
    if sync_to_s3 "$bucket_name" "$artifacts_dir" && \
       set_content_types "$bucket_name"; then
        
        if [[ -n "$cloudfront_id" ]]; then
            invalidate_cloudfront "$cloudfront_id"
        fi
        
        if verify_deployment "$bucket_name" "$cloudfront_domain"; then
            # Update deployment status to success
            .github/scripts/deployment-versioning.sh update-status \
                "$bucket_name" \
                "$deployment_version" \
                "success"
            
            log "🎉 Deployment completed successfully for $environment environment!"
            log "Deployment version: $deployment_version"
            
            # Export deployment version for use in subsequent steps
            echo "DEPLOYMENT_VERSION=$deployment_version" >> "${GITHUB_ENV:-/dev/null}"
        else
            # Update deployment status to failed
            .github/scripts/deployment-versioning.sh update-status \
                "$bucket_name" \
                "$deployment_version" \
                "failed"
            
            log "❌ Deployment verification failed"
            exit 1
        fi
    else
        # Update deployment status to failed
        .github/scripts/deployment-versioning.sh update-status \
            "$bucket_name" \
            "$deployment_version" \
            "failed"
        
        log "❌ Deployment failed during S3 sync or content type setting"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"