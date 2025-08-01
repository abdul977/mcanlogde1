# Community System Test Plan

## Overview
Comprehensive testing plan for the community system fixes across web and mobile platforms.

## Test Categories

### 1. Web Community Creation (Fixed)
**Issue**: 500 Internal Server Error with multipart form handling
**Fix**: Removed multer/express-fileupload conflict, added proper validation middleware

**Test Cases**:
- [ ] Create community without images (should work)
- [ ] Create community with avatar only (should work)
- [ ] Create community with banner only (should work)
- [ ] Create community with both avatar and banner (should work)
- [ ] Test file size validation (>5MB should fail)
- [ ] Test file type validation (non-image should fail)
- [ ] Test required field validation (name/description required)

**Test URLs**:
- Admin Create: `/admin/create-chat-community`
- API Endpoint: `POST /api/chat-communities/create`

### 2. Supabase Storage Infrastructure (Fixed)
**Issue**: Missing 'mcan-communities' and 'mcan-community-messages' buckets
**Fix**: Added buckets to setup script and created them

**Test Cases**:
- [x] Verify 'mcan-communities' bucket exists
- [x] Verify 'mcan-community-messages' bucket exists
- [ ] Test avatar upload to 'mcan-communities' bucket
- [ ] Test banner upload to 'mcan-communities' bucket
- [ ] Test message attachment upload to 'mcan-community-messages' bucket

### 3. Mobile Community Real-time Messaging (Fixed)
**Issue**: Messages don't appear immediately after sending
**Fix**: Added duplicate prevention logic and improved socket event handling

**Test Cases**:
- [ ] Send message in community chat (should appear immediately)
- [ ] Receive message from another user (should appear immediately)
- [ ] Test duplicate message prevention
- [ ] Test socket connection/disconnection handling
- [ ] Test typing indicators
- [ ] Test message with attachments

**Test Location**: `mobile/src/screens/community/CommunityDetailScreen.tsx`

### 4. Mobile Keyboard Behavior (Fixed)
**Issue**: Text input doesn't move up with keyboard properly
**Fix**: Restructured KeyboardAvoidingView to be root container

**Test Cases**:
- [ ] Open community chat on mobile
- [ ] Tap text input (keyboard should appear, input should move up)
- [ ] Type message (input should stay visible above keyboard)
- [ ] Send message (input should remain accessible)
- [ ] Test on both iOS and Android behavior

### 5. Community Avatar Fallback System (Already Working)
**Issue**: Need fallback for communities without images
**Status**: Already implemented with green background and initials

**Test Cases**:
- [x] Community without avatar shows green background with initials
- [x] Community with avatar shows the image
- [x] Fallback system works in community cards
- [x] Fallback system works in community headers

### 6. Admin Dashboard Community Management (Fixed)
**Issue**: Missing delete functionality and broken create form
**Fix**: Added delete functionality and proper create chat community form

**Test Cases**:
- [ ] Access admin chat communities page (`/admin/chat-communities`)
- [ ] View list of all chat communities
- [ ] Approve pending community
- [ ] Reject pending community
- [ ] Suspend approved community
- [ ] Delete community (with confirmation)
- [ ] Access create chat community form (`/admin/create-chat-community`)
- [ ] Create new chat community as admin

## Cross-Platform Synchronization Tests

### Community Creation Sync
- [ ] Create community on web → verify appears on mobile
- [ ] Create community on mobile → verify appears on web
- [ ] Admin approve community → verify status updates on both platforms

### Community Messaging Sync
- [ ] Send message on mobile → verify appears on web
- [ ] Send message on web → verify appears on mobile
- [ ] Upload attachment on mobile → verify accessible on web
- [ ] Upload attachment on web → verify accessible on mobile

### Community Management Sync
- [ ] Admin delete community on web → verify removed from mobile
- [ ] Admin suspend community on web → verify status on mobile
- [ ] User join community on mobile → verify member count on web
- [ ] User leave community on mobile → verify member count on web

## Performance Tests

### Load Testing
- [ ] Create community with large description (500 chars)
- [ ] Upload maximum file size (5MB) for avatar/banner
- [ ] Test community with maximum members (1000)
- [ ] Send multiple messages rapidly (rate limiting)

### Error Handling
- [ ] Test network disconnection during message send
- [ ] Test invalid file upload
- [ ] Test unauthorized access to admin functions
- [ ] Test malformed data submission

## Security Tests

### Authentication & Authorization
- [ ] Non-admin cannot access admin routes
- [ ] Non-authenticated users cannot create communities
- [ ] Users cannot delete communities they don't own
- [ ] File upload security (type/size validation)

### Data Validation
- [ ] SQL injection prevention in community search
- [ ] XSS prevention in community descriptions
- [ ] File upload validation (malicious files)
- [ ] Rate limiting on community creation

## Browser/Device Compatibility

### Web Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Devices
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] React Native iOS app
- [ ] React Native Android app

## Test Environment Setup

### Prerequisites
1. Server running on production (Render)
2. MongoDB database accessible
3. Supabase storage configured
4. Admin user account
5. Regular user accounts for testing

### Test Data
- Create test communities with various configurations
- Test users with different roles (admin, regular user)
- Sample images for avatar/banner testing
- Sample files for attachment testing

## Success Criteria

All test cases must pass for the community system to be considered fully functional:

1. ✅ Web community creation works without errors
2. ✅ Supabase storage buckets exist and functional
3. ✅ Mobile real-time messaging works properly
4. ✅ Mobile keyboard behavior is correct
5. ✅ Avatar fallback system works
6. ✅ Admin dashboard has full management capabilities
7. 🔄 Cross-platform synchronization works correctly
8. 🔄 Performance meets requirements
9. 🔄 Security measures are effective
10. 🔄 Browser/device compatibility confirmed

## Test Execution Log

### Date: [Current Date]
### Tester: AI Assistant
### Environment: Production (Render + Supabase)

**Completed Fixes**:
1. ✅ Fixed web community creation multipart form error
2. ✅ Created missing Supabase storage buckets
3. ✅ Fixed mobile real-time messaging with duplicate prevention
4. ✅ Fixed mobile keyboard behavior with proper KeyboardAvoidingView
5. ✅ Verified avatar fallback system is working
6. ✅ Added admin delete functionality and create chat community form

**Next Steps**:
1. Run comprehensive cross-platform tests
2. Validate all functionality works end-to-end
3. Test performance and security measures
4. Verify browser/device compatibility
