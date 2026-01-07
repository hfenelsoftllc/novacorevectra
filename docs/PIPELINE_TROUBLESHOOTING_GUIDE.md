# Pipeline Troubleshooting Guide

## AWS Credentials Error: "Could not load credentials from any providers"

This error occurs when GitHub Actions cannot authenticate with AWS. Here are the possible causes and solutions:

### 🔍 **Root Cause Analysis**

The error "Credentials could not be loaded, please check your action inputs" typically means:

1. **Missing GitHub Secrets**: Required AWS credentials are not configured
2. **Incorrect Secret Names**: Secrets exist but have wrong names
3. **Invalid Credentials**: Credentials are expired or incorrect
4. **Permission Issues**: Credentials lack required permissions
5. **Backend State Issues**: Terraform state backend is not accessible

### 🛠️ **Solution Steps**

#### Step 1: Verify GitHub Secrets

Check that these secrets exist in your GitHub repository:

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `TERRAFORM_STATE_BUCKET`
- `TERRAFORM_STATE_LOCK_TABLE`

**Optional Secrets:**
- `SLACK_WEBHOOK_URL`
- `SNYK_TOKEN`

**To check/add secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Verify all required secrets are present
3. Add missing secrets if needed

#### Step 2: Verify AWS Credentials

Test your AWS credentials locally:

```bash
# Set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"

# Test credentials
aws sts get-caller-identity

# Expected output:
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-user"
}
```

#### Step 3: Verify Terraform Backend Resources

Ensure the Terraform state backend resources exist:

```bash
# Check if state bucket exists
aws s3 ls s3://novacorevectra-terraform-state

# Check if DynamoDB table exists
aws dynamodb describe-table --table-name terraform-state-lock
```

If these don't exist, create them:

```bash
# Create state bucket
aws s3 mb s3://novacorevectra-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket novacorevectra-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

#### Step 4: Verify IAM Permissions

Ensure your AWS user/role has the required permissions. Test key permissions:

```bash
# Test S3 permissions
aws s3 ls s3://novacorevectra-terraform-state

# Test DynamoDB permissions
aws dynamodb scan --table-name terraform-state-lock --limit 1

# Test basic AWS permissions
aws iam get-user
```

#### Step 5: Update GitHub Secrets

If secrets are missing or incorrect, update them:

1. **AWS_ACCESS_KEY_ID**: Your AWS access key
2. **AWS_SECRET_ACCESS_KEY**: Your AWS secret key
3. **TERRAFORM_STATE_BUCKET**: `novacorevectra-terraform-state`
4. **TERRAFORM_STATE_LOCK_TABLE**: `terraform-state-lock`

### 🔄 **Alternative: OIDC Authentication (Recommended)**

For better security, consider switching to OIDC authentication:

#### 1. Create OIDC Provider

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

#### 2. Create IAM Role

Create a role with this trust policy:

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
                    "token.actions.githubusercontent.com:sub": "repo:hfenelsoftllc/novacorevectra:*"
                }
            }
        }
    ]
}
```

#### 3. Update Workflow

Replace the credential configuration in `.github/workflows/deploy.yml`:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ${{ env.AWS_REGION }}
```

### 🐛 **Common Issues and Fixes**

#### Issue 1: "Access Denied" for S3 Backend

**Cause**: User lacks permissions for Terraform state bucket
**Fix**: Add S3 permissions to your IAM user/role

```json
{
    "Effect": "Allow",
    "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
    ],
    "Resource": [
        "arn:aws:s3:::novacorevectra-terraform-state",
        "arn:aws:s3:::novacorevectra-terraform-state/*"
    ]
}
```

#### Issue 2: "Table not found" for DynamoDB

**Cause**: DynamoDB table for state locking doesn't exist
**Fix**: Create the table as shown in Step 3

#### Issue 3: "Invalid credentials"

**Cause**: Credentials are expired or incorrect
**Fix**: Generate new access keys and update GitHub secrets

#### Issue 4: "Region mismatch"

**Cause**: Resources created in different region than expected
**Fix**: Ensure all resources are in `us-east-1`

### 📋 **Verification Checklist**

Before running the pipeline, verify:

- [ ] GitHub secrets are configured correctly
- [ ] AWS credentials work locally
- [ ] Terraform state bucket exists and is accessible
- [ ] DynamoDB table exists and is accessible
- [ ] IAM permissions are sufficient
- [ ] All resources are in the correct region (us-east-1)

### 🔧 **Quick Fix Commands**

If you need to quickly set up the backend resources:

```bash
# Set your AWS credentials
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_DEFAULT_REGION="us-east-1"

# Create all required resources
aws s3 mb s3://novacorevectra-terraform-state --region us-east-1
aws s3api put-bucket-versioning --bucket novacorevectra-terraform-state --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name terraform-state-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1

# Test Terraform initialization
cd terraform
terraform init
```

### 📞 **Getting Help**

If the issue persists:

1. Check the full GitHub Actions logs for more details
2. Verify AWS CloudTrail logs for authentication attempts
3. Test the exact same commands locally
4. Ensure your AWS account has no restrictions or policies blocking the actions

### 🔍 **Debug Commands**

Use these commands to debug credential issues:

```bash
# Check current AWS identity
aws sts get-caller-identity

# List available regions
aws ec2 describe-regions

# Test S3 access
aws s3 ls

# Test specific bucket access
aws s3 ls s3://novacorevectra-terraform-state

# Test DynamoDB access
aws dynamodb list-tables
```