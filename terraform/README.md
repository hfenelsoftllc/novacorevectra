# AWS Infrastructure with Terraform

This directory contains Terraform configuration files for deploying the NovaCore Vectra website infrastructure on AWS.

## Architecture Overview

The infrastructure includes:
- **S3 Buckets**: Static website hosting with versioning and lifecycle policies
- **CloudFront Distribution**: Global CDN with custom caching policies and security headers
- **Route53 Hosted Zone**: DNS management with health checks
- **ACM SSL Certificates**: Automatic SSL certificate provisioning and validation
- **CloudWatch Monitoring**: Health checks and alarms

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **Terraform >= 1.0** installed
3. **AWS permissions** for S3, CloudFront, Route53, ACM, and CloudWatch
4. **Domain ownership** of novacorevectra.net

## Required AWS Permissions

The AWS user/role needs the following permissions:
- `s3:*` for S3 bucket management
- `cloudfront:*` for CloudFront distribution management
- `route53:*` for DNS management
- `acm:*` for SSL certificate management
- `cloudwatch:*` for monitoring setup
- `iam:PassRole` for service roles

## Deployment Instructions

### 1. Initialize Terraform Backend

First, create an S3 bucket for Terraform state and DynamoDB table for state locking:

```bash
# Create S3 bucket for Terraform state (run once)
aws s3 mb s3://novacorevectra-terraform-state --region us-east-1

# Create DynamoDB table for state locking (run once)
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### 2. Configure Terraform Backend

Uncomment and configure the backend in `main.tf`:

```hcl
backend "s3" {
  bucket         = "novacorevectra-terraform-state"
  key            = "infrastructure/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "terraform-state-lock"
  encrypt        = true
}
```

### 3. Deploy Staging Environment

```bash
# Initialize Terraform
terraform init

# Plan staging deployment
terraform plan -var-file="terraform.tfvars.staging"

# Apply staging deployment
terraform apply -var-file="terraform.tfvars.staging"
```

### 4. Deploy Production Environment

```bash
# Plan production deployment
terraform plan -var-file="terraform.tfvars.production"

# Apply production deployment
terraform apply -var-file="terraform.tfvars.production"
```

## DNS Configuration

After deployment, you'll need to configure DNS at your domain registrar (Squarespace):

1. Get the Route53 name servers from Terraform output:
   ```bash
   terraform output route53_name_servers
   ```

2. In Squarespace DNS settings, replace the default name servers with the Route53 name servers.

3. Wait for DNS propagation (can take up to 48 hours).

## Environment Variables for CI/CD

The following outputs should be configured as GitHub Actions secrets:

- `AWS_S3_BUCKET`: From `s3_bucket_name` output
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: From `cloudfront_distribution_id` output
- `AWS_REGION`: us-east-1

## File Structure

```
terraform/
├── main.tf                    # Provider and backend configuration
├── variables.tf               # Input variables
├── s3.tf                     # S3 bucket configuration
├── cloudfront.tf             # CloudFront distribution
├── acm.tf                    # SSL certificates
├── route53.tf                # DNS configuration
├── outputs.tf                # Output values
├── terraform.tfvars.staging  # Staging environment variables
├── terraform.tfvars.production # Production environment variables
└── README.md                 # This file
```

## Monitoring and Maintenance

- **Health Checks**: Route53 health checks monitor website availability
- **CloudWatch Alarms**: Alerts for health check failures
- **S3 Lifecycle**: Automatic cleanup of old object versions
- **SSL Certificates**: Automatic renewal through ACM

## Troubleshooting

### Certificate Validation Issues
If SSL certificate validation fails:
1. Check that Route53 hosted zone is properly configured
2. Verify DNS propagation with `dig` or `nslookup`
3. Ensure ACM certificate is created in us-east-1 region

### CloudFront Distribution Issues
- Allow 15-20 minutes for CloudFront distribution deployment
- Check Origin Access Control configuration
- Verify S3 bucket policy allows CloudFront access

### DNS Issues
- DNS changes can take up to 48 hours to propagate
- Use online DNS propagation checkers to monitor status
- Verify name servers are correctly configured at domain registrar

## Cost Optimization

- Staging environment uses `PriceClass_100` (cheaper edge locations)
- Production uses `PriceClass_All` (all edge locations)
- S3 lifecycle policies automatically delete old versions
- Logging is disabled for staging to reduce costs