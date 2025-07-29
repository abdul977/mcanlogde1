import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDb } from "../config/db.js";

// Load environment variables
dotenv.config({ path: '../../../.env' });

// Import models to ensure they're registered
import ChatCommunity from "../models/ChatCommunity.js";
import CommunityMessage from "../models/CommunityMessage.js";
import CommunityMember from "../models/CommunityMember.js";
import ModerationLog from "../models/ModerationLog.js";

async function migrateCommunitySystem() {
  try {
    console.log("🚀 Starting Community System Migration...");
    
    // Connect to database
    await connectToDb();
    console.log("✅ Connected to MongoDB");

    // Create collections if they don't exist
    const db = mongoose.connection.db;
    
    // Check existing collections
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(col => col.name);
    
    console.log("📋 Existing collections:", collectionNames);

    // Collections to create
    const communityCollections = [
      'chat_communities',
      'community_messages', 
      'community_members',
      'moderation_logs'
    ];

    // Create collections if they don't exist
    for (const collectionName of communityCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${collectionName}`);
      }
    }

    // Create indexes for better performance
    console.log("🔍 Creating database indexes...");

    // ChatCommunity indexes
    await ChatCommunity.collection.createIndex({ status: 1, category: 1 });
    await ChatCommunity.collection.createIndex({ creator: 1, status: 1 });
    await ChatCommunity.collection.createIndex({ slug: 1 }, { unique: true });
    await ChatCommunity.collection.createIndex({ featured: 1, status: 1 });
    await ChatCommunity.collection.createIndex({ tags: 1, status: 1 });
    await ChatCommunity.collection.createIndex({ memberCount: -1, status: 1 });
    await ChatCommunity.collection.createIndex({ lastActivity: -1, status: 1 });
    await ChatCommunity.collection.createIndex({
      name: 'text',
      description: 'text',
      tags: 'text'
    });
    console.log("✅ ChatCommunity indexes created");

    // CommunityMessage indexes
    await CommunityMessage.collection.createIndex({ community: 1, createdAt: -1 });
    await CommunityMessage.collection.createIndex({ sender: 1, createdAt: -1 });
    await CommunityMessage.collection.createIndex({ community: 1, isDeleted: 1, createdAt: -1 });
    await CommunityMessage.collection.createIndex({ replyTo: 1 });
    await CommunityMessage.collection.createIndex({ flaggedAsSpam: 1, community: 1 });
    await CommunityMessage.collection.createIndex({ content: 'text' });
    console.log("✅ CommunityMessage indexes created");

    // CommunityMember indexes
    await CommunityMember.collection.createIndex({ community: 1, user: 1 }, { unique: true });
    await CommunityMember.collection.createIndex({ community: 1, status: 1, role: 1 });
    await CommunityMember.collection.createIndex({ user: 1, status: 1 });
    await CommunityMember.collection.createIndex({ community: 1, joinedAt: -1 });
    await CommunityMember.collection.createIndex({ community: 1, lastSeen: -1 });
    console.log("✅ CommunityMember indexes created");

    // ModerationLog indexes
    await ModerationLog.collection.createIndex({ community: 1, createdAt: -1 });
    await ModerationLog.collection.createIndex({ moderator: 1, createdAt: -1 });
    await ModerationLog.collection.createIndex({ "target.user": 1, createdAt: -1 });
    await ModerationLog.collection.createIndex({ action: 1, community: 1 });
    await ModerationLog.collection.createIndex({ "metadata.severity": 1, community: 1 });
    console.log("✅ ModerationLog indexes created");

    // Create sample data for testing (optional)
    console.log("📝 Creating sample data...");
    
    // Check if we already have communities
    const existingCommunities = await ChatCommunity.countDocuments();
    
    if (existingCommunities === 0) {
      // Create a sample community for testing
      const sampleCommunity = new ChatCommunity({
        name: "MCAN General Discussion",
        description: "A place for all MCAN members to discuss general topics, share experiences, and connect with fellow Muslim corps members.",
        category: "general",
        creator: new mongoose.Types.ObjectId(), // This should be replaced with actual admin user ID
        settings: {
          isPrivate: false,
          requireApproval: false,
          maxMembers: 1000,
          messageRateLimit: { enabled: true, seconds: 5 },
          allowMediaSharing: true,
          allowFileSharing: true
        },
        tags: ["general", "discussion", "mcan", "community"],
        status: "approved", // Pre-approved for testing
        featured: true,
        memberCount: 1
      });

      await sampleCommunity.save();
      console.log("✅ Sample community created");
    } else {
      console.log("ℹ️  Communities already exist, skipping sample data creation");
    }

    // Verify migration
    console.log("🔍 Verifying migration...");
    
    const stats = {
      communities: await ChatCommunity.countDocuments(),
      messages: await CommunityMessage.countDocuments(),
      members: await CommunityMember.countDocuments(),
      moderationLogs: await ModerationLog.countDocuments()
    };

    console.log("📊 Migration Statistics:");
    console.log(`   Communities: ${stats.communities}`);
    console.log(`   Messages: ${stats.messages}`);
    console.log(`   Members: ${stats.members}`);
    console.log(`   Moderation Logs: ${stats.moderationLogs}`);

    console.log("🎉 Community System Migration Completed Successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCommunitySystem()
    .then(() => {
      console.log("✅ Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration script failed:", error);
      process.exit(1);
    });
}

export default migrateCommunitySystem;
