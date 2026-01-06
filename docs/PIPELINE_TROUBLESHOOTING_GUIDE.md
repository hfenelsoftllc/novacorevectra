# Pipeline Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting steps for the AWS CI/CD deployment pipeline, covering common issues, debugging procedures, and monitoring strategies.

## Quick Diagnosis Checklist

When the pipeline fails, start with this quick checklist:

- [ ] Check GitHub Actions workflow status
- [ ] Verify AWS credentials and permissions
- [ ] Check Terraform state and locks
- [ ] Verify S3 bucket accessibility
- [ ] Check CloudFront distribution status
- [ ] Verify DNS configuration
- [ ] Check security scan results
- [ ] Review build and test logs

## Common Issues and Solutions

### 1. Build and Test Failures

#### Issue: Node.js Dependencies Installation Fails

**Symptoms**:
```
npm ERR! code ENOTFOUND
npm ERR! errno ENOTFOUND
npm ERR! network request to https://registry.npmjs.org/ failed
```

**Diagnosis**:
```bash
# Check npm registry connectivity
npm config get registry
curl -I https://registry.npmjs.org/

# Check package-lock.json integrity
npm ci --dry-run
```

**Solutions**:
1. **Retry with exponential backoff**:
   ```yaml
   - name: Install dependencies
     run: npm ci
     timeout-minutes: 10
     continue-on-error: false
   ```

2. **Use npm cache**:
   ```yaml
   - name: Cache node modules
     uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

3. **Alternative registry**:
   ```bash
   npm config set registry https://registry.yarnpkg.com/
   ```

#### Issue: Next.js Build Fails

**Symptoms**:
```
Error: Build failed with errors
TypeError: Cannot read property 'map' of undefined
```

**Diagnosis**:
```bash
# Local build test
npm run build

# Check build configuration
cat next.config.js

# Verify environment variables
env | grep NEXT_
```

**Solutions**:
1. **Check environment variables**:
   ```yaml
   env:
     NODE_ENV: production
     NEXT_TELEMETRY_DISABLED: 1
   ```

2. **Increase memory limit**:
   ```yaml
   - name: Build application
     run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

3. **Debug build process**:
   ```bash
   npm run build -- --debug
   ```

#### Issue: Tests Fail in CI but Pass Locally

**Symptoms**:
```
Tests: 5 failed, 10 passed
Timeout: Test exceeded 30000ms
```

**Diagnosis**:
```bash
# Run tests with same conditions as CI
NODE_ENV=test npm test

# Check test timeouts
grep -r "timeout" src/__tests__/

# Verify test dependencies
npm ls --depth=0
```

**Solutions**:
1. **Increase test timeouts**:
   ```javascript
   // jest.config.js
   module.exports = {
     testTimeout: 60000,
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
   };
   ```

2. **Mock external dependencies**:
   ```javascript
   // Mock AWS SDK calls in tests
   jest.mock('aws-sdk');
   ```

3. **Parallel test execution**:
   ```yaml
   - name: Run tests
     run: npm test -- --maxWorkers=2
   ```

### 2. Security Scanning Issues

#### Issue: Security Scanner Fails to Run

**Symptoms**:
```
Error: Semgrep failed with exit code 2
Unable to download vulnerability database
```

**Diagnosis**:
```bash
# Test security tools locally
npx eslint --ext .js,.ts,.tsx src/
semgrep --config=auto src/
npm audit
```

**Solutions**:
1. **Retry with fallback**:
   ```yaml
   - name: Security scan
     run: |
       semgrep --config=auto src/ || echo "Semgrep failed, continuing with npm audit"
       npm audit --audit-level=high
   ```

2. **Update security databases**:
   ```yaml
   - name: Update security databases
     run: |
       npm update
       semgrep --update
   ```

#### Issue: False Positive Security Alerts

**Symptoms**:
```
High severity vulnerability in dev dependency
Known false positive for test files
```

**Solutions**:
1. **Configure security tool exclusions**:
   ```yaml
   # .semgrepignore
   src/__tests__/
   *.test.ts
   *.spec.ts
   ```

2. **Audit exceptions**:
   ```json
   // .npmrc
   audit-level=moderate
   ```

3. **Manual review process**:
   ```yaml
   - name: Security review
     if: failure()
     run: |
       echo "Security scan failed. Manual review required."
       echo "Review results and update security exceptions if needed."
   ```

### 3. AWS Infrastructure Issues

#### Issue: Terraform State Lock

**Symptoms**:
```
Error: Error locking state: Error acquiring the state lock
Lock Info:
  ID:        12345678-1234-1234-1234-123456789012
  Path:      terraform-state-lock
```

**Diagnosis**:
```bash
# Check DynamoDB lock table
aws dynamodb scan --table-name terraform-state-lock

# Check lock details
terraform force-unlock 12345678-1234-1234-1234-123456789012
```

**Solutions**:
1. **Force unlock (use carefully)**:
   ```bash
   terraform force-unlock 12345678-1234-1234-1234-123456789012
   ```

2. **Wait for automatic timeout**:
   ```yaml
   - name: Terraform apply
     run: terraform apply -auto-approve
     timeout-minutes: 30
   ```

3. **Check for stuck processes**:
   ```bash
   # Kill any stuck terraform processes
   pkill -f terraform
   ```

#### Issue: S3 Bucket Access Denied

**Symptoms**:
```
Error: AccessDenied: Access Denied
Status Code: 403
```

**Diagnosis**:
```bash
# Test S3 access
aws s3 ls s3://novacorevectra-production/
aws s3api get-bucket-policy --bucket novacorevectra-production

# Check IAM permissions
aws iam get-user
aws sts get-caller-identity
```

**Solutions**:
1. **Verify IAM permissions**:
   ```bash
   # Check attached policies
   aws iam list-attached-user-policies --user-name github-actions-user
   ```

2. **Update bucket policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::ACCOUNT:user/github-actions-user"
         },
         "Action": "s3:*",
         "Resource": [
           "arn:aws:s3:::novacorevectra-production",
           "arn:aws:s3:::novacorevectra-production/*"
         ]
       }
     ]
   }
   ```

#### Issue: CloudFront Distribution Not Updating

**Symptoms**:
```
CloudFront distribution is in "InProgress" state
Changes not reflected on website
```

**Diagnosis**:
```bash
# Check distribution status
aws cloudfront get-distribution --id E1234567890ABC

# Check invalidation status
aws cloudfront list-invalidations --distribution-id E1234567890ABC
```

**Solutions**:
1. **Wait for deployment**:
   ```yaml
   - name: Wait for CloudFront deployment
     run: |
       aws cloudfront wait distribution-deployed --id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }}
   ```

2. **Create cache invalidation**:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E1234567890ABC \
     --paths "/*"
   ```

3. **Check edge locations**:
   ```bash
   # Test from different locations
   curl -I https://novacorevectra.net
   ```

### 4. DNS and Domain Issues

#### Issue: Domain Not Resolving

**Symptoms**:
```
nslookup: can't resolve 'novacorevectra.net'
DNS_PROBE_FINISHED_NXDOMAIN
```

**Diagnosis**:
```bash
# Check DNS propagation
nslookup novacorevectra.net
dig novacorevectra.net
host novacorevectra.net

# Check from different DNS servers
nslookup novacorevectra.net 8.8.8.8
nslookup novacorevectra.net 1.1.1.1
```

**Solutions**:
1. **Verify DNS records**:
   ```bash
   # Check Route53 records
   aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC
   ```

2. **Check name servers**:
   ```bash
   # Verify name servers match
   dig NS novacorevectra.net
   ```

3. **Wait for propagation**:
   ```bash
   # DNS propagation can take 24-48 hours
   # Use online tools: https://dnschecker.org/
   ```

#### Issue: SSL Certificate Problems

**Symptoms**:
```
NET::ERR_CERT_AUTHORITY_INVALID
Certificate not trusted
```

**Diagnosis**:
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn arn:aws:acm:...

# Test SSL connection
openssl s_client -connect novacorevectra.net:443 -servername novacorevectra.net
```

**Solutions**:
1. **Verify certificate validation**:
   ```bash
   # Check DNS validation records
   aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC | grep _acme
   ```

2. **Request new certificate**:
   ```bash
   aws acm request-certificate \
     --domain-name novacorevectra.net \
     --subject-alternative-names www.novacorevectra.net \
     --validation-method DNS
   ```

### 5. Deployment and Rollback Issues

#### Issue: Deployment Stuck in Progress

**Symptoms**:
```
Deployment has been running for over 30 minutes
No progress updates in logs
```

**Diagnosis**:
```bash
# Check GitHub Actions workflow
gh run list --limit 5

# Check AWS resource status
aws s3api head-bucket --bucket novacorevectra-production
aws cloudfront get-distribution --id E1234567890ABC
```

**Solutions**:
1. **Cancel and retry**:
   ```bash
   # Cancel current workflow
   gh run cancel <run-id>
   
   # Trigger new deployment
   git push origin main --force-with-lease
   ```

2. **Manual intervention**:
   ```yaml
   - name: Manual checkpoint
     if: failure()
     run: |
       echo "Deployment failed. Manual intervention required."
       echo "Check AWS console for resource status."
   ```

#### Issue: Rollback Fails

**Symptoms**:
```
Previous version not found
S3 object does not exist
```

**Diagnosis**:
```bash
# Check available versions
aws s3 ls s3://novacorevectra-production/versions/

# Check deployment metadata
aws s3 cp s3://novacorevectra-production/deployment-metadata.json -
```

**Solutions**:
1. **Verify version exists**:
   ```bash
   # List all versions
   aws s3api list-object-versions --bucket novacorevectra-production
   ```

2. **Manual rollback**:
   ```bash
   # Copy previous version
   aws s3 sync s3://novacorevectra-production/versions/v1.2.3/ s3://novacorevectra-production/
   ```

## Monitoring and Debugging

### GitHub Actions Debugging

#### Enable Debug Logging

Add these secrets to your repository:
- `ACTIONS_STEP_DEBUG`: `true`
- `ACTIONS_RUNNER_DEBUG`: `true`

#### Workflow Debugging Commands

```yaml
- name: Debug environment
  run: |
    echo "Runner OS: ${{ runner.os }}"
    echo "GitHub ref: ${{ github.ref }}"
    echo "GitHub event: ${{ github.event_name }}"
    env | sort
```

#### SSH into Runner (for debugging)

```yaml
- name: Setup tmate session
  if: failure()
  uses: mxschmitt/action-tmate@v3
  timeout-minutes: 30
```

### AWS CloudWatch Monitoring

#### Key Metrics to Monitor

1. **S3 Metrics**:
   - `BucketRequests`
   - `BucketErrors`
   - `BucketSizeBytes`

2. **CloudFront Metrics**:
   - `Requests`
   - `BytesDownloaded`
   - `ErrorRate`
   - `OriginLatency`

3. **Custom Metrics**:
   - Deployment success/failure rate
   - Build duration
   - Test coverage percentage

#### CloudWatch Alarms

```bash
# Create deployment failure alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "DeploymentFailures" \
  --alarm-description "Alert on deployment failures" \
  --metric-name "DeploymentFailures" \
  --namespace "CI/CD" \
  --statistic "Sum" \
  --period 300 \
  --threshold 1 \
  --comparison-operator "GreaterThanOrEqualToThreshold"
```

#### Log Analysis

```bash
# Search CloudWatch logs
aws logs filter-log-events \
  --log-group-name "/aws/lambda/deployment-notifier" \
  --filter-pattern "ERROR"

# Export logs for analysis
aws logs create-export-task \
  --log-group-name "/aws/lambda/deployment-notifier" \
  --from 1640995200000 \
  --to 1641081600000 \
  --destination "s3://my-log-bucket"
```

### Performance Monitoring

#### Website Performance

```bash
# Test website speed
curl -w "@curl-format.txt" -o /dev/null -s "https://novacorevectra.net"

# Check Core Web Vitals
npx lighthouse https://novacorevectra.net --only-categories=performance
```

#### Pipeline Performance

Track these metrics:
- Build time
- Test execution time
- Deployment time
- Total pipeline duration

```yaml
- name: Track build time
  run: |
    START_TIME=$(date +%s)
    npm run build
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo "Build took $DURATION seconds"
    # Send to monitoring system
    curl -X POST "https://api.monitoring.com/metrics" \
      -d "build_duration=$DURATION"
```

## Emergency Procedures

### Complete Pipeline Failure

1. **Immediate Actions**:
   ```bash
   # Check website status
   curl -I https://novacorevectra.net
   
   # Verify DNS resolution
   nslookup novacorevectra.net
   
   # Check CloudFront status
   aws cloudfront get-distribution --id E1234567890ABC
   ```

2. **Rollback Procedure**:
   ```bash
   # Manual rollback to last known good version
   aws s3 sync s3://novacorevectra-production/versions/last-good/ s3://novacorevectra-production/
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
   ```

3. **Communication**:
   - Notify stakeholders via Slack/email
   - Update status page if available
   - Document incident for post-mortem

### Security Incident

1. **Immediate Response**:
   ```bash
   # Disable pipeline
   gh workflow disable deploy.yml
   
   # Revoke AWS credentials
   aws iam delete-access-key --access-key-id AKIA...
   
   # Check for unauthorized changes
   aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=PutObject
   ```

2. **Investigation**:
   - Review security scan results
   - Check access logs
   - Analyze recent commits
   - Verify infrastructure integrity

### Data Loss or Corruption

1. **Assessment**:
   ```bash
   # Check S3 versioning
   aws s3api list-object-versions --bucket novacorevectra-production
   
   # Verify backup integrity
   aws s3 ls s3://novacorevectra-backups/
   ```

2. **Recovery**:
   ```bash
   # Restore from backup
   aws s3 sync s3://novacorevectra-backups/latest/ s3://novacorevectra-production/
   
   # Verify restoration
   curl -I https://novacorevectra.net
   ```

## Preventive Measures

### Regular Maintenance

1. **Weekly**:
   - Review pipeline performance metrics
   - Check for security updates
   - Verify backup integrity

2. **Monthly**:
   - Update dependencies
   - Review and rotate secrets
   - Test disaster recovery procedures

3. **Quarterly**:
   - Security audit
   - Performance optimization
   - Documentation updates

### Monitoring Setup

```yaml
# Add to workflow for continuous monitoring
- name: Health check
  run: |
    curl -f https://novacorevectra.net/health || exit 1
    
- name: Performance check
  run: |
    RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s https://novacorevectra.net)
    if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l) )); then
      echo "Website is slow: ${RESPONSE_TIME}s"
      exit 1
    fi
```

## Contact Information

### Escalation Contacts

- **Primary**: DevOps Team - devops@company.com
- **Secondary**: Infrastructure Team - infrastructure@company.com
- **Emergency**: On-call Engineer - +1-555-0123

### External Support

- **AWS Support**: https://aws.amazon.com/support/
- **GitHub Support**: https://support.github.com/
- **Squarespace Support**: https://support.squarespace.com/

### Documentation Links

- [AWS Setup Requirements](./AWS_SETUP_REQUIREMENTS.md)
- [Squarespace DNS Configuration](./SQUARESPACE_DNS_CONFIGURATION.md)
- [Pipeline Architecture Diagram](./architecture-diagram.png)
- [Runbook for Common Tasks](./runbook.md)

## Additional Troubleshooting Scenarios

### GitHub Actions Specific Issues

#### Issue: Workflow Not Triggering

**Symptoms**:
```
No workflow runs appear after pushing to main/develop
Workflow shows as "skipped" in GitHub Actions
```

**Diagnosis**:
```bash
# Check workflow file syntax
yamllint .github/workflows/deploy.yml

# Verify branch protection rules
gh api repos/:owner/:repo/branches/main/protection

# Check repository settings
gh repo view --json defaultBranch,visibility
```

**Solutions**:
1. **Verify workflow triggers**:
   ```yaml
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]
   ```

2. **Check file permissions**:
   ```bash
   chmod +x .github/scripts/*.sh
   git add .github/scripts/
   git commit -m "Fix script permissions"
   ```

#### Issue: Artifact Upload/Download Failures

**Symptoms**:
```
Error: Artifact not found
Upload failed: Request timeout
```

**Diagnosis**:
```bash
# Check artifact retention settings
gh api repos/:owner/:repo/actions/artifacts

# Verify artifact names match between jobs
grep -r "upload-artifact" .github/workflows/
grep -r "download-artifact" .github/workflows/
```

**Solutions**:
1. **Consistent artifact naming**:
   ```yaml
   - name: Upload build artifacts
     uses: actions/upload-artifact@v4
     with:
       name: build-artifacts-${{ github.sha }}
       path: out/
   ```

2. **Add retry logic**:
   ```yaml
   - name: Download artifacts with retry
     uses: actions/download-artifact@v4
     with:
       name: build-artifacts-${{ github.sha }}
     continue-on-error: true
   ```

### Environment Configuration Issues

#### Issue: Environment Variables Not Loading

**Symptoms**:
```
Environment variable ENVIRONMENT is not set
Configuration file not found
```

**Diagnosis**:
```bash
# Check environment files exist
ls -la .github/config/
cat .github/config/staging.env
cat .github/config/production.env

# Verify environment loading in workflow
grep -A 10 "Load.*environment configuration" .github/workflows/deploy.yml
```

**Solutions**:
1. **Verify environment files**:
   ```bash
   # .github/config/staging.env
   ENVIRONMENT=staging
   S3_BUCKET_PREFIX=novacorevectra-staging
   HTML_CACHE_CONTROL="no-cache"
   ```

2. **Fix environment loading**:
   ```yaml
   - name: Load environment configuration
     run: |
       if [ ! -f .github/config/${{ env.ENVIRONMENT }}.env ]; then
         echo "Environment file not found"
         exit 1
       fi
       set -a
       source .github/config/${{ env.ENVIRONMENT }}.env
       set +a
   ```

### Script Execution Issues

#### Issue: Shell Scripts Fail with Permission Denied

**Symptoms**:
```
/bin/bash: .github/scripts/deploy.sh: Permission denied
chmod: Operation not permitted
```

**Solutions**:
1. **Set executable permissions in Git**:
   ```bash
   git update-index --chmod=+x .github/scripts/*.sh
   git commit -m "Make scripts executable"
   ```

2. **Add chmod in workflow**:
   ```yaml
   - name: Make scripts executable
     run: |
       chmod +x .github/scripts/deploy.sh
       chmod +x .github/scripts/security-gate.sh
   ```

#### Issue: Script Variables Not Exported

**Symptoms**:
```
Variable DEPLOYMENT_VERSION is not set
Script exits with undefined variable error
```

**Solutions**:
1. **Export variables properly**:
   ```bash
   # In script
   export DEPLOYMENT_VERSION="v$(date +%Y%m%d-%H%M%S)-${GITHUB_SHA:0:8}"
   echo "DEPLOYMENT_VERSION=$DEPLOYMENT_VERSION" >> $GITHUB_ENV
   ```

2. **Use GitHub Actions outputs**:
   ```yaml
   - name: Set deployment version
     id: version
     run: |
       VERSION="v$(date +%Y%m%d-%H%M%S)-${GITHUB_SHA:0:8}"
       echo "version=$VERSION" >> $GITHUB_OUTPUT
   ```

### Terraform-Specific Issues

#### Issue: Terraform Backend Configuration Errors

**Symptoms**:
```
Error: Backend configuration changed
Error: Failed to get existing workspaces
```

**Diagnosis**:
```bash
# Check backend configuration
terraform init -backend=false
terraform state list

# Verify S3 bucket and DynamoDB table
aws s3 ls s3://terraform-state-bucket/
aws dynamodb describe-table --table-name terraform-state-lock
```

**Solutions**:
1. **Reconfigure backend**:
   ```bash
   terraform init -reconfigure \
     -backend-config="bucket=terraform-state-bucket" \
     -backend-config="key=production/terraform.tfstate"
   ```

2. **Migrate state if needed**:
   ```bash
   terraform init -migrate-state
   ```

#### Issue: Terraform Plan Shows Unexpected Changes

**Symptoms**:
```
Plan: 5 to add, 3 to change, 2 to destroy
Resources being recreated unexpectedly
```

**Diagnosis**:
```bash
# Compare current state with configuration
terraform plan -detailed-exitcode
terraform show
terraform state show aws_s3_bucket.website
```

**Solutions**:
1. **Import existing resources**:
   ```bash
   terraform import aws_s3_bucket.website novacorevectra-production
   ```

2. **Use lifecycle rules**:
   ```hcl
   resource "aws_s3_bucket" "website" {
     lifecycle {
       prevent_destroy = true
       ignore_changes = [tags]
     }
   }
   ```

### CloudFront and CDN Issues

#### Issue: CloudFront Invalidation Takes Too Long

**Symptoms**:
```
Invalidation in progress for over 15 minutes
Website showing old content
```

**Diagnosis**:
```bash
# Check invalidation status
aws cloudfront list-invalidations --distribution-id E1234567890ABC
aws cloudfront get-invalidation --distribution-id E1234567890ABC --id I1234567890ABC
```

**Solutions**:
1. **Optimize invalidation patterns**:
   ```bash
   # Instead of invalidating everything
   aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
   
   # Invalidate specific paths
   aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/index.html" "/assets/*"
   ```

2. **Use versioned assets**:
   ```javascript
   // next.config.js
   module.exports = {
     assetPrefix: process.env.NODE_ENV === 'production' ? '/v1.2.3' : '',
   }
   ```

#### Issue: Custom Domain SSL Certificate Issues

**Symptoms**:
```
SSL certificate validation failed
Certificate not associated with CloudFront
```

**Diagnosis**:
```bash
# Check certificate status
aws acm list-certificates --region us-east-1
aws acm describe-certificate --certificate-arn arn:aws:acm:...

# Verify DNS validation records
dig _acme-challenge.novacorevectra.net TXT
```

**Solutions**:
1. **Verify DNS validation**:
   ```bash
   # Add CNAME record for validation
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC --change-batch file://validation-record.json
   ```

2. **Request new certificate in us-east-1**:
   ```bash
   aws acm request-certificate \
     --domain-name novacorevectra.net \
     --subject-alternative-names www.novacorevectra.net \
     --validation-method DNS \
     --region us-east-1
   ```

### Monitoring and Alerting Issues

#### Issue: CloudWatch Alarms Not Triggering

**Symptoms**:
```
No alerts received despite deployment failures
CloudWatch metrics not updating
```

**Diagnosis**:
```bash
# Check alarm configuration
aws cloudwatch describe-alarms --alarm-names "DeploymentFailures"
aws cloudwatch get-metric-statistics --namespace "CI/CD" --metric-name "DeploymentFailures"

# Test notification endpoints
aws sns publish --topic-arn arn:aws:sns:... --message "Test notification"
```

**Solutions**:
1. **Verify alarm configuration**:
   ```bash
   aws cloudwatch put-metric-alarm \
     --alarm-name "DeploymentFailures" \
     --alarm-description "Alert on deployment failures" \
     --metric-name "DeploymentFailures" \
     --namespace "CI/CD" \
     --statistic "Sum" \
     --period 300 \
     --threshold 1 \
     --comparison-operator "GreaterThanOrEqualToThreshold" \
     --alarm-actions "arn:aws:sns:us-east-1:123456789012:deployment-alerts"
   ```

2. **Test metric publishing**:
   ```bash
   aws cloudwatch put-metric-data \
     --namespace "CI/CD" \
     --metric-data MetricName=DeploymentFailures,Value=1,Unit=Count
   ```

### Performance and Optimization Issues

#### Issue: Build Times Increasing

**Symptoms**:
```
Build job taking over 10 minutes
npm install running slowly
```

**Diagnosis**:
```bash
# Analyze build performance
npm run build -- --analyze
npm ls --depth=0 | wc -l

# Check cache effectiveness
du -sh ~/.npm
```

**Solutions**:
1. **Optimize dependencies**:
   ```bash
   # Remove unused dependencies
   npm prune
   npx depcheck
   
   # Use exact versions
   npm shrinkwrap
   ```

2. **Improve caching**:
   ```yaml
   - name: Cache dependencies and build
     uses: actions/cache@v4
     with:
       path: |
         ~/.npm
         .next/cache
       key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
   ```

#### Issue: Large Bundle Sizes

**Symptoms**:
```
Build artifacts over 100MB
Slow page load times
```

**Solutions**:
1. **Bundle analysis**:
   ```bash
   npm run build -- --analyze
   npx webpack-bundle-analyzer .next/static/chunks/
   ```

2. **Optimize assets**:
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       formats: ['image/webp'],
       minimumCacheTTL: 31536000,
     },
     experimental: {
       optimizeCss: true,
     }
   }
   ```

### Rollback and Recovery Procedures

#### Issue: Rollback Script Fails

**Symptoms**:
```
Previous version not found in S3
Rollback script exits with error
```

**Diagnosis**:
```bash
# Check available versions
aws s3 ls s3://novacorevectra-production/versions/
cat deployment-metadata.json

# Verify rollback script
bash -x .github/scripts/rollback.sh
```

**Solutions**:
1. **Manual rollback procedure**:
   ```bash
   # List available versions
   aws s3 ls s3://novacorevectra-production/versions/
   
   # Copy previous version
   PREVIOUS_VERSION=$(aws s3 ls s3://novacorevectra-production/versions/ | tail -2 | head -1 | awk '{print $2}')
   aws s3 sync s3://novacorevectra-production/versions/$PREVIOUS_VERSION s3://novacorevectra-production/
   
   # Invalidate CloudFront
   aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
   ```

2. **Verify rollback success**:
   ```bash
   # Health check
   curl -f https://novacorevectra.net/health
   
   # Verify version
   curl -s https://novacorevectra.net/version.json
   ```

## Advanced Debugging Techniques

### GitHub Actions Runner Debugging

#### Enable Debug Logging
```bash
# Set repository secrets
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
```

#### SSH into Runner for Live Debugging
```yaml
- name: Setup tmate session
  if: failure()
  uses: mxschmitt/action-tmate@v3
  timeout-minutes: 30
```

#### Capture Full Environment
```yaml
- name: Debug environment
  run: |
    echo "=== System Information ==="
    uname -a
    df -h
    free -h
    
    echo "=== Environment Variables ==="
    env | sort
    
    echo "=== GitHub Context ==="
    echo '${{ toJSON(github) }}'
    
    echo "=== Runner Context ==="
    echo '${{ toJSON(runner) }}'
```

### AWS Resource Debugging

#### Comprehensive Resource Status Check
```bash
#!/bin/bash
# comprehensive-aws-check.sh

echo "=== S3 Bucket Status ==="
aws s3api head-bucket --bucket novacorevectra-production
aws s3api get-bucket-website --bucket novacorevectra-production
aws s3 ls s3://novacorevectra-production/ --recursive --human-readable --summarize

echo "=== CloudFront Distribution Status ==="
aws cloudfront get-distribution --id E1234567890ABC --query 'Distribution.{Status:Status,DomainName:DomainName,Enabled:Enabled}'
aws cloudfront list-invalidations --distribution-id E1234567890ABC --max-items 5

echo "=== Route53 DNS Status ==="
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC --query 'ResourceRecordSets[?Type==`A` || Type==`AAAA`]'

echo "=== Certificate Status ==="
aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[?DomainName==`novacorevectra.net`]'
```

### Log Analysis and Monitoring

#### Centralized Log Collection
```bash
#!/bin/bash
# collect-logs.sh

mkdir -p debug-logs/$(date +%Y%m%d-%H%M%S)
cd debug-logs/$(date +%Y%m%d-%H%M%S)

# GitHub Actions logs
gh run list --limit 10 --json databaseId,status,conclusion,createdAt > github-runs.json
gh run view --log > github-actions.log

# AWS CloudWatch logs
aws logs describe-log-groups --query 'logGroups[?contains(logGroupName, `deployment`)]' > cloudwatch-groups.json
aws logs filter-log-events --log-group-name "/aws/lambda/deployment-notifier" --start-time $(date -d '1 hour ago' +%s)000 > lambda-logs.json

# Terraform logs
terraform show -json > terraform-state.json
terraform plan -no-color > terraform-plan.txt

# Security scan results
find . -name "*-report.json" -exec cp {} . \;

echo "Debug logs collected in: $(pwd)"
```

---

**Last Updated**: January 5, 2026  
**Version**: 2.0  
**Maintained By**: DevOps Team