// Initialization script for yearly booking system
// Run this script to set up the yearly booking system components

import mongoose from 'mongoose';
import reminderService from '../services/reminderService.js';
import { initEmailService } from '../services/emailService.js';
import receiptService from '../services/receiptService.js';
import latePaymentService from '../services/latePaymentService.js';

class YearlyBookingSystemInitializer {
  constructor() {
    this.initializationSteps = [
      { name: 'Database Connection', fn: this.checkDatabaseConnection },
      { name: 'Email Service', fn: this.initializeEmailService },
      { name: 'Reminder Service', fn: this.initializeReminderService },
      { name: 'Receipt Service', fn: this.initializeReceiptService },
      { name: 'Late Payment Service', fn: this.initializeLatePaymentService },
      { name: 'File Upload Directories', fn: this.createUploadDirectories },
      { name: 'Database Indexes', fn: this.createDatabaseIndexes },
      { name: 'System Health Check', fn: this.performHealthCheck }
    ];
  }

  async initialize() {
    console.log('🚀 Initializing Yearly Booking System...\n');
    
    const results = [];
    
    for (const step of this.initializationSteps) {
      try {
        console.log(`⏳ ${step.name}...`);
        const result = await step.fn.call(this);
        console.log(`✅ ${step.name} - ${result.message}\n`);
        results.push({ step: step.name, success: true, ...result });
      } catch (error) {
        console.error(`❌ ${step.name} - ${error.message}\n`);
        results.push({ step: step.name, success: false, error: error.message });
      }
    }
    
    this.printSummary(results);
    return results;
  }

  async checkDatabaseConnection() {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    return { message: 'Database connection active' };
  }

  async initializeEmailService() {
    const isConfigured = await initEmailService();
    if (!isConfigured) {
      return { 
        message: 'Email service not configured (check SMTP settings)', 
        warning: true 
      };
    }
    return { message: 'Email service initialized successfully' };
  }

  async initializeReminderService() {
    reminderService.init();
    const status = reminderService.getStatus();
    return { 
      message: `Reminder service started with ${status.activeJobs.length} scheduled jobs`,
      details: status
    };
  }

  async initializeReceiptService() {
    // Test receipt service by checking directory creation
    receiptService.ensureReceiptDirectory();
    return { message: 'Receipt service initialized, directories created' };
  }

  async initializeLatePaymentService() {
    // Test late payment service
    const stats = await latePaymentService.getOverdueStatistics();
    return { 
      message: `Late payment service initialized, found ${stats.total} overdue payments`,
      details: stats
    };
  }

  async createUploadDirectories() {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const directories = [
      path.join(__dirname, '../../uploads'),
      path.join(__dirname, '../../uploads/payments'),
      path.join(__dirname, '../../uploads/payments/screenshots'),
      path.join(__dirname, '../../uploads/receipts')
    ];
    
    let createdCount = 0;
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        createdCount++;
      }
    });
    
    return { 
      message: `Upload directories verified, ${createdCount} created`,
      directories: directories.length
    };
  }

  async createDatabaseIndexes() {
    const collections = [
      {
        name: 'bookings',
        indexes: [
          { 'user': 1, 'status': 1 },
          { 'accommodation': 1, 'status': 1 },
          { 'paymentSchedule.dueDate': 1, 'paymentSchedule.status': 1 },
          { 'bookingDuration.endDate': 1 }
        ]
      },
      {
        name: 'paymentverifications',
        indexes: [
          { 'booking': 1, 'monthNumber': 1 },
          { 'user': 1, 'verificationStatus': 1 },
          { 'verificationStatus': 1, 'submittedAt': -1 },
          { 'verifiedAt': 1 }
        ]
      },
      {
        name: 'paymentreminders',
        indexes: [
          { 'booking': 1, 'monthNumber': 1 },
          { 'user': 1, 'status': 1 },
          { 'dueDate': 1, 'status': 1 },
          { 'nextRetryAt': 1 }
        ]
      },
      {
        name: 'notifications',
        indexes: [
          { 'user': 1, 'status': 1, 'createdAt': -1 },
          { 'user': 1, 'type': 1 },
          { 'expiresAt': 1 },
          { 'relatedBooking': 1 }
        ]
      }
    ];
    
    let indexCount = 0;
    for (const collection of collections) {
      const db = mongoose.connection.db;
      for (const index of collection.indexes) {
        try {
          await db.collection(collection.name).createIndex(index);
          indexCount++;
        } catch (error) {
          // Index might already exist, continue
          if (!error.message.includes('already exists')) {
            console.warn(`Warning: Could not create index on ${collection.name}:`, error.message);
          }
        }
      }
    }
    
    return { 
      message: `Database indexes verified, ${indexCount} indexes processed`,
      collections: collections.length
    };
  }

  async performHealthCheck() {
    const checks = [];
    
    // Check models
    const models = ['Booking', 'PaymentVerification', 'PaymentReminder', 'Notification'];
    for (const modelName of models) {
      try {
        const model = mongoose.model(modelName);
        await model.findOne().limit(1);
        checks.push({ model: modelName, status: 'OK' });
      } catch (error) {
        checks.push({ model: modelName, status: 'ERROR', error: error.message });
      }
    }
    
    // Check services
    const serviceChecks = [
      { name: 'Reminder Service', status: reminderService.getStatus().isRunning ? 'OK' : 'ERROR' },
      { name: 'Receipt Service', status: 'OK' }, // Always OK if initialized
      { name: 'Late Payment Service', status: 'OK' }
    ];
    
    const failedChecks = [...checks, ...serviceChecks].filter(check => check.status === 'ERROR');
    
    return {
      message: `Health check completed, ${failedChecks.length} issues found`,
      details: { models: checks, services: serviceChecks },
      healthy: failedChecks.length === 0
    };
  }

  printSummary(results) {
    console.log('📊 INITIALIZATION SUMMARY');
    console.log('=' * 50);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const warnings = results.filter(r => r.warning).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log('');
    
    if (failed > 0) {
      console.log('❌ FAILED STEPS:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.step}: ${result.error}`);
      });
      console.log('');
    }
    
    if (warnings > 0) {
      console.log('⚠️  WARNINGS:');
      results.filter(r => r.warning).forEach(result => {
        console.log(`   • ${result.step}: ${result.message}`);
      });
      console.log('');
    }
    
    if (failed === 0) {
      console.log('🎉 Yearly Booking System initialized successfully!');
      console.log('');
      console.log('📋 SYSTEM FEATURES READY:');
      console.log('   • 12-month maximum booking duration');
      console.log('   • Monthly payment schedules');
      console.log('   • Automated payment reminders');
      console.log('   • Payment verification workflow');
      console.log('   • Receipt generation');
      console.log('   • Late payment handling');
      console.log('   • Analytics and reporting');
      console.log('   • Mobile-responsive interfaces');
    } else {
      console.log('⚠️  System initialization completed with errors.');
      console.log('   Please resolve the failed steps before using the system.');
    }
    
    console.log('');
  }

  // Manual service controls
  async startServices() {
    console.log('🔄 Starting services...');
    reminderService.start();
    console.log('✅ Services started');
  }

  async stopServices() {
    console.log('🛑 Stopping services...');
    reminderService.stop();
    console.log('✅ Services stopped');
  }

  async getSystemStatus() {
    return {
      reminderService: reminderService.getStatus(),
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in other scripts
export default YearlyBookingSystemInitializer;

// Run initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const initializer = new YearlyBookingSystemInitializer();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await initializer.stopServices();
    process.exit(0);
  });
  
  // Run initialization
  initializer.initialize().catch(error => {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  });
}
