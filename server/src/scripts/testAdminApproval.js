import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = 'http://localhost:3000';

// Admin credentials from seedUsers.js
const ADMIN_CREDENTIALS = {
  email: 'ahmed.hassan@mcanenugu.org.ng',
  password: 'Ahmed123!'
};

async function testAdminApproval() {
  try {
    console.log('🧪 Testing Admin Community Approval Workflow...\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      return;
    }
    
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Admin: ${loginResponse.data.user.name} (${loginResponse.data.user.email})`);
    
    const authHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get all communities (admin view)
    console.log('\n2. Fetching all communities (admin view)...');
    const adminCommunitiesResponse = await axios.get(
      `${BASE_URL}/api/chat-communities/admin/all`,
      { headers: authHeaders }
    );
    
    if (adminCommunitiesResponse.data.success) {
      const communities = adminCommunitiesResponse.data.communities;
      console.log(`✅ Found ${communities.length} communities`);
      
      if (communities.length > 0) {
        console.log('   Communities:');
        communities.forEach((c, index) => {
          console.log(`   ${index + 1}. ${c.name} (${c.status}) - Created by: ${c.creator?.name || 'Unknown'}`);
        });
        
        console.log('\n   Status Counts:');
        const statusCounts = adminCommunitiesResponse.data.statusCounts;
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   - ${status}: ${count}`);
        });
      }
    } else {
      console.log('❌ Failed to fetch admin communities:', adminCommunitiesResponse.data.message);
      return;
    }

    // Step 3: Find a pending community to test approval
    const pendingCommunities = adminCommunitiesResponse.data.communities.filter(c => c.status === 'pending');
    
    if (pendingCommunities.length === 0) {
      console.log('\n⚠️  No pending communities found. Creating a test community...');
      
      // Create a test community for approval testing
      const testCommunity = {
        name: 'Test Approval Community',
        description: 'This community is created to test the admin approval workflow.',
        category: 'general',
        tags: ['test', 'approval']
      };
      
      const createResponse = await axios.post(
        `${BASE_URL}/api/chat-communities/create`,
        testCommunity,
        { headers: authHeaders }
      );
      
      if (createResponse.data.success) {
        console.log('✅ Test community created successfully');
        console.log(`   Community ID: ${createResponse.data.community._id}`);
        console.log(`   Status: ${createResponse.data.community.status}`);
        
        // Re-fetch communities to get the updated list
        const updatedResponse = await axios.get(
          `${BASE_URL}/api/chat-communities/admin/all`,
          { headers: authHeaders }
        );
        
        if (updatedResponse.data.success) {
          const updatedPending = updatedResponse.data.communities.filter(c => c.status === 'pending');
          if (updatedPending.length > 0) {
            pendingCommunities.push(updatedPending[updatedPending.length - 1]); // Add the newly created one
          }
        }
      } else {
        console.log('❌ Failed to create test community:', createResponse.data.message);
        return;
      }
    }

    if (pendingCommunities.length > 0) {
      const testCommunity = pendingCommunities[0];
      console.log(`\n3. Testing approval for: "${testCommunity.name}"`);
      
      // Step 4: Test community approval
      console.log('   Approving community...');
      const approvalData = {
        adminNotes: 'Approved during automated testing - community meets all guidelines.'
      };
      
      const approveResponse = await axios.put(
        `${BASE_URL}/api/chat-communities/admin/${testCommunity._id}/approve`,
        approvalData,
        { headers: authHeaders }
      );
      
      if (approveResponse.data.success) {
        console.log('✅ Community approved successfully');
        console.log(`   New status: ${approveResponse.data.community.status}`);
        console.log(`   Reviewed by: ${approveResponse.data.community.approvalInfo?.reviewedBy}`);
        console.log(`   Admin notes: ${approveResponse.data.community.approvalInfo?.adminNotes}`);
      } else {
        console.log('❌ Failed to approve community:', approveResponse.data.message);
      }

      // Step 5: Verify the community appears in public list
      console.log('\n4. Verifying community appears in public list...');
      const publicResponse = await axios.get(`${BASE_URL}/api/chat-communities`);
      
      if (publicResponse.data.success) {
        const approvedCommunity = publicResponse.data.communities.find(c => c._id === testCommunity._id);
        if (approvedCommunity) {
          console.log('✅ Approved community is now visible in public list');
          console.log(`   Community: ${approvedCommunity.name}`);
          console.log(`   Status: ${approvedCommunity.status}`);
        } else {
          console.log('⚠️  Approved community not found in public list (may take time to sync)');
        }
      } else {
        console.log('❌ Failed to fetch public communities:', publicResponse.data.message);
      }
    }

    // Step 6: Test rejection workflow (if there are more pending communities)
    const remainingPending = adminCommunitiesResponse.data.communities.filter(c => c.status === 'pending');
    if (remainingPending.length > 1) {
      const rejectTestCommunity = remainingPending[1];
      console.log(`\n5. Testing rejection for: "${rejectTestCommunity.name}"`);
      
      const rejectionData = {
        rejectionReason: 'Community content does not meet guidelines - testing rejection workflow.',
        adminNotes: 'Rejected during automated testing.'
      };
      
      const rejectResponse = await axios.put(
        `${BASE_URL}/api/chat-communities/admin/${rejectTestCommunity._id}/reject`,
        rejectionData,
        { headers: authHeaders }
      );
      
      if (rejectResponse.data.success) {
        console.log('✅ Community rejected successfully');
        console.log(`   New status: ${rejectResponse.data.community.status}`);
        console.log(`   Rejection reason: ${rejectResponse.data.community.approvalInfo?.rejectionReason}`);
      } else {
        console.log('❌ Failed to reject community:', rejectResponse.data.message);
      }
    }

    console.log('\n🎉 Admin approval workflow testing completed!');
    
  } catch (error) {
    console.error('❌ Error during admin approval testing:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('💡 This might be an authentication issue. Make sure the admin user exists and credentials are correct.');
    }
  }
}

// Run the test
testAdminApproval();
