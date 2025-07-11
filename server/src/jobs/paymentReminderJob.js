import cron from 'node-cron';
import PaymentNotificationService from '../services/PaymentNotificationService.js';

class PaymentReminderJob {
  
  /**
   * Initialize all payment reminder jobs
   */
  static init() {
    console.log('Initializing payment reminder jobs...');
    
    // Daily job to check for overdue payments (runs at 9:00 AM every day)
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily overdue payment check...');
      try {
        await PaymentNotificationService.notifyOverduePayments();
        console.log('Daily overdue payment check completed');
      } catch (error) {
        console.error('Error in daily overdue payment check:', error);
      }
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    // Daily job to check for upcoming payments (runs at 10:00 AM every day)
    cron.schedule('0 10 * * *', async () => {
      console.log('Running daily upcoming payment check...');
      try {
        await PaymentNotificationService.notifyUpcomingPayments(3); // 3 days before
        console.log('Daily upcoming payment check completed');
      } catch (error) {
        console.error('Error in daily upcoming payment check:', error);
      }
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    // Weekly job to check for payments due in 7 days (runs every Monday at 8:00 AM)
    cron.schedule('0 8 * * 1', async () => {
      console.log('Running weekly payment reminder check...');
      try {
        await PaymentNotificationService.notifyUpcomingPayments(7); // 7 days before
        console.log('Weekly payment reminder check completed');
      } catch (error) {
        console.error('Error in weekly payment reminder check:', error);
      }
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    // Monthly job to send payment summary (runs on 1st of every month at 9:00 AM)
    cron.schedule('0 9 1 * *', async () => {
      console.log('Running monthly payment summary...');
      try {
        await this.sendMonthlyPaymentSummary();
        console.log('Monthly payment summary completed');
      } catch (error) {
        console.error('Error in monthly payment summary:', error);
      }
    }, {
      scheduled: true,
      timezone: "Africa/Lagos"
    });

    console.log('Payment reminder jobs initialized successfully');
  }

  /**
   * Send monthly payment summary to admins
   */
  static async sendMonthlyPaymentSummary() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Get payment statistics for the month
      const PaymentVerification = (await import('../models/PaymentVerification.js')).default;
      const User = (await import('../models/User.js')).default;
      const Notification = (await import('../models/Notification.js')).default;

      const monthlyStats = await PaymentVerification.aggregate([
        {
          $match: {
            submittedAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: '$verificationStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Get all admins
      const admins = await User.find({ role: 'admin' });

      // Create summary message
      let summaryMessage = `Monthly Payment Summary (${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}):\n\n`;
      
      monthlyStats.forEach(stat => {
        summaryMessage += `${stat._id.toUpperCase()}: ${stat.count} payments (₦${stat.totalAmount.toLocaleString()})\n`;
      });

      // Create notifications for admins
      const notificationPromises = admins.map(admin => {
        return Notification.create({
          user: admin._id,
          title: 'Monthly Payment Summary',
          message: summaryMessage,
          type: 'payment_summary',
          priority: 'normal',
          actionData: {
            type: 'navigate',
            url: '/admin/payment-overview'
          }
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Created monthly payment summary for ${admins.length} admins`);

    } catch (error) {
      console.error('Error creating monthly payment summary:', error);
    }
  }

  /**
   * Manual trigger for overdue payment notifications
   */
  static async triggerOverdueNotifications() {
    try {
      console.log('Manually triggering overdue payment notifications...');
      await PaymentNotificationService.notifyOverduePayments();
      console.log('Manual overdue payment notifications completed');
    } catch (error) {
      console.error('Error in manual overdue payment notifications:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for upcoming payment notifications
   */
  static async triggerUpcomingNotifications(daysBefore = 3) {
    try {
      console.log(`Manually triggering upcoming payment notifications (${daysBefore} days)...`);
      await PaymentNotificationService.notifyUpcomingPayments(daysBefore);
      console.log('Manual upcoming payment notifications completed');
    } catch (error) {
      console.error('Error in manual upcoming payment notifications:', error);
      throw error;
    }
  }

  /**
   * Get job status and next run times
   */
  static getJobStatus() {
    const jobs = cron.getTasks();
    const status = {
      totalJobs: jobs.size,
      jobs: []
    };

    jobs.forEach((job, index) => {
      status.jobs.push({
        id: index,
        running: job.running,
        scheduled: job.scheduled
      });
    });

    return status;
  }

  /**
   * Stop all payment reminder jobs
   */
  static stopAllJobs() {
    const jobs = cron.getTasks();
    jobs.forEach(job => {
      job.stop();
    });
    console.log('All payment reminder jobs stopped');
  }

  /**
   * Start all payment reminder jobs
   */
  static startAllJobs() {
    const jobs = cron.getTasks();
    jobs.forEach(job => {
      job.start();
    });
    console.log('All payment reminder jobs started');
  }
}

export default PaymentReminderJob;
