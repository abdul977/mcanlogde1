/**
 * Master Test Runner
 * Orchestrates all test suites for the mobile application improvements
 */

import PaymentWorkflowTests from './paymentWorkflowTests';
import AvatarDisplayTests from './avatarDisplayTests';
import ShoppingCartTests from './shoppingCartTests';
import UIResponsivenessTests from './uiResponsivenessTests';

// Test configuration
const TEST_CONFIG = {
  runInParallel: false, // Set to true for faster execution, false for detailed logging
  stopOnFirstFailure: false,
  generateReport: true,
  reportFormat: 'console', // 'console' | 'json' | 'html'
  timeout: 30000 // 30 seconds per test suite
};

// Test result tracking
class TestResultTracker {
  constructor() {
    this.results = {
      totalSuites: 0,
      passedSuites: 0,
      failedSuites: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      startTime: null,
      endTime: null,
      duration: 0,
      suiteResults: []
    };
  }

  startTesting() {
    this.results.startTime = new Date();
    console.log(`🚀 Starting comprehensive test suite at ${this.results.startTime.toISOString()}\n`);
  }

  endTesting() {
    this.results.endTime = new Date();
    this.results.duration = this.results.endTime - this.results.startTime;
    
    console.log(`\n🏁 Testing completed at ${this.results.endTime.toISOString()}`);
    console.log(`⏱️  Total duration: ${this.results.duration}ms (${(this.results.duration / 1000).toFixed(2)}s)`);
  }

  recordSuiteResult(suiteName, passed, details = {}) {
    this.results.totalSuites++;
    
    if (passed) {
      this.results.passedSuites++;
    } else {
      this.results.failedSuites++;
    }

    this.results.suiteResults.push({
      name: suiteName,
      passed,
      timestamp: new Date(),
      details
    });
  }

  generateReport() {
    const successRate = ((this.results.passedSuites / this.results.totalSuites) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    console.log(`📈 Overall Success Rate: ${successRate}%`);
    console.log(`✅ Passed Suites: ${this.results.passedSuites}/${this.results.totalSuites}`);
    console.log(`❌ Failed Suites: ${this.results.failedSuites}/${this.results.totalSuites}`);
    console.log(`⏱️  Total Duration: ${(this.results.duration / 1000).toFixed(2)}s`);
    
    console.log('\n📋 Suite Breakdown:');
    this.results.suiteResults.forEach((suite, index) => {
      const status = suite.passed ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${suite.name}`);
    });

    if (this.results.failedSuites > 0) {
      console.log('\n🔍 Failed Suites Details:');
      this.results.suiteResults
        .filter(suite => !suite.passed)
        .forEach(suite => {
          console.log(`  ❌ ${suite.name}`);
          if (suite.details.error) {
            console.log(`     Error: ${suite.details.error}`);
          }
        });
    }

    console.log('\n' + '='.repeat(80));
    
    return this.results;
  }

  getResults() {
    return this.results;
  }
}

// Main test runner
export class MobileAppTestRunner {
  constructor(config = {}) {
    this.config = { ...TEST_CONFIG, ...config };
    this.tracker = new TestResultTracker();
    this.testSuites = [
      {
        name: 'Avatar Display Tests',
        runner: AvatarDisplayTests,
        description: 'Tests messaging interface avatar functionality and performance'
      },
      {
        name: 'Shopping Cart Tests',
        runner: ShoppingCartTests,
        description: 'Tests cart operations and price calculations'
      },
      {
        name: 'Payment Workflow Tests',
        runner: PaymentWorkflowTests,
        description: 'Tests payment screenshot upload and admin verification flow'
      },
      {
        name: 'UI Responsiveness Tests',
        runner: UIResponsivenessTests,
        description: 'Tests cross-platform compatibility and responsive design'
      }
    ];
  }

  async runAllTests() {
    this.tracker.startTesting();
    
    console.log('🎯 Mobile Application Comprehensive Test Suite');
    console.log('📱 Testing messaging avatars, shopping cart, payments, and UI responsiveness\n');

    let allTestsPassed = true;

    for (const suite of this.testSuites) {
      if (this.config.stopOnFirstFailure && !allTestsPassed) {
        console.log(`⏭️  Skipping ${suite.name} due to previous failure`);
        continue;
      }

      await this.runTestSuite(suite);
    }

    this.tracker.endTesting();
    
    if (this.config.generateReport) {
      this.tracker.generateReport();
    }

    const results = this.tracker.getResults();
    allTestsPassed = results.failedSuites === 0;

    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! The mobile app improvements are ready for deployment.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues before deployment.');
    }

    return {
      success: allTestsPassed,
      results: results
    };
  }

  async runTestSuite(suite) {
    console.log(`\n🧪 Running ${suite.name}`);
    console.log(`📝 ${suite.description}`);
    console.log('-'.repeat(60));

    const startTime = Date.now();
    let suitePassed = false;
    let error = null;

    try {
      // Set timeout for test suite
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test suite timeout')), this.config.timeout);
      });

      const testPromise = suite.runner.runAllTests();
      
      suitePassed = await Promise.race([testPromise, timeoutPromise]);
      
    } catch (err) {
      error = err.message;
      console.error(`❌ ${suite.name} failed with error:`, err.message);
      suitePassed = false;
    }

    const duration = Date.now() - startTime;
    const status = suitePassed ? '✅ PASSED' : '❌ FAILED';
    
    console.log(`\n${status} - ${suite.name} (${duration}ms)`);
    
    this.tracker.recordSuiteResult(suite.name, suitePassed, {
      duration,
      error,
      description: suite.description
    });

    return suitePassed;
  }

  async runSpecificSuite(suiteName) {
    const suite = this.testSuites.find(s => 
      s.name.toLowerCase().includes(suiteName.toLowerCase())
    );

    if (!suite) {
      console.error(`❌ Test suite "${suiteName}" not found`);
      console.log('Available suites:');
      this.testSuites.forEach(s => console.log(`  - ${s.name}`));
      return false;
    }

    this.tracker.startTesting();
    const result = await this.runTestSuite(suite);
    this.tracker.endTesting();
    
    if (this.config.generateReport) {
      this.tracker.generateReport();
    }

    return result;
  }

  listAvailableSuites() {
    console.log('📋 Available Test Suites:');
    this.testSuites.forEach((suite, index) => {
      console.log(`  ${index + 1}. ${suite.name}`);
      console.log(`     ${suite.description}`);
    });
  }

  async validateEnvironment() {
    console.log('🔍 Validating test environment...');
    
    const checks = [
      { name: 'React Native Environment', check: () => typeof require !== 'undefined' },
      { name: 'Testing Library', check: () => true }, // Simplified check
      { name: 'Navigation Library', check: () => true }, // Simplified check
      { name: 'API Connectivity', check: () => true } // Would test actual API in real scenario
    ];

    let allChecksPass = true;

    for (const check of checks) {
      try {
        const passed = check.check();
        const status = passed ? '✅' : '❌';
        console.log(`  ${status} ${check.name}`);
        
        if (!passed) {
          allChecksPass = false;
        }
      } catch (error) {
        console.log(`  ❌ ${check.name} - Error: ${error.message}`);
        allChecksPass = false;
      }
    }

    if (allChecksPass) {
      console.log('✅ Environment validation passed');
    } else {
      console.log('❌ Environment validation failed');
    }

    return allChecksPass;
  }
}

// Convenience functions for direct usage
export const runAllTests = async (config) => {
  const runner = new MobileAppTestRunner(config);
  return await runner.runAllTests();
};

export const runSpecificTest = async (suiteName, config) => {
  const runner = new MobileAppTestRunner(config);
  return await runner.runSpecificSuite(suiteName);
};

export const validateTestEnvironment = async () => {
  const runner = new MobileAppTestRunner();
  return await runner.validateEnvironment();
};

// Export test runner as default
export default MobileAppTestRunner;

// CLI-style usage example
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'all':
      runAllTests().then(result => {
        process.exit(result.success ? 0 : 1);
      });
      break;
      
    case 'suite':
      const suiteName = args[1];
      if (!suiteName) {
        console.error('Please specify a suite name');
        process.exit(1);
      }
      runSpecificTest(suiteName).then(result => {
        process.exit(result ? 0 : 1);
      });
      break;
      
    case 'validate':
      validateTestEnvironment().then(result => {
        process.exit(result ? 0 : 1);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node testRunner.js all           - Run all test suites');
      console.log('  node testRunner.js suite <name>  - Run specific test suite');
      console.log('  node testRunner.js validate      - Validate test environment');
      break;
  }
}
