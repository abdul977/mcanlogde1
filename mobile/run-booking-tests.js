/**
 * Test Runner for Mobile App Booking Flow
 * Runs comprehensive tests to verify the booking implementation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Mobile App Booking Flow Test Suite');
console.log('=' .repeat(50));

// Test configuration
const TESTS = [
  {
    name: 'Unit Tests',
    description: 'Run Jest unit tests for booking components',
    command: 'npm test -- --testPathPattern=BookingFlow.test.js',
    optional: true
  },
  {
    name: 'Integration Test',
    description: 'Test mobile app against actual server',
    command: 'node test-mobile-booking-integration.js',
    optional: false
  },
  {
    name: 'Type Check',
    description: 'Verify TypeScript types are correct',
    command: 'npm run type-check',
    optional: true
  }
];

async function runTest(test) {
  console.log(`\n📋 Running: ${test.name}`);
  console.log(`📝 Description: ${test.description}`);
  console.log(`⚡ Command: ${test.command}`);
  console.log('-'.repeat(40));

  try {
    const output = execSync(test.command, { 
      encoding: 'utf8',
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    console.log('✅ PASSED');
    if (output.trim()) {
      console.log('📄 Output:');
      console.log(output);
    }
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('📄 Error:');
    console.log(error.stdout || error.message);
    
    if (!test.optional) {
      throw error;
    }
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Mobile App Booking Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  for (const test of TESTS) {
    try {
      const passed = await runTest(test);
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      if (!test.optional) {
        console.log('\n💥 Critical test failed, stopping execution');
        break;
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('📱 Mobile app booking flow is working correctly');
    console.log('🚀 Ready for deployment');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('🔧 Please review the errors above and fix issues');
    process.exit(1);
  }
}

// Check if required files exist
function checkPrerequisites() {
  const requiredFiles = [
    'package.json',
    'src/constants/index.ts',
    'src/screens/accommodation/BookingFlowScreen.tsx',
    'src/screens/accommodation/AccommodationListingScreen.tsx'
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
    await runAllTests();
  } catch (error) {
    console.log('\n💥 Test execution failed:');
    console.log(error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runAllTests, runTest };
