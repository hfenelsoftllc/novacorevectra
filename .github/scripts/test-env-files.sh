#!/bin/bash

# Test Environment Files Script
# This script tests that environment files can be sourced without errors

set -e

echo "🧪 Testing Environment Files..."
echo "==============================="

test_env_file() {
    local env_file="$1"
    local env_name="$2"
    
    echo "Testing $env_name environment file: $env_file"
    
    if [ ! -f "$env_file" ]; then
        echo "❌ File not found: $env_file"
        return 1
    fi
    
    # Test sourcing the file
    echo "  Attempting to source file..."
    if (set -a; source "$env_file" >/dev/null 2>&1); then
        echo "  ✅ File can be sourced successfully"
    else
        echo "  ❌ File cannot be sourced - syntax error detected"
        echo "  Error details:"
        (set -a; source "$env_file") || true
        return 1
    fi
    
    # Test loading specific variables that were problematic
    echo "  Testing problematic variables..."
    (
        set -a
        source "$env_file"
        
        echo "    HTML_CACHE_CONTROL='$HTML_CACHE_CONTROL'"
        echo "    STATIC_CACHE_CONTROL='$STATIC_CACHE_CONTROL'"
        echo "    API_CACHE_CONTROL='$API_CACHE_CONTROL'"
        echo "    ROBOTS_TAG='$ROBOTS_TAG'"
        
        # Verify they contain expected values
        if [[ "$HTML_CACHE_CONTROL" == *"max-age"* ]]; then
            echo "  ✅ HTML_CACHE_CONTROL contains max-age directive"
        else
            echo "  ❌ HTML_CACHE_CONTROL missing max-age directive"
            return 1
        fi
        
        if [[ "$ROBOTS_TAG" == *","* ]]; then
            echo "  ✅ ROBOTS_TAG contains comma-separated values"
        else
            echo "  ❌ ROBOTS_TAG missing comma-separated values"
            return 1
        fi
    )
    
    echo "  ✅ $env_name environment test passed"
    echo ""
}

# Test both environment files
test_env_file ".github/config/staging.env" "Staging"
test_env_file ".github/config/production.env" "Production"

echo "🎉 All environment files passed testing!"
echo "======================================="

# Additional verification - simulate how the workflow loads them
echo "🔄 Simulating workflow environment loading..."
echo "============================================="

for env in staging production; do
    echo "Loading $env environment..."
    (
        set -a
        source ".github/config/$env.env"
        set +a
        
        echo "  Environment: $ENVIRONMENT"
        echo "  AWS Region: $AWS_REGION"
        echo "  Domain: $DOMAIN_NAME"
        echo "  Cache Control: $HTML_CACHE_CONTROL"
        echo "  Robots: $ROBOTS_TAG"
        echo "  ✅ $env environment loaded successfully"
    )
    echo ""
done

echo "✅ Environment file testing completed successfully!"