# Validate coverage thresholds are met
# This script checks if the coverage meets the configured thresholds

Write-Host "🔍 Validating coverage thresholds..." -ForegroundColor Blue

# Check if coverage directory exists
if (-not (Test-Path "coverage")) {
    Write-Host "❌ Coverage directory not found" -ForegroundColor Red
    exit 1
}

# Check if coverage summary exists
if (-not (Test-Path "coverage/coverage-summary.json")) {
    Write-Host "❌ Coverage summary not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Coverage files found" -ForegroundColor Green

# Read coverage summary
$coverageSummary = Get-Content "coverage/coverage-summary.json" | ConvertFrom-Json

# Extract coverage percentages
$linesPct = if ($coverageSummary.total.lines.pct) { $coverageSummary.total.lines.pct } else { 0 }
$functionsPct = if ($coverageSummary.total.functions.pct) { $coverageSummary.total.functions.pct } else { 0 }
$branchesPct = if ($coverageSummary.total.branches.pct) { $coverageSummary.total.branches.pct } else { 0 }
$statementsPct = if ($coverageSummary.total.statements.pct) { $coverageSummary.total.statements.pct } else { 0 }

Write-Host "📊 Current Coverage:" -ForegroundColor Cyan
Write-Host "  Lines: $linesPct%" -ForegroundColor White
Write-Host "  Functions: $functionsPct%" -ForegroundColor White
Write-Host "  Branches: $branchesPct%" -ForegroundColor White
Write-Host "  Statements: $statementsPct%" -ForegroundColor White

# Read thresholds from .c8rc.json
$c8Config = Get-Content ".c8rc.json" | ConvertFrom-Json
$linesThreshold = if ($c8Config.lines) { $c8Config.lines } else { 0 }
$functionsThreshold = if ($c8Config.functions) { $c8Config.functions } else { 0 }
$branchesThreshold = if ($c8Config.branches) { $c8Config.branches } else { 0 }
$statementsThreshold = if ($c8Config.statements) { $c8Config.statements } else { 0 }

Write-Host "🎯 Required Thresholds:" -ForegroundColor Cyan
Write-Host "  Lines: $linesThreshold%" -ForegroundColor White
Write-Host "  Functions: $functionsThreshold%" -ForegroundColor White
Write-Host "  Branches: $branchesThreshold%" -ForegroundColor White
Write-Host "  Statements: $statementsThreshold%" -ForegroundColor White

# Check if coverage meets thresholds
$failed = $false

if ($linesPct -lt $linesThreshold) {
    Write-Host "❌ Lines coverage $linesPct% is below threshold $linesThreshold%" -ForegroundColor Red
    $failed = $true
}

if ($functionsPct -lt $functionsThreshold) {
    Write-Host "❌ Functions coverage $functionsPct% is below threshold $functionsThreshold%" -ForegroundColor Red
    $failed = $true
}

if ($branchesPct -lt $branchesThreshold) {
    Write-Host "❌ Branches coverage $branchesPct% is below threshold $branchesThreshold%" -ForegroundColor Red
    $failed = $true
}

if ($statementsPct -lt $statementsThreshold) {
    Write-Host "❌ Statements coverage $statementsPct% is below threshold $statementsThreshold%" -ForegroundColor Red
    $failed = $true
}

if (-not $failed) {
    Write-Host "✅ All coverage thresholds met!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Coverage thresholds not met" -ForegroundColor Red
    exit 1
}