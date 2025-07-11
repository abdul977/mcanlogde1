import cron from 'node-cron';
import PaymentReminder from '../models/PaymentReminder.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { sendEmail } from './emailService.js';

class ReminderService {
  constructor() {
    this.isRunning = false;
    this.scheduledJobs = new Map();
  }

  // Initialize the reminder service
  init() {
    console.log('🔔 Initializing Payment Reminder Service...');
    
    // Schedule daily check for due reminders (runs at 9:00 AM every day)
    this.scheduledJobs.set('daily-reminders', cron.schedule('0 9 * * *', () => {
      this.processDueReminders();
    }, {
      scheduled: false,
      timezone: "Africa/Lagos"
    }));

    // Schedule weekly check for overdue payments (runs every Monday at 10:00 AM)
    this.scheduledJobs.set('overdue-check', cron.schedule('0 10 * * 1', () => {
      this.processOverduePayments();
    }, {
      scheduled: false,
      timezone: "Africa/Lagos"
    }));

    // Schedule monthly reminder generation (runs on 1st of every month at 8:00 AM)
    this.scheduledJobs.set('monthly-generation', cron.schedule('0 8 1 * *', () => {
      this.generateMonthlyReminders();
    }, {
      scheduled: false,
      timezone: "Africa/Lagos"
    }));

    this.start();
  }

  // Start all scheduled jobs
  start() {
    if (this.isRunning) {
      console.log('⚠️ Reminder service is already running');
      return;
    }

    this.scheduledJobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Started ${name} job`);
    });

    this.isRunning = true;
    console.log('🚀 Payment Reminder Service started successfully');
  }

  // Stop all scheduled jobs
  stop() {
    this.scheduledJobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped ${name} job`);
    });

    this.isRunning = false;
    console.log('⏹️ Payment Reminder Service stopped');
  }

  // Process due reminders
  async processDueReminders() {
    try {
      console.log('📅 Processing due payment reminders...');
      
      const dueReminders = await PaymentReminder.findDueReminders();
      
      for (const reminder of dueReminders) {
        await this.sendReminder(reminder);
      }

      console.log(`✅ Processed ${dueReminders.length} due reminders`);
    } catch (error) {
      console.error('❌ Error processing due reminders:', error);
    }
  }

  // Process overdue payments
  async processOverduePayments() {
    try {
      console.log('⚠️ Processing overdue payments...');
      
      const overduePayments = await PaymentReminder.findOverduePayments();
      
      for (const payment of overduePayments) {
        await this.createOverdueReminder(payment);
      }

      console.log(`✅ Processed ${overduePayments.length} overdue payments`);
    } catch (error) {
      console.error('❌ Error processing overdue payments:', error);
    }
  }

  // Generate monthly reminders for upcoming payments
  async generateMonthlyReminders() {
    try {
      console.log('📆 Generating monthly payment reminders...');
      
      // Find all active bookings with payment schedules
      const activeBookings = await Booking.find({
        status: 'approved',
        'paymentSchedule.0': { $exists: true }
      }).populate('user', 'name email phone');

      let generatedCount = 0;

      for (const booking of activeBookings) {
        for (const payment of booking.paymentSchedule) {
          if (payment.status === 'pending') {
            // Check if reminder already exists
            const existingReminder = await PaymentReminder.findOne({
              booking: booking._id,
              monthNumber: payment.monthNumber,
              reminderType: 'upcoming'
            });

            if (!existingReminder) {
              await PaymentReminder.createUpcomingReminder(
                booking,
                payment.monthNumber,
                payment.dueDate,
                payment.amount
              );
              generatedCount++;
            }
          }
        }
      }

      console.log(`✅ Generated ${generatedCount} monthly reminders`);
    } catch (error) {
      console.error('❌ Error generating monthly reminders:', error);
    }
  }

  // Send individual reminder
  async sendReminder(reminder) {
    try {
      const channels = reminder.channels;
      let sentSuccessfully = false;

      // Send email reminder
      if (!channels.email.sent) {
        try {
          await this.sendEmailReminder(reminder);
          channels.email.sent = true;
          channels.email.sentAt = new Date();
          sentSuccessfully = true;
        } catch (emailError) {
          console.error(`❌ Failed to send email reminder for ${reminder._id}:`, emailError);
        }
      }

      // Send in-app notification
      if (!channels.inApp.sent) {
        try {
          await this.sendInAppNotification(reminder);
          channels.inApp.sent = true;
          channels.inApp.sentAt = new Date();
          sentSuccessfully = true;
        } catch (notificationError) {
          console.error(`❌ Failed to send in-app notification for ${reminder._id}:`, notificationError);
        }
      }

      // Update reminder status
      if (sentSuccessfully) {
        reminder.status = 'sent';
      } else {
        reminder.status = 'failed';
        reminder.retryCount += 1;
        
        // Schedule retry if under limit
        if (reminder.retryCount < 3) {
          reminder.nextRetryAt = new Date(Date.now() + (reminder.retryCount * 60 * 60 * 1000)); // Retry after 1, 2, 3 hours
        }
      }

      await reminder.save();
      
    } catch (error) {
      console.error(`❌ Error sending reminder ${reminder._id}:`, error);
      reminder.status = 'failed';
      reminder.lastError = error.message;
      await reminder.save();
    }
  }

  // Send email reminder
  async sendEmailReminder(reminder) {
    const user = reminder.user;
    const booking = reminder.booking;
    
    const emailData = {
      to: user.email,
      subject: reminder.subject,
      template: 'payment-reminder',
      data: {
        userName: user.name,
        accommodationTitle: booking.accommodation?.title,
        monthNumber: reminder.monthNumber,
        amount: reminder.amount,
        dueDate: reminder.dueDate.toLocaleDateString(),
        reminderType: reminder.reminderType,
        message: reminder.message
      }
    };

    await sendEmail(emailData);
  }

  // Send in-app notification
  async sendInAppNotification(reminder) {
    // This would integrate with your notification system
    // For now, we'll just log it
    console.log(`📱 In-app notification sent to user ${reminder.user._id} for payment reminder ${reminder._id}`);
  }

  // Create overdue reminder
  async createOverdueReminder(payment) {
    try {
      const booking = payment.booking;
      
      await PaymentReminder.createOverdueReminder(
        booking,
        payment.monthNumber,
        payment.dueDate,
        payment.amount
      );

      console.log(`⚠️ Created overdue reminder for booking ${booking._id}, month ${payment.monthNumber}`);
    } catch (error) {
      console.error('❌ Error creating overdue reminder:', error);
    }
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    console.log('🔧 Manual reminder check triggered');
    await this.processDueReminders();
    await this.processOverduePayments();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.scheduledJobs.keys()),
      nextRuns: Array.from(this.scheduledJobs.entries()).map(([name, job]) => ({
        name,
        nextRun: job.nextDate()?.toISOString()
      }))
    };
  }
}

// Create singleton instance
const reminderService = new ReminderService();

export default reminderService;
