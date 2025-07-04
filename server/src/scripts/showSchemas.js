import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import '../models/User.js';
import '../models/Post.js';
import '../models/Category.js';
import '../models/Booking.js';
import '../models/Contribute.js';

// Configure dotenv to read from the correct path
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });

const displaySchema = (modelName) => {
  try {
    const model = mongoose.models[modelName];
    if (!model) {
      console.error(`Model ${modelName} not found`);
      return;
    }
    const schema = model.schema;
    
    console.error(`\n=== ${modelName} Schema ===`);
    
    const paths = schema.paths;
    for (const [path, schemaType] of Object.entries(paths)) {
      let type = schemaType.instance;
      
      // Handle special cases
      if (type === 'ObjectID' && schemaType.options.ref) {
        type = `Reference to ${schemaType.options.ref}`;
      } else if (type === 'Array') {
        if (schemaType.schema) {
          type = 'Array of Objects';
        } else if (schemaType.caster) {
          type = `Array of ${schemaType.caster.instance}s`;
        }
      }
      
      let required = schemaType.options.required ? '*' : ' ';
      let defaultValue = schemaType.options.default !== undefined ? 
        ` (default: ${JSON.stringify(schemaType.options.default)})` : '';
      let enumValues = schemaType.options.enum ? 
        ` [enum: ${schemaType.options.enum.join(', ')}]` : '';
      
      console.error(`${required} ${path}: ${type}${defaultValue}${enumValues}`);
    }
    
    // Display indexes if any
    const indexes = schema._indexes;
    if (indexes && indexes.length > 0) {
      console.error('\nIndexes:');
      indexes.forEach(([fields, options]) => {
        console.error(`- ${JSON.stringify(fields)} ${JSON.stringify(options)}`);
      });
    }
  } catch (error) {
    console.error(`Error displaying schema for ${modelName}:`, error);
  }
}

// Main function
async function main() {
  try {
    console.error('Script started...');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    console.error('MongoDB URI found:', uri.substring(0, 20) + '...');

    console.error('Attempting to connect to MongoDB...');
    await mongoose.connect(uri);
    console.error('Connected to MongoDB successfully!\n');
    
    console.error('=== Database Schemas ===');
    
    // Display schemas for all models
    const models = ['User', 'Post', 'Category', 'Booking', 'Contribute'];
    console.error('Models to display:', models.join(', '));
    
    models.forEach(modelName => {
      displaySchema(modelName);
    });
    
  } catch (error) {
    console.error('Error:', error);
    console.error('\nStack trace:', error.stack);
    if (!process.env.MONGODB_URI) {
      console.error('\nMake sure you have a .env file in the server directory with MONGODB_URI defined.');
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.error('\nDisconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
    process.exit();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

main();