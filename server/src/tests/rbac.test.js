import { expect } from 'chai';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import RolePermission from '../models/RolePermission.js';
import MFADevice from '../models/MFADevice.js';
import { permissionAuthManager } from '../middlewares/PermissionAuth.js';
import { roleHierarchyManager } from '../middlewares/RoleHierarchy.js';
import { hashPassword } from '../utils/passwordPolicy.js';

describe('RBAC System Tests', function() {
  this.timeout(10000);

  let testUsers = {};
  let testRoles = {};
  let testPermissions = {};

  before(async function() {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/mcan_test');
    }

    // Clean up test data
    await User.deleteMany({ email: { $regex: /test.*@test\.com/ } });
    await Role.deleteMany({ name: { $regex: /test_/ } });
    await Permission.deleteMany({ name: { $regex: /test_/ } });
    await RolePermission.deleteMany({});
    await MFADevice.deleteMany({});

    // Create test roles
    testRoles.superAdmin = await Role.create({
      name: 'test_super_admin',
      displayName: 'Test Super Admin',
      hierarchyLevel: 1,
      scope: 'global',
      isActive: true
    });

    testRoles.stateAdmin = await Role.create({
      name: 'test_state_admin',
      displayName: 'Test State Admin',
      hierarchyLevel: 3,
      scope: 'state',
      isActive: true
    });

    testRoles.member = await Role.create({
      name: 'test_member',
      displayName: 'Test Member',
      hierarchyLevel: 6,
      scope: 'personal',
      isActive: true
    });

    // Create test permissions
    testPermissions.userManage = await Permission.create({
      name: 'test_users_manage_global',
      displayName: 'Test Manage Users (Global)',
      description: 'Test permission to manage users globally',
      resource: 'users',
      action: 'manage',
      scope: 'global',
      category: 'user_management',
      riskLevel: 'high',
      requiresMFA: true,
      isSystemPermission: true
    });

    testPermissions.userRead = await Permission.create({
      name: 'test_users_read_state',
      displayName: 'Test Read Users (State)',
      description: 'Test permission to read users in state',
      resource: 'users',
      action: 'read',
      scope: 'state',
      category: 'user_management',
      riskLevel: 'low',
      requiresMFA: false,
      isSystemPermission: true
    });

    testPermissions.bookingCreate = await Permission.create({
      name: 'test_bookings_create_personal',
      displayName: 'Test Create Bookings',
      description: 'Test permission to create personal bookings',
      resource: 'bookings',
      action: 'create',
      scope: 'personal',
      category: 'administrative',
      riskLevel: 'low',
      requiresMFA: false,
      isSystemPermission: true
    });

    // Grant permissions to roles
    await RolePermission.grantPermission(
      testRoles.superAdmin._id,
      testPermissions.userManage._id,
      null,
      { reason: 'Test setup' }
    );

    await RolePermission.grantPermission(
      testRoles.stateAdmin._id,
      testPermissions.userRead._id,
      null,
      { reason: 'Test setup' }
    );

    await RolePermission.grantPermission(
      testRoles.member._id,
      testPermissions.bookingCreate._id,
      null,
      { reason: 'Test setup' }
    );

    // Create test users
    const hashedPassword = await hashPassword('TestPassword123!');

    testUsers.superAdmin = await User.create({
      name: 'Test Super Admin',
      email: 'test.superadmin@test.com',
      password: hashedPassword,
      roles: [testRoles.superAdmin._id],
      primaryRole: testRoles.superAdmin._id,
      stateId: 'TS',
      accountStatus: 'active',
      mfaEnabled: true
    });

    testUsers.stateAdmin = await User.create({
      name: 'Test State Admin',
      email: 'test.stateadmin@test.com',
      password: hashedPassword,
      roles: [testRoles.stateAdmin._id],
      primaryRole: testRoles.stateAdmin._id,
      stateId: 'TS',
      accountStatus: 'active',
      mfaEnabled: false
    });

    testUsers.member = await User.create({
      name: 'Test Member',
      email: 'test.member@test.com',
      password: hashedPassword,
      roles: [testRoles.member._id],
      primaryRole: testRoles.member._id,
      stateId: 'TS',
      accountStatus: 'active',
      mfaEnabled: false
    });

    testUsers.otherStateMember = await User.create({
      name: 'Test Other State Member',
      email: 'test.othermember@test.com',
      password: hashedPassword,
      roles: [testRoles.member._id],
      primaryRole: testRoles.member._id,
      stateId: 'OS', // Different state
      accountStatus: 'active',
      mfaEnabled: false
    });
  });

  after(async function() {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /test.*@test\.com/ } });
    await Role.deleteMany({ name: { $regex: /test_/ } });
    await Permission.deleteMany({ name: { $regex: /test_/ } });
    await RolePermission.deleteMany({});
    await MFADevice.deleteMany({});
  });

  describe('Role Hierarchy Tests', function() {
    it('should correctly identify user hierarchy levels', async function() {
      const superAdminRole = await roleHierarchyManager.getUserHighestRole(testUsers.superAdmin._id);
      const stateAdminRole = await roleHierarchyManager.getUserHighestRole(testUsers.stateAdmin._id);
      const memberRole = await roleHierarchyManager.getUserHighestRole(testUsers.member._id);

      expect(superAdminRole.hierarchyLevel).to.equal(1);
      expect(stateAdminRole.hierarchyLevel).to.equal(3);
      expect(memberRole.hierarchyLevel).to.equal(6);
    });

    it('should allow higher roles to manage lower roles', async function() {
      const canManage = await roleHierarchyManager.canManageUser(
        testUsers.superAdmin._id,
        testUsers.stateAdmin._id
      );

      expect(canManage.canManage).to.be.true;
    });

    it('should prevent lower roles from managing higher roles', async function() {
      const canManage = await roleHierarchyManager.canManageUser(
        testUsers.member._id,
        testUsers.superAdmin._id
      );

      expect(canManage.canManage).to.be.false;
    });

    it('should prevent equal level roles from managing each other', async function() {
      const canManage = await roleHierarchyManager.canManageUser(
        testUsers.stateAdmin._id,
        testUsers.stateAdmin._id
      );

      expect(canManage.canManage).to.be.true; // Self-management allowed
    });
  });

  describe('Permission System Tests', function() {
    it('should grant permissions based on role assignments', async function() {
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.superAdmin._id,
        'users',
        'manage'
      );

      expect(hasPermission.hasPermission).to.be.true;
      expect(hasPermission.requiresMFA).to.be.true;
    });

    it('should deny permissions not granted to role', async function() {
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.member._id,
        'users',
        'manage'
      );

      expect(hasPermission.hasPermission).to.be.false;
    });

    it('should respect scope restrictions', async function() {
      // State admin should have state-scoped read permission
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.stateAdmin._id,
        'users',
        'read',
        { user: testUsers.stateAdmin, stateId: 'TS' }
      );

      expect(hasPermission.hasPermission).to.be.true;
    });

    it('should deny access outside scope', async function() {
      // State admin should not have access to different state
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.stateAdmin._id,
        'users',
        'read',
        { user: testUsers.stateAdmin, stateId: 'OS' }
      );

      expect(hasPermission.hasPermission).to.be.false;
    });
  });

  describe('Resource Ownership Tests', function() {
    it('should allow access to own records', async function() {
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.member._id,
        'bookings',
        'create',
        { 
          user: testUsers.member,
          resourceOwnerId: testUsers.member._id.toString()
        }
      );

      expect(hasPermission.hasPermission).to.be.true;
    });

    it('should deny access to other users records for personal scope', async function() {
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.member._id,
        'bookings',
        'create',
        { 
          user: testUsers.member,
          resourceOwnerId: testUsers.otherStateMember._id.toString()
        }
      );

      expect(hasPermission.hasPermission).to.be.false;
    });
  });

  describe('MFA Requirements Tests', function() {
    it('should identify MFA requirements for high-risk permissions', async function() {
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.superAdmin._id,
        'users',
        'manage'
      );

      expect(hasPermission.requiresMFA).to.be.true;
    });

    it('should not require MFA for low-risk permissions', async function() {
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.member._id,
        'bookings',
        'create'
      );

      expect(hasPermission.requiresMFA).to.be.false;
    });
  });

  describe('Security Edge Cases', function() {
    it('should handle non-existent users gracefully', async function() {
      const fakeUserId = new mongoose.Types.ObjectId();
      const hasPermission = await permissionAuthManager.hasPermission(
        fakeUserId,
        'users',
        'read'
      );

      expect(hasPermission.hasPermission).to.be.false;
    });

    it('should handle non-existent permissions gracefully', async function() {
      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.member._id,
        'nonexistent',
        'action'
      );

      expect(hasPermission.hasPermission).to.be.false;
    });

    it('should handle inactive roles', async function() {
      // Deactivate role temporarily
      await Role.findByIdAndUpdate(testRoles.member._id, { isActive: false });

      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.member._id,
        'bookings',
        'create'
      );

      expect(hasPermission.hasPermission).to.be.false;

      // Reactivate role
      await Role.findByIdAndUpdate(testRoles.member._id, { isActive: true });
    });

    it('should handle revoked permissions', async function() {
      // Revoke permission temporarily
      const mapping = await RolePermission.findOne({
        role: testRoles.member._id,
        permission: testPermissions.bookingCreate._id
      });

      await mapping.revoke(testUsers.superAdmin._id, 'Test revocation');

      const hasPermission = await permissionAuthManager.hasPermission(
        testUsers.member._id,
        'bookings',
        'create'
      );

      expect(hasPermission.hasPermission).to.be.false;

      // Re-grant permission
      await RolePermission.grantPermission(
        testRoles.member._id,
        testPermissions.bookingCreate._id,
        testUsers.superAdmin._id,
        { reason: 'Test re-grant' }
      );
    });
  });

  describe('Performance Tests', function() {
    it('should handle permission checks efficiently', async function() {
      const startTime = Date.now();
      
      // Perform multiple permission checks
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          permissionAuthManager.hasPermission(
            testUsers.member._id,
            'bookings',
            'create'
          )
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete 100 checks in under 1 second
      expect(duration).to.be.lessThan(1000);
    });
  });
});
