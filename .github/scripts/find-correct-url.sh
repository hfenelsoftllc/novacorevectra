#!/bin/bash

# Script to find the correct website URL
set -euo pipefail

echo "🔍 Finding the correct website URL for novacorevectra-production..."
echo "================================================================"

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Please run: aws configure"
    exit 1
fi

BUCKET_NAME="novacorevectra-production"

echo "✅ Target bucket: $BUCKET_NAME"
echo ""

# Check if bucket exists
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "❌ Bucket $BUCKET_NAME does not exist or is not accessible"
    exit 1
fi

echo "✅ Bucket exists and is accessible"

# Find CloudFront distribution that uses this bucket
echo "🌐 Finding CloudFront distribution for this bucket..."

# Get all distributions and find the one with matching origin
DISTRIBUTIONS=$(aws cloudfront list-distributions --query 'DistributionList.Items[]' --output json 2>/dev/null || echo "[]")

if [[ "$DISTRIBUTIONS" == "[]" ]]; then
    echo "❌ No CloudFront distributions found"
    exit 1
fi

# Find distribution with matching S3 origin
MATCHING_DIST=$(echo "$DISTRIBUTIONS" | jq -r --arg bucket "$BUCKET_NAME" '
    .[] | select(.Origins.Items[]?.DomainName | contains($bucket)) | 
    {
        Id: .Id,
        DomainName: .DomainName,
        Status: .Status,
        Comment: .Comment,
        OriginDomain: .Origins.Items[0].DomainName
    }
')

if [[ -z "$MATCHING_DIST" || "$MATCHING_DIST" == "null" ]]; then
    echo "❌ No CloudFront distribution found for bucket $BUCKET_NAME"
    echo ""
    echo "Available distributions:"
    echo "$DISTRIBUTIONS" | jq -r '.[] | "  - ID: \(.Id), Domain: \(.DomainName), Origin: \(.Origins.Items[0].DomainName)"'
    exit 1
fi

# Extract distribution details
DIST_ID=$(echo "$MATCHING_DIST" | jq -r '.Id')
CLOUDFRONT_DOMAIN=$(echo "$MATCHING_DIST" | jq -r '.DomainName')
STATUS=$(echo "$MATCHING_DIST" | jq -r '.Status')
COMMENT=$(echo "$MATCHING_DIST" | jq -r '.Comment')

echo "✅ Found matching CloudFront distribution:"
echo "   Distribution ID: $DIST_ID"
echo "   CloudFront Domain: $CLOUDFRONT_DOMAIN"
echo "   Status: $STATUS"
echo "   Comment: $COMMENT"
echo ""

# Check for custom domain (Route53 aliases)
echo "🔍 Checking for custom domain aliases..."
ALIASES=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DistributionConfig.Aliases.Items' --output json 2>/dev/null || echo "[]")

if [[ "$ALIASES" != "[]" && "$ALIASES" != "null" ]]; then
    echo "✅ Custom domain(s) configured:"
    echo "$ALIASES" | jq -r '.[] | "   - https://\(.)"'
    CUSTOM_DOMAIN=$(echo "$ALIASES" | jq -r '.[0]')
    echo ""
else
    echo "ℹ️  No custom domains configured"
    echo ""
fi

# Test CloudFront access
echo "🧪 Testing CloudFront access..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$CLOUDFRONT_DOMAIN/" --max-time 10 || echo "000")

echo "   CloudFront URL: https://$CLOUDFRONT_DOMAIN/"
echo "   HTTP Status: $HTTP_STATUS"

if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "   ✅ CloudFront is working!"
elif [[ "$HTTP_STATUS" == "403" ]]; then
    echo "   ❌ Access Denied (403) - OAC configuration issue"
elif [[ "$HTTP_STATUS" == "404" ]]; then
    echo "   ❌ Not Found (404) - Missing index.html"
else
    echo "   ⚠️  Unexpected status: $HTTP_STATUS"
fi

# Test custom domain if available
if [[ -n "${CUSTOM_DOMAIN:-}" ]]; then
    echo ""
    echo "🧪 Testing custom domain..."
    CUSTOM_HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$CUSTOM_DOMAIN/" --max-time 10 || echo "000")
    
    echo "   Custom Domain: https://$CUSTOM_DOMAIN/"
    echo "   HTTP Status: $CUSTOM_HTTP_STATUS"
    
    if [[ "$CUSTOM_HTTP_STATUS" == "200" ]]; then
        echo "   ✅ Custom domain is working!"
    else
        echo "   ⚠️  Custom domain issue (Status: $CUSTOM_HTTP_STATUS)"
    fi
fi

echo ""
echo "🎯 SUMMARY:"
echo "=========="

if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "✅ Your website is accessible at:"
    echo "   🌐 CloudFront: https://$CLOUDFRONT_DOMAIN/"
    if [[ -n "${CUSTOM_DOMAIN:-}" ]]; then
        if [[ "$CUSTOM_HTTP_STATUS" == "200" ]]; then
            echo "   🏠 Custom Domain: https://$CUSTOM_DOMAIN/"
        else
            echo "   ⚠️  Custom Domain: https://$CUSTOM_DOMAIN/ (has issues)"
        fi
    fi
else
    echo "❌ Website is not accessible. Issues found:"
    echo "   CloudFront Status: $HTTP_STATUS"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Run diagnostic: bash .github/scripts/debug-live-issue.sh $BUCKET_NAME $DIST_ID $CLOUDFRONT_DOMAIN"
    echo "   2. Check S3 public access block settings"
    echo "   3. Verify bucket policy allows CloudFront OAC"
fi

echo ""
echo "❌ DO NOT USE: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
echo "   (This is blocked by design for security - use CloudFront URLs above)"
echo ""
echo "ℹ️  Why S3 direct access is blocked:"
echo "   - Your infrastructure uses CloudFront Origin Access Control (OAC)"
echo "   - OAC blocks direct S3 access for security"
echo "   - All traffic must go through CloudFront"
echo "   - This is the recommended AWS best practice"