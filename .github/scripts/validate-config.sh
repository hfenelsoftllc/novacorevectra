#!/bin/bash

# Configuration Validation Script
# This script validates environment-specific configuration files

set -euo pipefail

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to validate a configuration file
validate_config_file() {
    local config_file="$1"
    local env_name="$2"
    
    log "Validating configuration file: $config_file"
    
    if [[ ! -f "$config_file" ]]; then
        log "ERROR: Configuration file not found: $config_file"
        return 1
    fi
    
    # Source the configuration file
    set -a
    source "$config_file"
    set +a
    
    # Required variables for all environments
    local required_vars=(
        "ENVIRONMENT"
        "AWS_REGION"
        "DOMAIN_NAME"
        "PROJECT_NAME"
        "S3_BUCKET_PREFIX"
        "ENABLE_S3_VERSIONING"
        "ENABLE_S3_LOGGING"
        "CLOUDFRONT_PRICE_CLASS"
        "HTML_CACHE_CONTROL"
        "STATIC_CACHE_CONTROL"
        "API_CACHE_CONTROL"
        "ROBOTS_TAG"
        "DEPLOYMENT_TIMEOUT"
    )
    
    local errors=0
    
    # Check required variables
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log "ERROR: Required variable $var is not set in $config_file"
            ((errors++))
        fi
    done
    
    # Validate ENVIRONMENT matches expected value
    if [[ "$ENVIRONMENT" != "$env_name" ]]; then
        log "ERROR: ENVIRONMENT variable ($ENVIRONMENT) does not match expected value ($env_name)"
        ((errors++))
    fi
    
    # Validate AWS_REGION format
    if [[ ! "$AWS_REGION" =~ ^[a-z]{2}-[a-z]+-[0-9]$ ]]; then
        log "WARNING: AWS_REGION ($AWS_REGION) may not be in correct format (e.g., us-east-1)"
    fi
    
    # Validate boolean values
    for bool_var in "ENABLE_S3_VERSIONING" "ENABLE_S3_LOGGING"; do
        if [[ "${!bool_var}" != "true" && "${!bool_var}" != "false" ]]; then
            log "ERROR: $bool_var must be 'true' or 'false', got: ${!bool_var}"
            ((errors++))
        fi
    done
    
    # Validate CloudFront price class
    local valid_price_classes=("PriceClass_All" "PriceClass_200" "PriceClass_100")
    if [[ ! " ${valid_price_classes[*]} " =~ " $CLOUDFRONT_PRICE_CLASS " ]]; then
        log "ERROR: Invalid CLOUDFRONT_PRICE_CLASS: $CLOUDFRONT_PRICE_CLASS"
        log "Valid options: ${valid_price_classes[*]}"
        ((errors++))
    fi
    
    # Validate cache control headers format
    if [[ ! "$HTML_CACHE_CONTROL" =~ ^public,\ max-age=[0-9]+$ ]]; then
        log "WARNING: HTML_CACHE_CONTROL may not be in correct format: $HTML_CACHE_CONTROL"
    fi
    
    if [[ ! "$STATIC_CACHE_CONTROL" =~ ^public,\ max-age=[0-9]+$ ]]; then
        log "WARNING: STATIC_CACHE_CONTROL may not be in correct format: $STATIC_CACHE_CONTROL"
    fi
    
    # Validate timeout values are numeric
    if [[ ! "$DEPLOYMENT_TIMEOUT" =~ ^[0-9]+$ ]]; then
        log "ERROR: DEPLOYMENT_TIMEOUT must be numeric, got: $DEPLOYMENT_TIMEOUT"
        ((errors++))
    fi
    
    # Environment-specific validations
    case "$env_name" in
        "staging")
            # Staging should have noindex robots tag
            if [[ "$ROBOTS_TAG" != "noindex, nofollow" ]]; then
                log "WARNING: Staging environment should have 'noindex, nofollow' robots tag"
            fi
            
            # Staging typically uses cheaper CloudFront price class
            if [[ "$CLOUDFRONT_PRICE_CLASS" == "PriceClass_All" ]]; then
                log "WARNING: Staging environment using expensive CloudFront price class"
            fi
            ;;
            
        "production")
            # Production should have index robots tag
            if [[ "$ROBOTS_TAG" != "index, follow" ]]; then
                log "WARNING: Production environment should have 'index, follow' robots tag"
            fi
            
            # Production should enable logging
            if [[ "$ENABLE_S3_LOGGING" != "true" ]]; then
                log "WARNING: Production environment should enable S3 logging"
            fi
            
            # Check for invalidation timeout in production
            if [[ -z "${INVALIDATION_TIMEOUT:-}" ]]; then
                log "ERROR: Production environment missing INVALIDATION_TIMEOUT"
                ((errors++))
            fi
            ;;
    esac
    
    if [[ $errors -eq 0 ]]; then
        log "✅ Configuration validation passed for $env_name"
        return 0
    else
        log "❌ Configuration validation failed for $env_name with $errors errors"
        return 1
    fi
}

# Function to compare configurations and highlight differences
compare_configurations() {
    log "Comparing staging and production configurations..."
    
    # Load both configurations
    set -a
    source .github/config/staging.env
    local staging_vars=$(env | grep -E '^[A-Z_]+=')
    
    source .github/config/production.env
    local production_vars=$(env | grep -E '^[A-Z_]+=')
    set +a
    
    log "Configuration differences between staging and production:"
    
    # Compare common variables
    local common_vars=(
        "CLOUDFRONT_PRICE_CLASS"
        "ENABLE_S3_LOGGING"
        "ROBOTS_TAG"
        "DEPLOYMENT_TIMEOUT"
    )
    
    for var in "${common_vars[@]}"; do
        # Get values from both environments
        local staging_val=$(grep "^$var=" .github/config/staging.env | cut -d'=' -f2)
        local prod_val=$(grep "^$var=" .github/config/production.env | cut -d'=' -f2)
        
        if [[ "$staging_val" != "$prod_val" ]]; then
            log "  $var: staging=$staging_val, production=$prod_val"
        fi
    done
}

# Main function
main() {
    log "Starting configuration validation..."
    
    local config_dir=".github/config"
    local environments=("staging" "production")
    local validation_errors=0
    
    # Validate each environment configuration
    for env in "${environments[@]}"; do
        local config_file="$config_dir/$env.env"
        
        if ! validate_config_file "$config_file" "$env"; then
            ((validation_errors++))
        fi
    done
    
    # Compare configurations
    if [[ $validation_errors -eq 0 ]]; then
        compare_configurations
    fi
    
    # Summary
    if [[ $validation_errors -eq 0 ]]; then
        log "🎉 All configuration validations passed!"
        return 0
    else
        log "❌ Configuration validation failed with $validation_errors errors"
        return 1
    fi
}

# Run main function
main "$@"