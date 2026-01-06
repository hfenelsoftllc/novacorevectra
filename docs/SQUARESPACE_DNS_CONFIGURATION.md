# Squarespace DNS Configuration Guide

## Overview

This guide provides step-by-step instructions for configuring DNS records in Squarespace to point the `novacorevectra.net` domain to your AWS CloudFront distribution.

## Prerequisites

Before starting, ensure you have:

1. ✅ AWS infrastructure deployed (S3, CloudFront, Route53)
2. ✅ CloudFront distribution created and deployed
3. ✅ SSL certificate issued and validated
4. ✅ Access to Squarespace domain management
5. ✅ CloudFront distribution domain name (e.g., `d1234567890.cloudfront.net`)

## Step-by-Step Configuration

### Step 1: Gather Required Information

From your AWS deployment, collect the following information:

1. **CloudFront Distribution Domain Name**
   - Found in AWS Console → CloudFront → Your Distribution → Domain Name
   - Format: `d1234567890.cloudfront.net`

2. **Route53 Name Servers** (if using Route53 hosted zone)
   - Found in AWS Console → Route53 → Hosted Zones → Your Domain
   - Format: `ns-123.awsdns-12.com`, `ns-456.awsdns-45.net`, etc.

### Step 2: Access Squarespace Domain Settings

1. Log in to your Squarespace account
2. Navigate to **Settings** → **Domains**
3. Find `novacorevectra.net` in your domain list
4. Click **Manage** next to the domain

### Step 3: Choose Configuration Method

You have two options for DNS configuration:

#### Option A: Use Squarespace DNS (Recommended for Simplicity)
#### Option B: Use Route53 DNS (Recommended for Advanced Features)

---

## Option A: Squarespace DNS Configuration

### Step 3A: Configure DNS Records in Squarespace

1. In domain settings, click **Advanced DNS Settings**
2. Click **Manage DNS Records**

### Step 4A: Add Required DNS Records

Add the following DNS records:

#### Root Domain (novacorevectra.net)

1. **Add A Record**:
   - **Host**: `@` (or leave blank)
   - **Points To**: `CloudFront IP Address`
   - **TTL**: `3600` (1 hour)

   > **Note**: CloudFront doesn't provide static IP addresses. You'll need to use CNAME or ALIAS records instead.

2. **Add CNAME Record** (Alternative to A record):
   - **Host**: `@` (or leave blank)
   - **Points To**: `d1234567890.cloudfront.net` (your CloudFront domain)
   - **TTL**: `3600`

   > **Important**: Some DNS providers don't allow CNAME records for root domains. If this fails, contact Squarespace support.

#### WWW Subdomain

3. **Add CNAME Record for WWW**:
   - **Host**: `www`
   - **Points To**: `d1234567890.cloudfront.net`
   - **TTL**: `3600`

#### Staging Subdomain (Optional)

4. **Add CNAME Record for Staging**:
   - **Host**: `staging`
   - **Points To**: `d1234567890-staging.cloudfront.net` (your staging CloudFront domain)
   - **TTL**: `3600`

### Step 5A: Remove Conflicting Records

Remove any existing records that might conflict:

1. Delete existing A records pointing to other IPs
2. Delete existing CNAME records for `@` or `www`
3. Keep MX records for email (if applicable)

### Step 6A: Save and Verify Configuration

1. Click **Save** to apply changes
2. Wait 5-10 minutes for DNS propagation
3. Proceed to verification steps below

---

## Option B: Route53 DNS Configuration

### Step 3B: Update Name Servers in Squarespace

1. In domain settings, find **Name Servers** section
2. Select **Use Custom Name Servers**
3. Enter your Route53 name servers:
   ```
   ns-123.awsdns-12.com
   ns-456.awsdns-45.net
   ns-789.awsdns-78.org
   ns-012.awsdns-01.co.uk
   ```
4. Click **Save**

### Step 4B: Configure Route53 Records

Your Route53 hosted zone should already be configured by Terraform with:

1. **A Record (ALIAS)** for root domain → CloudFront
2. **AAAA Record (ALIAS)** for IPv6 → CloudFront
3. **CNAME Record** for www → CloudFront
4. **CNAME Record** for staging → Staging CloudFront (if applicable)

### Step 5B: Verify Route53 Configuration

Check your Route53 hosted zone has these records:

```
novacorevectra.net.     A       ALIAS   d1234567890.cloudfront.net
novacorevectra.net.     AAAA    ALIAS   d1234567890.cloudfront.net
www.novacorevectra.net. CNAME           d1234567890.cloudfront.net
```

---

## Verification Steps

### Step 1: DNS Propagation Check

Use online tools to verify DNS propagation:

1. **DNS Checker**: https://dnschecker.org/
   - Enter `novacorevectra.net`
   - Verify A/CNAME records point to CloudFront

2. **Command Line Check**:
   ```bash
   # Check A record
   nslookup novacorevectra.net
   
   # Check CNAME record
   nslookup www.novacorevectra.net
   
   # Check with specific DNS server
   nslookup novacorevectra.net 8.8.8.8
   ```

### Step 2: Website Accessibility Test

1. **Browser Test**:
   - Visit `https://novacorevectra.net`
   - Visit `https://www.novacorevectra.net`
   - Verify both load the website correctly

2. **SSL Certificate Test**:
   - Check that HTTPS works without warnings
   - Verify certificate is valid and issued by Amazon

3. **Mobile Test**:
   - Test on mobile devices
   - Verify responsive design works

### Step 3: Performance Verification

1. **Speed Test**:
   - Use Google PageSpeed Insights
   - Use GTmetrix or similar tools
   - Verify CloudFront caching is working

2. **Global Accessibility**:
   - Test from different geographic locations
   - Use tools like Pingdom or WebPageTest

### Step 4: Redirect Testing

Verify these redirects work correctly:

1. `http://novacorevectra.net` → `https://novacorevectra.net`
2. `http://www.novacorevectra.net` → `https://www.novacorevectra.net`
3. `https://www.novacorevectra.net` → `https://novacorevectra.net` (if configured)

## Troubleshooting Common Issues

### Issue 1: DNS Not Propagating

**Symptoms**: Domain still shows old content or doesn't resolve

**Solutions**:
1. Wait 24-48 hours for full global propagation
2. Clear your local DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemctl restart systemd-resolved
   ```
3. Try accessing from different networks/devices

### Issue 2: SSL Certificate Errors

**Symptoms**: Browser shows SSL warnings or errors

**Solutions**:
1. Verify certificate covers both `novacorevectra.net` and `www.novacorevectra.net`
2. Check certificate status in AWS Certificate Manager
3. Ensure CloudFront distribution is using the correct certificate
4. Wait for certificate validation to complete

### Issue 3: CNAME at Root Domain Not Supported

**Symptoms**: Squarespace rejects CNAME record for root domain

**Solutions**:
1. Use Route53 DNS instead (Option B)
2. Contact Squarespace support for ALIAS record support
3. Use A records with CloudFront IP ranges (not recommended due to IP changes)

### Issue 4: Partial Loading or Mixed Content

**Symptoms**: Some resources don't load or show mixed content warnings

**Solutions**:
1. Verify all resources use HTTPS URLs
2. Check CloudFront cache behavior settings
3. Clear CloudFront cache and browser cache
4. Verify S3 bucket permissions

### Issue 5: Staging Subdomain Not Working

**Symptoms**: `staging.novacorevectra.net` doesn't resolve

**Solutions**:
1. Verify staging CloudFront distribution is deployed
2. Check DNS record points to correct staging distribution
3. Ensure staging SSL certificate includes staging subdomain

## DNS Record Examples

### Final DNS Configuration (Squarespace DNS)

```
Type    Host    Points To                           TTL
A       @       [CloudFront IP or use CNAME]        3600
CNAME   www     d1234567890.cloudfront.net          3600
CNAME   staging d0987654321.cloudfront.net          3600
```

### Final DNS Configuration (Route53 DNS)

```
Type    Name                        Value                           TTL
A       novacorevectra.net.         ALIAS d1234567890.cloudfront.net    300
AAAA    novacorevectra.net.         ALIAS d1234567890.cloudfront.net    300
CNAME   www.novacorevectra.net.     d1234567890.cloudfront.net          300
CNAME   staging.novacorevectra.net. d0987654321.cloudfront.net          300
```

## Monitoring and Maintenance

### Regular Checks

1. **Monthly**: Verify website accessibility and performance
2. **Quarterly**: Check SSL certificate expiration (auto-renewed by AWS)
3. **Annually**: Review DNS configuration and optimize TTL values

### Automated Monitoring

Set up monitoring for:
1. Domain resolution (DNS monitoring)
2. Website uptime (HTTP monitoring)
3. SSL certificate validity
4. Performance metrics

### Contact Information

For DNS-related issues:
- **Squarespace Support**: https://support.squarespace.com/
- **AWS Support**: https://aws.amazon.com/support/
- **Emergency Contact**: [Your team's contact information]

## Next Steps

After successful DNS configuration:

1. ✅ Update any hardcoded URLs in your application
2. ✅ Set up monitoring and alerting
3. ✅ Configure analytics and tracking
4. ✅ Test the complete CI/CD pipeline
5. ✅ Document any custom configurations for your team