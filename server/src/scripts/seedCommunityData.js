import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDb } from "../config/db.js";

// Load environment variables
dotenv.config({ path: '../../../.env' });

// Import models
import ChatCommunity from "../models/ChatCommunity.js";
import CommunityMember from "../models/CommunityMember.js";
import User from "../models/User.js";

async function seedCommunityData() {
  try {
    console.log("🌱 Starting Community Data Seeding...");
    
    // Connect to database
    await connectToDb();
    console.log("✅ Connected to MongoDB");

    // Get admin user (or create one if doesn't exist)
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log("⚠️  No admin user found. Please create an admin user first.");
      return;
    }

    console.log(`👤 Using admin user: ${adminUser.name} (${adminUser.email})`);

    // Sample communities data
    const sampleCommunities = [
      {
        name: "MCAN General Discussion",
        description: "A place for all MCAN members to discuss general topics, share experiences, and connect with fellow Muslim corps members.",
        category: "general",
        tags: ["general", "discussion", "mcan", "community"],
        featured: true,
        settings: {
          isPrivate: false,
          requireApproval: false,
          maxMembers: 1000,
          messageRateLimit: { enabled: true, seconds: 5 },
          allowMediaSharing: true,
          allowFileSharing: true
        }
      },
      {
        name: "Islamic Studies & Learning",
        description: "Dedicated space for Islamic education, Quran study, Hadith discussions, and religious learning among corps members.",
        category: "spiritual",
        tags: ["islam", "quran", "hadith", "education", "learning"],
        featured: true,
        settings: {
          isPrivate: false,
          requireApproval: false,
          maxMembers: 500,
          messageRateLimit: { enabled: true, seconds: 10 },
          allowMediaSharing: true,
          allowFileSharing: true
        }
      },
      {
        name: "NYSC Welfare Support",
        description: "Community focused on welfare support, financial assistance, and helping fellow corps members in need.",
        category: "welfare",
        tags: ["welfare", "support", "assistance", "help", "nysc"],
        featured: false,
        settings: {
          isPrivate: false,
          requireApproval: true,
          maxMembers: 300,
          messageRateLimit: { enabled: true, seconds: 5 },
          allowMediaSharing: true,
          allowFileSharing: true
        }
      },
      {
        name: "Tech & Innovation Hub",
        description: "For tech-savvy corps members to share knowledge, collaborate on projects, and discuss technology trends.",
        category: "technology",
        tags: ["technology", "programming", "innovation", "projects", "coding"],
        featured: false,
        settings: {
          isPrivate: false,
          requireApproval: false,
          maxMembers: 200,
          messageRateLimit: { enabled: true, seconds: 3 },
          allowMediaSharing: true,
          allowFileSharing: true
        }
      },
      {
        name: "Women's Circle",
        description: "A supportive community for female corps members to discuss women-specific issues, share experiences, and support each other.",
        category: "women",
        tags: ["women", "support", "sisterhood", "empowerment"],
        featured: false,
        settings: {
          isPrivate: true,
          requireApproval: true,
          maxMembers: 150,
          messageRateLimit: { enabled: true, seconds: 5 },
          allowMediaSharing: true,
          allowFileSharing: true
        }
      },
      {
        name: "Youth Leadership Development",
        description: "Focused on developing leadership skills, career guidance, and professional development for young Muslim professionals.",
        category: "youth",
        tags: ["leadership", "career", "development", "youth", "professional"],
        featured: true,
        settings: {
          isPrivate: false,
          requireApproval: false,
          maxMembers: 400,
          messageRateLimit: { enabled: true, seconds: 5 },
          allowMediaSharing: true,
          allowFileSharing: true
        }
      }
    ];

    // Check if communities already exist
    const existingCommunities = await ChatCommunity.countDocuments();
    
    if (existingCommunities > 0) {
      console.log(`ℹ️  ${existingCommunities} communities already exist. Skipping seeding.`);
      return;
    }

    console.log("📝 Creating sample communities...");

    // Create communities
    const createdCommunities = [];
    
    for (const communityData of sampleCommunities) {
      const community = new ChatCommunity({
        ...communityData,
        creator: adminUser._id,
        status: "approved", // Pre-approve for demo
        memberCount: 1 // Creator is automatically a member
      });

      await community.save();
      createdCommunities.push(community);

      // Add creator as a member
      const creatorMember = new CommunityMember({
        community: community._id,
        user: adminUser._id,
        role: "creator",
        status: "active",
        permissions: {
          canKickMembers: true,
          canBanMembers: true,
          canDeleteMessages: true,
          canManageRules: true,
          canInviteMembers: true,
          canPinMessages: true
        }
      });

      await creatorMember.save();

      console.log(`✅ Created community: ${community.name}`);
    }

    // Add some sample rules to communities
    console.log("📋 Adding community rules...");
    
    for (const community of createdCommunities) {
      const sampleRules = [
        {
          title: "Be Respectful",
          description: "Treat all members with respect and kindness. No harassment, bullying, or discriminatory language.",
          order: 1
        },
        {
          title: "Stay On Topic",
          description: "Keep discussions relevant to the community's purpose and avoid off-topic conversations.",
          order: 2
        },
        {
          title: "No Spam",
          description: "Avoid repetitive messages, excessive links, or promotional content without permission.",
          order: 3
        },
        {
          title: "Islamic Values",
          description: "Maintain Islamic principles and values in all interactions and discussions.",
          order: 4
        }
      ];

      community.rules = sampleRules;
      await community.save();
    }

    // Final statistics
    const finalStats = {
      communities: await ChatCommunity.countDocuments(),
      members: await CommunityMember.countDocuments()
    };

    console.log("📊 Seeding Statistics:");
    console.log(`   Communities Created: ${finalStats.communities}`);
    console.log(`   Members Added: ${finalStats.members}`);

    console.log("🎉 Community Data Seeding Completed Successfully!");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCommunityData()
    .then(() => {
      console.log("✅ Seeding script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding script failed:", error);
      process.exit(1);
    });
}

export default seedCommunityData;
