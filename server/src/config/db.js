import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

export const connectToDb = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting to connect with URI:', uri ? 'URI exists' : 'URI is undefined');
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log('Connected to MongoDB Atlas');
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error.message);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};
