import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import RolePermission from '../models/RolePermission.js';
import { connectToDb } from '../config/db.js';
import { permissionAuthManager } from '../middlewares/PermissionAuth.js';
import { roleHierarchyManager } from '../middlewares/RoleHierarchy.js';

dotenv.config();

/**
 * RBAC Validation Script
 * Validates the integrity and security of the RBAC system
 */
class RBACValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validationResults = {
      roles: { passed: 0, failed: 0 },
      permissions: { passed: 0, failed: 0 },
      users: { passed: 0, failed: 0 },
      hierarchy: { passed: 0, failed: 0 },
      security: { passed: 0, failed: 0 }
    };
  }

  /**
   * Add error to validation results
   */
  addError(category, message, details = {}) {
    this.errors.push({ category, message, details, timestamp: new Date() });
    this.validationResults[category].failed++;
    console.error(`❌ [${category.toUpperCase()}] ${message}`);
  }

  /**
   * Add warning to validation results
   */
  addWarning(category, message, details = {}) {
    this.warnings.push({ category, message, details, timestamp: new Date() });
    console.warn(`⚠️ [${category.toUpperCase()}] ${message}`);
  }

  /**
   * Add success to validation results
   */
  addSuccess(category, message) {
    this.validationResults[category].passed++;
    console.log(`✅ [${category.toUpperCase()}] ${message}`);
  }

  /**
   * Validate role hierarchy integrity
   */
  async validateRoleHierarchy() {
    console.log('\n🔍 Validating Role Hierarchy...');

    try {
      const roles = await Role.find({ isActive: true }).sort({ hierarchyLevel: 1 });

      // Check for duplicate hierarchy levels
      const levelCounts = {};
      for (const role of roles) {
        levelCounts[role.hierarchyLevel] = (levelCounts[role.hierarchyLevel] || 0) + 1;
      }

      for (const [level, count] of Object.entries(levelCounts)) {
        if (count > 1) {
          this.addError('hierarchy', `Duplicate hierarchy level ${level} found in ${count} roles`);
        } else {
          this.addSuccess('hierarchy', `Hierarchy level ${level} is unique`);
        }
      }

      // Check for gaps in hierarchy
      const levels = roles.map(r => r.hierarchyLevel).sort((a, b) => a - b);
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] > 1) {
          this.addWarning('hierarchy', `Gap in hierarchy levels between ${levels[i-1]} and ${levels[i]}`);
        }
      }

      // Validate scope assignments
      const scopeHierarchy = ['global', 'national', 'state', 'campus', 'personal'];
      for (const role of roles) {
        if (!scopeHierarchy.includes(role.scope)) {
          this.addError('hierarchy', `Invalid scope '${role.scope}' for role ${role.name}`);
        } else {
          this.addSuccess('hierarchy', `Role ${role.name} has valid scope: ${role.scope}`);
        }
      }

    } catch (error) {
      this.addError('hierarchy', 'Failed to validate role hierarchy', { error: error.message });
    }
  }

  /**
   * Validate permission assignments
   */
  async validatePermissions() {
    console.log('\n🔍 Validating Permissions...');

    try {
      const permissions = await Permission.find({ isActive: true });
      const roleMappings = await RolePermission.find({ isActive: true, granted: true })
        .populate('role')
        .populate('permission');

      // Check for orphaned permissions
      const mappedPermissionIds = new Set(roleMappings.map(m => m.permission._id.toString()));
      for (const permission of permissions) {
        if (!mappedPermissionIds.has(permission._id.toString())) {
          this.addWarning('permissions', `Permission '${permission.name}' is not assigned to any role`);
        } else {
          this.addSuccess('permissions', `Permission '${permission.name}' is properly assigned`);
        }
      }

      // Validate permission scope consistency
      for (const mapping of roleMappings) {
        const roleScope = mapping.role.scope;
        const permissionScope = mapping.permission.scope;
        
        if (!this.isScopeCompatible(roleScope, permissionScope)) {
          this.addError('permissions', 
            `Scope mismatch: Role '${mapping.role.name}' (${roleScope}) assigned permission '${mapping.permission.name}' (${permissionScope})`
          );
        } else {
          this.addSuccess('permissions', 
            `Scope compatibility verified for ${mapping.role.name} -> ${mapping.permission.name}`
          );
        }
      }

      // Check for high-risk permissions without MFA requirement
      const highRiskPermissions = permissions.filter(p => 
        ['high', 'critical'].includes(p.riskLevel) && !p.requiresMFA
      );

      for (const permission of highRiskPermissions) {
        this.addWarning('permissions', 
          `High-risk permission '${permission.name}' does not require MFA`
        );
      }

    } catch (error) {
      this.addError('permissions', 'Failed to validate permissions', { error: error.message });
    }
  }

  /**
   * Check if role scope is compatible with permission scope
   */
  isScopeCompatible(roleScope, permissionScope) {
    const scopeHierarchy = {
      'global': 5,
      'national': 4,
      'state': 3,
      'campus': 2,
      'personal': 1,
      'own_records': 0
    };

    return (scopeHierarchy[roleScope] || 0) >= (scopeHierarchy[permissionScope] || 0);
  }

  /**
   * Validate user role assignments
   */
  async validateUsers() {
    console.log('\n🔍 Validating User Role Assignments...');

    try {
      const users = await User.find({ accountStatus: 'active' })
        .populate('roles')
        .populate('primaryRole');

      for (const user of users) {
        // Check for users without roles
        if (!user.roles || user.roles.length === 0) {
          this.addError('users', `User '${user.email}' has no roles assigned`);
          continue;
        }

        // Check primary role validity
        if (user.primaryRole) {
          const hasRole = user.roles.some(role => role._id.equals(user.primaryRole._id));
          if (!hasRole) {
            this.addError('users', 
              `User '${user.email}' primary role '${user.primaryRole.name}' not in user's roles`
            );
          } else {
            this.addSuccess('users', `User '${user.email}' has valid primary role`);
          }
        }

        // Check for inactive roles
        const inactiveRoles = user.roles.filter(role => !role.isActive);
        if (inactiveRoles.length > 0) {
          this.addWarning('users', 
            `User '${user.email}' has ${inactiveRoles.length} inactive roles assigned`
          );
        }

        // Check MFA requirements
        const requiresMFA = await this.checkUserMFARequirement(user);
        if (requiresMFA && !user.mfaEnabled) {
          this.addError('users', 
            `User '${user.email}' requires MFA but it's not enabled`
          );
        } else if (requiresMFA && user.mfaEnabled) {
          this.addSuccess('users', `User '${user.email}' has required MFA enabled`);
        }
      }

    } catch (error) {
      this.addError('users', 'Failed to validate users', { error: error.message });
    }
  }

  /**
   * Check if user requires MFA based on roles
   */
  async checkUserMFARequirement(user) {
    const mfaRequiredRoles = ['super_admin', 'national_admin'];
    return user.roles.some(role => mfaRequiredRoles.includes(role.name));
  }

  /**
   * Validate security configurations
   */
  async validateSecurity() {
    console.log('\n🔍 Validating Security Configurations...');

    try {
      // Check for users with excessive permissions
      const users = await User.find({ accountStatus: 'active' }).populate('roles');
      
      for (const user of users) {
        const permissions = await permissionAuthManager.getUserPermissions(user._id);
        const criticalPermissions = permissions.filter(p => p.riskLevel === 'critical');
        
        if (criticalPermissions.length > 10) {
          this.addWarning('security', 
            `User '${user.email}' has ${criticalPermissions.length} critical permissions`
          );
        }

        // Check for admin users without MFA
        const isAdmin = user.roles.some(role => 
          ['super_admin', 'national_admin', 'state_admin'].includes(role.name)
        );
        
        if (isAdmin && !user.mfaEnabled) {
          this.addError('security', 
            `Admin user '${user.email}' does not have MFA enabled`
          );
        } else if (isAdmin && user.mfaEnabled) {
          this.addSuccess('security', `Admin user '${user.email}' has MFA enabled`);
        }
      }

      // Check for overly permissive roles
      const roles = await Role.find({ isActive: true });
      for (const role of roles) {
        const permissions = await RolePermission.getRolePermissions(role._id);
        const criticalPermissions = permissions.filter(p => 
          p.permission.riskLevel === 'critical'
        );
        
        if (criticalPermissions.length > 5 && role.hierarchyLevel > 2) {
          this.addWarning('security', 
            `Role '${role.name}' (level ${role.hierarchyLevel}) has ${criticalPermissions.length} critical permissions`
          );
        }
      }

      this.addSuccess('security', 'Security validation completed');

    } catch (error) {
      this.addError('security', 'Failed to validate security', { error: error.message });
    }
  }

  /**
   * Test permission system functionality
   */
  async testPermissionSystem() {
    console.log('\n🔍 Testing Permission System Functionality...');

    try {
      // Test basic permission check
      const testUser = await User.findOne({ accountStatus: 'active' }).populate('roles');
      if (!testUser) {
        this.addWarning('permissions', 'No active users found for permission testing');
        return;
      }

      const hasPermission = await permissionAuthManager.hasPermission(
        testUser._id,
        'users',
        'read'
      );

      if (typeof hasPermission.hasPermission === 'boolean') {
        this.addSuccess('permissions', 'Permission system responding correctly');
      } else {
        this.addError('permissions', 'Permission system not responding correctly');
      }

      // Test role hierarchy
      const userRole = await roleHierarchyManager.getUserHighestRole(testUser._id);
      if (userRole && userRole.name) {
        this.addSuccess('hierarchy', 'Role hierarchy system functioning');
      } else {
        this.addError('hierarchy', 'Role hierarchy system not functioning');
      }

    } catch (error) {
      this.addError('permissions', 'Permission system test failed', { error: error.message });
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 RBAC Validation Report');
    console.log('=' .repeat(50));

    const totalTests = Object.values(this.validationResults).reduce(
      (sum, category) => sum + category.passed + category.failed, 0
    );
    const totalPassed = Object.values(this.validationResults).reduce(
      (sum, category) => sum + category.passed, 0
    );
    const totalFailed = Object.values(this.validationResults).reduce(
      (sum, category) => sum + category.failed, 0
    );

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
    console.log(`Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)`);
    console.log(`Warnings: ${this.warnings.length}`);

    console.log('\nCategory Breakdown:');
    for (const [category, results] of Object.entries(this.validationResults)) {
      const total = results.passed + results.failed;
      const passRate = total > 0 ? ((results.passed/total)*100).toFixed(1) : '0.0';
      console.log(`  ${category}: ${results.passed}/${total} (${passRate}%)`);
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.category}] ${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. [${warning.category}] ${warning.message}`);
      });
    }

    return {
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        warningCount: this.warnings.length,
        passRate: ((totalPassed/totalTests)*100).toFixed(1)
      },
      categories: this.validationResults,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Run all validations
   */
  async runValidation() {
    console.log('🚀 Starting RBAC System Validation...');

    await this.validateRoleHierarchy();
    await this.validatePermissions();
    await this.validateUsers();
    await this.validateSecurity();
    await this.testPermissionSystem();

    return this.generateReport();
  }
}

/**
 * Main validation function
 */
async function validateRBAC() {
  try {
    await connectToDb();
    console.log('✅ Connected to MongoDB');

    const validator = new RBACValidator();
    const report = await validator.runValidation();

    // Save report to file
    const fs = await import('fs');
    const reportPath = `./rbac-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    const hasErrors = report.summary.totalFailed > 0;
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateRBAC();
}

export { RBACValidator, validateRBAC };
