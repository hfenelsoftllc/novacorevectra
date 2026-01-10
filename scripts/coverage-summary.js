#!/usr/bin/env node

/**
 * Coverage Summary Script
 * 
 * This script provides a summary of coverage thresholds for different file types
 * and can be used to check the status of coverage across the project.
 */

const fs = require('fs');
const path = require('path');

// Coverage configuration files and their descriptions
const coverageConfigs = {
  'components': {
    file: '.c8rc.components.json',
    description: 'React Components',
    pattern: 'src/components/**/*.{ts,tsx}'
  },
  'utils': {
    file: '.c8rc.utils.json',
    description: 'Utility Functions',
    pattern: 'src/utils/**/*.{ts,tsx}'
  },
  'services': {
    file: '.c8rc.services.json',
    description: 'Service Layer',
    pattern: 'src/services/**/*.{ts,tsx}'
  },
  'hooks': {
    file: '.c8rc.hooks.json',
    description: 'React Hooks',
    pattern: 'src/hooks/**/*.{ts,tsx}'
  },
  'constants': {
    file: '.c8rc.constants.json',
    description: 'Constants & Configuration',
    pattern: 'src/constants/**/*.{ts,tsx}'
  },
  'app': {
    file: '.c8rc.app.json',
    description: 'Next.js App Router',
    pattern: 'app/**/*.{ts,tsx}'
  }
};

function readConfig(configFile) {
  try {
    const configPath = path.join(process.cwd(), configFile);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      lines: config.lines || 0,
      functions: config.functions || 0,
      branches: config.branches || 0,
      statements: config.statements || 0
    };
  } catch (error) {
    console.error(`Error reading ${configFile}:`, error.message);
    return null;
  }
}

function displaySummary() {
  console.log('\n📊 Coverage Thresholds Summary\n');
  console.log('=' .repeat(80));
  console.log('File Type'.padEnd(25) + 'Lines'.padEnd(8) + 'Functions'.padEnd(12) + 'Branches'.padEnd(10) + 'Statements');
  console.log('-'.repeat(80));

  Object.entries(coverageConfigs).forEach(([type, config]) => {
    const thresholds = readConfig(config.file);
    if (thresholds) {
      const line = config.description.padEnd(25) +
                   `${thresholds.lines}%`.padEnd(8) +
                   `${thresholds.functions}%`.padEnd(12) +
                   `${thresholds.branches}%`.padEnd(10) +
                   `${thresholds.statements}%`;
      console.log(line);
    }
  });

  console.log('=' .repeat(80));
  console.log('\n📝 Available Commands:\n');
  
  Object.entries(coverageConfigs).forEach(([type, config]) => {
    console.log(`  npm run test:coverage:${type}`.padEnd(35) + `- Test ${config.description}`);
  });

  console.log(`  npm run test:coverage:by-type`.padEnd(35) + '- Test all file types');
  console.log(`  npm run test:coverage`.padEnd(35) + '- General coverage (all files)');

  console.log('\n📁 File Patterns:\n');
  
  Object.entries(coverageConfigs).forEach(([type, config]) => {
    console.log(`  ${type}:`.padEnd(12) + config.pattern);
  });

  console.log('\n💡 Tips:');
  console.log('  - Start with achievable thresholds and gradually increase them');
  console.log('  - Focus on critical paths and business logic');
  console.log('  - Use coverage as a guide, not a strict requirement');
  console.log('  - Review HTML reports in coverage/lcov-report/index.html');
  console.log('\n');
}

// Run the summary if this script is executed directly
if (require.main === module) {
  displaySummary();
}

module.exports = { coverageConfigs, readConfig, displaySummary };