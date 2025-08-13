# RBAC Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string
- Basic understanding of REST APIs

### 1. Environment Setup

Create `.env` file in the server directory:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/mcan_lodge
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-minimum-32-characters

# Optional
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Run RBAC Setup

```bash
npm run setup:rbac
```

This interactive script will:
- ✅ Connect to your MongoDB database
- ✅ Create default roles and permissions
- ✅ Create your first super admin user
- ✅ Configure security settings
- ✅ Validate the setup

### 4. Start the Server

```bash
npm start
```

### 5. Test Your Setup

#### Login as Super Admin
```bash
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-admin@email.com",
    "password": "your-password"
  }'
```

#### Check Admin Access
```bash
curl -X GET http://localhost:8080/api/user/admin-auth \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔐 Setting Up MFA (Required for Admins)

### 1. Setup TOTP Device
```bash
curl -X POST http://localhost:8080/api/mfa/setup/totp \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceName": "My Phone"}'
```

### 2. Scan QR Code
- Use the returned QR code with Google Authenticator or Authy
- Or manually enter the secret key

### 3. Verify Setup
```bash
curl -X POST http://localhost:8080/api/mfa/setup/totp/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEVICE_ID_FROM_SETUP",
    "token": "123456"
  }'
```

## 👥 Managing Users

### Create New User
```bash
curl -X POST http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "stateId": "CA"
  }'
```

### Assign Role to User
```bash
curl -X PUT http://localhost:8080/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "ROLE_ID",
    "isPrimary": true
  }'
```

### Get All Users
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🛡️ Understanding Permissions

### Check User Permissions
```bash
curl -X GET http://localhost:8080/api/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Common Permission Patterns

| Permission | Description | Required Role |
|------------|-------------|---------------|
| `users_read_state` | View users in same state | State Admin+ |
| `users_manage_global` | Manage all users | Super Admin |
| `bookings_approve_state` | Approve bookings in state | State Admin+ |
| `payments_approve_global` | Approve all payments | Finance/Super Admin |
| `audit_logs_read_global` | View audit logs | National Admin+ |

## 📊 Monitoring & Auditing

### View Audit Logs
```bash
curl -X GET http://localhost:8080/api/admin/audit-logs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Security Statistics
```bash
curl -X GET http://localhost:8080/api/admin/security/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### System Health
```bash
curl -X GET http://localhost:8080/api/admin/system/health \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Testing & Validation

### Run RBAC Tests
```bash
npm run test:rbac
```

### Validate System Integrity
```bash
npm run validate:rbac
```

### Check Specific User Permissions
```javascript
// In Node.js console or script
import { permissionAuthManager } from './src/middlewares/PermissionAuth.js';

const hasPermission = await permissionAuthManager.hasPermission(
  'USER_ID',
  'users',     // resource
  'manage',    // action
  {            // context
    user: userObject,
    stateId: 'CA'
  }
);

console.log('Has permission:', hasPermission.hasPermission);
console.log('Requires MFA:', hasPermission.requiresMFA);
```

## 🔧 Common Tasks

### Reset User Password (Admin)
```bash
curl -X PUT http://localhost:8080/api/admin/users/USER_ID/password/reset \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewSecurePassword123!",
    "forceChange": true
  }'
```

### Lock/Unlock User Account
```bash
curl -X PUT http://localhost:8080/api/admin/users/USER_ID/lock \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lock": true,
    "reason": "Security violation"
  }'
```

### Bulk Operations
```bash
curl -X POST http://localhost:8080/api/admin/users/bulk \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "assign_role",
    "userIds": ["USER_ID_1", "USER_ID_2"],
    "data": {"roleId": "ROLE_ID"}
  }'
```

## 🚨 Troubleshooting

### Permission Denied
1. Check user's roles: `GET /api/admin/users/USER_ID`
2. Verify role permissions: `GET /api/admin/roles/ROLE_ID/permissions`
3. Check MFA status: `GET /api/mfa/status`

### MFA Issues
1. Check device status: `GET /api/mfa/devices`
2. Use backup codes if needed
3. Admin can disable MFA: `POST /api/mfa/admin/disable/USER_ID`

### Token Problems
1. Check token expiry (15 minutes for access tokens)
2. Use refresh token: `POST /api/auth/refresh`
3. Re-login if refresh token expired

### System Validation Failures
```bash
# Run detailed validation
npm run validate:rbac

# Check specific issues
node -e "
import('./src/scripts/validateRBAC.js').then(async ({ validateRBAC }) => {
  await validateRBAC();
});
"
```

## 📚 Next Steps

1. **Read Full Documentation**: `./RBAC_DOCUMENTATION.md`
2. **Customize Roles**: Modify roles in `./src/scripts/seedRoles.js`
3. **Add Permissions**: Extend permissions in `./src/scripts/seedPermissions.js`
4. **Integrate Frontend**: Use the API endpoints in your React/Vue/Angular app
5. **Monitor Security**: Set up regular audit log reviews

## 🆘 Need Help?

- **Documentation**: `./RBAC_DOCUMENTATION.md`
- **API Reference**: Check the documentation for detailed endpoint specs
- **Validation**: Run `npm run validate:rbac` to check system health
- **Tests**: Run `npm run test:rbac` to verify functionality

---

**Security Note**: Always use HTTPS in production and keep your JWT secrets secure!
