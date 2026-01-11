#!/bin/bash

# Validate coverage thresholds are met
# This script checks if the coverage meets the configured thresholds

set -e

echo "🔍 Validating coverage thresholds..."

# Check if coverage directory exists
if [ ! -d "coverage" ]; then
    echo "❌ Coverage directory not found"
    exit 1
fi

# Check if coverage summary exists
if [ ! -f "coverage/coverage-summary.json" ]; then
    echo "❌ Coverage summary not found"
    exit 1
fi

echo "✅ Coverage files found"

# Extract coverage percentages
LINES_PCT=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct // 0')
FUNCTIONS_PCT=$(cat coverage/coverage-summary.json | jq -r '.total.functions.pct // 0')
BRANCHES_PCT=$(cat coverage/coverage-summary.json | jq -r '.total.branches.pct // 0')
STATEMENTS_PCT=$(cat coverage/coverage-summary.json | jq -r '.total.statements.pct // 0')

echo "📊 Current Coverage:"
echo "  Lines: ${LINES_PCT}%"
echo "  Functions: ${FUNCTIONS_PCT}%"
echo "  Branches: ${BRANCHES_PCT}%"
echo "  Statements: ${STATEMENTS_PCT}%"

# Read thresholds from .c8rc.json
LINES_THRESHOLD=$(cat .c8rc.json | jq -r '.lines // 0')
FUNCTIONS_THRESHOLD=$(cat .c8rc.json | jq -r '.functions // 0')
BRANCHES_THRESHOLD=$(cat .c8rc.json | jq -r '.branches // 0')
STATEMENTS_THRESHOLD=$(cat .c8rc.json | jq -r '.statements // 0')

echo "🎯 Required Thresholds:"
echo "  Lines: ${LINES_THRESHOLD}%"
echo "  Functions: ${FUNCTIONS_THRESHOLD}%"
echo "  Branches: ${BRANCHES_THRESHOLD}%"
echo "  Statements: ${STATEMENTS_THRESHOLD}%"

# Check if coverage meets thresholds
FAILED=0

if (( $(echo "$LINES_PCT < $LINES_THRESHOLD" | bc -l) )); then
    echo "❌ Lines coverage ${LINES_PCT}% is below threshold ${LINES_THRESHOLD}%"
    FAILED=1
fi

if (( $(echo "$FUNCTIONS_PCT < $FUNCTIONS_THRESHOLD" | bc -l) )); then
    echo "❌ Functions coverage ${FUNCTIONS_PCT}% is below threshold ${FUNCTIONS_THRESHOLD}%"
    FAILED=1
fi

if (( $(echo "$BRANCHES_PCT < $BRANCHES_THRESHOLD" | bc -l) )); then
    echo "❌ Branches coverage ${BRANCHES_PCT}% is below threshold ${BRANCHES_THRESHOLD}%"
    FAILED=1
fi

if (( $(echo "$STATEMENTS_PCT < $STATEMENTS_THRESHOLD" | bc -l) )); then
    echo "❌ Statements coverage ${STATEMENTS_PCT}% is below threshold ${STATEMENTS_THRESHOLD}%"
    FAILED=1
fi

if [ $FAILED -eq 0 ]; then
    echo "✅ All coverage thresholds met!"
    exit 0
else
    echo "❌ Coverage thresholds not met"
    exit 1
fi