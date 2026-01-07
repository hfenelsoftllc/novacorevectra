#!/bin/bash

# AWS Backend Setup Script
# This script creates the required AWS resources for Terraform state management

set -e

echo "🚀 Setting up AWS Backend for Terraform..."
echo "=========================================="

# Configuration
BUCKET_NAME="novacorevectra-terraform-state"
TABLE_NAME="terraform-state-lock"
REGION="us-east-1"

echo "Configuration:"
echo "- S3 Bucket: $BUCKET_NAME"
echo "- DynamoDB Table: $TABLE_NAME"
echo "- Region: $REGION"
echo ""

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured or invalid"
    echo "Please configure AWS credentials first:"
    echo "  aws configure"
    echo "Or set environment variables:"
    echo "  export AWS_ACCESS_KEY_ID=your-key"
    echo "  export AWS_SECRET_ACCESS_KEY=your-secret"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
echo "✅ AWS credentials verified"
echo "Account ID: $ACCOUNT_ID"
echo "User/Role: $USER_ARN"
echo ""

# Create S3 bucket for Terraform state
echo "🗄️  Creating S3 bucket for Terraform state..."
if aws s3 ls "s3://$BUCKET_NAME" > /dev/null 2>&1; then
    echo "✅ S3 bucket $BUCKET_NAME already exists"
else
    echo "Creating S3 bucket: $BUCKET_NAME"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ S3 bucket created successfully"
fi

# Enable versioning on the bucket
echo "🔄 Enabling versioning on S3 bucket..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled
echo "✅ Versioning enabled"

# Enable server-side encryption
echo "🔒 Enabling server-side encryption..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
echo "✅ Encryption enabled"

# Block public access
echo "🚫 Blocking public access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo "✅ Public access blocked"

# Create DynamoDB table for state locking
echo "🔐 Creating DynamoDB table for state locking..."
if aws dynamodb describe-table --table-name "$TABLE_NAME" > /dev/null 2>&1; then
    echo "✅ DynamoDB table $TABLE_NAME already exists"
else
    echo "Creating DynamoDB table: $TABLE_NAME"
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION"
    
    echo "⏳ Waiting for table to become active..."
    aws dynamodb wait table-exists --table-name "$TABLE_NAME"
    echo "✅ DynamoDB table created successfully"
fi

# Test access to both resources
echo "🧪 Testing access to created resources..."

echo "Testing S3 bucket access..."
aws s3 ls "s3://$BUCKET_NAME" > /dev/null
echo "✅ S3 bucket is accessible"

echo "Testing DynamoDB table access..."
aws dynamodb scan --table-name "$TABLE_NAME" --limit 1 > /dev/null
echo "✅ DynamoDB table is accessible"

echo ""
echo "🎉 AWS Backend setup completed successfully!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   - AWS_ACCESS_KEY_ID: [Your AWS Access Key ID]"
echo "   - AWS_SECRET_ACCESS_KEY: [Your AWS Secret Access Key]"
echo "   - TERRAFORM_STATE_BUCKET: $BUCKET_NAME"
echo "   - TERRAFORM_STATE_LOCK_TABLE: $TABLE_NAME"
echo ""
echo "2. Go to GitHub repository → Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret' for each secret above"
echo ""
echo "📖 For more information, see:"
echo "   - docs/AWS_SETUP_REQUIREMENTS.md"
echo "   - docs/PIPELINE_TROUBLESHOOTING_GUIDE.md"
echo ""
echo "🔧 Backend Configuration:"
echo "   Bucket: $BUCKET_NAME"
echo "   Table: $TABLE_NAME"
echo "   Region: $REGION"
echo "   Account: $ACCOUNT_ID"