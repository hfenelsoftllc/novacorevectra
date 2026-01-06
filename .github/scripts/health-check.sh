#!/bin/bash

# Health Check Script for Deployment Verification
# This script performs comprehensive health checks on deployed websites

set -euo pipefail

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to perform HTTP health check
http_health_check() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout="${3:-30}"
    local max_retries="${4:-3}"
    
    log "Performing HTTP health check: $url"
    
    local retry_count=0
    while [[ $retry_count -lt $max_retries ]]; do
        local response
        response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total};SIZE:%{size_download}" \
                       --max-time "$timeout" \
                       --connect-timeout 10 \
                       "$url" 2>/dev/null || echo "HTTPSTATUS:000;TIME:0;SIZE:0")
        
        local http_status
        http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        
        local response_time
        response_time=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)
        
        local content_size
        content_size=$(echo "$response" | grep -o "SIZE:[0-9]*" | cut -d: -f2)
        
        if [[ "$http_status" == "$expected_status" ]]; then
            log "✅ HTTP health check passed"
            log "   Status: $http_status"
            log "   Response time: ${response_time}s"
            log "   Content size: ${content_size} bytes"
            
            # Return health check result as JSON
            cat << EOF
{
  "endpoint": "$url",
  "status": $http_status,
  "responseTime": $response_time,
  "contentSize": $content_size,
  "timestamp": "$(date --iso-8601=seconds)",
  "success": true,
  "retryCount": $retry_count
}
EOF
            return 0
        else
            retry_count=$((retry_count + 1))
            log "❌ HTTP health check failed (attempt $retry_count/$max_retries)"
            log "   Status: $http_status"
            log "   Response time: ${response_time}s"
            
            if [[ $retry_count -lt $max_retries ]]; then
                log "   Retrying in 5 seconds..."
                sleep 5
            fi
        fi
    done
    
    # Return failed health check result
    cat << EOF
{
  "endpoint": "$url",
  "status": $http_status,
  "responseTime": $response_time,
  "contentSize": $content_size,
  "timestamp": "$(date --iso-8601=seconds)",
  "success": false,
  "retryCount": $retry_count,
  "error": "HTTP status $http_status after $max_retries attempts"
}
EOF
    return 1
}

# Function to check specific page content
content_health_check() {
    local url="$1"
    local expected_content="$2"
    local timeout="${3:-30}"
    
    log "Performing content health check: $url"
    log "Expected content: $expected_content"
    
    local content
    content=$(curl -s --max-time "$timeout" --connect-timeout 10 "$url" 2>/dev/null || echo "")
    
    if [[ -n "$content" && "$content" == *"$expected_content"* ]]; then
        log "✅ Content health check passed"
        
        cat << EOF
{
  "endpoint": "$url",
  "expectedContent": "$expected_content",
  "contentFound": true,
  "timestamp": "$(date --iso-8601=seconds)",
  "success": true
}
EOF
        return 0
    else
        log "❌ Content health check failed"
        log "   Expected content not found: $expected_content"
        
        cat << EOF
{
  "endpoint": "$url",
  "expectedContent": "$expected_content",
  "contentFound": false,
  "timestamp": "$(date --iso-8601=seconds)",
  "success": false,
  "error": "Expected content not found"
}
EOF
        return 1
    fi
}

# Function to check SEO meta tags
seo_health_check() {
    local url="$1"
    local timeout="${2:-30}"
    
    log "Performing SEO health check: $url"
    
    local content
    content=$(curl -s --max-time "$timeout" --connect-timeout 10 "$url" 2>/dev/null || echo "")
    
    local has_title=false
    local has_description=false
    local has_viewport=false
    local title_content=""
    local description_content=""
    
    if [[ "$content" == *"<title>"* ]]; then
        has_title=true
        title_content=$(echo "$content" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g' | head -1)
    fi
    
    if [[ "$content" == *'name="description"'* ]]; then
        has_description=true
        description_content=$(echo "$content" | grep -o 'name="description"[^>]*content="[^"]*"' | sed 's/.*content="\([^"]*\)".*/\1/' | head -1)
    fi
    
    if [[ "$content" == *'name="viewport"'* ]]; then
        has_viewport=true
    fi
    
    local success=true
    local issues=()
    
    if [[ "$has_title" != true ]]; then
        success=false
        issues+=("Missing title tag")
    fi
    
    if [[ "$has_description" != true ]]; then
        success=false
        issues+=("Missing meta description")
    fi
    
    if [[ "$has_viewport" != true ]]; then
        success=false
        issues+=("Missing viewport meta tag")
    fi
    
    if [[ "$success" == true ]]; then
        log "✅ SEO health check passed"
    else
        log "❌ SEO health check failed: ${issues[*]}"
    fi
    
    cat << EOF
{
  "endpoint": "$url",
  "hasTitle": $has_title,
  "hasDescription": $has_description,
  "hasViewport": $has_viewport,
  "titleContent": "$title_content",
  "descriptionContent": "$description_content",
  "issues": $(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .),
  "timestamp": "$(date --iso-8601=seconds)",
  "success": $success
}
EOF
    
    return $([[ "$success" == true ]] && echo 0 || echo 1)
}

# Function to check SSL certificate
ssl_health_check() {
    local domain="$1"
    local timeout="${2:-30}"
    
    log "Performing SSL health check: $domain"
    
    local ssl_info
    ssl_info=$(timeout "$timeout" openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
    
    if [[ -n "$ssl_info" ]]; then
        local not_before
        not_before=$(echo "$ssl_info" | grep "notBefore=" | cut -d= -f2)
        
        local not_after
        not_after=$(echo "$ssl_info" | grep "notAfter=" | cut -d= -f2)
        
        local expiry_timestamp
        expiry_timestamp=$(date -d "$not_after" +%s 2>/dev/null || echo "0")
        
        local current_timestamp
        current_timestamp=$(date +%s)
        
        local days_until_expiry
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        local success=true
        local warning=""
        
        if [[ $days_until_expiry -lt 30 ]]; then
            success=false
            warning="SSL certificate expires in $days_until_expiry days"
        fi
        
        if [[ "$success" == true ]]; then
            log "✅ SSL health check passed"
        else
            log "⚠️  SSL health check warning: $warning"
        fi
        
        cat << EOF
{
  "domain": "$domain",
  "notBefore": "$not_before",
  "notAfter": "$not_after",
  "daysUntilExpiry": $days_until_expiry,
  "timestamp": "$(date --iso-8601=seconds)",
  "success": $success,
  "warning": "$warning"
}
EOF
        return $([[ "$success" == true ]] && echo 0 || echo 1)
    else
        log "❌ SSL health check failed: Unable to retrieve certificate"
        
        cat << EOF
{
  "domain": "$domain",
  "timestamp": "$(date --iso-8601=seconds)",
  "success": false,
  "error": "Unable to retrieve SSL certificate"
}
EOF
        return 1
    fi
}

# Function to perform comprehensive health check
comprehensive_health_check() {
    local environment="$1"
    local s3_url="$2"
    local cloudfront_url="${3:-}"
    local custom_domain="${4:-}"
    
    log "Starting comprehensive health check for $environment environment"
    
    local health_results=()
    local overall_success=true
    
    # Check S3 website endpoint
    log "Checking S3 website endpoint..."
    local s3_result
    if s3_result=$(http_health_check "$s3_url" 200 30 3); then
        health_results+=("$s3_result")
    else
        health_results+=("$s3_result")
        overall_success=false
    fi
    
    # Check CloudFront endpoint if provided
    if [[ -n "$cloudfront_url" ]]; then
        log "Checking CloudFront endpoint..."
        local cf_result
        if cf_result=$(http_health_check "$cloudfront_url" 200 30 3); then
            health_results+=("$cf_result")
        else
            health_results+=("$cf_result")
            overall_success=false
        fi
        
        # Check SSL for CloudFront
        local cf_domain
        cf_domain=$(echo "$cloudfront_url" | sed 's|https://||' | sed 's|/.*||')
        local ssl_result
        if ssl_result=$(ssl_health_check "$cf_domain" 30); then
            health_results+=("$ssl_result")
        else
            health_results+=("$ssl_result")
            # SSL warnings don't fail the overall check
        fi
    fi
    
    # Check custom domain if provided
    if [[ -n "$custom_domain" ]]; then
        log "Checking custom domain..."
        local custom_url="https://$custom_domain"
        local custom_result
        if custom_result=$(http_health_check "$custom_url" 200 30 3); then
            health_results+=("$custom_result")
        else
            health_results+=("$custom_result")
            overall_success=false
        fi
        
        # Check SSL for custom domain
        local custom_ssl_result
        if custom_ssl_result=$(ssl_health_check "$custom_domain" 30); then
            health_results+=("$custom_ssl_result")
        else
            health_results+=("$custom_ssl_result")
            # SSL warnings don't fail the overall check
        fi
    fi
    
    # Check SEO elements on primary endpoint
    local primary_url="$s3_url"
    if [[ -n "$cloudfront_url" ]]; then
        primary_url="$cloudfront_url"
    fi
    
    log "Checking SEO elements..."
    local seo_result
    if seo_result=$(seo_health_check "$primary_url" 30); then
        health_results+=("$seo_result")
    else
        health_results+=("$seo_result")
        # SEO issues don't fail the overall check, but are warnings
    fi
    
    # Check for specific content (homepage title)
    log "Checking homepage content..."
    local content_result
    if content_result=$(content_health_check "$primary_url" "<title>" 30); then
        health_results+=("$content_result")
    else
        health_results+=("$content_result")
        overall_success=false
    fi
    
    # Compile final health check report
    local health_report
    health_report=$(printf '%s\n' "${health_results[@]}" | jq -s .)
    
    local final_report
    final_report=$(cat << EOF
{
  "environment": "$environment",
  "timestamp": "$(date --iso-8601=seconds)",
  "overallSuccess": $overall_success,
  "checksPerformed": ${#health_results[@]},
  "results": $health_report
}
EOF
)
    
    if [[ "$overall_success" == true ]]; then
        log "✅ Comprehensive health check passed"
    else
        log "❌ Comprehensive health check failed"
    fi
    
    echo "$final_report"
    return $([[ "$overall_success" == true ]] && echo 0 || echo 1)
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        "http")
            local url="$2"
            local expected_status="${3:-200}"
            local timeout="${4:-30}"
            local max_retries="${5:-3}"
            
            http_health_check "$url" "$expected_status" "$timeout" "$max_retries"
            ;;
        
        "content")
            local url="$2"
            local expected_content="$3"
            local timeout="${4:-30}"
            
            content_health_check "$url" "$expected_content" "$timeout"
            ;;
        
        "seo")
            local url="$2"
            local timeout="${3:-30}"
            
            seo_health_check "$url" "$timeout"
            ;;
        
        "ssl")
            local domain="$2"
            local timeout="${3:-30}"
            
            ssl_health_check "$domain" "$timeout"
            ;;
        
        "comprehensive")
            local environment="$2"
            local s3_url="$3"
            local cloudfront_url="${4:-}"
            local custom_domain="${5:-}"
            
            comprehensive_health_check "$environment" "$s3_url" "$cloudfront_url" "$custom_domain"
            ;;
        
        *)
            echo "Usage: $0 <command> [args...]"
            echo ""
            echo "Commands:"
            echo "  http <url> [expected_status] [timeout] [max_retries]"
            echo "  content <url> <expected_content> [timeout]"
            echo "  seo <url> [timeout]"
            echo "  ssl <domain> [timeout]"
            echo "  comprehensive <environment> <s3_url> [cloudfront_url] [custom_domain]"
            echo ""
            echo "Examples:"
            echo "  $0 http https://example.com 200 30 3"
            echo "  $0 content https://example.com '<title>'"
            echo "  $0 seo https://example.com"
            echo "  $0 ssl example.com"
            echo "  $0 comprehensive production http://bucket.s3-website.amazonaws.com https://d123.cloudfront.net example.com"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"