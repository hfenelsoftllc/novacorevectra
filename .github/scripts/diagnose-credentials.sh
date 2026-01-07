#!/bin/bash

# GitHub Actions Credential Diagnosis Script
# This script helps diagnose AWS credential issues in GitHub Actions

set -e

echo "🔍 Diagnosing AWS Credentials Configuration..."
echo "=============================================="

# Check if we're running in GitHub Actions
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "✅ Running in GitHub Actions environment"
    echo "Repository: $GITHUB_REPOSITORY"
    echo "Workflow: $GITHUB_WORKFLOW"
    echo "Run ID: $GITHUB_RUN_ID"
else
    echo "⚠️  Not running in GitHub Actions - this is a local test"
fi

echo ""
echo "🔐 Checking AWS Credential Sources..."
echo "====================================="

# Check for AWS credentials in environment
if [ -n "$AWS_ACCESS_KEY_ID" ]; then
    echo "✅ AWS_ACCESS_KEY_ID is set (length: ${#AWS_ACCESS_KEY_ID})"
else
    echo "❌ AWS_ACCESS_KEY_ID is not set"
fi

if [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "✅ AWS_SECRET_ACCESS_KEY is set (length: ${#AWS_SECRET_ACCESS_KEY})"
else
    echo "❌ AWS_SECRET_ACCESS_KEY is not set"
fi

if [ -n "$AWS_SESSION_TOKEN" ]; then
    echo "✅ AWS_SESSION_TOKEN is set (length: ${#AWS_SESSION_TOKEN})"
else
    echo "ℹ️  AWS_SESSION_TOKEN is not set (normal for long-term credentials)"
fi

if [ -n "$AWS_ROLE_ARN" ]; then
    echo "✅ AWS_ROLE_ARN is set: $AWS_ROLE_ARN"
else
    echo "ℹ️  AWS_ROLE_ARN is not set (normal for access key authentication)"
fi

echo ""
echo "🌍 Checking AWS Region Configuration..."
echo "======================================"

if [ -n "$AWS_REGION" ]; then
    echo "✅ AWS_REGION is set: $AWS_REGION"
elif [ -n "$AWS_DEFAULT_REGION" ]; then
    echo "✅ AWS_DEFAULT_REGION is set: $AWS_DEFAULT_REGION"
else
    echo "❌ No AWS region is set"
fi

echo ""
echo "🧪 Testing AWS Credentials..."
echo "============================="

# Test AWS CLI availability
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI is available"
    
    # Test basic AWS access
    echo "Testing AWS STS access..."
    if aws sts get-caller-identity > /tmp/aws-identity.json 2>/tmp/aws-error.log; then
        echo "✅ AWS credentials are working!"
        echo "Account ID: $(cat /tmp/aws-identity.json | jq -r '.Account')"
        echo "User/Role: $(cat /tmp/aws-identity.json | jq -r '.Arn')"
        echo "User ID: $(cat /tmp/aws-identity.json | jq -r '.UserId')"
    else
        echo "❌ AWS credentials test failed!"
        echo "Error details:"
        cat /tmp/aws-error.log
        exit 1
    fi
else
    echo "❌ AWS CLI is not available"
    exit 1
fi

echo ""
echo "🗄️  Testing Terraform Backend Access..."
echo "======================================"

# Check Terraform state bucket
TERRAFORM_STATE_BUCKET="${TERRAFORM_STATE_BUCKET:-novacorevectra-terraform-state}"
echo "Testing S3 bucket access: $TERRAFORM_STATE_BUCKET"

if aws s3 ls "s3://$TERRAFORM_STATE_BUCKET" > /dev/null 2>&1; then
    echo "✅ Terraform state bucket is accessible"
else
    echo "❌ Cannot access Terraform state bucket: $TERRAFORM_STATE_BUCKET"
    echo "This bucket needs to exist for Terraform to work"
fi

# Check DynamoDB table
TERRAFORM_STATE_LOCK_TABLE="${TERRAFORM_STATE_LOCK_TABLE:-terraform-state-lock}"
echo "Testing DynamoDB table access: $TERRAFORM_STATE_LOCK_TABLE"

if aws dynamodb describe-table --table-name "$TERRAFORM_STATE_LOCK_TABLE" > /dev/null 2>&1; then
    echo "✅ Terraform state lock table is accessible"
else
    echo "❌ Cannot access Terraform state lock table: $TERRAFORM_STATE_LOCK_TABLE"
    echo "This table needs to exist for Terraform state locking"
fi

echo ""
echo "📋 Required GitHub Secrets Checklist..."
echo "======================================"

echo "The following secrets should be configured in GitHub:"
echo "- AWS_ACCESS_KEY_ID (✅ if set above)"
echo "- AWS_SECRET_ACCESS_KEY (✅ if set above)"
echo "- TERRAFORM_STATE_BUCKET (current: ${TERRAFORM_STATE_BUCKET:-'not set'})"
echo "- TERRAFORM_STATE_LOCK_TABLE (current: ${TERRAFORM_STATE_LOCK_TABLE:-'not set'})"
echo "- SLACK_WEBHOOK_URL (optional)"

echo ""
echo "🎯 Next Steps..."
echo "==============="

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ CRITICAL: AWS credentials are missing!"
    echo ""
    echo "To fix this:"
    echo "1. Go to GitHub repository → Settings → Secrets and variables → Actions"
    echo "2. Add the following secrets:"
    echo "   - AWS_ACCESS_KEY_ID: Your AWS access key ID"
    echo "   - AWS_SECRET_ACCESS_KEY: Your AWS secret access key"
    echo "   - TERRAFORM_STATE_BUCKET: novacorevectra-terraform-state"
    echo "   - TERRAFORM_STATE_LOCK_TABLE: terraform-state-lock"
    echo ""
    echo "3. Ensure your AWS user has the required permissions (see docs/AWS_SETUP_REQUIREMENTS.md)"
    exit 1
else
    echo "✅ AWS credentials are properly configured!"
    echo "✅ Diagnosis completed successfully"
fi

echo ""
echo "📖 For more help, see: docs/PIPELINE_TROUBLESHOOTING_GUIDE.md"