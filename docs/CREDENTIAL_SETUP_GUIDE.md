# AWS Credentials Setup Guide

## 🚨 **Issue: "Credentials could not be loaded, please check your action inputs"**

This error occurs because the required AWS credentials and backend resources are not properly configured in GitHub Actions.

## 🔍 **Root Cause**

The GitHub Actions workflow requires:
1. **AWS Credentials** (Access Key ID and Secret Access Key)
2. **Terraform Backend Resources** (S3 bucket and DynamoDB table)
3. **GitHub Secrets** properly configured

## 🛠️ **Complete Solution**

### Step 1: Create AWS User and Get Credentials

1. **Log into AWS Console**
2. **Go to IAM → Users → Create User**
3. **User name**: `github-actions-deployment`
4. **Attach policies**: Create a custom policy with the permissions from `docs/AWS_SETUP_REQUIREMENTS.md`
5. **Create access key**: Go to Security credentials → Create access key → Command Line Interface (CLI)
6. **Save the credentials**: You'll need both Access Key ID and Secret Access Key

### Step 2: Set Up AWS Backend Resources

Run this script locally (with AWS CLI configured):

```bash
# Make the script executable
chmod +x .github/scripts/setup-aws-backend.sh

# Run the setup script
./.github/scripts/setup-aws-backend.sh
```

This creates:
- S3 bucket: `novacorevectra-terraform-state`
- DynamoDB table: `terraform-state-lock`

### Step 3: Configure GitHub Secrets

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Secrets and variables → Actions
3. **Add these secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | Your AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | `wJalrXUt...` | Your AWS secret access key |
| `TERRAFORM_STATE_BUCKET` | `novacorevectra-terraform-state` | S3 bucket for Terraform state |
| `TERRAFORM_STATE_LOCK_TABLE` | `terraform-state-lock` | DynamoDB table for state locking |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | (Optional) Slack webhook URL |

### Step 4: Verify Setup

Push a commit to trigger the workflow and verify it works:

```bash
git add .
git commit -m "Test AWS credentials setup"
git push origin main
```

## 🔧 **Quick Fix Commands**

If you have AWS CLI configured locally, run these commands:

```bash
# 1. Create backend resources
aws s3 mb s3://novacorevectra-terraform-state --region us-east-1
aws s3api put-bucket-versioning --bucket novacorevectra-terraform-state --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name terraform-state-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1

# 2. Test Terraform locally
cd terraform
terraform init
terraform plan -var-file="terraform.tfvars.staging"
```

## 🧪 **Testing Your Setup**

Use the diagnostic script to verify everything is working:

```bash
# In GitHub Actions (automatically runs on failure)
# Or run locally:
chmod +x .github/scripts/diagnose-credentials.sh
./.github/scripts/diagnose-credentials.sh
```

## 📋 **Troubleshooting Checklist**

- [ ] AWS user exists with proper permissions
- [ ] Access keys are generated and valid
- [ ] S3 bucket `novacorevectra-terraform-state` exists
- [ ] DynamoDB table `terraform-state-lock` exists
- [ ] All GitHub secrets are configured correctly
- [ ] Secrets have the exact names shown above
- [ ] AWS resources are in `us-east-1` region

## 🔐 **Security Best Practices**

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Regular Rotation**: Rotate access keys every 90 days
3. **Monitor Usage**: Enable CloudTrail for API logging
4. **Use OIDC**: Consider switching to OIDC authentication for better security

## 🆘 **Still Having Issues?**

1. **Check the full error logs** in GitHub Actions
2. **Verify AWS account limits** and quotas
3. **Test credentials locally** with AWS CLI
4. **Review IAM permissions** in AWS Console
5. **Check CloudTrail logs** for authentication failures

## 📖 **Additional Resources**

- [AWS Setup Requirements](./AWS_SETUP_REQUIREMENTS.md)
- [Pipeline Troubleshooting Guide](./PIPELINE_TROUBLESHOOTING_GUIDE.md)
- [Slack Setup Guide](./SLACK_SETUP.md)

## 🎯 **Expected Outcome**

After completing these steps:
- ✅ GitHub Actions can authenticate with AWS
- ✅ Terraform can initialize and manage state
- ✅ Deployments to staging and production work
- ✅ All pipeline steps complete successfully