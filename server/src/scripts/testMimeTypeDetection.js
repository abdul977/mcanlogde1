import supabaseStorage from '../services/supabaseStorage.js';
import fs from 'fs';
import path from 'path';

// Test MIME type detection and validation
async function testMimeTypeDetection() {
  console.log('🧪 Testing MIME Type Detection and Validation...\n');
  
  // Test cases for MIME type detection
  const testCases = [
    { filename: 'test.jpg', expectedMime: 'image/jpeg' },
    { filename: 'test.jpeg', expectedMime: 'image/jpeg' },
    { filename: 'test.png', expectedMime: 'image/png' },
    { filename: 'test.gif', expectedMime: 'image/gif' },
    { filename: 'test.webp', expectedMime: 'image/webp' },
    { filename: 'test.pdf', expectedMime: 'application/pdf' },
    { filename: 'test.doc', expectedMime: 'application/msword' },
    { filename: 'test.docx', expectedMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { filename: 'test.txt', expectedMime: 'text/plain' },
    { filename: 'test.unknown', expectedMime: null }
  ];
  
  // Import the utility functions from the service
  const getMimeTypeFromExtension = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.csv': 'text/csv'
    };
    return mimeTypes[ext] || null;
  };
  
  const validateMimeType = (mimeType, bucketName) => {
    const bucketRestrictions = {
      'mcan-donations': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'mcan-posts': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'mcan-community': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'mcan-resources': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'mcan-services': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'mcan-quran-classes': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'mcan-authors': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'mcan-participants': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'mcan-thumbnails': ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    };
    
    const allowedTypes = bucketRestrictions[bucketName];
    if (!allowedTypes) {
      return { valid: true, mimeType };
    }
    
    return {
      valid: allowedTypes.includes(mimeType),
      mimeType,
      allowedTypes
    };
  };
  
  console.log('1. Testing MIME type detection from file extensions:');
  console.log('=' .repeat(60));
  
  testCases.forEach(testCase => {
    const detected = getMimeTypeFromExtension(testCase.filename);
    const status = detected === testCase.expectedMime ? '✅' : '❌';
    console.log(`${status} ${testCase.filename.padEnd(15)} -> ${detected || 'null'}`);
  });
  
  console.log('\n2. Testing bucket validation for different MIME types:');
  console.log('=' .repeat(60));
  
  const bucketTests = [
    { bucket: 'mcan-community', mimeType: 'image/jpeg', shouldPass: true },
    { bucket: 'mcan-community', mimeType: 'image/png', shouldPass: true },
    { bucket: 'mcan-community', mimeType: 'application/pdf', shouldPass: false },
    { bucket: 'mcan-community', mimeType: 'application/octet-stream', shouldPass: false },
    { bucket: 'mcan-resources', mimeType: 'image/jpeg', shouldPass: true },
    { bucket: 'mcan-resources', mimeType: 'application/pdf', shouldPass: true },
    { bucket: 'mcan-resources', mimeType: 'text/plain', shouldPass: false }
  ];
  
  bucketTests.forEach(test => {
    const validation = validateMimeType(test.mimeType, test.bucket);
    const status = validation.valid === test.shouldPass ? '✅' : '❌';
    console.log(`${status} ${test.bucket.padEnd(20)} + ${test.mimeType.padEnd(25)} = ${validation.valid ? 'ALLOWED' : 'BLOCKED'}`);
  });
  
  console.log('\n3. Testing file upload simulation:');
  console.log('=' .repeat(60));
  
  // Create a test image buffer (minimal JPEG header)
  const testImageBuffer = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
  ]);
  
  try {
    // Test successful upload
    const result = await supabaseStorage.uploadFile(
      'mcan-community',
      `test/mime-test-${Date.now()}.jpg`,
      testImageBuffer,
      { contentType: 'image/jpeg' }
    );
    
    if (result.success) {
      console.log('✅ Test upload successful:', result.data.secure_url);
    } else {
      console.log('❌ Test upload failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test upload error:', error.message);
  }
  
  console.log('\n🎉 MIME type detection and validation test completed!');
}

// Run the test
testMimeTypeDetection().catch(console.error);
