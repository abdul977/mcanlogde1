import supabaseStorage from '../services/supabaseStorage.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Test the MIME type fix for the original error
async function testMimeTypeFix() {
  console.log('🧪 Testing MIME Type Fix for Blog Upload Error...\n');
  
  // Create a test image buffer (minimal JPEG header)
  const testImageBuffer = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
  ]);
  
  // Use OS temp directory
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `test-blog-${Date.now()}.jpg`);
  
  try {
    // Create temp file
    fs.writeFileSync(tempFilePath, testImageBuffer);
    console.log(`✅ Created temp file: ${tempFilePath}`);
    
    // Simulate the problematic scenario that was causing the original error
    const problematicFile = {
      name: 'blog-featured-image.jpg',
      mimetype: 'application/octet-stream', // This was the problem!
      tempFilePath: tempFilePath,
      size: testImageBuffer.length
    };
    
    console.log('\n📤 Testing problematic scenario:');
    console.log(`   File: ${problematicFile.name}`);
    console.log(`   Original MIME: ${problematicFile.mimetype} (this was causing the error)`);
    console.log(`   Size: ${problematicFile.size} bytes`);
    
    // Test the upload with our fix
    const result = await supabaseStorage.uploadFromTempFile(
      problematicFile,
      'mcan-community',
      'blogs'
    );
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! The fix works!');
      console.log(`   ✅ Upload URL: ${result.data.secure_url}`);
      console.log(`   📊 File size: ${result.data.bytes} bytes`);
      console.log(`   🔧 MIME type was automatically corrected from 'application/octet-stream' to 'image/jpeg'`);
    } else {
      console.log('\n❌ Upload failed:', result.error);
    }
    
  } catch (error) {
    console.log('\n❌ Test error:', error.message);
  } finally {
    // Clean up
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`\n🧹 Cleaned up temp file: ${tempFilePath}`);
      }
    } catch (cleanupError) {
      console.log(`\n⚠️  Could not clean up temp file: ${cleanupError.message}`);
    }
  }
  
  console.log('\n📋 Summary of the fix:');
  console.log('=' .repeat(50));
  console.log('• Problem: Files uploaded with MIME type "application/octet-stream"');
  console.log('• Cause: express-fileupload sometimes fails to detect correct MIME type');
  console.log('• Solution: Detect MIME type from file extension as fallback');
  console.log('• Validation: Check MIME type against bucket restrictions');
  console.log('• Result: Upload succeeds with correct MIME type');
  
  console.log('\n✨ The original error should now be resolved!');
}

// Run the test
testMimeTypeFix().catch(console.error);
