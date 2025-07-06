import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import User from "../models/User.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const usersData = [
  {
    name: "Ahmed Hassan",
    email: "ahmed.hassan@mcanenugu.org.ng",
    password: "Ahmed123!",
    role: "admin"
  },
  {
    name: "Fatima Ibrahim",
    email: "fatima.ibrahim@mcanenugu.org.ng", 
    password: "Fatima456!",
    role: "user"
  },
  {
    name: "Usman Abdullahi",
    email: "usman.abdullahi@mcanenugu.org.ng",
    password: "Usman789!",
    role: "user"
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding process...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - remove this if you want to keep existing users)
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Existing users cleared');

    // Seed new users
    console.log('👥 Creating new users...');
    
    for (const userData of usersData) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const newUser = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });

      await newUser.save();
      console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
    }

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 SEEDED USERS CREDENTIALS:');
    console.log('================================');
    
    usersData.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Username/Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
    });
    
    console.log('\n================================');
    console.log('💡 Save these credentials for testing purposes!');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seeding function
seedUsers();
