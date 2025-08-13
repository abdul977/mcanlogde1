# MCAN Lodge RBAC System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Role Hierarchy](#role-hierarchy)
4. [Permission System](#permission-system)
5. [Security Features](#security-features)
6. [Setup Guide](#setup-guide)
7. [API Reference](#api-reference)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Overview

The MCAN Lodge Role-Based Access Control (RBAC) system provides comprehensive security and authorization management with the following key features:

- **7-Level Role Hierarchy**: From Super Admin to Auditor
- **Granular Permissions**: Resource and action-based permissions with scope control
- **Multi-Factor Authentication**: TOTP-based MFA for high-privilege roles
- **Comprehensive Audit Logging**: All actions tracked with security monitoring
- **Token Rotation**: Secure JWT access/refresh token system
- **Session Management**: HTTP-only cookies with device tracking

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │     Roles       │    │  Permissions    │
│                 │    │                 │    │                 │
│ - Multiple Roles│◄──►│ - Hierarchy     │◄──►│ - Resource      │
│ - Primary Role  │    │ - Scope         │    │ - Action        │
│ - State/Campus  │    │ - Capabilities  │    │ - Scope         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   Role-Permission       │
                    │     Mappings            │
                    │                         │
                    │ - Granted/Revoked       │
                    │ - Time Restrictions     │
                    │ - IP Restrictions       │
                    └─────────────────────────┘
```

### Database Models

1. **User Model**: Extended with RBAC fields, MFA support, and security tracking
2. **Role Model**: Hierarchical roles with scope and capability definitions
3. **Permission Model**: Granular permissions with risk levels and conditions
4. **RolePermission Model**: Many-to-many mapping with advanced controls
5. **MFADevice Model**: TOTP device management with backup codes
6. **RefreshToken Model**: Secure token rotation with device fingerprinting
7. **AuditLog Model**: Comprehensive activity logging with security context

## Role Hierarchy

### Hierarchy Levels (1 = Highest Authority)

| Level | Role | Scope | Description |
|-------|------|-------|-------------|
| 1 | Super Admin | Global | Full system access, can manage all users and settings |
| 2 | National Admin | National | National-level management, can manage state admins |
| 3 | State Admin | State | State-level management within assigned state |
| 4 | MCLO Admin | Campus | Campus-level management within assigned campus |
| 5 | Finance/Treasurer | Global/State | Financial operations and payment approvals |
| 6 | Member | Personal | Basic user access, own records only |
| 7 | Auditor | Global | Read-only access for auditing purposes |

### Role Capabilities

Each role has specific capabilities that define what they can do:

```javascript
// Example: State Admin capabilities
{
  canManageUsers: true,
  canApproveBookings: true,
  canViewReports: true,
  canExportData: false,
  canManageRoles: false,
  maxUsersManaged: 1000,
  scopeRestrictions: ["state"]
}
```

## Permission System

### Permission Structure

Permissions follow the format: `{resource}_{action}_{scope}`

**Resources**: users, roles, bookings, payments, content, settings, audit_logs, reports
**Actions**: create, read, update, delete, manage, approve, export
**Scopes**: global, national, state, campus, personal, own_records

### Permission Examples

```javascript
// High-privilege permission
{
  name: "users_manage_global",
  resource: "users",
  action: "manage", 
  scope: "global",
  riskLevel: "critical",
  requiresMFA: true
}

// Standard permission
{
  name: "bookings_create_personal",
  resource: "bookings",
  action: "create",
  scope: "personal", 
  riskLevel: "low",
  requiresMFA: false
}
```

### Scope Hierarchy

Scopes are hierarchical - higher scopes include lower ones:
- **Global** > National > State > Campus > Personal > Own Records
- Users with global scope can access all lower scopes
- State scope users can only access their assigned state

## Security Features

### Multi-Factor Authentication (MFA)

- **Required for**: Super Admin, National Admin roles
- **TOTP Support**: Google Authenticator, Authy, etc.
- **Backup Codes**: 10 single-use backup codes per device
- **Device Management**: Multiple devices per user with primary device selection

### Token Security

- **Access Tokens**: 15-minute expiry, JWT format
- **Refresh Tokens**: 7-day expiry, stored hashed in database
- **Token Rotation**: New refresh token on each use
- **Device Fingerprinting**: IP, User-Agent, and device characteristics
- **Suspicious Activity Detection**: Multiple IPs, rapid token creation

### Audit Logging

All actions are logged with:
- User identification and target user (if applicable)
- Action type and resource affected
- Request details (IP, User-Agent, headers)
- Security context (MFA status, risk level)
- Before/after changes for updates

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Password Reset**: 3 attempts per hour
- **Admin Operations**: 50 requests per 5 minutes

## Setup Guide

### 1. Environment Configuration

Create `.env` file with required variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mcan_lodge

# JWT Secrets
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here

# Redis (optional, for distributed rate limiting)
REDIS_URL=redis://localhost:6379

# Security
NODE_ENV=production
BCRYPT_ROUNDS=12

# MFA
MFA_ISSUER=MCAN Lodge
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Connect to MongoDB and run migrations
npm run seed:roles
npm run seed:permissions

# Validate RBAC setup
npm run validate:rbac
```

### 3. Create Initial Super Admin

```javascript
// Run this script to create your first super admin
import User from './src/models/User.js';
import Role from './src/models/Role.js';
import { hashPassword } from './src/utils/passwordPolicy.js';

const createSuperAdmin = async () => {
  const superAdminRole = await Role.findOne({ name: 'super_admin' });
  const hashedPassword = await hashPassword('YourSecurePassword123!');
  
  const superAdmin = await User.create({
    name: 'System Administrator',
    email: 'admin@mcanlodge.com',
    password: hashedPassword,
    roles: [superAdminRole._id],
    primaryRole: superAdminRole._id,
    accountStatus: 'active',
    mfaEnabled: true // Will need to set up MFA on first login
  });
  
  console.log('Super admin created:', superAdmin.email);
};
```

### 4. Middleware Integration

Add RBAC middleware to your routes:

```javascript
import { requireSignIn } from './middlewares/Auth.js';
import { requirePermission } from './middlewares/PermissionAuth.js';
import { requireMFAForRole } from './middlewares/MFAEnforcement.js';
import { auditMiddleware } from './middlewares/AuditLogger.js';

// Apply audit logging globally
app.use(auditMiddleware);

// Protect admin routes
router.get('/admin/users', 
  requireSignIn,
  requireMFAForRole,
  requirePermission('users', 'read'),
  getUsersController
);
```

## API Reference

### Authentication Endpoints

```
POST /api/auth/login          - User login with MFA support
POST /api/auth/refresh        - Refresh access token
POST /api/auth/logout         - Logout and revoke tokens
GET  /api/auth/user-auth      - Check user authentication
GET  /api/auth/admin-auth     - Check admin authentication with MFA
```

### MFA Endpoints

```
POST /api/mfa/setup/totp      - Setup TOTP MFA device
POST /api/mfa/setup/totp/verify - Verify TOTP setup
POST /api/mfa/verify          - Verify MFA token
GET  /api/mfa/devices         - Get user's MFA devices
DELETE /api/mfa/devices/:id   - Remove MFA device
```

### Admin User Management

```
GET    /api/admin/users                    - Get all users
GET    /api/admin/users/:id                - Get user details
PUT    /api/admin/users/:id/role           - Update user role
DELETE /api/admin/users/:id/roles/:roleId  - Remove user role
PUT    /api/admin/users/:id/lock           - Lock/unlock account
PUT    /api/admin/users/:id/password/reset - Reset user password
```

### Permission Checking

```javascript
// Check if user has permission
const hasPermission = await permissionAuthManager.hasPermission(
  userId,
  'users',      // resource
  'manage',     // action
  {             // context
    user: currentUser,
    stateId: 'CA',
    targetUserId: '...'
  }
);

if (hasPermission.hasPermission) {
  // User has permission
  if (hasPermission.requiresMFA) {
    // Check MFA verification
  }
}
```

## Testing

### Run RBAC Tests

```bash
# Run comprehensive RBAC test suite
npm run test:rbac

# Validate RBAC system integrity
npm run validate:rbac

# Run all tests
npm test
```

### Test Coverage

The test suite covers:
- Role hierarchy validation
- Permission assignment and checking
- Scope restrictions
- Resource ownership
- MFA requirements
- Security edge cases
- Performance benchmarks

## Troubleshooting

### Common Issues

**1. Permission Denied Errors**
```
Error: Insufficient permissions
```
- Check user's role assignments
- Verify permission is granted to role
- Check scope restrictions
- Validate MFA requirements

**2. MFA Setup Issues**
```
Error: MFA setup required
```
- User needs to set up TOTP device
- Check if role requires MFA
- Verify MFA device is active

**3. Token Rotation Failures**
```
Error: Invalid refresh token
```
- Token may be expired or revoked
- Check for suspicious activity flags
- Verify token family integrity

### Debug Commands

```bash
# Check user permissions
node -e "
import('./src/middlewares/PermissionAuth.js').then(async ({ permissionAuthManager }) => {
  const perms = await permissionAuthManager.getUserPermissions('USER_ID');
  console.log(JSON.stringify(perms, null, 2));
});
"

# Validate role hierarchy
npm run validate:rbac

# Check audit logs
node -e "
import('./src/models/AuditLog.js').then(async (AuditLog) => {
  const logs = await AuditLog.default.findByUser('USER_ID', { limit: 10 });
  console.log(logs);
});
"
```

### Performance Optimization

1. **Permission Caching**: Permissions are cached for 5 minutes
2. **Database Indexes**: Optimized indexes on frequently queried fields
3. **Rate Limiting**: Prevents abuse and ensures system stability
4. **Token Cleanup**: Automatic cleanup of expired tokens

### Security Best Practices

1. **Regular Audits**: Review audit logs regularly
2. **MFA Enforcement**: Ensure all admin users have MFA enabled
3. **Permission Reviews**: Regularly review and validate role permissions
4. **Token Rotation**: Monitor for suspicious token activity
5. **System Validation**: Run RBAC validation script regularly

For additional support or questions, please refer to the development team or create an issue in the project repository.
