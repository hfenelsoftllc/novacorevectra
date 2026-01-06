# Security Configuration

This directory contains security configuration files for the CI/CD pipeline.

## Files

### security-thresholds.json
Defines vulnerability thresholds and deployment blocking rules:
- `vulnerabilityThresholds`: Maximum allowed vulnerabilities by severity
- `blockDeployment`: Whether to block deployment for each severity level
- `notifications`: Which channels to notify for each severity level

## Security Tools

### ESLint Security Plugin
- Configuration: `.eslintrc.security.json`
- Detects common JavaScript/TypeScript security anti-patterns
- Runs as part of the security scanning pipeline

### Semgrep
- Configuration: `.semgrep.yml`
- Static analysis for security vulnerabilities
- Custom rules for JavaScript/TypeScript/React

### npm audit
- Built-in Node.js dependency vulnerability scanner
- Checks against the npm security advisory database
- Configurable severity thresholds

### Snyk
- Advanced dependency vulnerability scanning
- Requires SNYK_TOKEN secret to be configured
- Provides detailed vulnerability information and fixes

### TruffleHog
- Configuration: `.trufflehog.yml`
- Scans git history for exposed secrets
- Verifies findings to reduce false positives

## Security Gate

The security gate (`security-gate.sh`) evaluates all scan results and determines if deployment should proceed based on:
1. Vulnerability counts vs. thresholds
2. Severity levels and blocking rules
3. Presence of verified secrets

## Usage

### Local Security Scanning
```bash
# Run all security checks
npm run security:full

# Run individual checks
npm run lint:security
npm run security:audit
```

### CI/CD Pipeline
Security scanning runs automatically on all pushes to main and develop branches. The security gate will block deployment if critical issues are found.

## Configuration

### Required Secrets
- `SNYK_TOKEN`: Snyk API token for dependency scanning (optional)

### Thresholds
Edit `security-thresholds.json` to adjust vulnerability thresholds and blocking rules.

### Custom Rules
- Add ESLint security rules in `.eslintrc.security.json`
- Add Semgrep rules in `.semgrep.yml`
- Add TruffleHog patterns in `.trufflehog.yml`