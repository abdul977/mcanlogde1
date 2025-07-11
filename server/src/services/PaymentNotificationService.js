import Notification from '../models/Notification.js';
import User from '../models/User.js';
import PaymentVerification from '../models/PaymentVerification.js';
import Booking from '../models/Booking.js';
import { sendEmail } from './emailService.js';
import { sendSMS } from '../utils/smsService.js';

class PaymentNotificationService {
  
  /**
   * Create notification for payment proof submission
   */
  static async notifyPaymentSubmission(paymentVerification) {
    try {
      // Get all admin users
      const admins = await User.find({ role: 'admin' });
      
      // Populate payment verification details
      await paymentVerification.populate([
        { path: 'user', select: 'name email phone' },
        { path: 'booking', select: 'accommodation checkInDate', populate: { path: 'accommodation', select: 'title' } }
      ]);

      const notificationData = {
        title: 'New Payment Proof Submitted',
        message: `${paymentVerification.user.name} submitted payment proof for ${paymentVerification.booking.accommodation.title} - Month ${paymentVerification.monthNumber}`,
        type: 'payment_verification',
        priority: 'high',
        relatedPayment: paymentVerification._id,
        relatedBooking: paymentVerification.booking._id,
        actionData: {
          type: 'navigate',
          url: '/admin/payment-verification',
          params: { paymentId: paymentVerification._id }
        }
      };

      // Create notifications for all admins
      const notificationPromises = admins.map(admin => {
        return Notification.create({
          ...notificationData,
          user: admin._id
        });
      });

      await Promise.all(notificationPromises);

      // Send email notifications to admins
      const emailPromises = admins.map(admin => {
        return this.sendPaymentSubmissionEmail(admin, paymentVerification);
      });

      await Promise.all(emailPromises);

      console.log(`Created payment submission notifications for ${admins.length} admins`);
      return true;
    } catch (error) {
      console.error('Error creating payment submission notifications:', error);
      return false;
    }
  }

  /**
   * Create notification for payment approval/rejection
   */
  static async notifyPaymentDecision(paymentVerification, action, adminNotes = '') {
    try {
      await paymentVerification.populate([
        { path: 'user', select: 'name email phone' },
        { path: 'booking', select: 'accommodation checkInDate', populate: { path: 'accommodation', select: 'title' } }
      ]);

      const isApproved = action === 'approve';
      const notificationTitle = isApproved ? 'Payment Approved' : 'Payment Rejected';
      const notificationMessage = isApproved 
        ? `Your payment for ${paymentVerification.booking.accommodation.title} - Month ${paymentVerification.monthNumber} has been approved.`
        : `Your payment for ${paymentVerification.booking.accommodation.title} - Month ${paymentVerification.monthNumber} has been rejected. ${adminNotes ? 'Reason: ' + adminNotes : ''}`;

      // Create notification for user
      await Notification.create({
        user: paymentVerification.user._id,
        title: notificationTitle,
        message: notificationMessage,
        type: isApproved ? 'payment_approved' : 'payment_rejected',
        priority: isApproved ? 'normal' : 'high',
        relatedPayment: paymentVerification._id,
        relatedBooking: paymentVerification.booking._id,
        actionData: {
          type: 'navigate',
          url: '/user/payments',
          params: { bookingId: paymentVerification.booking._id }
        }
      });

      // Send email notification to user
      await this.sendPaymentDecisionEmail(paymentVerification.user, paymentVerification, isApproved, adminNotes);

      // Send SMS notification for important updates
      if (!isApproved) {
        await this.sendPaymentRejectionSMS(paymentVerification.user, paymentVerification);
      }

      console.log(`Created ${action} notification for user ${paymentVerification.user._id}`);
      return true;
    } catch (error) {
      console.error('Error creating payment decision notification:', error);
      return false;
    }
  }

  /**
   * Create notification for overdue payments
   */
  static async notifyOverduePayments() {
    try {
      const overdueBookings = await Booking.find({
        bookingType: 'accommodation',
        paymentStatus: { $in: ['pending', 'partial'] },
        'paymentSchedule.dueDate': { $lt: new Date() },
        'paymentSchedule.status': 'pending'
      }).populate('user', 'name email phone')
        .populate('accommodation', 'title');

      const notifications = [];

      for (const booking of overdueBookings) {
        const overduePayments = booking.paymentSchedule.filter(
          payment => payment.status === 'pending' && new Date(payment.dueDate) < new Date()
        );

        if (overduePayments.length > 0) {
          const notification = await Notification.create({
            user: booking.user._id,
            title: 'Overdue Payment Reminder',
            message: `You have ${overduePayments.length} overdue payment(s) for ${booking.accommodation.title}. Please make payment to avoid service interruption.`,
            type: 'payment_overdue',
            priority: 'high',
            relatedBooking: booking._id,
            actionData: {
              type: 'navigate',
              url: '/user/payments',
              params: { bookingId: booking._id }
            }
          });

          notifications.push(notification);

          // Send email reminder
          await this.sendOverduePaymentEmail(booking.user, booking, overduePayments);
        }
      }

      console.log(`Created ${notifications.length} overdue payment notifications`);
      return notifications;
    } catch (error) {
      console.error('Error creating overdue payment notifications:', error);
      return [];
    }
  }

  /**
   * Create notification for upcoming payment due dates
   */
  static async notifyUpcomingPayments(daysBefore = 3) {
    try {
      const upcomingDate = new Date();
      upcomingDate.setDate(upcomingDate.getDate() + daysBefore);

      const upcomingBookings = await Booking.find({
        bookingType: 'accommodation',
        paymentStatus: { $in: ['pending', 'partial'] },
        'paymentSchedule.dueDate': { 
          $gte: new Date(),
          $lte: upcomingDate
        },
        'paymentSchedule.status': 'pending'
      }).populate('user', 'name email phone')
        .populate('accommodation', 'title');

      const notifications = [];

      for (const booking of upcomingBookings) {
        const upcomingPayments = booking.paymentSchedule.filter(
          payment => payment.status === 'pending' && 
          new Date(payment.dueDate) >= new Date() && 
          new Date(payment.dueDate) <= upcomingDate
        );

        if (upcomingPayments.length > 0) {
          const notification = await Notification.create({
            user: booking.user._id,
            title: 'Payment Due Soon',
            message: `You have ${upcomingPayments.length} payment(s) due within ${daysBefore} days for ${booking.accommodation.title}.`,
            type: 'payment_reminder',
            priority: 'normal',
            relatedBooking: booking._id,
            actionData: {
              type: 'navigate',
              url: '/user/payments',
              params: { bookingId: booking._id }
            }
          });

          notifications.push(notification);

          // Send email reminder
          await this.sendUpcomingPaymentEmail(booking.user, booking, upcomingPayments);
        }
      }

      console.log(`Created ${notifications.length} upcoming payment notifications`);
      return notifications;
    } catch (error) {
      console.error('Error creating upcoming payment notifications:', error);
      return [];
    }
  }

  /**
   * Send email notification for payment submission
   */
  static async sendPaymentSubmissionEmail(admin, paymentVerification) {
    try {
      const subject = 'New Payment Proof Submitted - Action Required';
      const html = `
        <h2>New Payment Proof Submitted</h2>
        <p>A new payment proof has been submitted and requires your review:</p>
        <ul>
          <li><strong>User:</strong> ${paymentVerification.user.name}</li>
          <li><strong>Accommodation:</strong> ${paymentVerification.booking.accommodation.title}</li>
          <li><strong>Month:</strong> ${paymentVerification.monthNumber}</li>
          <li><strong>Amount:</strong> ₦${paymentVerification.amount.toLocaleString()}</li>
          <li><strong>Payment Method:</strong> ${paymentVerification.paymentMethod}</li>
        </ul>
        <p>Please log in to the admin panel to review and verify this payment.</p>
        <a href="${process.env.FRONTEND_URL}/admin/payment-verification" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Payment</a>
      `;

      await sendEmail({ to: admin.email, subject, html });
    } catch (error) {
      console.error('Error sending payment submission email:', error);
    }
  }

  /**
   * Send email notification for payment decision
   */
  static async sendPaymentDecisionEmail(user, paymentVerification, isApproved, adminNotes) {
    try {
      const subject = isApproved ? 'Payment Approved' : 'Payment Rejected';
      const statusColor = isApproved ? '#10B981' : '#EF4444';
      const statusText = isApproved ? 'APPROVED' : 'REJECTED';

      const html = `
        <h2 style="color: ${statusColor};">Payment ${statusText}</h2>
        <p>Your payment submission has been ${isApproved ? 'approved' : 'rejected'}:</p>
        <ul>
          <li><strong>Accommodation:</strong> ${paymentVerification.booking.accommodation.title}</li>
          <li><strong>Month:</strong> ${paymentVerification.monthNumber}</li>
          <li><strong>Amount:</strong> ₦${paymentVerification.amount.toLocaleString()}</li>
        </ul>
        ${!isApproved && adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
        ${!isApproved ? '<p>Please resubmit your payment proof with the correct information.</p>' : ''}
        <a href="${process.env.FRONTEND_URL}/user/payments" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Payments</a>
      `;

      await sendEmail({ to: user.email, subject, html });
    } catch (error) {
      console.error('Error sending payment decision email:', error);
    }
  }

  /**
   * Send SMS for payment rejection
   */
  static async sendPaymentRejectionSMS(user, paymentVerification) {
    try {
      if (!user.phone) return;

      const message = `MCAN: Your payment for ${paymentVerification.booking.accommodation.title} (Month ${paymentVerification.monthNumber}) has been rejected. Please resubmit with correct information. Check your email for details.`;
      
      await sendSMS(user.phone, message);
    } catch (error) {
      console.error('Error sending payment rejection SMS:', error);
    }
  }

  /**
   * Send email for overdue payments
   */
  static async sendOverduePaymentEmail(user, booking, overduePayments) {
    try {
      const subject = 'Overdue Payment Reminder - Action Required';
      const totalOverdue = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);

      const html = `
        <h2 style="color: #EF4444;">Overdue Payment Reminder</h2>
        <p>You have overdue payments for your accommodation booking:</p>
        <ul>
          <li><strong>Accommodation:</strong> ${booking.accommodation.title}</li>
          <li><strong>Overdue Payments:</strong> ${overduePayments.length}</li>
          <li><strong>Total Amount:</strong> ₦${totalOverdue.toLocaleString()}</li>
        </ul>
        <p>Please make payment immediately to avoid service interruption.</p>
        <a href="${process.env.FRONTEND_URL}/user/payments" style="background-color: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Make Payment</a>
      `;

      await sendEmail({ to: user.email, subject, html });
    } catch (error) {
      console.error('Error sending overdue payment email:', error);
    }
  }

  /**
   * Send email for upcoming payments
   */
  static async sendUpcomingPaymentEmail(user, booking, upcomingPayments) {
    try {
      const subject = 'Payment Due Soon - Reminder';
      const totalAmount = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0);

      const html = `
        <h2 style="color: #F59E0B;">Payment Due Soon</h2>
        <p>You have upcoming payments for your accommodation booking:</p>
        <ul>
          <li><strong>Accommodation:</strong> ${booking.accommodation.title}</li>
          <li><strong>Upcoming Payments:</strong> ${upcomingPayments.length}</li>
          <li><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</li>
        </ul>
        <p>Please make payment before the due date to avoid late fees.</p>
        <a href="${process.env.FRONTEND_URL}/user/payments" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Make Payment</a>
      `;

      await sendEmail({ to: user.email, subject, html });
    } catch (error) {
      console.error('Error sending upcoming payment email:', error);
    }
  }
}

export default PaymentNotificationService;
