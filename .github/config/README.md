# Environment Configuration

This directory contains environment-specific configuration files for the AWS CI/CD deployment pipeline.

## Configuration Files

### `staging.env`
Configuration for the staging environment:
- Deployed from `develop` branch
- Uses cost-optimized settings (cheaper CloudFront price class, no logging)
- Sets `noindex, nofollow` robots tag to prevent search engine indexing
- Shorter deployment timeouts for faster feedback

### `production.env`
Configuration for the production environment:
- Deployed from `main` branch
- Uses full-featured settings (all CloudFront edge locations, logging enabled)
- Sets `index, follow` robots tag for search engine optimization
- Longer deployment timeouts for reliability

## Configuration Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment name | `staging` or `production` |
| `AWS_REGION` | AWS region for resources | `us-east-1` |
| `DOMAIN_NAME` | Base domain name | `novacorevectra.net` |
| `PROJECT_NAME` | Project identifier | `novacorevectra` |
| `S3_BUCKET_PREFIX` | S3 bucket name prefix | `novacorevectra-staging` |

### S3 Configuration

| Variable | Description | Values |
|----------|-------------|--------|
| `ENABLE_S3_VERSIONING` | Enable S3 bucket versioning | `true` or `false` |
| `ENABLE_S3_LOGGING` | Enable S3 access logging | `true` or `false` |

### CloudFront Configuration

| Variable | Description | Values |
|----------|-------------|--------|
| `CLOUDFRONT_PRICE_CLASS` | CloudFront price class | `PriceClass_All`, `PriceClass_200`, `PriceClass_100` |
| `CLOUDFRONT_MIN_TTL` | Minimum TTL in seconds | `0` |
| `CLOUDFRONT_DEFAULT_TTL` | Default TTL in seconds | `3600` |
| `CLOUDFRONT_MAX_TTL` | Maximum TTL in seconds | `86400` |

### Cache Control Settings

| Variable | Description | Example |
|----------|-------------|---------|
| `HTML_CACHE_CONTROL` | Cache control for HTML files | `public, max-age=300` |
| `STATIC_CACHE_CONTROL` | Cache control for static assets | `public, max-age=31536000` |
| `API_CACHE_CONTROL` | Cache control for API responses | `public, max-age=3600` |

### Security Headers

| Variable | Description | Values |
|----------|-------------|--------|
| `ROBOTS_TAG` | Robots meta tag value | `index, follow` or `noindex, nofollow` |
| `HSTS_MAX_AGE` | HSTS max age in seconds | `31536000` |

### Deployment Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `DEPLOYMENT_TIMEOUT` | Deployment timeout in seconds | `600` (staging), `900` (production) |
| `INVALIDATION_TIMEOUT` | CloudFront invalidation timeout | `900` (staging), `1200` (production) |
| `SYNC_DELETE_FLAG` | Delete files not in source | `true` |

## Usage

### In GitHub Actions

The deployment jobs automatically load the appropriate configuration file:

```yaml
- name: Load staging environment configuration
  run: |
    set -a
    source .github/config/staging.env
    set +a
    # Variables are now available in subsequent steps
```

### In Deployment Script

The deployment script accepts the environment name and loads the configuration:

```bash
./.github/scripts/deploy.sh staging ./artifacts/out bucket-name
```

### Configuration Validation

Validate all configuration files:

```bash
./.github/scripts/validate-config.sh
```

## Environment Differences

### Staging vs Production

| Setting | Staging | Production | Reason |
|---------|---------|------------|--------|
| CloudFront Price Class | `PriceClass_100` | `PriceClass_All` | Cost optimization vs global performance |
| S3 Logging | Disabled | Enabled | Cost vs compliance requirements |
| Robots Tag | `noindex, nofollow` | `index, follow` | Prevent staging indexing |
| Deployment Timeout | 600s | 900s | Faster feedback vs reliability |
| Health Checks | Disabled | Enabled | Simplified staging vs production monitoring |

## Adding New Environments

To add a new environment (e.g., `development`):

1. Create `.github/config/development.env` with required variables
2. Add environment-specific Terraform variables file: `terraform/terraform.tfvars.development`
3. Update GitHub Actions workflow to include the new environment
4. Update the deployment script to handle the new environment
5. Run configuration validation to ensure correctness

## Security Considerations

- Configuration files are stored in the repository and are publicly visible
- Sensitive values (API keys, secrets) should be stored in GitHub Secrets
- Environment variables in these files should only contain non-sensitive configuration
- Use GitHub Environments to control deployment approvals and secrets access

## Troubleshooting

### Common Issues

1. **Invalid cache control format**: Ensure cache control headers follow the format `public, max-age=<seconds>`
2. **Boolean values**: Use lowercase `true` or `false` for boolean variables
3. **Timeout values**: Must be numeric values in seconds
4. **CloudFront price class**: Must be one of the valid AWS price classes

### Validation Errors

Run the validation script to check for configuration issues:

```bash
./.github/scripts/validate-config.sh
```

The script will report:
- Missing required variables
- Invalid variable formats
- Environment-specific validation warnings
- Differences between staging and production configurations