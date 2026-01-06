#!/bin/bash

# Script to send pipeline notifications via SNS
# Usage: ./send-notification.sh <event_type> <status> [additional_data]

set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to send SNS notification
send_sns_notification() {
    local topic_arn="$1"
    local message="$2"
    local subject="$3"
    
    if [ -z "$topic_arn" ]; then
        log "ERROR: SNS topic ARN not provided"
        return 1
    fi
    
    log "Sending SNS notification to topic: $topic_arn"
    
    aws sns publish \
        --topic-arn "$topic_arn" \
        --message "$message" \
        --subject "$subject" \
        --region "${AWS_REGION:-us-east-1}" || {
        log "ERROR: Failed to send SNS notification"
        return 1
    }
    
    log "SNS notification sent successfully"
}

# Main function
main() {
    local event_type="${1:-unknown}"
    local status="${2:-unknown}"
    local environment="${ENVIRONMENT:-unknown}"
    local branch="${GITHUB_REF_NAME:-unknown}"
    local commit_sha="${GITHUB_SHA:-unknown}"
    local commit_message="${COMMIT_MESSAGE:-No commit message}"
    local author="${GITHUB_ACTOR:-Unknown}"
    local workflow_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
    local deployment_version="${DEPLOYMENT_VERSION:-}"
    
    # Get SNS topic ARN from Terraform output
    local sns_topic_arn
    if [ -f "terraform_outputs.json" ]; then
        sns_topic_arn=$(jq -r '.pipeline_events_topic_arn.value' terraform_outputs.json 2>/dev/null || echo "")
    fi
    
    # Fallback to environment variable if Terraform output not available
    if [ -z "$sns_topic_arn" ] || [ "$sns_topic_arn" = "null" ]; then
        sns_topic_arn="${PIPELINE_EVENTS_TOPIC_ARN:-}"
    fi
    
    if [ -z "$sns_topic_arn" ]; then
        log "WARNING: Pipeline events SNS topic ARN not found. Skipping notification."
        return 0
    fi
    
    # Create notification message
    local message
    message=$(cat <<EOF
{
    "event_type": "$event_type",
    "status": "$status",
    "environment": "$environment",
    "branch": "$branch",
    "commit_sha": "$commit_sha",
    "commit_message": "$commit_message",
    "author": "$author",
    "workflow_url": "$workflow_url",
    "deployment_version": "$deployment_version",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    )
    
    # Create subject
    local subject="[$environment] Pipeline Event: $event_type - $status"
    
    # Send notification
    send_sns_notification "$sns_topic_arn" "$message" "$subject"
    
    log "Pipeline notification sent: $event_type ($status)"
}

# Check if required tools are available
if ! command -v aws &> /dev/null; then
    log "ERROR: AWS CLI not found"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    log "ERROR: jq not found"
    exit 1
fi

# Run main function
main "$@"