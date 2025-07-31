/**
 * Payment & Shopping System Test Runner
 * Comprehensive test suite for payment and shopping functionality
 * Run this script to test the complete payment/shopping flow
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Payment & Shopping System Test Suite');
console.log('=' .repeat(50));

// Test configuration
const TESTS = [
  {
    name: 'Server API Tests',
    description: 'Test server-side payment and shopping APIs',
    command: 'node server/src/scripts/testPaymentShoppingAPI.js',
    directory: '.',
    optional: false
  },
  {
    name: 'Mobile Integration Tests',
    description: 'Test mobile app shopping integration',
    command: 'node test-mobile-shopping-integration.js',
    directory: 'mobile',
    optional: false
  },
  {
    name: 'Database Consistency Check',
    description: 'Verify product and order data consistency',
    command: 'node server/src/scripts/testAdminEndpoint.js',
    directory: '.',
    optional: true
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Run a single test
async function runTest(test) {
  console.log(`\n${colorize('▶️', 'blue')} Running: ${colorize(test.name, 'bright')}`);
  console.log(`   ${test.description}`);
  
  try {
    const startTime = Date.now();
    
    // Change to test directory if specified
    const originalDir = process.cwd();
    if (test.directory && test.directory !== '.') {
      process.chdir(path.join(originalDir, test.directory));
    }
    
    // Execute the test command
    const output = execSync(test.command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000 // 2 minute timeout
    });
    
    // Restore original directory
    if (test.directory && test.directory !== '.') {
      process.chdir(originalDir);
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`   ${colorize('✅ PASSED', 'green')} (${duration}ms)`);
    
    // Show last few lines of output for context
    const lines = output.trim().split('\n');
    const lastLines = lines.slice(-3);
    lastLines.forEach(line => {
      if (line.includes('✅') || line.includes('🎉')) {
        console.log(`   ${colorize(line, 'green')}`);
      }
    });
    
    return { success: true, duration, output };
    
  } catch (error) {
    console.log(`   ${colorize('❌ FAILED', 'red')}`);
    console.log(`   ${colorize('Error:', 'red')} ${error.message}`);
    
    // Show error output
    if (error.stdout) {
      const lines = error.stdout.trim().split('\n');
      const errorLines = lines.slice(-5);
      errorLines.forEach(line => {
        console.log(`   ${colorize(line, 'red')}`);
      });
    }
    
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log(`\n${colorize('🚀 Starting Payment & Shopping Test Suite...', 'cyan')}`);
  
  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const test of TESTS) {
    const result = await runTest(test);
    results.push({ test, result });
    
    if (result.success) {
      totalPassed++;
    } else {
      totalFailed++;
      
      // If it's not optional and failed, we might want to stop
      if (!test.optional) {
        console.log(`\n${colorize('⚠️ Critical test failed!', 'yellow')}`);
        console.log(`   ${test.name} is required for the payment system to work properly.`);
      }
    }
  }
  
  // Print summary
  console.log(`\n${colorize('📊 TEST SUMMARY', 'bright')}`);
  console.log('=' .repeat(50));
  
  results.forEach(({ test, result }) => {
    const status = result.success ? 
      colorize('✅ PASSED', 'green') : 
      colorize('❌ FAILED', 'red');
    
    const optional = test.optional ? colorize('(optional)', 'yellow') : '';
    console.log(`${status} ${test.name} ${optional}`);
    
    if (result.duration) {
      console.log(`        Duration: ${result.duration}ms`);
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log(`${colorize('Total Tests:', 'bright')} ${TESTS.length}`);
  console.log(`${colorize('Passed:', 'green')} ${totalPassed}`);
  console.log(`${colorize('Failed:', 'red')} ${totalFailed}`);
  
  if (totalFailed === 0) {
    console.log(`\n${colorize('🎉 ALL TESTS PASSED!', 'green')}`);
    console.log(`${colorize('✅ Payment & Shopping System is working correctly!', 'green')}`);
  } else {
    console.log(`\n${colorize('⚠️ SOME TESTS FAILED', 'yellow')}`);
    console.log(`${colorize('❌ Payment & Shopping System needs attention', 'red')}`);
    
    // Show failed tests
    const failedTests = results.filter(r => !r.result.success);
    console.log(`\n${colorize('Failed Tests:', 'red')}`);
    failedTests.forEach(({ test }) => {
      console.log(`  - ${test.name}`);
    });
  }
  
  return totalFailed === 0;
}

// Check if required files exist
function checkPrerequisites() {
  const requiredFiles = [
    'server/src/scripts/testPaymentShoppingAPI.js',
    'mobile/test-mobile-shopping-integration.js',
    'server/src/controller/Product.js',
    'server/src/controller/Order.js',
    'server/src/routes/Product.js',
    'server/src/routes/Order.js'
  ];

  console.log('🔍 Checking prerequisites...');
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Missing required file: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ All required files found');
}

// Main execution
async function main() {
  try {
    checkPrerequisites();
    const success = await runAllTests();
    
    if (success) {
      console.log(`\n${colorize('🚀 Ready to proceed with payment system integration!', 'green')}`);
      process.exit(0);
    } else {
      console.log(`\n${colorize('🔧 Please fix the failing tests before proceeding', 'yellow')}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.log('\n💥 Test execution failed:');
    console.log(error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\n⏹️ Test execution interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️ Test execution terminated');
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runAllTests, runTest, checkPrerequisites };
