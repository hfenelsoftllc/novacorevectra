#!/bin/bash

# Quick script to get current AWS resource information
set -euo pipefail

echo "🔍 Getting AWS resource information..."
echo "======================================"

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Please run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
echo "✅ AWS Account: $ACCOUNT_ID"

# Find S3 buckets
echo ""
echo "📦 S3 Buckets (potential website buckets):"
aws s3api list-buckets --query 'Buckets[?contains(Name, `novacorevectra`) || contains(Name, `website`) || contains(Name, `production`) || contains(Name, `staging`)].{Name:Name,Created:CreationDate}' --output table 2>/dev/null || echo "No matching buckets found"

# Find CloudFront distributions
echo ""
echo "🌐 CloudFront Distributions:"
aws cloudfront list-distributions --query 'DistributionList.Items[?Comment && (contains(Comment, `novacorevectra`) || contains(Comment, `website`) || contains(Comment, `production`) || contains(Comment, `staging`))].{Id:Id,Domain:DomainName,Status:Status,Comment:Comment}' --output table 2>/dev/null || echo "No matching distributions found"

# Get all distributions if none found with comments
DIST_COUNT=$(aws cloudfront list-distributions --query 'DistributionList.Items | length(@)' --output text 2>/dev/null || echo "0")
if [[ "$DIST_COUNT" -gt 0 ]]; then
    echo ""
    echo "📡 All CloudFront Distributions:"
    aws cloudfront list-distributions --query 'DistributionList.Items[].{Id:Id,Domain:DomainName,Status:Status,Origins:Origins.Items[0].DomainName}' --output table 2>/dev/null
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Identify your bucket and distribution from the lists above"
echo "2. Run the diagnostic: ./.github/scripts/debug-live-issue.sh <bucket-name> <distribution-id> <cloudfront-domain>"
echo "3. Or run with auto-discovery: ./.github/scripts/debug-live-issue.sh"