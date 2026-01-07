#!/bin/bash

# Security Gate Script with Comprehensive Logging
# This script evaluates security scan results and determines if deployment should proceed

set -e

# Source the comprehensive logging system
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/pipeline-logger.sh"

SECURITY_GATE_PASSED=true
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MODERATE_ISSUES=0
LOW_ISSUES=0
SECRETS_FOUND=0

log_step_start "security_gate_evaluation" "security"

# Load security thresholds
THRESHOLDS_FILE=".github/config/security-thresholds.json"
if [ ! -f "$THRESHOLDS_FILE" ]; then
    log_step_failure "security_gate_evaluation" "Security thresholds configuration not found: $THRESHOLDS_FILE" "security"
    exit 1
fi

log_info "Security thresholds configuration loaded" "security" "security_gate_evaluation"

# Function to extract threshold values
get_threshold() {
    local severity=$1
    jq -r ".vulnerabilityThresholds.$severity" "$THRESHOLDS_FILE"
}

# Function to check if deployment should be blocked
should_block_deployment() {
    local severity=$1
    jq -r ".blockDeployment.$severity" "$THRESHOLDS_FILE"
}

# Evaluate ESLint Security Results
log_info "Evaluating ESLint Security Results" "security" "eslint_evaluation"
if [ -f "eslint-security-report.json" ]; then
    ESLINT_ISSUES=$(cat eslint-security-report.json | jq '[.[] | select(.messages | length > 0)] | length')
    log_security_scan "eslint" "completed" "$ESLINT_ISSUES" "0" "0" "{\"issues_found\": $ESLINT_ISSUES}"
    
    if [ "$ESLINT_ISSUES" -gt 0 ]; then
        log_warn "ESLint security issues found - review required" "security" "eslint_evaluation"
        MODERATE_ISSUES=$((MODERATE_ISSUES + ESLINT_ISSUES))
    else
        log_info "No ESLint security issues found" "security" "eslint_evaluation"
    fi
else
    log_error "ESLint security report not found" "security" "eslint_evaluation"
    SECURITY_GATE_PASSED=false
fi

# Evaluate Semgrep Results
log_info "Evaluating Semgrep Results" "security" "semgrep_evaluation"
if [ -f "semgrep-report.json" ]; then
    SEMGREP_CRITICAL=$(cat semgrep-report.json | jq '[.results[] | select(.extra.severity == "ERROR")] | length')
    SEMGREP_WARNING=$(cat semgrep-report.json | jq '[.results[] | select(.extra.severity == "WARNING")] | length')
    
    log_security_scan "semgrep" "completed" "$((SEMGREP_CRITICAL + SEMGREP_WARNING))" "$SEMGREP_CRITICAL" "0" "{\"critical\": $SEMGREP_CRITICAL, \"warnings\": $SEMGREP_WARNING}"
    
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + SEMGREP_CRITICAL))
    MODERATE_ISSUES=$((MODERATE_ISSUES + SEMGREP_WARNING))
    
    if [ "$SEMGREP_CRITICAL" -gt 0 ]; then
        log_error "Critical security issues found by Semgrep" "security" "semgrep_evaluation"
    else
        log_info "No critical security issues found by Semgrep" "security" "semgrep_evaluation"
    fi
else
    log_error "Semgrep report not found" "security" "semgrep_evaluation"
    SECURITY_GATE_PASSED=false
fi

# Evaluate npm audit Results
log_info "Evaluating npm audit Results" "security" "npm_audit_evaluation"
if [ -f "npm-audit-report.json" ]; then
    NPM_CRITICAL=$(cat npm-audit-report.json | jq -r '.metadata.vulnerabilities.critical // 0')
    NPM_HIGH=$(cat npm-audit-report.json | jq -r '.metadata.vulnerabilities.high // 0')
    NPM_MODERATE=$(cat npm-audit-report.json | jq -r '.metadata.vulnerabilities.moderate // 0')
    NPM_LOW=$(cat npm-audit-report.json | jq -r '.metadata.vulnerabilities.low // 0')
    
    npm_total=$((NPM_CRITICAL + NPM_HIGH + NPM_MODERATE + NPM_LOW))
    log_security_scan "npm_audit" "completed" "$npm_total" "$NPM_CRITICAL" "$NPM_HIGH" "{\"critical\": $NPM_CRITICAL, \"high\": $NPM_HIGH, \"moderate\": $NPM_MODERATE, \"low\": $NPM_LOW}"
    
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + NPM_CRITICAL))
    HIGH_ISSUES=$((HIGH_ISSUES + NPM_HIGH))
    MODERATE_ISSUES=$((MODERATE_ISSUES + NPM_MODERATE))
    LOW_ISSUES=$((LOW_ISSUES + NPM_LOW))
else
    log_error "npm audit report not found" "security" "npm_audit_evaluation"
    SECURITY_GATE_PASSED=false
fi

# Evaluate Snyk Results
log_info "Evaluating Snyk Results" "security" "snyk_evaluation"
if [ -f "snyk-report.json" ]; then
    SNYK_TOTAL=$(cat snyk-report.json | jq '.vulnerabilities | length')
    log_security_scan "snyk" "completed" "$SNYK_TOTAL" "0" "$SNYK_TOTAL" "{\"total_vulnerabilities\": $SNYK_TOTAL}"
    
    # Snyk vulnerabilities are typically high severity
    HIGH_ISSUES=$((HIGH_ISSUES + SNYK_TOTAL))
    
    if [ "$SNYK_TOTAL" -gt 0 ]; then
        log_warn "Snyk vulnerabilities found - review required" "security" "snyk_evaluation"
    else
        log_info "No Snyk vulnerabilities found" "security" "snyk_evaluation"
    fi
else
    log_warn "Snyk report not found (may be skipped)" "security" "snyk_evaluation"
fi

# Evaluate TruffleHog Results
log_info "Evaluating TruffleHog Results" "security" "trufflehog_evaluation"
if [ -f "trufflehog-report.json" ]; then
    VERIFIED_SECRETS=$(cat trufflehog-report.json | jq -s 'map(select(.Verified == true)) | length')
    TOTAL_FINDINGS=$(cat trufflehog-report.json | jq -s 'length')
    
    log_security_scan "trufflehog" "completed" "$TOTAL_FINDINGS" "$VERIFIED_SECRETS" "0" "{\"total_findings\": $TOTAL_FINDINGS, \"verified_secrets\": $VERIFIED_SECRETS}"
    
    SECRETS_FOUND=$VERIFIED_SECRETS
    
    if [ "$VERIFIED_SECRETS" -gt 0 ]; then
        log_error "Verified secrets found - CRITICAL SECURITY ISSUE" "security" "trufflehog_evaluation"
        CRITICAL_ISSUES=$((CRITICAL_ISSUES + VERIFIED_SECRETS))
    else
        log_info "No verified secrets found" "security" "trufflehog_evaluation"
    fi
else
    log_error "TruffleHog report not found" "security" "trufflehog_evaluation"
    SECURITY_GATE_PASSED=false
fi

# Check thresholds and determine if deployment should be blocked
log_info "Security Gate Threshold Evaluation" "security" "threshold_evaluation"

CRITICAL_THRESHOLD=$(get_threshold "critical")
HIGH_THRESHOLD=$(get_threshold "high")
MODERATE_THRESHOLD=$(get_threshold "moderate")
LOW_THRESHOLD=$(get_threshold "low")

threshold_info=$(cat <<EOF
{
    "found": {
        "critical": $CRITICAL_ISSUES,
        "high": $HIGH_ISSUES,
        "moderate": $MODERATE_ISSUES,
        "low": $LOW_ISSUES
    },
    "thresholds": {
        "critical": $CRITICAL_THRESHOLD,
        "high": $HIGH_THRESHOLD,
        "moderate": $MODERATE_THRESHOLD,
        "low": $LOW_THRESHOLD
    }
}
EOF
)

log_info "Security threshold comparison" "security" "threshold_evaluation" "$threshold_info"

# Check if thresholds are exceeded and if deployment should be blocked
if [ "$CRITICAL_ISSUES" -gt "$CRITICAL_THRESHOLD" ]; then
    log_error "Critical vulnerability threshold exceeded" "security" "threshold_evaluation"
    if [ "$(should_block_deployment "critical")" = "true" ]; then
        SECURITY_GATE_PASSED=false
    fi
fi

if [ "$HIGH_ISSUES" -gt "$HIGH_THRESHOLD" ]; then
    log_error "High vulnerability threshold exceeded" "security" "threshold_evaluation"
    if [ "$(should_block_deployment "high")" = "true" ]; then
        SECURITY_GATE_PASSED=false
    fi
fi

if [ "$MODERATE_ISSUES" -gt "$MODERATE_THRESHOLD" ]; then
    log_warn "Moderate vulnerability threshold exceeded" "security" "threshold_evaluation"
    if [ "$(should_block_deployment "moderate")" = "true" ]; then
        SECURITY_GATE_PASSED=false
    fi
fi

if [ "$LOW_ISSUES" -gt "$LOW_THRESHOLD" ]; then
    log_warn "Low vulnerability threshold exceeded" "security" "threshold_evaluation"
    if [ "$(should_block_deployment "low")" = "true" ]; then
        SECURITY_GATE_PASSED=false
    fi
fi

# Generate security summary report
log_info "Generating Security Summary Report" "security" "summary_generation"

cat > security-summary.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "${GITHUB_SHA:-unknown}",
  "branch": "${GITHUB_REF_NAME:-unknown}",
  "securityGatePassed": $SECURITY_GATE_PASSED,
  "summary": {
    "critical": $CRITICAL_ISSUES,
    "high": $HIGH_ISSUES,
    "moderate": $MODERATE_ISSUES,
    "low": $LOW_ISSUES,
    "secrets": $SECRETS_FOUND
  },
  "thresholds": {
    "critical": $CRITICAL_THRESHOLD,
    "high": $HIGH_THRESHOLD,
    "moderate": $MODERATE_THRESHOLD,
    "low": $LOW_THRESHOLD
  },
  "scanResults": {
    "eslint": $([ -f "eslint-security-report.json" ] && echo "true" || echo "false"),
    "semgrep": $([ -f "semgrep-report.json" ] && echo "true" || echo "false"),
    "npmAudit": $([ -f "npm-audit-report.json" ] && echo "true" || echo "false"),
    "snyk": $([ -f "snyk-report.json" ] && echo "true" || echo "false"),
    "trufflehog": $([ -f "trufflehog-report.json" ] && echo "true" || echo "false")
  }
}
EOF

log_info "Security summary report generated: security-summary.json" "security" "summary_generation"

# Final decision
if [ "$SECURITY_GATE_PASSED" = "true" ]; then
    log_step_complete "security_gate_evaluation" "security" "unknown" "{\"result\": \"passed\", \"critical\": $CRITICAL_ISSUES, \"high\": $HIGH_ISSUES, \"moderate\": $MODERATE_ISSUES, \"low\": $LOW_ISSUES}"
    log_info "✅ SECURITY GATE PASSED - Deployment can proceed" "security" "security_gate_evaluation"
    exit 0
else
    log_step_failure "security_gate_evaluation" "SECURITY GATE FAILED - Deployment blocked" "security" "{\"result\": \"failed\", \"critical\": $CRITICAL_ISSUES, \"high\": $HIGH_ISSUES, \"moderate\": $MODERATE_ISSUES, \"low\": $LOW_ISSUES}"
    log_error "❌ SECURITY GATE FAILED - Deployment blocked" "security" "security_gate_evaluation"
    log_error "Critical security issues found that exceed acceptable thresholds" "security" "security_gate_evaluation"
    exit 1
fi