import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDb } from "../config/db.js";
import ChatCommunity from "../models/ChatCommunity.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config({ path: '../../../.env' });

async function createTestCommunity() {
  try {
    console.log("🌱 Creating test community...");
    
    // Connect to database
    await connectToDb();
    console.log("✅ Connected to MongoDB");

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log("❌ No admin user found. Please run seedUsers.js first.");
      return;
    }

    console.log(`👤 Using admin user: ${adminUser.name} (${adminUser.email})`);

    // Check if communities already exist
    const existingCount = await ChatCommunity.countDocuments();
    console.log(`📊 Existing communities: ${existingCount}`);

    // Create a test community
    const testCommunity = new ChatCommunity({
      name: "Test Community for API Testing",
      description: "This is a test community created to verify the community creation and approval workflow.",
      category: "general",
      creator: adminUser._id,
      settings: {
        isPrivate: false,
        requireApproval: false,
        maxMembers: 100,
        messageRateLimit: { enabled: true, seconds: 5 },
        allowMediaSharing: true,
        allowFileSharing: true
      },
      tags: ["test", "api", "general"],
      status: "pending", // Start as pending to test approval workflow
      featured: false,
      memberCount: 1
    });

    await testCommunity.save();
    console.log(`✅ Created test community: ${testCommunity.name}`);
    console.log(`   ID: ${testCommunity._id}`);
    console.log(`   Slug: ${testCommunity.slug}`);
    console.log(`   Status: ${testCommunity.status}`);

    // Create another approved community for testing
    const approvedCommunity = new ChatCommunity({
      name: "MCAN General Discussion",
      description: "A place for all MCAN members to discuss general topics and connect.",
      category: "general",
      creator: adminUser._id,
      settings: {
        isPrivate: false,
        requireApproval: false,
        maxMembers: 1000,
        messageRateLimit: { enabled: true, seconds: 5 },
        allowMediaSharing: true,
        allowFileSharing: true
      },
      tags: ["general", "discussion", "mcan"],
      status: "approved", // Pre-approved for testing
      featured: true,
      memberCount: 1
    });

    await approvedCommunity.save();
    console.log(`✅ Created approved community: ${approvedCommunity.name}`);
    console.log(`   ID: ${approvedCommunity._id}`);
    console.log(`   Slug: ${approvedCommunity.slug}`);
    console.log(`   Status: ${approvedCommunity.status}`);

    // Final count
    const finalCount = await ChatCommunity.countDocuments();
    console.log(`\n📊 Total communities now: ${finalCount}`);

    const pendingCount = await ChatCommunity.countDocuments({ status: "pending" });
    const approvedCount = await ChatCommunity.countDocuments({ status: "approved" });
    
    console.log(`   Pending: ${pendingCount}`);
    console.log(`   Approved: ${approvedCount}`);

    console.log("\n🎉 Test communities created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating test community:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
createTestCommunity();
