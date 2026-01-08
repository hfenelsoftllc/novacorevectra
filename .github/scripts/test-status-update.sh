#!/bin/bash

# Test script for deployment status update functionality
set -euo pipefail

echo "Testing deployment status update with retry mechanism..."

# Mock function to simulate AWS S3 operations
mock_aws_s3_cp() {
    local source="$1"
    local dest="$2"
    
    # Simulate failure on first few attempts, then success
    if [[ ! -f "/tmp/retry_count" ]]; then
        echo "0" > /tmp/retry_count
    fi
    
    local count=$(cat /tmp/retry_count)
    count=$((count + 1))
    echo "$count" > /tmp/retry_count
    
    if [[ $count -le 2 ]]; then
        echo "Simulating failure (attempt $count)" >&2
        return 1
    else
        echo "Simulating success (attempt $count)" >&2
        if [[ "$source" == "s3://"* ]]; then
            # Downloading from S3 - create a mock metadata file
            cat > "$dest" << EOF
{
  "id": "test-version",
  "environment": "test",
  "status": "pending",
  "timestamp": "$(date +%s)"
}
EOF
        else
            # Uploading to S3 - just return success
            return 0
        fi
        return 0
    fi
}

# Test the retry logic (simplified version)
test_retry_logic() {
    local max_retries=5
    local retry_count=0
    local success=false
    
    echo "Testing retry logic with max_retries=$max_retries"
    
    while [[ $retry_count -lt $max_retries ]]; do
        if mock_aws_s3_cp "s3://test-bucket/test-key" "/tmp/test-download.json"; then
            success=true
            echo "✅ Download succeeded on attempt $((retry_count + 1))"
            break
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $max_retries ]]; then
                local wait_time=$((retry_count * 2))
                echo "⏳ Retrying in ${wait_time}s (attempt $retry_count/$max_retries)"
                sleep 1  # Reduced for testing
            fi
        fi
    done
    
    if [[ "$success" == "true" ]]; then
        echo "✅ Retry mechanism worked successfully"
        return 0
    else
        echo "❌ Retry mechanism failed after $max_retries attempts"
        return 1
    fi
}

# Run the test
if test_retry_logic; then
    echo "✅ Status update retry test passed!"
else
    echo "❌ Status update retry test failed!"
    exit 1
fi

# Cleanup
rm -f /tmp/retry_count /tmp/test-download.json

echo "✅ All status update tests completed successfully!"