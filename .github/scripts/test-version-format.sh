#!/bin/bash

# Test script to verify deployment version format validation
set -euo pipefail

echo "Testing deployment version format validation..."

# Test valid version formats
valid_versions=(
    "v2026.01.08-production-116f3948-1767911808"
    "v2024.12.25-staging-abcd1234-1703520000"
    "v2025.06.15-development-12345678-1718409600"
)

# Test invalid version formats
invalid_versions=(
    "2026.01.08-production-116f3948-1767911808"  # Missing 'v' prefix
    "v26.1.8-production-116f3948-1767911808"     # Wrong date format
    "v2026.01.08-prod-116f3948-1767911808"       # Environment too short
    "v2026.01.08-production-116f394-1767911808"  # SHA too short
    "v2026.01.08-production-116f3948g-1767911808" # Invalid SHA character
    "v2026.01.08-production-116f3948"            # Missing timestamp
)

# Regex pattern from deploy.sh
version_pattern='^v[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[a-zA-Z]+-[a-f0-9]{8}-[0-9]+$'

echo "Testing valid versions:"
for version in "${valid_versions[@]}"; do
    if [[ "$version" =~ $version_pattern ]]; then
        echo "✅ PASS: $version"
    else
        echo "❌ FAIL: $version (should be valid)"
        exit 1
    fi
done

echo ""
echo "Testing invalid versions:"
for version in "${invalid_versions[@]}"; do
    if [[ ! "$version" =~ $version_pattern ]]; then
        echo "✅ PASS: $version (correctly rejected)"
    else
        echo "❌ FAIL: $version (should be invalid)"
        exit 1
    fi
done

echo ""
echo "✅ All version format tests passed!"