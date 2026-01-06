# AWS Setup Requirements

## Overview

This document outlines the AWS permissions, IAM roles, and infrastructure requirements needed to deploy the Next.js marketing website using the CI/CD pipeline.

## Required AWS Services

The following AWS services must be available in your account:

- **S3** - Static website hosting and artifact storage
- **CloudFront** - Content Delivery Network
- **Route53** - DNS management
- **Certificate Manager (ACM)** - SSL certificate management
- **CloudWatch** - Monitoring and logging
- **IAM** - Identity and Access Management

## IAM Permissions

### GitHub Actions Service Account

Create an IAM user or role for GitHub Actions with the following permissions:

#### S3 Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:DeleteBucket",
                "s3:GetBucketLocation",
                "s3:GetBucketPolicy",
                "s3:GetBucketVersioning",
                "s3:GetBucketWebsite",
                "s3:ListBucket",
                "s3:PutBucketPolicy",
                "s3:PutBucketVersioning",
                "s3:PutBucketWebsite",
                "s3:PutBucketCORS",
                "s3:GetBucketCORS"
            ],
            "Resource": [
                "arn:aws:s3:::novacorevectra-staging",
                "arn:aws:s3:::novacorevectra-production"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::novacorevectra-staging/*",
                "arn:aws:s3:::novacorevectra-production/*"
            ]
        }
    ]
}
```

#### CloudFront Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateDistribution",
                "cloudfront:GetDistribution",
                "cloudfront:GetDistributionConfig",
                "cloudfront:UpdateDistribution",
                "cloudfront:DeleteDistribution",
                "cloudfront:ListDistributions",
                "cloudfront:CreateInvalidation",
                "cloudfront:GetInvalidation",
                "cloudfront:ListInvalidations"
            ],
            "Resource": "*"
        }
    ]
}
```

#### Route53 Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "route53:CreateHostedZone",
                "route53:GetHostedZone",
                "route53:ListHostedZones",
                "route53:ChangeResourceRecordSets",
                "route53:GetChange",
                "route53:ListResourceRecordSets"
            ],
            "Resource": "*"
        }
    ]
}
```

#### Certificate Manager Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "acm:RequestCertificate",
                "acm:DescribeCertificate",
                "acm:ListCertificates",
                "acm:DeleteCertificate",
                "acm:AddTagsToCertificate"
            ],
            "Resource": "*"
        }
    ]
}
```

#### CloudWatch Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutMetricAlarm",
                "cloudwatch:DeleteAlarms",
                "cloudwatch:DescribeAlarms",
                "cloudwatch:PutMetricData",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Resource": "*"
        }
    ]
}
```

### Combined IAM Policy

For convenience, here's a combined policy that includes all required permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:DeleteBucket",
                "s3:GetBucketLocation",
                "s3:GetBucketPolicy",
                "s3:GetBucketVersioning",
                "s3:GetBucketWebsite",
                "s3:ListBucket",
                "s3:PutBucketPolicy",
                "s3:PutBucketVersioning",
                "s3:PutBucketWebsite",
                "s3:PutBucketCORS",
                "s3:GetBucketCORS",
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "cloudfront:CreateDistribution",
                "cloudfront:GetDistribution",
                "cloudfront:GetDistributionConfig",
                "cloudfront:UpdateDistribution",
                "cloudfront:DeleteDistribution",
                "cloudfront:ListDistributions",
                "cloudfront:CreateInvalidation",
                "cloudfront:GetInvalidation",
                "cloudfront:ListInvalidations",
                "route53:CreateHostedZone",
                "route53:GetHostedZone",
                "route53:ListHostedZones",
                "route53:ChangeResourceRecordSets",
                "route53:GetChange",
                "route53:ListResourceRecordSets",
                "acm:RequestCertificate",
                "acm:DescribeCertificate",
                "acm:ListCertificates",
                "acm:DeleteCertificate",
                "acm:AddTagsToCertificate",
                "cloudwatch:PutMetricAlarm",
                "cloudwatch:DeleteAlarms",
                "cloudwatch:DescribeAlarms",
                "cloudwatch:PutMetricData",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Resource": "*"
        }
    ]
}
```

## Required IAM Roles

### GitHub Actions Execution Role

Create an IAM role that can be assumed by GitHub Actions:

1. **Role Name**: `GitHubActionsDeploymentRole`
2. **Trust Policy**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                },
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:*"
                }
            }
        }
    ]
}
```

3. **Attached Policies**: Attach the combined IAM policy created above

## Terraform State Management

### S3 Backend Configuration

The Terraform state should be stored remotely for team collaboration and state locking:

#### Required Resources

1. **S3 Bucket for State Storage**
   - Bucket Name: `novacorevectra-terraform-state`
   - Versioning: Enabled
   - Encryption: AES256 or KMS
   - Public Access: Blocked

2. **DynamoDB Table for State Locking**
   - Table Name: `terraform-state-lock`
   - Partition Key: `LockID` (String)
   - Billing Mode: On-demand

#### Backend Configuration

Add this to your Terraform configuration:

```hcl
terraform {
  backend "s3" {
    bucket         = "novacorevectra-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

#### Setup Commands

```bash
# Create state bucket
aws s3 mb s3://novacorevectra-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket novacorevectra-terraform-state \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket novacorevectra-terraform-state \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Create DynamoDB table
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

### Required Secrets

- `AWS_ACCOUNT_ID` - Your AWS account ID
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_ROLE_ARN` - ARN of the GitHub Actions execution role
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications (optional)
- `NOTIFICATION_EMAIL` - Email for deployment notifications

### OIDC Provider Setup

Set up GitHub OIDC provider in AWS IAM:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## Environment-Specific Configuration

### Staging Environment
- S3 Bucket: `novacorevectra-staging`
- CloudFront Distribution: Auto-generated
- Domain: `staging.novacorevectra.net` (optional)

### Production Environment
- S3 Bucket: `novacorevectra-production`
- CloudFront Distribution: Auto-generated
- Domain: `novacorevectra.net`

## Cost Considerations

### Estimated Monthly Costs

- **S3 Storage**: $1-5 (depending on site size)
- **CloudFront**: $1-10 (depending on traffic)
- **Route53**: $0.50 per hosted zone
- **Certificate Manager**: Free
- **CloudWatch**: $1-5 (depending on metrics)

**Total Estimated Cost**: $3-20 per month

### Cost Optimization

1. Enable S3 lifecycle policies for old versions
2. Use CloudFront caching effectively
3. Monitor CloudWatch usage
4. Clean up unused resources regularly

## Security Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Regular Rotation**: Rotate access keys and secrets regularly
3. **Monitoring**: Enable CloudTrail for API logging
4. **Encryption**: Enable encryption at rest and in transit
5. **Access Logging**: Enable S3 and CloudFront access logging

## Verification Steps

After setup, verify the configuration:

1. **Test AWS CLI Access**:
```bash
aws sts get-caller-identity
```

2. **Test Terraform Backend**:
```bash
terraform init
terraform plan
```

3. **Test GitHub Actions**:
   - Push a test commit to trigger the pipeline
   - Verify all jobs complete successfully

4. **Test Deployments**:
   - Verify staging deployment works
   - Verify production deployment works
   - Test rollback functionality