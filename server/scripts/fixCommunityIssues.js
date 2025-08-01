import mongoose from 'mongoose';
import ChatCommunity from '../src/models/ChatCommunity.js';
import CommunityMember from '../src/models/CommunityMember.js';
import CommunityMessage from '../src/models/CommunityMessage.js';
import ModerationLog from '../src/models/ModerationLog.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcanlogde';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function fixCommunityIssues() {
  try {
    console.log('🔧 Starting community issues fix...');

    // 1. Remove problematic MCAN community
    console.log('\n1. Removing problematic MCAN community...');
    const mcanCommunity = await ChatCommunity.findOne({ 
      name: { $regex: /MCAN/i } 
    });

    if (mcanCommunity) {
      console.log(`Found MCAN community: ${mcanCommunity.name} (ID: ${mcanCommunity._id})`);
      
      // Remove associated members
      const memberCount = await CommunityMember.countDocuments({ 
        community: mcanCommunity._id 
      });
      await CommunityMember.deleteMany({ community: mcanCommunity._id });
      console.log(`  - Removed ${memberCount} members`);

      // Remove associated messages
      const messageCount = await CommunityMessage.countDocuments({ 
        community: mcanCommunity._id 
      });
      await CommunityMessage.deleteMany({ community: mcanCommunity._id });
      console.log(`  - Removed ${messageCount} messages`);

      // Remove associated moderation logs
      const logCount = await ModerationLog.countDocuments({ 
        community: mcanCommunity._id 
      });
      await ModerationLog.deleteMany({ community: mcanCommunity._id });
      console.log(`  - Removed ${logCount} moderation logs`);

      // Remove the community itself
      await ChatCommunity.deleteOne({ _id: mcanCommunity._id });
      console.log(`  - Removed community: ${mcanCommunity.name}`);
    } else {
      console.log('  - No MCAN community found');
    }

    // 2. Fix null user references in community members
    console.log('\n2. Fixing null user references in community members...');
    const nullUserMembers = await CommunityMember.find({ 
      user: { $in: [null, undefined] } 
    });
    
    if (nullUserMembers.length > 0) {
      await CommunityMember.deleteMany({ 
        user: { $in: [null, undefined] } 
      });
      console.log(`  - Removed ${nullUserMembers.length} members with null user references`);
    } else {
      console.log('  - No null user references found');
    }

    // 3. Fix community member counts
    console.log('\n3. Fixing community member counts...');
    const communities = await ChatCommunity.find({});
    
    for (const community of communities) {
      const actualMemberCount = await CommunityMember.countDocuments({
        community: community._id,
        status: 'active'
      });
      
      if (community.memberCount !== actualMemberCount) {
        await ChatCommunity.updateOne(
          { _id: community._id },
          { memberCount: actualMemberCount }
        );
        console.log(`  - Updated ${community.name}: ${community.memberCount} → ${actualMemberCount} members`);
      }
    }

    // 4. Ensure all communities have proper settings
    console.log('\n4. Ensuring all communities have proper settings...');
    const communitiesWithoutSettings = await ChatCommunity.find({
      $or: [
        { settings: { $exists: false } },
        { settings: null },
        { 'settings.requireJoinApproval': { $exists: false } }
      ]
    });

    for (const community of communitiesWithoutSettings) {
      const defaultSettings = {
        requireJoinApproval: false,
        allowMemberInvites: true,
        allowFileUploads: true,
        maxFileSize: 10, // MB
        allowedFileTypes: ['image', 'document'],
        messageRetentionDays: 365,
        autoModeration: {
          enabled: false,
          spamDetection: true,
          profanityFilter: false,
          linkDetection: true
        },
        notifications: {
          newMembers: true,
          newMessages: false,
          mentions: true
        }
      };

      await ChatCommunity.updateOne(
        { _id: community._id },
        { 
          $set: { 
            settings: {
              ...defaultSettings,
              ...community.settings
            }
          }
        }
      );
      console.log(`  - Added default settings to: ${community.name}`);
    }

    // 5. Clean up orphaned moderation logs
    console.log('\n5. Cleaning up orphaned moderation logs...');
    const communityIds = await ChatCommunity.distinct('_id');
    const orphanedLogs = await ModerationLog.find({
      community: { $nin: communityIds }
    });

    if (orphanedLogs.length > 0) {
      await ModerationLog.deleteMany({
        community: { $nin: communityIds }
      });
      console.log(`  - Removed ${orphanedLogs.length} orphaned moderation logs`);
    } else {
      console.log('  - No orphaned moderation logs found');
    }

    console.log('\n✅ Community issues fix completed successfully!');
    
    // Display summary
    const totalCommunities = await ChatCommunity.countDocuments();
    const totalMembers = await CommunityMember.countDocuments();
    const totalMessages = await CommunityMessage.countDocuments();
    
    console.log('\n📊 Current database state:');
    console.log(`  - Communities: ${totalCommunities}`);
    console.log(`  - Members: ${totalMembers}`);
    console.log(`  - Messages: ${totalMessages}`);

  } catch (error) {
    console.error('❌ Error fixing community issues:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await fixCommunityIssues();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
main();
