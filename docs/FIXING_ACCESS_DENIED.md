# Fixing CloudFront Access Denied Errors

## Problem
When accessing your website after deployment, you see:
```xml
<Error>
  <Code>AccessDenied</Code>
  <Message>Access Denied</Message>
</Error>
```

## Root Cause
The S3 bucket's public access block settings are preventing CloudFront Origin Access Control (OAC) from accessing the bucket, even though CloudFront has the proper permissions.

## Quick Fix

### Option 1: Automated Fix (Recommended)
Run the automated fix script:

```bash
# Plan the changes first
./.github/scripts/fix-cloudfront-access.sh production plan

# Apply the changes
./.github/scripts/fix-cloudfront-access.sh production apply <bucket-name> <distribution-id>
```

### Option 2: Manual Fix
1. **Update Terraform Configuration**
   
   Edit `terraform/s3.tf` and change the public access block:
   
   ```hcl
   resource "aws_s3_bucket_public_access_block" "website" {
     bucket = aws_s3_bucket.website.id

     block_public_acls       = true
     block_public_policy     = false  # Changed from true
     ignore_public_acls      = true
     restrict_public_buckets = false  # Changed from true
   }
   ```

2. **Apply Terraform Changes**
   
   ```bash
   cd terraform
   terraform plan -var-file="terraform.tfvars.production"
   terraform apply
   ```

3. **Wait for Propagation**
   
   CloudFront changes can take up to 15 minutes to propagate.

## Verification

### Diagnostic Script
Run the diagnostic script to check the current state:

```bash
./.github/scripts/diagnose-access-denied.sh <bucket-name> <distribution-id> <cloudfront-domain>
```

### Manual Verification
1. **Check S3 Bucket Policy**
   ```bash
   aws s3api get-bucket-policy --bucket <bucket-name>
   ```

2. **Check Public Access Block**
   ```bash
   aws s3api get-public-access-block --bucket <bucket-name>
   ```

3. **Test CloudFront Access**
   ```bash
   curl -I https://<cloudfront-domain>/
   ```

## Expected Configuration

### S3 Public Access Block (Correct)
```json
{
  "BlockPublicAcls": true,
  "IgnorePublicAcls": true,
  "BlockPublicPolicy": false,
  "RestrictPublicBuckets": false
}
```

### S3 Bucket Policy (Correct)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket-name/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::account:distribution/distribution-id"
        }
      }
    }
  ]
}
```

## Understanding the Issue

### Why This Happens
1. **Security by Default**: S3 buckets are created with restrictive public access blocks
2. **OAC Requirements**: CloudFront OAC needs specific bucket policy permissions
3. **Policy Conflicts**: `BlockPublicPolicy=true` prevents the OAC bucket policy from working

### Why These Settings Are Safe
- `BlockPublicPolicy=false`: Allows the specific CloudFront service principal policy
- `RestrictPublicBuckets=false`: Allows CloudFront service access
- The bucket policy still restricts access to only the specific CloudFront distribution
- No public internet access is allowed

## Troubleshooting

### Common Issues

#### 1. Still Getting 403 After Fix
- **Cause**: CloudFront propagation delay
- **Solution**: Wait up to 15 minutes, then test again

#### 2. Terraform Apply Fails
- **Cause**: State lock or permission issues
- **Solution**: Check AWS credentials and state lock table

#### 3. Policy Not Taking Effect
- **Cause**: Public access block still restrictive
- **Solution**: Verify both `BlockPublicPolicy` and `RestrictPublicBuckets` are `false`

### Advanced Diagnostics

#### Check CloudFront Distribution Status
```bash
aws cloudfront get-distribution --id <distribution-id> --query 'Distribution.Status'
```

#### Check OAC Configuration
```bash
aws cloudfront get-origin-access-control --id <oac-id>
```

#### Test Specific Files
```bash
curl -I https://<cloudfront-domain>/index.html
curl -I https://<cloudfront-domain>/404.html
```

## Prevention

### For New Deployments
The Terraform configuration has been updated to use the correct settings by default. New deployments should not experience this issue.

### For Existing Deployments
Run the fix script or manually update the configuration as described above.

## Related Documentation
- [AWS CloudFront OAC Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [S3 Public Access Block](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)
- [Deployment Architecture](./DEPLOYMENT_ARCHITECTURE.md)