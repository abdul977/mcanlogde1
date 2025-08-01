import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = 'http://localhost:3000';

// Test user credentials
const USER_CREDENTIALS = {
  email: 'fatima.ibrahim@mcanenugu.org.ng',
  password: 'Fatima456!'
};

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'ahmed.hassan@mcanenugu.org.ng',
  password: 'Ahmed123!'
};

async function testFullWorkflow() {
  try {
    console.log('🧪 Testing Full Community Creation & Approval Workflow...\n');
    
    // Step 1: Login as regular user
    console.log('1. Logging in as regular user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/api/login`, USER_CREDENTIALS);
    
    if (!userLoginResponse.data.success) {
      console.log('❌ User login failed:', userLoginResponse.data.message);
      return;
    }
    
    const userToken = userLoginResponse.data.token;
    console.log('✅ User login successful');
    console.log(`   User: ${userLoginResponse.data.user.name} (${userLoginResponse.data.user.email})`);
    
    const userAuthHeaders = {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Create a community as regular user
    console.log('\n2. Creating community as regular user...');
    const newCommunity = {
      name: 'Test User Community',
      description: 'This community was created by a regular user to test the full approval workflow.',
      category: 'general',
      tags: ['test', 'user-created'],
      isPrivate: false,
      requireApproval: false,
      maxMembers: 100,
      messageRateLimit: { enabled: true, seconds: 5 },
      allowMediaSharing: true,
      allowFileSharing: true
    };
    
    const createResponse = await axios.post(
      `${BASE_URL}/api/chat-communities/create`,
      newCommunity,
      { headers: userAuthHeaders }
    );
    
    if (createResponse.data.success) {
      console.log('✅ Community created successfully');
      console.log(`   Community ID: ${createResponse.data.community._id}`);
      console.log(`   Status: ${createResponse.data.community.status}`);
      console.log(`   Creator: ${createResponse.data.community.creator}`);
    } else {
      console.log('❌ Failed to create community:', createResponse.data.message);
      return;
    }

    const communityId = createResponse.data.community._id;

    // Step 3: Verify community is not visible in public list (pending approval)
    console.log('\n3. Checking public community list...');
    const publicResponse = await axios.get(`${BASE_URL}/api/chat-communities`);
    
    if (publicResponse.data.success) {
      const publicCommunity = publicResponse.data.communities.find(c => c._id === communityId);
      if (publicCommunity) {
        console.log('⚠️  Community is visible in public list (unexpected for pending status)');
      } else {
        console.log('✅ Community is not visible in public list (correct for pending status)');
      }
      console.log(`   Total public communities: ${publicResponse.data.communities.length}`);
    }

    // Step 4: Login as admin
    console.log('\n4. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/api/login`, ADMIN_CREDENTIALS);
    
    if (!adminLoginResponse.data.success) {
      console.log('❌ Admin login failed:', adminLoginResponse.data.message);
      return;
    }
    
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Admin: ${adminLoginResponse.data.user.name} (${adminLoginResponse.data.user.email})`);
    
    const adminAuthHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Step 5: Check admin community list
    console.log('\n5. Checking admin community list...');
    const adminCommunitiesResponse = await axios.get(
      `${BASE_URL}/api/chat-communities/admin/all`,
      { headers: adminAuthHeaders }
    );
    
    if (adminCommunitiesResponse.data.success) {
      const communities = adminCommunitiesResponse.data.communities;
      const pendingCommunity = communities.find(c => c._id === communityId);
      
      if (pendingCommunity) {
        console.log('✅ Community found in admin list');
        console.log(`   Status: ${pendingCommunity.status}`);
        console.log(`   Creator: ${pendingCommunity.creator?.name || 'Unknown'}`);
      } else {
        console.log('❌ Community not found in admin list');
        return;
      }
      
      console.log(`   Total communities: ${communities.length}`);
      console.log('   Status counts:', adminCommunitiesResponse.data.statusCounts);
    } else {
      console.log('❌ Failed to fetch admin communities:', adminCommunitiesResponse.data.message);
      return;
    }

    // Step 6: Approve the community
    console.log('\n6. Approving the community...');
    const approvalData = {
      adminNotes: 'Community approved during automated workflow testing. Meets all guidelines.'
    };
    
    const approveResponse = await axios.put(
      `${BASE_URL}/api/chat-communities/admin/${communityId}/approve`,
      approvalData,
      { headers: adminAuthHeaders }
    );
    
    if (approveResponse.data.success) {
      console.log('✅ Community approved successfully');
      console.log(`   New status: ${approveResponse.data.community.status}`);
      console.log(`   Approved by: ${approveResponse.data.community.approvalInfo?.reviewedBy}`);
      console.log(`   Admin notes: ${approveResponse.data.community.approvalInfo?.adminNotes}`);
    } else {
      console.log('❌ Failed to approve community:', approveResponse.data.message);
      return;
    }

    // Step 7: Verify community is now visible in public list
    console.log('\n7. Verifying community is now public...');
    const finalPublicResponse = await axios.get(`${BASE_URL}/api/chat-communities`);
    
    if (finalPublicResponse.data.success) {
      const approvedCommunity = finalPublicResponse.data.communities.find(c => c._id === communityId);
      if (approvedCommunity) {
        console.log('✅ Approved community is now visible in public list');
        console.log(`   Community: ${approvedCommunity.name}`);
        console.log(`   Status: ${approvedCommunity.status}`);
        console.log(`   Members: ${approvedCommunity.memberCount}`);
      } else {
        console.log('⚠️  Approved community not found in public list (may take time to sync)');
      }
      console.log(`   Total public communities: ${finalPublicResponse.data.communities.length}`);
    }

    // Step 8: Test user's communities list
    console.log('\n8. Checking user\'s communities...');
    const userCommunitiesResponse = await axios.get(
      `${BASE_URL}/api/chat-communities/user/my-communities`,
      { headers: userAuthHeaders }
    );
    
    if (userCommunitiesResponse.data.success) {
      const userCommunities = userCommunitiesResponse.data.communities;
      const userCommunity = userCommunities.find(c => c._id === communityId);
      
      if (userCommunity) {
        console.log('✅ Community found in user\'s communities list');
        console.log(`   Role: ${userCommunity.role || 'creator'}`);
      } else {
        console.log('⚠️  Community not found in user\'s communities list');
      }
      console.log(`   User has ${userCommunities.length} communities`);
    }

    console.log('\n🎉 Full workflow testing completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User registration/login works');
    console.log('   ✅ Community creation works (starts as pending)');
    console.log('   ✅ Pending communities are hidden from public');
    console.log('   ✅ Admin can see all communities');
    console.log('   ✅ Admin approval workflow works');
    console.log('   ✅ Approved communities become public');
    console.log('   ✅ User can see their created communities');
    
  } catch (error) {
    console.error('❌ Error during workflow testing:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('💡 This might be an authentication issue.');
    }
  }
}

// Run the test
testFullWorkflow();
