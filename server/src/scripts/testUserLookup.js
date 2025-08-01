import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDb } from "../config/db.js";
import User from "../models/User.js";
import JWT from "jsonwebtoken";

// Load environment variables
dotenv.config({ path: '../../../.env' });

async function testUserLookup() {
  try {
    console.log("🔍 Testing User Lookup...");
    
    // Connect to database
    await connectToDb();
    console.log("✅ Connected to MongoDB");

    // Find the admin user
    const adminUser = await User.findOne({ email: 'ahmed.hassan@mcanenugu.org.ng' });
    if (!adminUser) {
      console.log("❌ Admin user not found");
      return;
    }

    console.log("👤 Admin user found:");
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);

    // Create a JWT token like the login would
    const token = JWT.sign(
      { _id: adminUser._id, id: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("\n🔑 Generated token:");
    console.log(`   Token length: ${token.length}`);

    // Decode the token to verify
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    console.log("\n📋 Decoded token:");
    console.log(`   _id: ${decoded._id}`);
    console.log(`   id: ${decoded.id}`);

    // Test user lookup with the ID from token
    const userLookup = await User.findById(decoded._id);
    if (userLookup) {
      console.log("\n✅ User lookup successful:");
      console.log(`   Found user: ${userLookup.name}`);
      console.log(`   Role: ${userLookup.role}`);
      console.log(`   Role check: ${userLookup.role === 'admin'}`);
    } else {
      console.log("\n❌ User lookup failed - user not found by ID");
    }

    // Test with string conversion
    const userLookupString = await User.findById(decoded._id.toString());
    if (userLookupString) {
      console.log("\n✅ User lookup with string conversion successful:");
      console.log(`   Found user: ${userLookupString.name}`);
      console.log(`   Role: ${userLookupString.role}`);
    } else {
      console.log("\n❌ User lookup with string conversion failed");
    }

    console.log("\n🎉 User lookup testing completed!");
    
  } catch (error) {
    console.error("❌ Error during user lookup testing:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the test
testUserLookup();
