#!/bin/bash

# Comprehensive logging script for CI/CD pipeline
# Usage: source ./pipeline-logger.sh

# Set strict error handling
set -euo pipefail

# Global variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_LEVEL="${LOG_LEVEL:-INFO}"
LOG_FORMAT="${LOG_FORMAT:-structured}"
PIPELINE_ID="${GITHUB_RUN_ID:-$(date +%s)}"
PIPELINE_ATTEMPT="${GITHUB_RUN_ATTEMPT:-1}"

# Color codes for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Log levels
declare -A LOG_LEVELS=(
    ["DEBUG"]=0
    ["INFO"]=1
    ["WARN"]=2
    ["ERROR"]=3
    ["FATAL"]=4
)

# Function to get current timestamp in ISO 8601 format
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%S.%3NZ"
}

# Function to get log level number
get_log_level_num() {
    echo "${LOG_LEVELS[$1]:-1}"
}

# Function to check if log level should be output
should_log() {
    local level="$1"
    local current_level_num=$(get_log_level_num "$LOG_LEVEL")
    local message_level_num=$(get_log_level_num "$level")
    
    [ "$message_level_num" -ge "$current_level_num" ]
}

# Function to get color for log level
get_log_color() {
    case "$1" in
        "DEBUG") echo "$CYAN" ;;
        "INFO") echo "$GREEN" ;;
        "WARN") echo "$YELLOW" ;;
        "ERROR") echo "$RED" ;;
        "FATAL") echo "$PURPLE" ;;
        *) echo "$NC" ;;
    esac
}

# Function to log structured messages
log_structured() {
    local level="$1"
    local message="$2"
    local component="${3:-pipeline}"
    local step="${4:-unknown}"
    local additional_fields="${5:-{}}"
    
    if ! should_log "$level"; then
        return 0
    fi
    
    local timestamp=$(get_timestamp)
    local log_entry
    
    # Create structured log entry
    log_entry=$(cat <<EOF
{
    "timestamp": "$timestamp",
    "level": "$level",
    "message": "$message",
    "component": "$component",
    "step": "$step",
    "pipeline_id": "$PIPELINE_ID",
    "pipeline_attempt": "$PIPELINE_ATTEMPT",
    "environment": "${ENVIRONMENT:-unknown}",
    "branch": "${GITHUB_REF_NAME:-unknown}",
    "commit_sha": "${GITHUB_SHA:-unknown}",
    "actor": "${GITHUB_ACTOR:-unknown}",
    "workflow": "${GITHUB_WORKFLOW:-unknown}",
    "job": "${GITHUB_JOB:-unknown}",
    "additional": $additional_fields
}
EOF
    )
    
    # Output to console with color
    local color=$(get_log_color "$level")
    echo -e "${color}[$timestamp] [$level] [$component:$step] $message${NC}" >&2
    
    # Output structured log to stdout for CloudWatch
    echo "$log_entry"
    
    # Send to CloudWatch if log group is configured
    if [ -n "${CLOUDWATCH_LOG_GROUP_NAME:-}" ] && command -v aws &> /dev/null; then
        send_to_cloudwatch "$log_entry" "$level"
    fi
}

# Function to log simple messages (backward compatibility)
log_simple() {
    local level="$1"
    local message="$2"
    
    if ! should_log "$level"; then
        return 0
    fi
    
    local timestamp=$(get_timestamp)
    local color=$(get_log_color "$level")
    
    echo -e "${color}[$timestamp] [$level] $message${NC}" >&2
}

# Function to send logs to CloudWatch
send_to_cloudwatch() {
    local log_entry="$1"
    local level="$2"
    local log_group="${CLOUDWATCH_LOG_GROUP_NAME}"
    local log_stream="${GITHUB_WORKFLOW:-pipeline}-${GITHUB_RUN_ID:-unknown}-${GITHUB_RUN_ATTEMPT:-1}"
    
    # Create log stream if it doesn't exist
    aws logs create-log-stream \
        --log-group-name "$log_group" \
        --log-stream-name "$log_stream" \
        --region "${AWS_REGION:-us-east-1}" 2>/dev/null || true
    
    # Send log event
    aws logs put-log-events \
        --log-group-name "$log_group" \
        --log-stream-name "$log_stream" \
        --log-events timestamp=$(date +%s000),message="$log_entry" \
        --region "${AWS_REGION:-us-east-1}" 2>/dev/null || true
}

# Convenience functions for different log levels
log_debug() {
    if [ "$LOG_FORMAT" = "structured" ]; then
        log_structured "DEBUG" "$1" "${2:-pipeline}" "${3:-unknown}" "${4:-{}}"
    else
        log_simple "DEBUG" "$1"
    fi
}

log_info() {
    if [ "$LOG_FORMAT" = "structured" ]; then
        log_structured "INFO" "$1" "${2:-pipeline}" "${3:-unknown}" "${4:-{}}"
    else
        log_simple "INFO" "$1"
    fi
}

log_warn() {
    if [ "$LOG_FORMAT" = "structured" ]; then
        log_structured "WARN" "$1" "${2:-pipeline}" "${3:-unknown}" "${4:-{}}"
    else
        log_simple "WARN" "$1"
    fi
}

log_error() {
    if [ "$LOG_FORMAT" = "structured" ]; then
        log_structured "ERROR" "$1" "${2:-pipeline}" "${3:-unknown}" "${4:-{}}"
    else
        log_simple "ERROR" "$1"
    fi
}

log_fatal() {
    if [ "$LOG_FORMAT" = "structured" ]; then
        log_structured "FATAL" "$1" "${2:-pipeline}" "${3:-unknown}" "${4:-{}}"
    else
        log_simple "FATAL" "$1"
    fi
}

# Function to log step start
log_step_start() {
    local step_name="$1"
    local component="${2:-pipeline}"
    local additional_info="${3:-{}}"
    
    log_info "Starting step: $step_name" "$component" "$step_name" "$additional_info"
}

# Function to log step completion
log_step_complete() {
    local step_name="$1"
    local component="${2:-pipeline}"
    local duration="${3:-unknown}"
    local additional_info="${4:-{}}"
    
    local duration_info
    if [ "$duration" != "unknown" ]; then
        duration_info="{\"duration_seconds\": $duration, \"additional\": $additional_info}"
    else
        duration_info="$additional_info"
    fi
    
    log_info "Completed step: $step_name" "$component" "$step_name" "$duration_info"
}

# Function to log step failure
log_step_failure() {
    local step_name="$1"
    local error_message="$2"
    local component="${3:-pipeline}"
    local additional_info="${4:-{}}"
    
    local error_info="{\"error\": \"$error_message\", \"additional\": $additional_info}"
    
    log_error "Failed step: $step_name - $error_message" "$component" "$step_name" "$error_info"
}

# Function to log deployment events
log_deployment_event() {
    local event_type="$1"
    local status="$2"
    local environment="${3:-unknown}"
    local version="${4:-unknown}"
    local additional_info="${5:-{}}"
    
    local deployment_info
    deployment_info=$(cat <<EOF
{
    "event_type": "$event_type",
    "status": "$status",
    "environment": "$environment",
    "version": "$version",
    "additional": $additional_info
}
EOF
    )
    
    log_info "Deployment event: $event_type ($status)" "deployment" "$event_type" "$deployment_info"
}

# Function to log security scan results
log_security_scan() {
    local tool="$1"
    local status="$2"
    local vulnerabilities_found="${3:-0}"
    local critical_count="${4:-0}"
    local high_count="${5:-0}"
    local additional_info="${6:-{}}"
    
    local security_info
    security_info=$(cat <<EOF
{
    "tool": "$tool",
    "status": "$status",
    "vulnerabilities_found": $vulnerabilities_found,
    "critical_count": $critical_count,
    "high_count": $high_count,
    "additional": $additional_info
}
EOF
    )
    
    if [ "$critical_count" -gt 0 ] || [ "$status" = "failed" ]; then
        log_error "Security scan completed: $tool - $vulnerabilities_found vulnerabilities found" "security" "$tool" "$security_info"
    else
        log_info "Security scan completed: $tool - $vulnerabilities_found vulnerabilities found" "security" "$tool" "$security_info"
    fi
}

# Function to log performance metrics
log_performance_metric() {
    local metric_name="$1"
    local value="$2"
    local unit="${3:-count}"
    local component="${4:-pipeline}"
    local additional_info="${5:-{}}"
    
    local metric_info
    metric_info=$(cat <<EOF
{
    "metric_name": "$metric_name",
    "value": $value,
    "unit": "$unit",
    "additional": $additional_info
}
EOF
    )
    
    log_info "Performance metric: $metric_name = $value $unit" "$component" "metrics" "$metric_info"
}

# Function to initialize logging
init_logging() {
    log_info "Initializing pipeline logging" "system" "init" "{\"log_level\": \"$LOG_LEVEL\", \"log_format\": \"$LOG_FORMAT\"}"
    
    # Create log directory if it doesn't exist
    mkdir -p "${GITHUB_WORKSPACE:-/tmp}/logs"
    
    # Set up log file for this run
    export PIPELINE_LOG_FILE="${GITHUB_WORKSPACE:-/tmp}/logs/pipeline-${PIPELINE_ID}-${PIPELINE_ATTEMPT}.log"
    
    log_info "Pipeline logging initialized" "system" "init" "{\"log_file\": \"$PIPELINE_LOG_FILE\"}"
}

# Function to finalize logging
finalize_logging() {
    log_info "Finalizing pipeline logging" "system" "finalize"
    
    # Archive logs if needed
    if [ -n "${PIPELINE_LOG_FILE:-}" ] && [ -f "$PIPELINE_LOG_FILE" ]; then
        log_info "Pipeline log file available at: $PIPELINE_LOG_FILE" "system" "finalize"
    fi
}

# Trap to ensure logging is finalized on exit
trap finalize_logging EXIT

# Initialize logging when script is sourced
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
    init_logging
fi

# Export functions for use in other scripts
export -f log_debug log_info log_warn log_error log_fatal
export -f log_step_start log_step_complete log_step_failure
export -f log_deployment_event log_security_scan log_performance_metric