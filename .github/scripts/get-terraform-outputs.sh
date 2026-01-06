#!/bin/bash

# Script to get Terraform outputs and make them available to GitHub Actions
# Usage: ./get-terraform-outputs.sh

set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Main function
main() {
    local terraform_dir="${1:-terraform}"
    
    if [ ! -d "$terraform_dir" ]; then
        log "ERROR: Terraform directory not found: $terraform_dir"
        exit 1
    fi
    
    cd "$terraform_dir"
    
    log "Getting Terraform outputs..."
    
    # Get all outputs in JSON format
    terraform output -json > ../terraform_outputs.json
    
    if [ $? -eq 0 ]; then
        log "Terraform outputs saved to terraform_outputs.json"
        
        # Extract key outputs and set as GitHub Actions environment variables
        if command -v jq &> /dev/null; then
            # SNS Topic ARNs
            local sns_topic_arn
            sns_topic_arn=$(jq -r '.sns_topic_arn.value // empty' ../terraform_outputs.json)
            if [ -n "$sns_topic_arn" ]; then
                echo "SNS_TOPIC_ARN=$sns_topic_arn" >> "$GITHUB_ENV"
                log "Set SNS_TOPIC_ARN environment variable"
            fi
            
            local pipeline_events_topic_arn
            pipeline_events_topic_arn=$(jq -r '.pipeline_events_topic_arn.value // empty' ../terraform_outputs.json)
            if [ -n "$pipeline_events_topic_arn" ]; then
                echo "PIPELINE_EVENTS_TOPIC_ARN=$pipeline_events_topic_arn" >> "$GITHUB_ENV"
                log "Set PIPELINE_EVENTS_TOPIC_ARN environment variable"
            fi
            
            # CloudWatch Log Group
            local log_group_name
            log_group_name=$(jq -r '.cloudwatch_log_group_name.value // empty' ../terraform_outputs.json)
            if [ -n "$log_group_name" ]; then
                echo "CLOUDWATCH_LOG_GROUP_NAME=$log_group_name" >> "$GITHUB_ENV"
                log "Set CLOUDWATCH_LOG_GROUP_NAME environment variable"
            fi
            
            # Dashboard URL
            local dashboard_url
            dashboard_url=$(jq -r '.cloudwatch_dashboard_url.value // empty' ../terraform_outputs.json)
            if [ -n "$dashboard_url" ]; then
                echo "CLOUDWATCH_DASHBOARD_URL=$dashboard_url" >> "$GITHUB_ENV"
                log "Set CLOUDWATCH_DASHBOARD_URL environment variable"
            fi
            
            log "Terraform outputs processed successfully"
        else
            log "WARNING: jq not available, skipping environment variable extraction"
        fi
    else
        log "ERROR: Failed to get Terraform outputs"
        exit 1
    fi
    
    cd ..
}

# Run main function
main "$@"