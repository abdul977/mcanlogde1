import PaymentVerification from "../models/PaymentVerification.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getFileUrl, validatePaymentProofFile, getFileType } from "../utils/fileUpload.js";
import path from 'path';

// Submit payment proof
export const submitPaymentProof = async (req, res) => {
  try {
    const {
      bookingId,
      monthNumber,
      amount,
      paymentMethod,
      transactionReference,
      paymentDate,
      userNotes
    } = req.body;

    const userId = req.user._id || req.user.id;

    // Validate required fields
    if (!bookingId || !monthNumber || !amount || !paymentMethod || !paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required"
      });
    }

    const fileErrors = validatePaymentProofFile(req.file);
    if (fileErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: fileErrors.join(', ')
      });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    }).populate('accommodation', 'title price');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied"
      });
    }

    // Check if payment verification already exists for this month
    const existingVerification = await PaymentVerification.findOne({
      booking: bookingId,
      monthNumber: parseInt(monthNumber),
      verificationStatus: { $in: ['pending', 'approved'] }
    });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: "Payment verification already exists for this month"
      });
    }

    // Create payment verification record
    const paymentVerification = new PaymentVerification({
      booking: bookingId,
      user: userId,
      monthNumber: parseInt(monthNumber),
      amount: parseFloat(amount),
      paymentProof: {
        url: getFileUrl(req.file.filename),
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        fileType: getFileType(req.file.mimetype)
      },
      // Keep legacy field for backward compatibility
      paymentScreenshot: {
        url: getFileUrl(req.file.filename),
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      paymentMethod,
      transactionReference: transactionReference || undefined,
      paymentDate: new Date(paymentDate),
      userNotes: userNotes || undefined,
      verificationStatus: 'pending'
    });

    await paymentVerification.save();

    // Populate the response
    await paymentVerification.populate([
      { path: 'user', select: 'name email' },
      { path: 'booking', select: 'accommodation checkInDate', populate: { path: 'accommodation', select: 'title' } }
    ]);

    // Create notification for admins
    try {
      const admins = await User.find({ role: 'admin' });
      const notificationPromises = admins.map(admin => {
        return Notification.create({
          user: admin._id,
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
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Created payment notification for ${admins.length} admins`);
    } catch (notificationError) {
      console.error("Error creating admin notifications:", notificationError);
      // Don't fail the payment submission if notifications fail
    }

    res.status(201).json({
      success: true,
      message: "Payment proof submitted successfully",
      paymentVerification
    });

  } catch (error) {
    console.error("Error submitting payment proof:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit payment proof",
      error: error.message
    });
  }
};

// Get payment verifications for admin
export const getPaymentVerifications = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status !== 'all') {
      filter.verificationStatus = status;
    }

    const payments = await PaymentVerification.find(filter)
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        select: 'accommodation checkInDate',
        populate: {
          path: 'accommodation',
          select: 'title location'
        }
      })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PaymentVerification.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching payment verifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment verifications",
      error: error.message
    });
  }
};

// Verify payment (approve/reject)
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, action, adminNotes } = req.body;
    const adminId = req.user._id || req.user.id;

    if (!paymentId || !action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters"
      });
    }

    const payment = await PaymentVerification.findById(paymentId)
      .populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment verification not found"
      });
    }

    if (payment.verificationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Payment has already been processed"
      });
    }

    // Update payment verification
    payment.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
    payment.verifiedBy = adminId;
    payment.verifiedAt = new Date();
    payment.adminNotes = adminNotes;

    if (action === 'reject') {
      payment.rejectionReason = adminNotes;
    }

    await payment.save();

    // Update booking payment schedule if approved
    if (action === 'approve' && payment.booking) {
      const booking = payment.booking;
      const paymentScheduleItem = booking.paymentSchedule.find(
        item => item.monthNumber === payment.monthNumber
      );

      if (paymentScheduleItem) {
        paymentScheduleItem.status = 'paid';
        paymentScheduleItem.paidDate = payment.paymentDate;
        paymentScheduleItem.paymentProof = payment._id;
        await booking.save();
      }
    }

    // Create notification for user about payment verification result
    try {
      const notificationTitle = action === 'approve' ? 'Payment Approved' : 'Payment Rejected';
      const notificationMessage = action === 'approve'
        ? `Your payment for ${payment.booking.accommodation?.title} - Month ${payment.monthNumber} has been approved.`
        : `Your payment for ${payment.booking.accommodation?.title} - Month ${payment.monthNumber} has been rejected. ${adminNotes ? 'Reason: ' + adminNotes : ''}`;

      await Notification.create({
        user: payment.user,
        title: notificationTitle,
        message: notificationMessage,
        type: action === 'approve' ? 'payment_approved' : 'payment_rejected',
        priority: action === 'approve' ? 'normal' : 'high',
        relatedPayment: payment._id,
        relatedBooking: payment.booking._id,
        actionData: {
          type: 'navigate',
          url: '/user/payments',
          params: { bookingId: payment.booking._id }
        }
      });

      console.log(`Created ${action} notification for user ${payment.user}`);
    } catch (notificationError) {
      console.error("Error creating user notification:", notificationError);
      // Don't fail the verification if notifications fail
    }

    res.json({
      success: true,
      message: `Payment ${action}d successfully`,
      payment
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message
    });
  }
};

// Get user's payment history
export const getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { bookingId } = req.query;

    const filter = { user: userId };
    if (bookingId) {
      filter.booking = bookingId;
    }

    const payments = await PaymentVerification.find(filter)
      .populate({
        path: 'booking',
        select: 'accommodation checkInDate',
        populate: {
          path: 'accommodation',
          select: 'title'
        }
      })
      .sort({ monthNumber: 1, submittedAt: -1 });

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error("Error fetching user payment history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message
    });
  }
};

// Get payment statistics for admin dashboard
export const getPaymentStatistics = async (req, res) => {
  try {
    const stats = await PaymentVerification.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalPayments = await PaymentVerification.countDocuments();
    const pendingPayments = await PaymentVerification.countDocuments({ verificationStatus: 'pending' });
    const approvedPayments = await PaymentVerification.countDocuments({ verificationStatus: 'approved' });
    const rejectedPayments = await PaymentVerification.countDocuments({ verificationStatus: 'rejected' });

    res.json({
      success: true,
      statistics: {
        total: totalPayments,
        pending: pendingPayments,
        approved: approvedPayments,
        rejected: rejectedPayments,
        breakdown: stats
      }
    });

  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
      error: error.message
    });
  }
};
