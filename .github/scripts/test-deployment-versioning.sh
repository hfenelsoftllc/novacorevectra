#!/bin/bash

# Test script for deployment versioning functionality
set -euo pipefail

echo "Testing deployment versioning script..."

# Create a temporary test artifacts directory
TEST_ARTIFACTS_DIR="/tmp/test-artifacts-$(date +%s)"
mkdir -p "$TEST_ARTIFACTS_DIR"

# Create some test files
echo "<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Test Page</h1></body></html>" > "$TEST_ARTIFACTS_DIR/index.html"
echo "body { font-family: Arial; }" > "$TEST_ARTIFACTS_DIR/style.css"
echo "console.log('test');" > "$TEST_ARTIFACTS_DIR/script.js"

echo "Created test artifacts in: $TEST_ARTIFACTS_DIR"
ls -la "$TEST_ARTIFACTS_DIR"

# Test deployment version generation
echo "Testing deployment version generation..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Mock environment variables
export GITHUB_SHA="48c71c2f1234567890abcdef"
export AWS_REGION="us-east-1"

# Test the create command
echo "Running deployment versioning create command..."
DEPLOYMENT_VERSION=$("$SCRIPT_DIR/deployment-versioning.sh" create \
    "production" \
    "$GITHUB_SHA" \
    "$(date +%s)" \
    "test-bucket" \
    "$TEST_ARTIFACTS_DIR" \
    "test-cloudfront-id")

echo "Generated deployment version: $DEPLOYMENT_VERSION"

# Check if metadata file was created
METADATA_FILE="/tmp/deployment-metadata-${DEPLOYMENT_VERSION}.json"
if [[ -f "$METADATA_FILE" ]]; then
    echo "✅ Metadata file created successfully: $METADATA_FILE"
    echo "Metadata content:"
    cat "$METADATA_FILE" | jq '.'
else
    echo "❌ Metadata file not found: $METADATA_FILE"
    exit 1
fi

# Cleanup
rm -rf "$TEST_ARTIFACTS_DIR"
rm -f "$METADATA_FILE"

echo "✅ Deployment versioning test completed successfully!"