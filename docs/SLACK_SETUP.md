# Slack Integration Setup

This document explains how to set up Slack notifications for your infrastructure and deployment events.

## GitHub Secret Configuration

To enable Slack notifications, you need to set up the SLACK_WEBHOOK_URL as a GitHub secret.

### 1. Create GitHub Secret

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click New repository secret
4. Name: SLACK_WEBHOOK_URL
5. Value: [Your Slack webhook URL here]
6. Click Add secret

### 2. Terraform Usage

The Terraform configuration will automatically use this secret via the TF_VAR_slack_webhook_url environment variable in GitHub Actions workflows.

### 3. What Gets Notified

When configured, you will receive Slack notifications for:

- CloudWatch Alarms: Infrastructure monitoring alerts
- Deployment Events: CI/CD pipeline status updates
- Health Check Failures: Website availability issues
- Certificate Renewals: SSL certificate status

### 4. Testing the Integration

After setting up the secret, the next deployment will automatically create:

- Lambda functions for Slack notifications
- SNS topics for event routing
- CloudWatch log groups for monitoring

### 5. Disabling Notifications

To disable Slack notifications:
- Remove the SLACK_WEBHOOK_URL GitHub secret
- The Terraform configuration will automatically skip creating notification resources

## Security Notes

- The webhook URL is marked as sensitive = true in Terraform
- It is stored securely as a GitHub secret
- Never commit webhook URLs directly to the repository
- GitHub push protection will block commits containing webhook URLs

## Getting Your Slack Webhook URL

1. Go to your Slack workspace
2. Navigate to Apps → Incoming Webhooks
3. Create a new webhook for your desired channel
4. Copy the webhook URL (starts with https://hooks.slack.com/services/)
5. Add it as a GitHub secret following the steps above