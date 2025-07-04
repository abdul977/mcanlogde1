import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });

async function testConnection() {
  try {
    process.stderr.write('Testing MongoDB connection...\n');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    process.stderr.write(`URI found: ${uri.substring(0, 20)}...\n`);
    
    await mongoose.connect(uri);
    process.stderr.write('Successfully connected to MongoDB!\n');
    
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.stderr.write(`Stack: ${error.stack}\n`);
  } finally {
    await mongoose.disconnect();
    process.stderr.write('Disconnected from MongoDB\n');
    process.exit();
  }
}

testConnection();