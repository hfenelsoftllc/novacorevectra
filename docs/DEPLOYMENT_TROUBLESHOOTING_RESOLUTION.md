# Deployment Troubleshooting Resolution

## Issue Summary

The deployment pipeline was experiencing "Access Denied" errors when trying to access the website through CloudFront, despite successful S3 uploads. This document provides the root cause analysis and resolution steps.

## Root Cause Analysis

### Primary Issues Identified

1. **Artifact Structure Mismatch**: Potential mismatch between GitHub Actions artifact upload/download paths
2. **Missing S3 Bucket Policy**: S3 bucket policy for CloudFront OAC access was commented out in Terraform
3. **CloudFront Propagation Delays**: Normal propagation delays not being handled properly
4. **Insufficient Diagnostics**: Limited visibility into the actual deployment process

### Secondary Issues

1. **Build Artifact Verification**: No verification that build artifacts contain the expected files
2. **Content Type Issues**: Potential incorrect content types for uploaded files
3. **Cache Invalidation Timing**: CloudFront cache not being invalidated properly

## Resolution Steps Implemented

### 1. Enhanced Diagnostics

**Added comprehensive diagnostic scripts:**

- **`.github/scripts/diagnose-deployment-issue.sh`**: Comprehensive diagnosis tool that checks:
  - AWS CLI configuration and credentials
  - Build artifact structure and contents
  - S3 bucket configuration and contents
  - CloudFront distribution status and configuration
  - URL accessibility testing
  - Terraform state validation

- **Debug steps in GitHub Actions**: Added artifact structure debugging to both staging and production deployments

### 2. Automated Fix Scripts

**Created `.github/scripts/fix-deployment-issues.sh`** with automated fixes for:

- **Artifact Structure**: Fixes misplaced build artifacts
- **S3 Bucket Policy**: Applies correct CloudFront OAC policy
- **Public Access Block**: Configures correct settings for OAC
- **Content Types**: Re-uploads files with correct MIME types
- **CloudFront Cache**: Creates invalidations to clear stale cache
- **Terraform Infrastructure**: Runs terraform apply to fix infrastructure issues

### 3. Workflow Improvements

**Enhanced GitHub Actions workflow:**

```yaml
# Added to both staging and production deployments
- name: Debug artifact structure
  run: |
    echo "🔍 Debugging artifact structure..."
    find ./artifacts -type f | head -20
    ls -la ./artifacts/
    if [ -d "./artifacts/out" ]; then
      echo "Contents of ./artifacts/out:"
      ls -la ./artifacts/out/ | head -10
      echo "File count: $(find ./artifacts/out -type f | wc -l)"
    fi

- name: Diagnose deployment if verification fails
  if: failure()
  run: |
    chmod +x .github/scripts/diagnose-deployment-issue.sh
    ./.github/scripts/diagnose-deployment-issue.sh ./artifacts/out $BUCKET_NAME $CF_ID $CF_DOMAIN
    
    chmod +x .github/scripts/fix-deployment-issues.sh
    ./.github/scripts/fix-deployment-issues.sh all $BUCKET_NAME $CF_ID $CF_DOMAIN
```

### 4. Infrastructure Verification

**Verified Terraform configuration:**

- ✅ CloudFront OAC is properly configured
- ✅ S3 bucket policy allows CloudFront service principal access
- ✅ Public access block settings are correct for OAC
- ✅ CloudFront distribution has proper cache behaviors

## Manual Resolution Steps

If the automated fixes don't resolve the issue, follow these manual steps:

### Step 1: Verify Build Artifacts

```bash
# Check if build completed successfully
npm run build
ls -la out/

# Verify essential files exist
ls -la out/index.html out/404.html out/_next/
```

### Step 2: Run Diagnostics

```bash
# Run comprehensive diagnostics
./.github/scripts/diagnose-deployment-issue.sh ./out

# Or with specific parameters
./.github/scripts/diagnose-deployment-issue.sh ./out bucket-name cf-distribution-id cf-domain
```

### Step 3: Apply Automated Fixes

```bash
# Fix all issues automatically
./.github/scripts/fix-deployment-issues.sh all

# Or fix specific components
./.github/scripts/fix-deployment-issues.sh s3 bucket-name
./.github/scripts/fix-deployment-issues.sh cloudfront cf-distribution-id
./.github/scripts/fix-deployment-issues.sh terraform ./terraform staging
```

### Step 4: Manual Infrastructure Fix

```bash
# If Terraform needs to be re-applied
cd terraform
terraform plan -var-file="terraform.tfvars.staging"
terraform apply -auto-approve

# Get outputs for verification
terraform output
```

### Step 5: Manual S3 Upload

```bash
# If S3 sync fails, upload manually
aws s3 sync ./out/ s3://bucket-name/ --delete
aws s3 cp s3://bucket-name/ s3://bucket-name/ --recursive --metadata-directive REPLACE --content-type text/html --include "*.html"
```

### Step 6: CloudFront Invalidation

```bash
# Create invalidation to clear cache
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"

# Check invalidation status
aws cloudfront list-invalidations --distribution-id DISTRIBUTION_ID
```

## Verification Steps

After applying fixes, verify the deployment:

### 1. Check S3 Bucket

```bash
# Verify files are uploaded
aws s3 ls s3://bucket-name/ --recursive

# Check specific files
aws s3api head-object --bucket bucket-name --key index.html
```

### 2. Test CloudFront Access

```bash
# Test CloudFront domain
curl -I https://cloudfront-domain.cloudfront.net

# Test custom domain (if configured)
curl -I https://staging.yourdomain.com
```

### 3. Verify Content Types

```bash
# Check content types in S3
aws s3api head-object --bucket bucket-name --key index.html --query 'ContentType'
aws s3api head-object --bucket bucket-name --key _next/static/css/app.css --query 'ContentType'
```

## Common Issues and Solutions

### Issue: "Access Denied" from CloudFront

**Cause**: S3 bucket policy doesn't allow CloudFront OAC access

**Solution**:
```bash
./.github/scripts/fix-deployment-issues.sh s3 bucket-name cf-distribution-id
```

### Issue: "404 Not Found" from CloudFront

**Cause**: Files not uploaded to S3 or incorrect paths

**Solution**:
```bash
# Check if files exist in S3
aws s3 ls s3://bucket-name/index.html

# Re-upload if missing
aws s3 sync ./out/ s3://bucket-name/ --delete
```

### Issue: Stale Content Served

**Cause**: CloudFront cache not invalidated

**Solution**:
```bash
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

### Issue: Incorrect Content Types

**Cause**: Files uploaded without proper MIME types

**Solution**:
```bash
./.github/scripts/fix-deployment-issues.sh s3 bucket-name
```

## Prevention Measures

### 1. Pre-deployment Checks

- Verify `npm run build` completes successfully
- Check that `out/` directory contains expected files
- Validate Next.js configuration has `output: 'export'`

### 2. Monitoring

- Set up CloudWatch alarms for 4xx/5xx errors
- Monitor CloudFront metrics for cache hit rates
- Track deployment success/failure rates

### 3. Testing

- Add automated tests for deployment process
- Implement health checks after deployment
- Test both CloudFront and custom domain access

## Contact and Support

If issues persist after following these steps:

1. Check GitHub Actions logs for detailed error messages
2. Run the diagnostic script and share the output
3. Verify AWS credentials have necessary permissions
4. Check if there are any AWS service outages

## Script Usage Examples

### Diagnose Issues
```bash
# Basic diagnosis
./.github/scripts/diagnose-deployment-issue.sh

# With specific parameters
./.github/scripts/diagnose-deployment-issue.sh ./artifacts/out my-bucket-staging cf-abc123 cf-domain.cloudfront.net
```

### Fix Issues
```bash
# Fix all issues
./.github/scripts/fix-deployment-issues.sh all

# Fix only S3 issues
./.github/scripts/fix-deployment-issues.sh s3 my-bucket-staging cf-abc123

# Fix only CloudFront cache
./.github/scripts/fix-deployment-issues.sh cloudfront cf-abc123

# Fix Terraform infrastructure
./.github/scripts/fix-deployment-issues.sh terraform ./terraform staging
```

These scripts are now integrated into the GitHub Actions workflow and will run automatically when deployment failures occur.