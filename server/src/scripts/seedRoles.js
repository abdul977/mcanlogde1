import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../models/Role.js";
import { connectToDb } from "../config/db.js";

dotenv.config();

const defaultRoles = [
  {
    name: "super_admin",
    displayName: "Super Admin",
    description: "Full system access with all privileges. Can manage all resources and users across the entire platform.",
    hierarchyLevel: 1,
    scope: "global",
    defaultPermissions: [
      {
        resource: "users",
        actions: ["create", "read", "update", "delete", "manage"],
        conditions: { scope: "all" }
      },
      {
        resource: "roles",
        actions: ["create", "read", "update", "delete", "manage"],
        conditions: { scope: "all" }
      },
      {
        resource: "permissions",
        actions: ["create", "read", "update", "delete", "manage"],
        conditions: { scope: "all" }
      },
      {
        resource: "audit_logs",
        actions: ["read", "export", "manage"],
        conditions: { scope: "all" }
      },
      {
        resource: "settings",
        actions: ["read", "update", "manage"],
        conditions: { scope: "all" }
      },
      {
        resource: "bookings",
        actions: ["create", "read", "update", "delete", "approve", "export"],
        conditions: { scope: "all" }
      },
      {
        resource: "payments",
        actions: ["create", "read", "update", "delete", "approve", "export"],
        conditions: { scope: "all" }
      }
    ],
    capabilities: {
      canManageUsers: true,
      canManageRoles: true,
      canViewAuditLogs: true,
      canExportData: true,
      canManageSettings: true,
      requiresMFA: true,
      maxSessionDuration: 240 // 4 hours
    },
    isSystemRole: true
  },
  {
    name: "national_admin",
    displayName: "National Admin",
    description: "National-level administration. Manages national content, finances, and state-level aggregated data.",
    hierarchyLevel: 2,
    scope: "national",
    defaultPermissions: [
      {
        resource: "users",
        actions: ["read", "update", "manage"],
        conditions: { scope: "subordinates" }
      },
      {
        resource: "bookings",
        actions: ["read", "update", "approve", "export"],
        conditions: { scope: "all" }
      },
      {
        resource: "payments",
        actions: ["read", "approve", "export"],
        conditions: { scope: "all" }
      },
      {
        resource: "content",
        actions: ["create", "read", "update", "delete", "manage"],
        conditions: { scope: "all" }
      },
      {
        resource: "reports",
        actions: ["read", "export"],
        conditions: { scope: "all" }
      },
      {
        resource: "settings",
        actions: ["read", "update"],
        conditions: { scope: "national" }
      }
    ],
    capabilities: {
      canManageUsers: true,
      canManageRoles: false,
      canViewAuditLogs: true,
      canExportData: true,
      canManageSettings: false,
      requiresMFA: true,
      maxSessionDuration: 360 // 6 hours
    },
    isSystemRole: true
  },
  {
    name: "state_admin",
    displayName: "State Admin",
    description: "State-level administration. Manages state chapter data and approves local property entries.",
    hierarchyLevel: 3,
    scope: "state",
    defaultPermissions: [
      {
        resource: "users",
        actions: ["read", "update", "manage"],
        conditions: { scope: "own_state" }
      },
      {
        resource: "bookings",
        actions: ["read", "update", "approve"],
        conditions: { scope: "own_state" }
      },
      {
        resource: "payments",
        actions: ["read", "approve"],
        conditions: { scope: "own_state" }
      },
      {
        resource: "content",
        actions: ["create", "read", "update"],
        conditions: { scope: "own_state" }
      },
      {
        resource: "reports",
        actions: ["read", "export"],
        conditions: { scope: "own_state" }
      }
    ],
    capabilities: {
      canManageUsers: true,
      canManageRoles: false,
      canViewAuditLogs: true,
      canExportData: true,
      canManageSettings: false,
      requiresMFA: false,
      maxSessionDuration: 480 // 8 hours
    },
    isSystemRole: true
  },
  {
    name: "mclo_admin",
    displayName: "MCLO Admin",
    description: "Campus-level management. Handles student lists and local reporting.",
    hierarchyLevel: 4,
    scope: "campus",
    defaultPermissions: [
      {
        resource: "users",
        actions: ["read", "update"],
        conditions: { scope: "own_campus" }
      },
      {
        resource: "bookings",
        actions: ["create", "read", "update"],
        conditions: { scope: "own_campus" }
      },
      {
        resource: "content",
        actions: ["read", "update"],
        conditions: { scope: "own_campus" }
      },
      {
        resource: "reports",
        actions: ["read"],
        conditions: { scope: "own_campus" }
      }
    ],
    capabilities: {
      canManageUsers: false,
      canManageRoles: false,
      canViewAuditLogs: false,
      canExportData: false,
      canManageSettings: false,
      requiresMFA: false,
      maxSessionDuration: 480 // 8 hours
    },
    isSystemRole: true
  },
  {
    name: "finance_treasurer",
    displayName: "Finance/Treasurer",
    description: "Financial management role. Views and approves transactions, manages revenue-sharing reports.",
    hierarchyLevel: 5,
    scope: "personal",
    defaultPermissions: [
      {
        resource: "payments",
        actions: ["read", "approve", "export"],
        conditions: { scope: "all" }
      },
      {
        resource: "reports",
        actions: ["read", "export"],
        conditions: { scope: "all" }
      },
      {
        resource: "bookings",
        actions: ["read"],
        conditions: { scope: "all" }
      }
    ],
    capabilities: {
      canManageUsers: false,
      canManageRoles: false,
      canViewAuditLogs: false,
      canExportData: true,
      canManageSettings: false,
      requiresMFA: false,
      maxSessionDuration: 480 // 8 hours
    },
    isSystemRole: true
  },
  {
    name: "member",
    displayName: "Member",
    description: "Standard member access. Can register, view personal dashboard, and use marketplace features.",
    hierarchyLevel: 6,
    scope: "personal",
    defaultPermissions: [
      {
        resource: "bookings",
        actions: ["create", "read", "update"],
        conditions: { scope: "own_records" }
      },
      {
        resource: "payments",
        actions: ["create", "read"],
        conditions: { scope: "own_records" }
      },
      {
        resource: "content",
        actions: ["read"],
        conditions: { scope: "all" }
      },
      {
        resource: "products",
        actions: ["read"],
        conditions: { scope: "all" }
      }
    ],
    capabilities: {
      canManageUsers: false,
      canManageRoles: false,
      canViewAuditLogs: false,
      canExportData: false,
      canManageSettings: false,
      requiresMFA: false,
      maxSessionDuration: 720 // 12 hours
    },
    isSystemRole: true
  },
  {
    name: "auditor",
    displayName: "Auditor/Read-Only",
    description: "Read-only access to audit logs and reports for compliance and monitoring purposes.",
    hierarchyLevel: 7,
    scope: "personal",
    defaultPermissions: [
      {
        resource: "audit_logs",
        actions: ["read"],
        conditions: { scope: "all" }
      },
      {
        resource: "reports",
        actions: ["read"],
        conditions: { scope: "all" }
      },
      {
        resource: "users",
        actions: ["read"],
        conditions: { scope: "all" }
      },
      {
        resource: "bookings",
        actions: ["read"],
        conditions: { scope: "all" }
      },
      {
        resource: "payments",
        actions: ["read"],
        conditions: { scope: "all" }
      }
    ],
    capabilities: {
      canManageUsers: false,
      canManageRoles: false,
      canViewAuditLogs: true,
      canExportData: false,
      canManageSettings: false,
      requiresMFA: false,
      maxSessionDuration: 480 // 8 hours
    },
    isSystemRole: true
  }
];

async function seedRoles() {
  try {
    console.log("🌱 Starting role seeding process...");
    
    // Connect to database
    await connectToDb();
    console.log("✅ Connected to MongoDB");

    // Clear existing roles (optional - comment out in production)
    // await Role.deleteMany({});
    // console.log("🗑️ Cleared existing roles");

    // Insert default roles
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (existingRole) {
        console.log(`⚠️ Role '${roleData.displayName}' already exists, skipping...`);
        continue;
      }

      const role = new Role(roleData);
      await role.save();
      console.log(`✅ Created role: ${role.displayName} (Level ${role.hierarchyLevel})`);
    }

    console.log("\n🎉 Role seeding completed successfully!");
    
    // Display role hierarchy
    console.log("\n📊 Role Hierarchy:");
    const roles = await Role.find({ isActive: true }).sort({ hierarchyLevel: 1 });
    roles.forEach(role => {
      console.log(`  ${role.hierarchyLevel}. ${role.displayName} (${role.scope})`);
    });

  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

// Run the seeding function
seedRoles();
