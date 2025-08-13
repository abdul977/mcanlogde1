import mongoose from "mongoose";
import dotenv from "dotenv";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import RolePermission from "../models/RolePermission.js";
import { connectToDb } from "../config/db.js";

dotenv.config();

const defaultPermissions = [
  // User Management Permissions
  { name: "users_create_global", displayName: "Create Users (Global)", description: "Create new users across all levels", resource: "users", action: "create", scope: "global", category: "user_management", riskLevel: "high", requiresMFA: true },
  { name: "users_read_global", displayName: "View Users (Global)", description: "View all users across the platform", resource: "users", action: "read", scope: "global", category: "user_management", riskLevel: "medium" },
  { name: "users_read_state", displayName: "View Users (State)", description: "View users within own state", resource: "users", action: "read", scope: "state", category: "user_management", riskLevel: "low" },
  { name: "users_read_campus", displayName: "View Users (Campus)", description: "View users within own campus", resource: "users", action: "read", scope: "campus", category: "user_management", riskLevel: "low" },
  { name: "users_update_global", displayName: "Edit Users (Global)", description: "Edit any user profile", resource: "users", action: "update", scope: "global", category: "user_management", riskLevel: "high", requiresMFA: true },
  { name: "users_update_state", displayName: "Edit Users (State)", description: "Edit users within own state", resource: "users", action: "update", scope: "state", category: "user_management", riskLevel: "medium" },
  { name: "users_delete_global", displayName: "Delete Users (Global)", description: "Delete any user account", resource: "users", action: "delete", scope: "global", category: "user_management", riskLevel: "critical", requiresMFA: true },
  { name: "users_manage_global", displayName: "Manage Users (Global)", description: "Full user management capabilities", resource: "users", action: "manage", scope: "global", category: "user_management", riskLevel: "critical", requiresMFA: true },

  // Role Management Permissions
  { name: "roles_create_global", displayName: "Create Roles", description: "Create new roles and permissions", resource: "roles", action: "create", scope: "global", category: "user_management", riskLevel: "critical", requiresMFA: true },
  { name: "roles_read_global", displayName: "View Roles", description: "View all roles and their permissions", resource: "roles", action: "read", scope: "global", category: "user_management", riskLevel: "medium" },
  { name: "roles_update_global", displayName: "Edit Roles", description: "Modify existing roles and permissions", resource: "roles", action: "update", scope: "global", category: "user_management", riskLevel: "critical", requiresMFA: true },
  { name: "roles_delete_global", displayName: "Delete Roles", description: "Delete roles (non-system only)", resource: "roles", action: "delete", scope: "global", category: "user_management", riskLevel: "critical", requiresMFA: true },

  // Booking Management Permissions
  { name: "bookings_create_personal", displayName: "Create Bookings", description: "Create personal booking requests", resource: "bookings", action: "create", scope: "personal", category: "administrative", riskLevel: "low" },
  { name: "bookings_read_global", displayName: "View All Bookings", description: "View all booking records", resource: "bookings", action: "read", scope: "global", category: "administrative", riskLevel: "medium" },
  { name: "bookings_read_state", displayName: "View State Bookings", description: "View bookings within own state", resource: "bookings", action: "read", scope: "state", category: "administrative", riskLevel: "low" },
  { name: "bookings_read_own", displayName: "View Own Bookings", description: "View personal booking history", resource: "bookings", action: "read", scope: "own_records", category: "administrative", riskLevel: "low" },
  { name: "bookings_update_global", displayName: "Edit All Bookings", description: "Modify any booking record", resource: "bookings", action: "update", scope: "global", category: "administrative", riskLevel: "high" },
  { name: "bookings_approve_global", displayName: "Approve Bookings (Global)", description: "Approve booking requests globally", resource: "bookings", action: "approve", scope: "global", category: "administrative", riskLevel: "high" },
  { name: "bookings_approve_state", displayName: "Approve Bookings (State)", description: "Approve bookings within own state", resource: "bookings", action: "approve", scope: "state", category: "administrative", riskLevel: "medium" },

  // Payment Management Permissions
  { name: "payments_create_personal", displayName: "Submit Payments", description: "Submit payment records", resource: "payments", action: "create", scope: "personal", category: "financial", riskLevel: "low" },
  { name: "payments_read_global", displayName: "View All Payments", description: "View all payment records", resource: "payments", action: "read", scope: "global", category: "financial", riskLevel: "high" },
  { name: "payments_read_state", displayName: "View State Payments", description: "View payments within own state", resource: "payments", action: "read", scope: "state", category: "financial", riskLevel: "medium" },
  { name: "payments_read_own", displayName: "View Own Payments", description: "View personal payment history", resource: "payments", action: "read", scope: "own_records", category: "financial", riskLevel: "low" },
  { name: "payments_approve_global", displayName: "Approve Payments (Global)", description: "Approve payment records globally", resource: "payments", action: "approve", scope: "global", category: "financial", riskLevel: "high", requiresMFA: true },
  { name: "payments_export_global", displayName: "Export Payments", description: "Export payment data and reports", resource: "payments", action: "export", scope: "global", category: "financial", riskLevel: "high" },

  // Content Management Permissions
  { name: "content_create_global", displayName: "Create Content (Global)", description: "Create content across all levels", resource: "content", action: "create", scope: "global", category: "content_management", riskLevel: "medium" },
  { name: "content_read_global", displayName: "View All Content", description: "View all content on the platform", resource: "content", action: "read", scope: "global", category: "content_management", riskLevel: "low" },
  { name: "content_update_global", displayName: "Edit Content (Global)", description: "Edit any content", resource: "content", action: "update", scope: "global", category: "content_management", riskLevel: "medium" },
  { name: "content_delete_global", displayName: "Delete Content (Global)", description: "Delete any content", resource: "content", action: "delete", scope: "global", category: "content_management", riskLevel: "high" },

  // Audit and Reporting Permissions
  { name: "audit_logs_read_global", displayName: "View Audit Logs", description: "Access to all audit logs", resource: "audit_logs", action: "read", scope: "global", category: "security", riskLevel: "high" },
  { name: "reports_read_global", displayName: "View All Reports", description: "Access to all system reports", resource: "reports", action: "read", scope: "global", category: "reporting", riskLevel: "medium" },
  { name: "reports_read_state", displayName: "View State Reports", description: "Access to state-level reports", resource: "reports", action: "read", scope: "state", category: "reporting", riskLevel: "low" },
  { name: "reports_export_global", displayName: "Export Reports", description: "Export system reports", resource: "reports", action: "export", scope: "global", category: "reporting", riskLevel: "medium" },

  // Settings Management Permissions
  { name: "settings_read_global", displayName: "View Global Settings", description: "View system-wide settings", resource: "settings", action: "read", scope: "global", category: "administrative", riskLevel: "medium" },
  { name: "settings_update_global", displayName: "Manage Global Settings", description: "Modify system-wide settings", resource: "settings", action: "update", scope: "global", category: "administrative", riskLevel: "critical", requiresMFA: true }
];

// Role-Permission mappings
const rolePermissionMappings = {
  "super_admin": [
    "users_create_global", "users_read_global", "users_update_global", "users_delete_global", "users_manage_global",
    "roles_create_global", "roles_read_global", "roles_update_global", "roles_delete_global",
    "bookings_read_global", "bookings_update_global", "bookings_approve_global",
    "payments_read_global", "payments_approve_global", "payments_export_global",
    "content_create_global", "content_read_global", "content_update_global", "content_delete_global",
    "audit_logs_read_global", "reports_read_global", "reports_export_global",
    "settings_read_global", "settings_update_global"
  ],
  "national_admin": [
    "users_read_global", "users_update_state",
    "bookings_read_global", "bookings_approve_global",
    "payments_read_global", "payments_approve_global", "payments_export_global",
    "content_create_global", "content_read_global", "content_update_global",
    "audit_logs_read_global", "reports_read_global", "reports_export_global"
  ],
  "state_admin": [
    "users_read_state", "users_update_state",
    "bookings_read_state", "bookings_approve_state",
    "payments_read_state",
    "content_read_global", "content_update_global",
    "reports_read_state"
  ],
  "mclo_admin": [
    "users_read_campus",
    "bookings_create_personal", "bookings_read_state",
    "content_read_global",
    "reports_read_state"
  ],
  "finance_treasurer": [
    "payments_read_global", "payments_approve_global", "payments_export_global",
    "bookings_read_global",
    "reports_read_global", "reports_export_global"
  ],
  "member": [
    "bookings_create_personal", "bookings_read_own",
    "payments_create_personal", "payments_read_own",
    "content_read_global"
  ],
  "auditor": [
    "audit_logs_read_global",
    "reports_read_global",
    "users_read_global",
    "bookings_read_global",
    "payments_read_global"
  ]
};

async function seedPermissions() {
  try {
    console.log("🌱 Starting permission seeding process...");
    
    // Connect to database
    await connectToDb();
    console.log("✅ Connected to MongoDB");

    // Create permissions
    console.log("\n📋 Creating permissions...");
    for (const permissionData of defaultPermissions) {
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      
      if (existingPermission) {
        console.log(`⚠️ Permission '${permissionData.displayName}' already exists, skipping...`);
        continue;
      }

      const permission = new Permission({
        ...permissionData,
        isSystemPermission: true
      });
      await permission.save();
      console.log(`✅ Created permission: ${permission.displayName}`);
    }

    // Create role-permission mappings
    console.log("\n🔗 Creating role-permission mappings...");
    for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        console.log(`⚠️ Role '${roleName}' not found, skipping mappings...`);
        continue;
      }

      console.log(`\n🎭 Processing role: ${role.displayName}`);
      
      for (const permissionName of permissionNames) {
        const permission = await Permission.findOne({ name: permissionName });
        if (!permission) {
          console.log(`⚠️ Permission '${permissionName}' not found, skipping...`);
          continue;
        }

        const existingMapping = await RolePermission.findOne({
          role: role._id,
          permission: permission._id
        });

        if (existingMapping) {
          console.log(`  ⚠️ Mapping already exists: ${permission.displayName}`);
          continue;
        }

        await RolePermission.grantPermission(
          role._id,
          permission._id,
          null, // System-granted
          { reason: "Default role permission" }
        );
        console.log(`  ✅ Granted: ${permission.displayName}`);
      }
    }

    console.log("\n🎉 Permission seeding completed successfully!");
    
    // Display summary
    const totalPermissions = await Permission.countDocuments({ isActive: true });
    const totalMappings = await RolePermission.countDocuments({ isActive: true, granted: true });
    
    console.log(`\n📊 Summary:`);
    console.log(`  Total Permissions: ${totalPermissions}`);
    console.log(`  Total Role-Permission Mappings: ${totalMappings}`);

  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

// Run the seeding function
seedPermissions();
