import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDb } from "../config/db.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config({ path: '../../../.env' });

async function checkUsers() {
  try {
    console.log("🔍 Checking existing users...");
    
    // Connect to database
    await connectToDb();
    console.log("✅ Connected to MongoDB");

    // Get all users
    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
    
    console.log(`\n📊 Found ${users.length} users:`);
    
    if (users.length === 0) {
      console.log("   No users found in database");
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

    // Check for admin users specifically
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n👑 Admin users: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email})`);
      });
    } else {
      console.log("   No admin users found");
    }

    // Check for regular users
    const regularUsers = await User.find({ role: { $ne: 'admin' } });
    console.log(`\n👤 Regular users: ${regularUsers.length}`);

    console.log("\n✅ User check completed!");
    
  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the check
checkUsers();
