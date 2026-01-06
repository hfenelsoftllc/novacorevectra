#!/bin/bash

# Rollback Deployment Script
# This script handles rolling back to a previous deployment version

set -euo pipefail

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

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

# Function to validate rollback target
validate_rollback_target() {
    local bucket_name="$1"
    local target_version="$2"
    
    log "Validating rollback target version: $target_version"
    
    # Check if deployment metadata exists
    local metadata_key="deployments/$target_version/metadata.json"
    if ! aws s3 ls "s3://$bucket_name/$metadata_key" >/dev/null 2>&1; then
        log "ERROR: Deployment metadata not found for version: $target_version"
        log "Available deployments:"
        .github/scripts/deployment-versioning.sh list "$bucket_name" "$ENVIRONMENT" 10
        return 1
    fi
    
    # Get deployment info
    local deployment_info
    deployment_info=$(.github/scripts/deployment-versioning.sh info "$bucket_name" "$target_version")
    
    local deployment_status
    deployment_status=$(echo "$deployment_info" | jq -r '.status')
    
    if [[ "$deployment_status" != "success" ]]; then
        log "WARNING: Target deployment status is '$deployment_status', not 'success'"
        log "Deployment info:"
        echo "$deployment_info" | jq '.'
        
        read -p "Do you want to continue with rollback to this version? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Rollback cancelled by user"
            return 1
        fi
    fi
    
    log "Rollback target validation completed"
    return 0
}

# Function to backup current deployment
backup_current_deployment() {
    local bucket_name="$1"
    local environment="$2"
    
    log "Creating backup of current deployment..."
    
    # Get current deployment info
    local current_deployment
    if current_deployment=$(.github/scripts/deployment-versioning.sh latest "$bucket_name" "$environment" 2>/dev/null); then
        local current_version
        current_version=$(echo "$current_deployment" | jq -r '.version')
        
        log "Current deployment version: $current_version"
        
        # Create rollback backup
        local backup_key="deployments/rollback-backups/$environment/$(date +%Y%m%d-%H%M%S)-$current_version/"
        
        log "Creating rollback backup at: $backup_key"
        aws s3 sync "s3://$bucket_name/" "s3://$bucket_name/$backup_key" \
            --exclude "deployments/*" \
            --exclude "*.log" \
            --quiet
        
        # Store backup metadata
        local backup_metadata=$(echo "$current_deployment" | jq --arg backup_key "$backup_key" \
            '. + {backupKey: $backup_key, backupCreatedAt: (now | strftime("%Y-%m-%dT%H:%M:%SZ"))}')
        
        echo "$backup_metadata" | aws s3 cp - "s3://$bucket_name/${backup_key}backup-metadata.json" \
            --content-type "application/json"
        
        log "Current deployment backed up successfully"
        echo "$current_version"
    else
        log "WARNING: No current deployment found to backup"
        echo ""
    fi
}

# Function to restore deployment from version
restore_deployment() {
    local bucket_name="$1"
    local target_version="$2"
    local cloudfront_id="${3:-}"
    
    log "Restoring deployment from version: $target_version"
    
    # Get deployment artifacts location
    local artifacts_key="deployments/$target_version/"
    
    # Check if artifacts exist
    if ! aws s3 ls "s3://$bucket_name/$artifacts_key" >/dev/null 2>&1; then
        log "ERROR: Deployment artifacts not found at: $artifacts_key"
        return 1
    fi
    
    log "Syncing artifacts from: $artifacts_key"
    
    # Clear current website content (except deployments directory)
    log "Clearing current website content..."
    aws s3 rm "s3://$bucket_name/" --recursive \
        --exclude "deployments/*" \
        --exclude "*.log"
    
    # Restore artifacts from target version
    log "Restoring artifacts from target version..."
    aws s3 sync "s3://$bucket_name/$artifacts_key" "s3://$bucket_name/" \
        --delete \
        --exclude "metadata.json"
    
    # Set proper content types (reuse function from deploy.sh)
    set_content_types "$bucket_name"
    
    log "Deployment artifacts restored successfully"
}

# Function to set content types for specific file extensions (copied from deploy.sh)
set_content_types() {
    local bucket_name="$1"
    
    log "Setting proper content types and headers..."
    
    # Set content type for CSS files
    aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.css" \
        --content-type "text/css" \
        --cache-control "${STATIC_CACHE_CONTROL:-max-age=31536000}" \
        --metadata-directive REPLACE
    
    # Set content type for JS files
    aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.js" \
        --content-type "application/javascript" \
        --cache-control "${STATIC_CACHE_CONTROL:-max-age=31536000}" \
        --metadata-directive REPLACE
    
    # Set content type for JSON files
    aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.json" \
        --content-type "application/json" \
        --cache-control "${API_CACHE_CONTROL:-max-age=300}" \
        --metadata-directive REPLACE
    
    # Set content type for HTML files
    aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
        --recursive \
        --exclude "*" \
        --include "*.html" \
        --content-type "text/html" \
        --cache-control "${HTML_CACHE_CONTROL:-max-age=300}" \
        --metadata-directive REPLACE
    
    # Set content type for image files
    for ext in jpg jpeg png gif ico svg webp; do
        aws s3 cp "s3://$bucket_name/" "s3://$bucket_name/" \
            --recursive \
            --exclude "*" \
            --include "*.$ext" \
            --content-type "image/$ext" \
            --cache-control "${STATIC_CACHE_CONTROL:-max-age=31536000}" \
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
        timeout "${INVALIDATION_TIMEOUT:-600}" aws cloudfront wait invalidation-completed \
            --distribution-id "$distribution_id" \
            --id "$invalidation_id" || {
            log "WARNING: Invalidation wait timed out, but invalidation is still in progress"
        }
        log "CloudFront cache invalidation completed"
    else
        log "Invalidation started for staging environment (not waiting for completion)"
    fi
}

# Function to verify rollback success
verify_rollback() {
    local bucket_name="$1"
    local target_version="$2"
    local cloudfront_domain="${3:-}"
    
    log "Verifying rollback success using comprehensive health checks..."
    
    # Construct URLs for health checking
    local s3_url="http://$bucket_name.s3-website-${AWS_REGION:-us-east-1}.amazonaws.com"
    local cloudfront_url=""
    local custom_domain="${DOMAIN_NAME:-}"
    
    if [[ -n "$cloudfront_domain" ]]; then
        cloudfront_url="https://$cloudfront_domain"
    fi
    
    # Perform comprehensive health check
    local health_results
    if health_results=$(.github/scripts/health-check.sh comprehensive \
                        "$ENVIRONMENT" \
                        "$s3_url" \
                        "$cloudfront_url" \
                        "$custom_domain"); then
        
        log "✅ Rollback health check passed"
        
        # Store health check results
        local health_check_file="/tmp/rollback-health-check-$target_version.json"
        echo "$health_results" > "$health_check_file"
        
        # Upload health check results to S3
        aws s3 cp "$health_check_file" \
            "s3://$bucket_name/deployments/$target_version/rollback-health-check.json" \
            --content-type "application/json" \
            --cache-control "no-cache"
        
        # Return health check results for status update
        echo "$health_results"
        return 0
    else
        log "❌ Rollback health check failed"
        
        # Store failed health check results
        local health_check_file="/tmp/rollback-health-check-failed-$target_version.json"
        echo "$health_results" > "$health_check_file"
        
        # Upload failed health check results to S3
        aws s3 cp "$health_check_file" \
            "s3://$bucket_name/deployments/$target_version/rollback-health-check-failed.json" \
            --content-type "application/json" \
            --cache-control "no-cache"
        
        # Show health check details
        log "Health check details:"
        echo "$health_results" | jq '.'
        
        return 1
    fi
}

# Function to update deployment status after rollback
update_rollback_status() {
    local bucket_name="$1"
    local target_version="$2"
    local previous_version="$3"
    local status="$4"
    local health_checks="${5:-[]}"
    
    log "Updating rollback status..."
    
    # Create rollback record
    local rollback_metadata=$(cat << EOF
{
  "rollbackId": "rollback-$(date +%s)",
  "targetVersion": "$target_version",
  "previousVersion": "$previous_version",
  "status": "$status",
  "timestamp": $(date +%s),
  "timestampISO": "$(date --iso-8601=seconds)",
  "environment": "$ENVIRONMENT",
  "performedBy": "${GITHUB_ACTOR:-manual}",
  "workflowRunId": "${GITHUB_RUN_ID:-unknown}",
  "healthChecks": $health_checks
}
EOF
)
    
    # Store rollback record
    local rollback_key="deployments/rollbacks/$ENVIRONMENT/$(date +%Y/%m)/rollback-$(date +%s).json"
    echo "$rollback_metadata" | aws s3 cp - "s3://$bucket_name/$rollback_key" \
        --content-type "application/json"
    
    # Update target deployment as current if successful
    if [[ "$status" == "success" ]]; then
        .github/scripts/deployment-versioning.sh update-status \
            "$bucket_name" \
            "$target_version" \
            "success" \
            "$health_checks"
    fi
    
    log "Rollback status updated successfully"
}

# Main rollback function
main() {
    local environment="${1:-}"
    local target_version="${2:-}"
    local bucket_name="${3:-}"
    local cloudfront_id="${4:-}"
    local cloudfront_domain="${5:-}"
    local auto_confirm="${6:-false}"
    
    if [[ -z "$environment" || -z "$target_version" ]]; then
        log "ERROR: Environment and target version parameters are required"
        echo "Usage: $0 <environment> <target_version> [bucket_name] [cloudfront_id] [cloudfront_domain] [auto_confirm]"
        echo ""
        echo "Examples:"
        echo "  $0 staging v2024.01.15-staging-abc12345-1705123456"
        echo "  $0 production v2024.01.15-production-def67890-1705123456 my-bucket dist123 d1234567890.cloudfront.net true"
        exit 1
    fi
    
    log "Starting rollback process..."
    log "Environment: $environment"
    log "Target version: $target_version"
    
    # Load environment-specific configuration
    load_environment_config "$environment"
    
    # Use provided bucket name or construct from environment config
    if [[ -z "$bucket_name" ]]; then
        bucket_name="$S3_BUCKET_PREFIX"
    fi
    
    log "Rollback configuration:"
    log "  Environment: $ENVIRONMENT"
    log "  Target Version: $target_version"
    log "  S3 Bucket: $bucket_name"
    log "  CloudFront ID: ${cloudfront_id:-'Not provided'}"
    log "  CloudFront Domain: ${cloudfront_domain:-'Not provided'}"
    
    # Validate rollback target
    if ! validate_rollback_target "$bucket_name" "$target_version"; then
        log "❌ Rollback target validation failed"
        exit 1
    fi
    
    # Confirm rollback unless auto-confirmed
    if [[ "$auto_confirm" != "true" ]]; then
        echo ""
        log "⚠️  WARNING: This will rollback the $environment environment to version $target_version"
        log "Current website content will be replaced with the target version"
        echo ""
        read -p "Are you sure you want to proceed with the rollback? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Rollback cancelled by user"
            exit 0
        fi
    fi
    
    # Backup current deployment
    local previous_version
    previous_version=$(backup_current_deployment "$bucket_name" "$environment")
    
    # Perform rollback
    log "Performing rollback..."
    if restore_deployment "$bucket_name" "$target_version" "$cloudfront_id" && \
       [[ -n "$cloudfront_id" ]] && invalidate_cloudfront "$cloudfront_id"; then
        
        local health_check_results
        if health_check_results=$(verify_rollback "$bucket_name" "$target_version" "$cloudfront_domain"); then
            # Extract health check results for status update
            local health_checks_json
            health_checks_json=$(echo "$health_check_results" | jq '.results')
            
            update_rollback_status "$bucket_name" "$target_version" "$previous_version" "success" "$health_checks_json"
            
            log "🎉 Rollback completed successfully!"
            log "Environment: $environment"
            log "Rolled back to version: $target_version"
            log "Previous version backed up: ${previous_version:-'none'}"
            
            # Export rollback info for use in subsequent steps
            echo "ROLLBACK_VERSION=$target_version" >> "${GITHUB_ENV:-/dev/null}"
            echo "PREVIOUS_VERSION=$previous_version" >> "${GITHUB_ENV:-/dev/null}"
        else
            update_rollback_status "$bucket_name" "$target_version" "$previous_version" "failed" "[]"
            log "❌ Rollback verification failed"
            exit 1
        fi
    else
        update_rollback_status "$bucket_name" "$target_version" "$previous_version" "failed" "[]"
        log "❌ Rollback failed during restoration or cache invalidation"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"