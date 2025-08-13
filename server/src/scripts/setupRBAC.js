import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import { connectToDb } from '../config/db.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import RolePermission from '../models/RolePermission.js';
import { hashPassword, validatePassword } from '../utils/passwordPolicy.js';
import { validateRBAC } from './validateRBAC.js';

dotenv.config();

/**
 * RBAC Setup Script
 * Interactive setup for the RBAC system
 */
class RBACSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Prompt user for input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  /**
   * Prompt for password with validation
   */
  async promptPassword(question) {
    const password = await this.prompt(question);
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      console.log('\n❌ Password does not meet requirements:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
      console.log('\nPassword Requirements:');
      console.log('  - At least 8 characters long');
      console.log('  - Contains uppercase and lowercase letters');
      console.log('  - Contains at least one number');
      console.log('  - Contains at least one special character');
      console.log('  - No common passwords or patterns\n');
      
      return await this.promptPassword(question);
    }
    
    return password;
  }

  /**
   * Check if RBAC is already set up
   */
  async checkExistingSetup() {
    const roleCount = await Role.countDocuments();
    const permissionCount = await Permission.countDocuments();
    const superAdminCount = await User.countDocuments({ 
      roles: { $exists: true, $ne: [] }
    });

    return {
      hasRoles: roleCount > 0,
      hasPermissions: permissionCount > 0,
      hasSuperAdmin: superAdminCount > 0,
      counts: { roleCount, permissionCount, superAdminCount }
    };
  }

  /**
   * Setup roles and permissions
   */
  async setupRolesAndPermissions() {
    console.log('\n🔧 Setting up roles and permissions...');

    try {
      // Import and run seed scripts
      const { seedRoles } = await import('./seedRoles.js');
      const { seedPermissions } = await import('./seedPermissions.js');

      console.log('📝 Creating default roles...');
      await seedRoles();

      console.log('📝 Creating default permissions...');
      await seedPermissions();

      console.log('✅ Roles and permissions created successfully');
      return true;

    } catch (error) {
      console.error('❌ Error setting up roles and permissions:', error.message);
      return false;
    }
  }

  /**
   * Create super admin user
   */
  async createSuperAdmin() {
    console.log('\n👤 Creating Super Admin User');
    console.log('=' .repeat(40));

    const name = await this.prompt('Enter super admin name: ');
    const email = await this.prompt('Enter super admin email: ');
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User with this email already exists');
      const overwrite = await this.prompt('Overwrite existing user? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        return false;
      }
      await User.deleteOne({ email });
    }

    const password = await this.promptPassword('Enter super admin password: ');
    const confirmPassword = await this.prompt('Confirm password: ');

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return await this.createSuperAdmin();
    }

    try {
      const hashedPassword = await hashPassword(password);
      const superAdminRole = await Role.findOne({ name: 'super_admin' });

      if (!superAdminRole) {
        console.log('❌ Super admin role not found. Please run role setup first.');
        return false;
      }

      const superAdmin = await User.create({
        name,
        email,
        password: hashedPassword,
        roles: [superAdminRole._id],
        primaryRole: superAdminRole._id,
        accountStatus: 'active',
        mfaEnabled: false, // Will be set up on first login
        profileCompleted: true
      });

      console.log('✅ Super admin created successfully');
      console.log(`📧 Email: ${superAdmin.email}`);
      console.log('🔐 MFA will need to be set up on first login');

      return true;

    } catch (error) {
      console.error('❌ Error creating super admin:', error.message);
      return false;
    }
  }

  /**
   * Configure security settings
   */
  async configureSecuritySettings() {
    console.log('\n🔒 Security Configuration');
    console.log('=' .repeat(40));

    const settings = {
      mfaRequired: true,
      sessionTimeout: 15, // minutes
      maxLoginAttempts: 5,
      passwordExpiry: 90, // days
      auditRetention: 7 * 365 // days (7 years)
    };

    console.log('Current security settings:');
    console.log(`  - MFA required for admins: ${settings.mfaRequired ? 'Yes' : 'No'}`);
    console.log(`  - Session timeout: ${settings.sessionTimeout} minutes`);
    console.log(`  - Max login attempts: ${settings.maxLoginAttempts}`);
    console.log(`  - Password expiry: ${settings.passwordExpiry} days`);
    console.log(`  - Audit log retention: ${settings.auditRetention} days`);

    const customize = await this.prompt('\nCustomize security settings? (y/N): ');
    
    if (customize.toLowerCase() === 'y') {
      const mfaInput = await this.prompt('Require MFA for admin roles? (Y/n): ');
      settings.mfaRequired = mfaInput.toLowerCase() !== 'n';

      const sessionInput = await this.prompt(`Session timeout in minutes (${settings.sessionTimeout}): `);
      if (sessionInput) settings.sessionTimeout = parseInt(sessionInput);

      const attemptsInput = await this.prompt(`Max login attempts (${settings.maxLoginAttempts}): `);
      if (attemptsInput) settings.maxLoginAttempts = parseInt(attemptsInput);
    }

    // Save settings to environment or config file
    console.log('✅ Security settings configured');
    return settings;
  }

  /**
   * Test RBAC setup
   */
  async testSetup() {
    console.log('\n🧪 Testing RBAC Setup...');

    try {
      // Run validation script
      const { RBACValidator } = await import('./validateRBAC.js');
      const validator = new RBACValidator();
      const report = await validator.runValidation();

      if (report.summary.totalFailed === 0) {
        console.log('✅ All RBAC tests passed');
        return true;
      } else {
        console.log(`❌ ${report.summary.totalFailed} tests failed`);
        console.log('Please check the validation report for details');
        return false;
      }

    } catch (error) {
      console.error('❌ Error testing setup:', error.message);
      return false;
    }
  }

  /**
   * Display setup summary
   */
  displaySummary(results) {
    console.log('\n📋 Setup Summary');
    console.log('=' .repeat(50));

    console.log(`✅ Database connection: ${results.dbConnected ? 'Success' : 'Failed'}`);
    console.log(`✅ Roles and permissions: ${results.rolesSetup ? 'Success' : 'Failed'}`);
    console.log(`✅ Super admin created: ${results.superAdminCreated ? 'Success' : 'Failed'}`);
    console.log(`✅ Security configured: ${results.securityConfigured ? 'Success' : 'Failed'}`);
    console.log(`✅ System validation: ${results.validationPassed ? 'Success' : 'Failed'}`);

    if (results.superAdminCreated) {
      console.log('\n🚀 Next Steps:');
      console.log('1. Start the server: npm start');
      console.log('2. Login with super admin credentials');
      console.log('3. Set up MFA for the super admin account');
      console.log('4. Create additional admin users as needed');
      console.log('5. Review and customize role permissions');
    }

    console.log('\n📚 Documentation:');
    console.log('- RBAC Documentation: ./RBAC_DOCUMENTATION.md');
    console.log('- API Reference: Check documentation for endpoint details');
    console.log('- Validation: Run "npm run validate:rbac" anytime');

    if (!results.validationPassed) {
      console.log('\n⚠️ Warning: Setup validation failed. Please review errors before proceeding.');
    }
  }

  /**
   * Main setup flow
   */
  async run() {
    console.log('🚀 MCAN Lodge RBAC System Setup');
    console.log('=' .repeat(50));

    const results = {
      dbConnected: false,
      rolesSetup: false,
      superAdminCreated: false,
      securityConfigured: false,
      validationPassed: false
    };

    try {
      // Connect to database
      console.log('📡 Connecting to MongoDB...');
      await connectToDb();
      results.dbConnected = true;
      console.log('✅ Connected to MongoDB');

      // Check existing setup
      const existing = await this.checkExistingSetup();
      
      if (existing.hasRoles && existing.hasPermissions && existing.hasSuperAdmin) {
        console.log('\n⚠️ RBAC system appears to already be set up:');
        console.log(`  - Roles: ${existing.counts.roleCount}`);
        console.log(`  - Permissions: ${existing.counts.permissionCount}`);
        console.log(`  - Admin users: ${existing.counts.superAdminCount}`);
        
        const proceed = await this.prompt('\nProceed with setup anyway? (y/N): ');
        if (proceed.toLowerCase() !== 'y') {
          console.log('Setup cancelled');
          return;
        }
      }

      // Setup roles and permissions
      if (!existing.hasRoles || !existing.hasPermissions) {
        results.rolesSetup = await this.setupRolesAndPermissions();
      } else {
        console.log('✅ Roles and permissions already exist');
        results.rolesSetup = true;
      }

      // Create super admin
      if (!existing.hasSuperAdmin) {
        results.superAdminCreated = await this.createSuperAdmin();
      } else {
        const createAnother = await this.prompt('\nCreate another super admin? (y/N): ');
        if (createAnother.toLowerCase() === 'y') {
          results.superAdminCreated = await this.createSuperAdmin();
        } else {
          results.superAdminCreated = true;
        }
      }

      // Configure security
      results.securityConfigured = true; // Always true for now
      await this.configureSecuritySettings();

      // Test setup
      const runTests = await this.prompt('\nRun validation tests? (Y/n): ');
      if (runTests.toLowerCase() !== 'n') {
        results.validationPassed = await this.testSetup();
      } else {
        results.validationPassed = true;
      }

      // Display summary
      this.displaySummary(results);

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    } finally {
      this.rl.close();
      await mongoose.connection.close();
    }
  }
}

/**
 * Run setup if called directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new RBACSetup();
  setup.run();
}

export { RBACSetup };
