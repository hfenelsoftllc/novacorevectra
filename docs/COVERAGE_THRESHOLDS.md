# Coverage Thresholds Configuration

This document explains the coverage threshold configuration implemented for different file types in the project.

## Overview

The project uses c8 for code coverage collection with different threshold requirements for different types of files. This approach recognizes that different file types have different testing requirements and complexity levels.

## File Type Classifications

### 1. Components (`src/components/**/*.{ts,tsx}`)
**Configuration:** `.c8rc.components.json`
**Thresholds:**
- Lines: 50%
- Functions: 50%
- Branches: 40%
- Statements: 50%

**Rationale:** Components are the most complex parts of the application with UI logic, event handlers, and conditional rendering. They require comprehensive testing but may have some untestable UI-specific code.

### 2. Utilities (`src/utils/**/*.{ts,tsx}`)
**Configuration:** `.c8rc.utils.json`
**Thresholds:**
- Lines: 40%
- Functions: 40%
- Branches: 30%
- Statements: 40%

**Rationale:** Utility functions should be well-tested as they're reused throughout the application. However, some utilities may contain complex edge cases or platform-specific code that's harder to test.

### 3. Services (`src/services/**/*.{ts,tsx}`)
**Configuration:** `.c8rc.services.json`
**Thresholds:**
- Lines: 60%
- Functions: 60%
- Branches: 50%
- Statements: 60%

**Rationale:** Services handle external API calls and business logic. They should have high coverage but may contain error handling and network-related code that's challenging to test comprehensively.

### 4. Hooks (`src/hooks/**/*.{ts,tsx}`)
**Configuration:** `.c8rc.hooks.json`
**Thresholds:**
- Lines: 30%
- Functions: 30%
- Branches: 25%
- Statements: 30%

**Rationale:** React hooks often contain complex state management and side effects that can be difficult to test in isolation. Lower thresholds account for this complexity.

### 5. Constants (`src/constants/**/*.{ts,tsx}`)
**Configuration:** `.c8rc.constants.json`
**Thresholds:**
- Lines: 85%
- Functions: 20%
- Branches: 40%
- Statements: 85%

**Rationale:** Constants files are mostly data definitions and should have high line coverage. Function coverage is very low since these files typically export data rather than functions.

### 6. App Router Files (`app/**/*.{ts,tsx}`)
**Configuration:** `.c8rc.app.json`
**Thresholds:**
- Lines: 70%
- Functions: 70%
- Branches: 50%
- Statements: 70%

**Rationale:** Next.js app router files contain page components and layouts. They should have good coverage but may contain framework-specific code that's harder to test.

## Global Configuration

**Default Configuration:** `.c8rc.json`
**Thresholds:**
- Lines: 60%
- Functions: 60%
- Branches: 50%
- Statements: 60%

This configuration is used for overall project coverage and as a fallback for files not covered by specific type configurations.

## Usage

### Running Coverage by File Type

```bash
# Test all components
npm run test:coverage:components

# Test all utilities
npm run test:coverage:utils

# Test all services
npm run test:coverage:services

# Test all hooks
npm run test:coverage:hooks

# Test all constants
npm run test:coverage:constants

# Test all app router files
npm run test:coverage:app

# Run all type-specific coverage tests
npm run test:coverage:by-type

# Run general coverage (all files)
npm run test:coverage
```

### Understanding Coverage Reports

Each coverage run will:
1. Show coverage percentages for each file
2. List uncovered line numbers
3. Report threshold violations with specific error messages
4. Generate HTML reports in the `coverage/` directory

### Threshold Violations

When a file doesn't meet its threshold requirements, you'll see errors like:
```
ERROR: Coverage for lines (45%) does not meet threshold (50%) for src/components/MyComponent.tsx
```

This indicates that `MyComponent.tsx` has 45% line coverage but needs 50% to pass the threshold.

## Maintenance

### Adjusting Thresholds

Thresholds should be adjusted based on:
1. **Current coverage levels** - Don't set unrealistic targets
2. **File complexity** - More complex files may need lower thresholds
3. **Testing feasibility** - Some code patterns are harder to test
4. **Project maturity** - Increase thresholds as the project grows

### Adding New File Types

To add coverage thresholds for new file types:

1. Create a new `.c8rc.{type}.json` configuration file
2. Add appropriate include/exclude patterns
3. Set realistic threshold values
4. Add a corresponding npm script in `package.json`
5. Update this documentation

### Best Practices

1. **Start with achievable thresholds** and gradually increase them
2. **Focus on critical paths** - ensure important code is well-tested
3. **Review coverage reports regularly** to identify gaps
4. **Don't chase 100% coverage** - focus on meaningful tests
5. **Use coverage as a guide**, not a strict requirement

## Excluded Files

The following files are excluded from coverage collection:
- Test files (`**/*.test.{ts,tsx,js,jsx}`)
- Test directories (`**/__tests__/**`)
- Configuration files (`**/*.config.{js,ts}`)
- Type definition files (`**/*.d.ts`)
- Index files (`**/index.{ts,tsx,js,jsx}`)
- Story files (`**/*.stories.{ts,tsx,js,jsx}`)
- Mock files (`**/*.mock.{ts,tsx,js,jsx}`)
- Next.js specific files (layout, loading, error, not-found)
- Static assets and styles

## Integration with CI/CD

Coverage thresholds are enforced in the CI/CD pipeline. Failed coverage checks will:
1. Block pull request merges
2. Provide detailed reports on which files need attention
3. Generate coverage reports for review

## Troubleshooting

### Common Issues

1. **"No coverage collected"** - Check include/exclude patterns
2. **"Threshold too high"** - Review current coverage and adjust thresholds
3. **"Files not found"** - Verify file paths in configuration
4. **"Tests not running"** - Check Jest configuration compatibility

### Getting Help

- Review the coverage HTML reports in `coverage/lcov-report/index.html`
- Check individual file coverage in the detailed reports
- Use `npm run test:coverage -- --verbose` for detailed output
- Consult the c8 documentation for advanced configuration options