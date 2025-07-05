import supabaseStorage from '../services/supabaseStorage.js';
import fs from 'fs';
import path from 'path';

// Test configuration
const testConfig = {
  buckets: [
    'mcan-donations',
    'mcan-posts', 
    'mcan-community',
    'mcan-resources',
    'mcan-services',
    'mcan-quran-classes',
    'mcan-authors',
    'mcan-participants',
    'mcan-thumbnails'
  ],
  testFile: {
    name: 'test-image.jpg',
    content: Buffer.from('fake-image-data-for-testing'),
    mimetype: 'image/jpeg'
  }
};

class StorageTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running test: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      this.log(`Test passed: ${testName}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`Test failed: ${testName} - ${error.message}`, 'error');
    }
  }

  async testBucketAccess() {
    for (const bucket of testConfig.buckets) {
      await this.runTest(`Bucket Access: ${bucket}`, async () => {
        const testPath = `test/${Date.now()}_test.txt`;
        const testData = Buffer.from('test data');
        
        const result = await supabaseStorage.uploadFile(bucket, testPath, testData);
        
        if (!result.success) {
          throw new Error(`Failed to upload to bucket ${bucket}: ${result.error}`);
        }
        
        if (!result.data.secure_url) {
          throw new Error(`No secure URL returned for bucket ${bucket}`);
        }
        
        // Test URL accessibility
        const url = result.data.secure_url;
        if (!url.includes('supabase.co')) {
          throw new Error(`Invalid URL format: ${url}`);
        }
      });
    }
  }

  async testFileUpload() {
    await this.runTest('File Upload Functionality', async () => {
      const testPath = `test/upload_${Date.now()}.jpg`;
      
      const result = await supabaseStorage.uploadFile(
        'mcan-donations',
        testPath,
        testConfig.testFile.content,
        { contentType: testConfig.testFile.mimetype }
      );
      
      if (!result.success) {
        throw new Error(`Upload failed: ${result.error}`);
      }
      
      if (!result.data.secure_url) {
        throw new Error('No secure URL returned');
      }
      
      if (result.data.bytes !== testConfig.testFile.content.length) {
        throw new Error(`File size mismatch: expected ${testConfig.testFile.content.length}, got ${result.data.bytes}`);
      }
    });
  }

  async testMultipleFileUpload() {
    await this.runTest('Multiple File Upload', async () => {
      const files = [
        { path: `test/multi1_${Date.now()}.jpg`, data: Buffer.from('test1') },
        { path: `test/multi2_${Date.now()}.jpg`, data: Buffer.from('test2') },
        { path: `test/multi3_${Date.now()}.jpg`, data: Buffer.from('test3') }
      ];
      
      const results = await supabaseStorage.uploadMultipleFiles('mcan-posts', files);
      
      if (results.length !== 3) {
        throw new Error(`Expected 3 results, got ${results.length}`);
      }
      
      for (let i = 0; i < results.length; i++) {
        if (!results[i].success) {
          throw new Error(`Upload ${i + 1} failed: ${results[i].error}`);
        }
      }
    });
  }

  async testFilePathGeneration() {
    await this.runTest('File Path Generation', async () => {
      const path1 = supabaseStorage.generateFilePath('test', 'image.jpg');
      const path2 = supabaseStorage.generateFilePath('test', 'image.jpg');
      
      if (path1 === path2) {
        throw new Error('Generated paths should be unique');
      }
      
      if (!path1.includes('test/')) {
        throw new Error('Path should include folder');
      }
      
      if (!path1.endsWith('.jpg')) {
        throw new Error('Path should preserve file extension');
      }
    });
  }

  async testPublicUrlGeneration() {
    await this.runTest('Public URL Generation', async () => {
      const testPath = 'test/url_test.jpg';
      const url = supabaseStorage.getPublicUrl('mcan-services', testPath);
      
      if (!url) {
        throw new Error('No URL generated');
      }
      
      if (!url.includes('supabase.co')) {
        throw new Error('URL should contain supabase.co domain');
      }
      
      if (!url.includes(testPath)) {
        throw new Error('URL should contain the file path');
      }
    });
  }

  async testErrorHandling() {
    await this.runTest('Error Handling', async () => {
      // Test with invalid bucket
      const result = await supabaseStorage.uploadFile(
        'invalid-bucket-name',
        'test.jpg',
        Buffer.from('test')
      );
      
      if (result.success) {
        throw new Error('Upload should have failed with invalid bucket');
      }
      
      if (!result.error) {
        throw new Error('Error message should be provided');
      }
    });
  }

  async runAllTests() {
    this.log('Starting Supabase Storage Test Suite');
    this.log('=====================================');
    
    await this.testFilePathGeneration();
    await this.testPublicUrlGeneration();
    await this.testFileUpload();
    await this.testMultipleFileUpload();
    await this.testBucketAccess();
    await this.testErrorHandling();
    
    this.log('=====================================');
    this.log('Test Suite Complete');
    this.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    
    if (this.results.failed > 0) {
      this.log('Failed Tests:', 'error');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`  - ${test.name}: ${test.error}`, 'error');
        });
    }
    
    return this.results.failed === 0;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new StorageTestSuite();
  testSuite.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed to run:', error);
      process.exit(1);
    });
}

export default StorageTestSuite;
