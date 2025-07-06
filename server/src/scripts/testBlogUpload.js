import supabaseStorage from '../services/supabaseStorage.js';
import fs from 'fs';
import path from 'path';

// Test blog image upload with problematic MIME type scenarios
async function testBlogUpload() {
  console.log('🧪 Testing Blog Image Upload with MIME Type Issues...\n');
  
  // Create a test image buffer (minimal JPEG header)
  const testImageBuffer = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
  ]);
  
  // Test scenarios that could cause the original error
  const testScenarios = [
    {
      name: 'Normal JPEG upload',
      file: {
        name: 'test-blog-image.jpg',
        mimetype: 'image/jpeg',
        tempFilePath: '/tmp/test-blog-image.jpg',
        data: testImageBuffer
      }
    },
    {
      name: 'JPEG with application/octet-stream MIME type (problematic scenario)',
      file: {
        name: 'test-blog-image.jpg',
        mimetype: 'application/octet-stream', // This was causing the original error
        tempFilePath: '/tmp/test-blog-image-octet.jpg',
        data: testImageBuffer
      }
    },
    {
      name: 'JPEG with missing MIME type',
      file: {
        name: 'test-blog-image.jpg',
        mimetype: null,
        tempFilePath: '/tmp/test-blog-image-no-mime.jpg',
        data: testImageBuffer
      }
    },
    {
      name: 'PNG upload',
      file: {
        name: 'test-blog-image.png',
        mimetype: 'image/png',
        tempFilePath: '/tmp/test-blog-image.png',
        data: testImageBuffer // Using JPEG data for simplicity
      }
    }
  ];
  
  // Create temp files for testing
  for (const scenario of testScenarios) {
    try {
      fs.writeFileSync(scenario.file.tempFilePath, scenario.file.data);
    } catch (error) {
      console.log(`⚠️  Could not create temp file for ${scenario.name}: ${error.message}`);
    }
  }
  
  console.log('Testing upload scenarios:');
  console.log('=' .repeat(60));
  
  for (const scenario of testScenarios) {
    try {
      console.log(`\n📤 Testing: ${scenario.name}`);
      console.log(`   File: ${scenario.file.name}`);
      console.log(`   MIME: ${scenario.file.mimetype || 'null'}`);
      
      const result = await supabaseStorage.uploadFromTempFile(
        scenario.file,
        'mcan-community',
        'blogs'
      );
      
      if (result.success) {
        console.log(`   ✅ SUCCESS: ${result.data.secure_url}`);
        console.log(`   📊 Size: ${result.data.bytes} bytes`);
      } else {
        console.log(`   ❌ FAILED: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
  
  // Clean up temp files
  console.log('\n🧹 Cleaning up temp files...');
  for (const scenario of testScenarios) {
    try {
      if (fs.existsSync(scenario.file.tempFilePath)) {
        fs.unlinkSync(scenario.file.tempFilePath);
        console.log(`   ✅ Cleaned: ${scenario.file.tempFilePath}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not clean: ${scenario.file.tempFilePath}`);
    }
  }
  
  console.log('\n🎉 Blog upload test completed!');
  console.log('\nKey improvements made:');
  console.log('• MIME type detection from file extensions');
  console.log('• Validation against bucket restrictions');
  console.log('• Better error messages for users');
  console.log('• Fallback handling for application/octet-stream');
}

// Run the test
testBlogUpload().catch(console.error);
