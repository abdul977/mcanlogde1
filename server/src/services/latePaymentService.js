import Booking from '../models/Booking.js';
import PaymentReminder from '../models/PaymentReminder.js';
import Notification from '../models/Notification.js';
import { sendEmail } from './emailService.js';

class LatePaymentService {
  constructor() {
    this.gracePeriodDays = 7; // Grace period after due date
    this.escalationLevels = [
      { days: 7, level: 1, action: 'gentle_reminder' },
      { days: 14, level: 2, action: 'firm_reminder' },
      { days: 21, level: 3, action: 'final_notice' },
      { days: 30, level: 4, action: 'account_suspension' }
    ];
  }

  // Process all overdue payments
  async processOverduePayments() {
    try {
      console.log('🔍 Processing overdue payments...');
      
      const overduePayments = await this.findOverduePayments();
      let processedCount = 0;

      for (const payment of overduePayments) {
        await this.handleOverduePayment(payment);
        processedCount++;
      }

      console.log(`✅ Processed ${processedCount} overdue payments`);
      return { success: true, processed: processedCount };
    } catch (error) {
      console.error('❌ Error processing overdue payments:', error);
      throw error;
    }
  }

  // Find all overdue payments
  async findOverduePayments() {
    const now = new Date();
    
    const bookings = await Booking.find({
      status: 'approved',
      'paymentSchedule.0': { $exists: true }
    }).populate('user', 'name email phone');

    const overduePayments = [];

    bookings.forEach(booking => {
      booking.paymentSchedule?.forEach(payment => {
        if (payment.status === 'pending') {
          const dueDate = new Date(payment.dueDate);
          const daysPastDue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
          
          if (daysPastDue > 0) {
            overduePayments.push({
              booking,
              payment,
              daysPastDue,
              escalationLevel: this.getEscalationLevel(daysPastDue)
            });
          }
        }
      });
    });

    return overduePayments;
  }

  // Handle individual overdue payment
  async handleOverduePayment(overduePayment) {
    const { booking, payment, daysPastDue, escalationLevel } = overduePayment;
    
    try {
      // Update payment status to overdue
      if (payment.status !== 'overdue') {
        payment.status = 'overdue';
        payment.overdueSince = new Date();
        await booking.save();
      }

      // Apply escalation action based on days overdue
      await this.applyEscalationAction(booking, payment, escalationLevel, daysPastDue);

      console.log(`📋 Processed overdue payment for booking ${booking._id}, month ${payment.monthNumber}, ${daysPastDue} days overdue`);
    } catch (error) {
      console.error(`❌ Error handling overdue payment for booking ${booking._id}:`, error);
    }
  }

  // Get escalation level based on days overdue
  getEscalationLevel(daysPastDue) {
    for (let i = this.escalationLevels.length - 1; i >= 0; i--) {
      if (daysPastDue >= this.escalationLevels[i].days) {
        return this.escalationLevels[i];
      }
    }
    return { days: 0, level: 0, action: 'none' };
  }

  // Apply escalation action
  async applyEscalationAction(booking, payment, escalationLevel, daysPastDue) {
    const user = booking.user;
    
    switch (escalationLevel.action) {
      case 'gentle_reminder':
        await this.sendGentleReminder(booking, payment, daysPastDue);
        break;
      
      case 'firm_reminder':
        await this.sendFirmReminder(booking, payment, daysPastDue);
        break;
      
      case 'final_notice':
        await this.sendFinalNotice(booking, payment, daysPastDue);
        break;
      
      case 'account_suspension':
        await this.handleAccountSuspension(booking, payment, daysPastDue);
        break;
      
      default:
        console.log(`No action defined for escalation level: ${escalationLevel.action}`);
    }
  }

  // Send gentle reminder (7 days overdue)
  async sendGentleReminder(booking, payment, daysPastDue) {
    const user = booking.user;
    
    // Create notification
    await Notification.create({
      user: user._id,
      title: `Payment Overdue - Month ${payment.monthNumber}`,
      message: `Your payment of ₦${payment.amount?.toLocaleString()} is ${daysPastDue} days overdue. Please submit your payment proof as soon as possible.`,
      type: 'payment_reminder',
      priority: 'high',
      relatedBooking: booking._id,
      actionData: {
        type: 'navigate',
        url: '/user/payment-dashboard'
      }
    });

    // Send email
    await sendEmail({
      to: user.email,
      template: 'payment-reminder',
      data: {
        userName: user.name,
        accommodationTitle: booking.accommodation?.title,
        monthNumber: payment.monthNumber,
        amount: payment.amount,
        dueDate: payment.dueDate.toLocaleDateString(),
        reminderType: 'overdue',
        message: `Your payment is ${daysPastDue} days overdue. Please submit your payment proof immediately to avoid further action.`
      }
    });

    console.log(`📧 Sent gentle reminder to ${user.email} for booking ${booking._id}`);
  }

  // Send firm reminder (14 days overdue)
  async sendFirmReminder(booking, payment, daysPastDue) {
    const user = booking.user;
    
    // Create urgent notification
    await Notification.create({
      user: user._id,
      title: `URGENT: Payment ${daysPastDue} Days Overdue`,
      message: `Your payment of ₦${payment.amount?.toLocaleString()} is seriously overdue. Immediate action required to avoid account restrictions.`,
      type: 'payment_reminder',
      priority: 'urgent',
      relatedBooking: booking._id,
      actionData: {
        type: 'navigate',
        url: '/user/payment-dashboard'
      }
    });

    // Send urgent email
    await sendEmail({
      to: user.email,
      subject: `URGENT: Payment Overdue - Action Required`,
      template: 'payment-reminder',
      data: {
        userName: user.name,
        accommodationTitle: booking.accommodation?.title,
        monthNumber: payment.monthNumber,
        amount: payment.amount,
        dueDate: payment.dueDate.toLocaleDateString(),
        reminderType: 'urgent',
        message: `Your payment is ${daysPastDue} days overdue. This is a firm reminder that immediate payment is required to avoid account restrictions.`
      }
    });

    console.log(`⚠️ Sent firm reminder to ${user.email} for booking ${booking._id}`);
  }

  // Send final notice (21 days overdue)
  async sendFinalNotice(booking, payment, daysPastDue) {
    const user = booking.user;
    
    // Create critical notification
    await Notification.create({
      user: user._id,
      title: `FINAL NOTICE: Payment ${daysPastDue} Days Overdue`,
      message: `This is your final notice. Payment of ₦${payment.amount?.toLocaleString()} must be submitted within 7 days or your booking may be cancelled.`,
      type: 'payment_reminder',
      priority: 'urgent',
      relatedBooking: booking._id,
      actionData: {
        type: 'navigate',
        url: '/user/payment-dashboard'
      }
    });

    // Send final notice email
    await sendEmail({
      to: user.email,
      subject: `FINAL NOTICE: Payment Overdue - Booking at Risk`,
      template: 'payment-reminder',
      data: {
        userName: user.name,
        accommodationTitle: booking.accommodation?.title,
        monthNumber: payment.monthNumber,
        amount: payment.amount,
        dueDate: payment.dueDate.toLocaleDateString(),
        reminderType: 'final_notice',
        message: `This is your FINAL NOTICE. Your payment is ${daysPastDue} days overdue. You have 7 days to submit payment or your booking may be cancelled.`
      }
    });

    console.log(`🚨 Sent final notice to ${user.email} for booking ${booking._id}`);
  }

  // Handle account suspension (30 days overdue)
  async handleAccountSuspension(booking, payment, daysPastDue) {
    const user = booking.user;
    
    // Mark booking as suspended
    booking.status = 'suspended';
    booking.suspensionReason = `Payment overdue for ${daysPastDue} days`;
    booking.suspendedAt = new Date();
    await booking.save();

    // Create critical notification
    await Notification.create({
      user: user._id,
      title: `BOOKING SUSPENDED: ${daysPastDue} Days Overdue`,
      message: `Your booking has been suspended due to non-payment. Contact support immediately to resolve this issue.`,
      type: 'booking_update',
      priority: 'urgent',
      relatedBooking: booking._id,
      actionData: {
        type: 'navigate',
        url: '/contact-support'
      }
    });

    // Send suspension email
    await sendEmail({
      to: user.email,
      subject: `BOOKING SUSPENDED - Immediate Action Required`,
      template: 'payment-reminder',
      data: {
        userName: user.name,
        accommodationTitle: booking.accommodation?.title,
        monthNumber: payment.monthNumber,
        amount: payment.amount,
        dueDate: payment.dueDate.toLocaleDateString(),
        reminderType: 'suspension',
        message: `Your booking has been suspended due to payment being ${daysPastDue} days overdue. Please contact our support team immediately to resolve this issue.`
      }
    });

    console.log(`🔒 Suspended booking ${booking._id} for user ${user.email}`);
  }

  // Get overdue payment statistics
  async getOverdueStatistics() {
    try {
      const overduePayments = await this.findOverduePayments();
      
      const stats = {
        total: overduePayments.length,
        byLevel: {},
        totalAmount: 0,
        averageDaysOverdue: 0
      };

      let totalDays = 0;

      overduePayments.forEach(payment => {
        const level = payment.escalationLevel.level;
        if (!stats.byLevel[level]) {
          stats.byLevel[level] = { count: 0, amount: 0 };
        }
        
        stats.byLevel[level].count++;
        stats.byLevel[level].amount += payment.payment.amount || 0;
        stats.totalAmount += payment.payment.amount || 0;
        totalDays += payment.daysPastDue;
      });

      if (overduePayments.length > 0) {
        stats.averageDaysOverdue = Math.round(totalDays / overduePayments.length);
      }

      return stats;
    } catch (error) {
      console.error('Error getting overdue statistics:', error);
      throw error;
    }
  }

  // Manual trigger for testing
  async triggerManualEscalation() {
    console.log('🔧 Manual escalation triggered');
    return await this.processOverduePayments();
  }
}

// Create singleton instance
const latePaymentService = new LatePaymentService();

export default latePaymentService;
