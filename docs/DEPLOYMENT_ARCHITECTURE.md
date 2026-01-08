# Deployment Architecture

## Overview

This project uses a secure, modern AWS architecture with CloudFront Origin Access Control (OAC) for static website hosting. This setup provides better security and performance compared to traditional S3 website hosting.

## Architecture Components

### 1. S3 Bucket (Private)
- **Purpose**: Stores static website files
- **Access**: Private bucket, no public access
- **Security**: All public access is blocked
- **Website Endpoint**: Disabled (returns 403 by design)

### 2. CloudFront Distribution
- **Purpose**: Content Delivery Network (CDN) and secure access layer
- **Access Method**: Origin Access Control (OAC)
- **Security**: Only CloudFront can access S3 bucket
- **Caching**: Optimized cache policies for different file types

### 3. Route53 DNS
- **Purpose**: Domain name resolution
- **Configuration**: Points custom domain to CloudFront
- **SSL**: ACM certificate for HTTPS

## Access Flow

```
User Request → Route53 → CloudFront → S3 Bucket (via OAC)
```

## Important Notes

### ✅ Expected Behavior
- **CloudFront Domain**: `https://d1234567890abc.cloudfront.net` → ✅ Works
- **Custom Domain**: `https://yourdomain.com` → ✅ Works
- **S3 Website Endpoint**: `http://bucket.s3-website-region.amazonaws.com` → ❌ Returns 403 (Expected!)

### 🔒 Security Benefits
1. **No Public S3 Access**: Bucket is completely private
2. **OAC Authentication**: Only CloudFront can access files
3. **HTTPS Enforcement**: All traffic encrypted
4. **Security Headers**: Automatic security headers via CloudFront

### ⚡ Performance Benefits
1. **Global CDN**: Files cached at edge locations worldwide
2. **Optimized Caching**: Different cache policies for HTML vs static assets
3. **Compression**: Automatic gzip/brotli compression
4. **HTTP/2**: Modern protocol support

## Deployment Process

1. **Build**: Next.js static export creates files in `out/` directory
2. **Upload**: Files uploaded to private S3 bucket
3. **Invalidation**: CloudFront cache invalidated for immediate updates
4. **Verification**: Tests CloudFront domain accessibility

## Troubleshooting

### Common Issues

#### 1. HTTP 403 on S3 Website Endpoint
**Status**: ✅ Expected behavior
**Reason**: S3 website endpoint is disabled for security
**Solution**: Use CloudFront domain instead

#### 2. CloudFront Returns 403/404
**Status**: ⚠️ Temporary issue
**Reason**: CloudFront propagation in progress
**Solution**: Wait up to 15 minutes for propagation

#### 3. Custom Domain Not Working
**Status**: ❌ Configuration issue
**Reason**: DNS not pointing to CloudFront or certificate issues
**Solution**: Check Route53 and ACM certificate

### Troubleshooting Script

Use the provided troubleshooting script:

```bash
./.github/scripts/troubleshoot-deployment.sh <bucket-name> [distribution-id] [cloudfront-domain] [version]
```

Example:
```bash
./.github/scripts/troubleshoot-deployment.sh novacorevectra-production E1234567890ABC d1234567890abc.cloudfront.net v2026.01.08-production-12345678-1234567890
```

## Environment Differences

### Production
- **Domain**: `https://yourdomain.com`
- **CloudFront**: Full global distribution
- **Caching**: Aggressive caching for performance
- **Monitoring**: Full health checks and alerts

### Staging
- **Domain**: `https://staging.yourdomain.com`
- **CloudFront**: Reduced edge locations (cost optimization)
- **Caching**: Shorter cache times for testing
- **Monitoring**: Basic monitoring

## Monitoring and Alerts

### CloudWatch Metrics
- CloudFront request count and error rates
- S3 bucket size and request metrics
- Custom deployment success/failure metrics

### SNS Notifications
- Deployment status updates
- Health check failures
- CloudWatch alarms

### Health Checks
- Production: Route53 health checks
- Staging: Basic availability checks

## Cost Optimization

1. **S3 Lifecycle**: Old versions deleted after 30 days
2. **CloudFront**: Staging uses cheaper price class
3. **Monitoring**: Essential metrics only
4. **Logs**: Optional access logging

## Security Considerations

1. **No Public S3**: Eliminates direct S3 access risks
2. **OAC**: Secure authentication between CloudFront and S3
3. **HTTPS Only**: All traffic encrypted
4. **Security Headers**: Automatic security headers
5. **Access Logs**: Optional logging for audit trails

## Migration Notes

If migrating from traditional S3 website hosting:

1. **Update DNS**: Point to CloudFront instead of S3
2. **Update Verification**: Test CloudFront domain, not S3 website endpoint
3. **Update Monitoring**: Monitor CloudFront metrics instead of S3 website metrics
4. **Update Documentation**: Update any references to S3 website endpoints