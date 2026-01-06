#!/bin/bash

# Deployment Versioning and Metadata Management Script
# This script handles deployment versioning, tagging, and metadata storage

set -euo pipefail

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to generate deployment version
generate_deployment_version() {
    local environment="$1"
    local commit_sha="$2"
    local timestamp="$3"
    
    # Format: v{YYYY.MM.DD}-{environment}-{short_sha}-{unix_timestamp}
    local short_sha="${commit_sha:0:8}"
    local date_part=$(date -d "@$timestamp" '+%Y.%m.%d')
    local version="v${date_part}-${environment}-${short_sha}-${timestamp}"
    
    echo "$version"
}

# Function to create deployment metadata
create_deployment_metadata() {
    local environment="$1"
    local version="$2"
    local commit_sha="$3"
    local timestamp="$4"
    local bucket_name="$5"
    local artifacts_path="$6"
    local cloudfront_id="${7:-}"
    local status="${8:-pending}"
    
    log "Creating deployment metadata for version: $version"
    
    # Calculate build hash and size
    local build_hash
    build_hash=$(find "$artifacts_path" -type f -exec sha256sum {} \; | sort | sha256sum | cut -d' ' -f1)
    
    local build_size
    build_size=$(du -sb "$artifacts_path" | cut -f1)
    
    # Create metadata JSON
    local metadata_file="/tmp/deployment-metadata-${version}.json"
    cat > "$metadata_file" << EOF
{
  "id": "$version",
  "environment": "$environment",
  "version": "$version",
  "commitSha": "$commit_sha",
  "timestamp": "$timestamp",
  "timestampISO": "$(date -d "@$timestamp" --iso-8601=seconds)",
  "status": "$status",
  "artifacts": {
    "s3Key": "deployments/$version/",
    "buildHash": "$build_hash",
    "size": $build_size
  },
  "infrastructure": {
    "s3Bucket": "$bucket_name",
    "cloudFrontDistributionId": "$cloudfront_id",
    "awsRegion": "${AWS_REGION:-us-east-1}"
  },
  "buildInfo": {
    "nodeVersion": "${NODE_VERSION:-unknown}",
    "gitBranch": "${GITHUB_REF_NAME:-unknown}",
    "gitRepository": "${GITHUB_REPOSITORY:-unknown}",
    "workflowRunId": "${GITHUB_RUN_ID:-unknown}",
    "workflowRunNumber": "${GITHUB_RUN_NUMBER:-unknown}"
  },
  "healthChecks": [],
  "createdAt": "$(date --iso-8601=seconds)",
  "updatedAt": "$(date --iso-8601=seconds)"
}
EOF
    
    echo "$metadata_file"
}

# Function to store deployment metadata in S3
store_deployment_metadata() {
    local bucket_name="$1"
    local metadata_file="$2"
    local version="$3"
    local environment="$4"
    
    log "Storing deployment metadata in S3..."
    
    # Store in multiple locations for easy access
    local metadata_key="deployments/$version/metadata.json"
    local latest_key="deployments/latest-$environment.json"
    local history_key="deployments/history/$environment/$(date +%Y/%m)/$version.json"
    
    # Upload metadata to S3
    aws s3 cp "$metadata_file" "s3://$bucket_name/$metadata_key" \
        --content-type "application/json" \
        --cache-control "no-cache, no-store, must-revalidate"
    
    # Update latest deployment pointer
    aws s3 cp "$metadata_file" "s3://$bucket_name/$latest_key" \
        --content-type "application/json" \
        --cache-control "no-cache, no-store, must-revalidate"
    
    # Store in historical archive
    aws s3 cp "$metadata_file" "s3://$bucket_name/$history_key" \
        --content-type "application/json" \
        --cache-control "max-age=31536000"
    
    log "Deployment metadata stored successfully"
    log "  Metadata key: $metadata_key"
    log "  Latest key: $latest_key"
    log "  History key: $history_key"
}

# Function to tag deployment artifacts in S3
tag_deployment_artifacts() {
    local bucket_name="$1"
    local version="$2"
    local environment="$3"
    local commit_sha="$4"
    local artifacts_path="$5"
    
    log "Tagging deployment artifacts in S3..."
    
    # Create deployment-specific directory
    local deployment_key="deployments/$version/"
    
    # Copy artifacts to versioned location
    aws s3 sync "$artifacts_path" "s3://$bucket_name/$deployment_key" \
        --delete \
        --metadata "deployment-version=$version,environment=$environment,commit-sha=$commit_sha" \
        --metadata-directive REPLACE
    
    # Tag the deployment directory
    aws s3api put-object-tagging \
        --bucket "$bucket_name" \
        --key "$deployment_key" \
        --tagging "TagSet=[
            {Key=DeploymentVersion,Value=$version},
            {Key=Environment,Value=$environment},
            {Key=CommitSha,Value=$commit_sha},
            {Key=CreatedAt,Value=$(date --iso-8601=seconds)},
            {Key=Type,Value=deployment-backup}
        ]" || log "WARNING: Failed to tag deployment directory (may not exist as object)"
    
    log "Deployment artifacts tagged successfully"
}

# Function to update deployment status
update_deployment_status() {
    local bucket_name="$1"
    local version="$2"
    local status="$3"
    local health_check_results="${4:-[]}"
    
    log "Updating deployment status to: $status"
    
    local metadata_key="deployments/$version/metadata.json"
    local temp_file="/tmp/metadata-update-$version.json"
    
    # Download current metadata
    if aws s3 cp "s3://$bucket_name/$metadata_key" "$temp_file" 2>/dev/null; then
        # Update status and health checks
        jq --arg status "$status" \
           --argjson health_checks "$health_check_results" \
           --arg updated_at "$(date --iso-8601=seconds)" \
           '.status = $status | .healthChecks = $health_checks | .updatedAt = $updated_at' \
           "$temp_file" > "${temp_file}.updated"
        
        # Upload updated metadata
        aws s3 cp "${temp_file}.updated" "s3://$bucket_name/$metadata_key" \
            --content-type "application/json" \
            --cache-control "no-cache, no-store, must-revalidate"
        
        # Update latest pointer if successful
        if [[ "$status" == "success" ]]; then
            local environment
            environment=$(jq -r '.environment' "${temp_file}.updated")
            local latest_key="deployments/latest-$environment.json"
            
            aws s3 cp "${temp_file}.updated" "s3://$bucket_name/$latest_key" \
                --content-type "application/json" \
                --cache-control "no-cache, no-store, must-revalidate"
        fi
        
        # Cleanup
        rm -f "$temp_file" "${temp_file}.updated"
        
        log "Deployment status updated successfully"
    else
        log "ERROR: Failed to download deployment metadata for status update"
        return 1
    fi
}

# Function to list recent deployments
list_recent_deployments() {
    local bucket_name="$1"
    local environment="$2"
    local limit="${3:-10}"
    
    log "Listing recent deployments for $environment environment (limit: $limit)..."
    
    # List deployment metadata files
    aws s3 ls "s3://$bucket_name/deployments/history/$environment/" --recursive \
        | grep "\.json$" \
        | sort -k1,2 -r \
        | head -n "$limit" \
        | while read -r line; do
            local s3_key=$(echo "$line" | awk '{print $4}')
            local temp_file="/tmp/deployment-list-$(basename "$s3_key")"
            
            if aws s3 cp "s3://$bucket_name/$s3_key" "$temp_file" 2>/dev/null; then
                local version status timestamp
                version=$(jq -r '.version' "$temp_file")
                status=$(jq -r '.status' "$temp_file")
                timestamp=$(jq -r '.timestampISO' "$temp_file")
                
                echo "  $version | $status | $timestamp"
                rm -f "$temp_file"
            fi
        done
}

# Function to get deployment info
get_deployment_info() {
    local bucket_name="$1"
    local version="$2"
    
    local metadata_key="deployments/$version/metadata.json"
    local temp_file="/tmp/deployment-info-$version.json"
    
    if aws s3 cp "s3://$bucket_name/$metadata_key" "$temp_file" 2>/dev/null; then
        cat "$temp_file"
        rm -f "$temp_file"
        return 0
    else
        log "ERROR: Deployment metadata not found for version: $version"
        return 1
    fi
}

# Function to get latest successful deployment
get_latest_deployment() {
    local bucket_name="$1"
    local environment="$2"
    
    local latest_key="deployments/latest-$environment.json"
    local temp_file="/tmp/latest-deployment-$environment.json"
    
    if aws s3 cp "s3://$bucket_name/$latest_key" "$temp_file" 2>/dev/null; then
        cat "$temp_file"
        rm -f "$temp_file"
        return 0
    else
        log "ERROR: No latest deployment found for environment: $environment"
        return 1
    fi
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        "create")
            local environment="$2"
            local commit_sha="$3"
            local timestamp="$4"
            local bucket_name="$5"
            local artifacts_path="$6"
            local cloudfront_id="${7:-}"
            
            local version
            version=$(generate_deployment_version "$environment" "$commit_sha" "$timestamp")
            
            local metadata_file
            metadata_file=$(create_deployment_metadata "$environment" "$version" "$commit_sha" "$timestamp" "$bucket_name" "$artifacts_path" "$cloudfront_id")
            
            store_deployment_metadata "$bucket_name" "$metadata_file" "$version" "$environment"
            tag_deployment_artifacts "$bucket_name" "$version" "$environment" "$commit_sha" "$artifacts_path"
            
            echo "$version"
            ;;
        
        "update-status")
            local bucket_name="$2"
            local version="$3"
            local status="$4"
            local health_checks="${5:-[]}"
            
            update_deployment_status "$bucket_name" "$version" "$status" "$health_checks"
            ;;
        
        "list")
            local bucket_name="$2"
            local environment="$3"
            local limit="${4:-10}"
            
            list_recent_deployments "$bucket_name" "$environment" "$limit"
            ;;
        
        "info")
            local bucket_name="$2"
            local version="$3"
            
            get_deployment_info "$bucket_name" "$version"
            ;;
        
        "latest")
            local bucket_name="$2"
            local environment="$3"
            
            get_latest_deployment "$bucket_name" "$environment"
            ;;
        
        *)
            echo "Usage: $0 <command> [args...]"
            echo ""
            echo "Commands:"
            echo "  create <env> <commit_sha> <timestamp> <bucket> <artifacts_path> [cloudfront_id]"
            echo "  update-status <bucket> <version> <status> [health_checks_json]"
            echo "  list <bucket> <environment> [limit]"
            echo "  info <bucket> <version>"
            echo "  latest <bucket> <environment>"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"