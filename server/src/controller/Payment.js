import PaymentVerification from "../models/PaymentVerification.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import PaymentNotificationService from "../services/PaymentNotificationService.js";
import PaymentReceiptService from "../services/PaymentReceiptService.js";
import PaymentExportService from "../services/PaymentExportService.js";
import PaymentAuditService from "../services/PaymentAuditService.js";
import { getFileUrl, validatePaymentProofFile, getFileType } from "../utils/fileUpload.js";
import path from 'path';
import fs from 'fs';

// Submit payment proof
export const submitPaymentProof = async (req, res) => {
  try {
    console.log('=== Payment Proof Submission Started ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    if (req.files && req.files.paymentScreenshot) {
      console.log('File details:', {
        name: req.files.paymentScreenshot.name,
        size: req.files.paymentScreenshot.size,
        mimetype: req.files.paymentScreenshot.mimetype,
        tempFilePath: req.files.paymentScreenshot.tempFilePath
      });
    }
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

    // Handle express-fileupload format
    let uploadedFile = null;

    if (req.files && req.files.paymentScreenshot) {
      // Express-fileupload format
      const file = req.files.paymentScreenshot;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only image files (JPEG, PNG, GIF) and PDF files are allowed"
        });
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 10MB"
        });
      }

      uploadedFile = {
        filename: `payment_${bookingId}_${monthNumber}_${Date.now()}${path.extname(file.name)}`,
        originalname: file.name,
        size: file.size,
        mimetype: file.mimetype,
        tempFilePath: file.tempFilePath
      };
    }

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required"
      });
    }

    // File validation is already done above, so we can skip this step

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

    // Handle file saving for express-fileupload format
    const uploadDir = path.join(process.cwd(), 'src', 'uploads', 'payments', 'screenshots');

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file from temp location to permanent location
    const finalPath = path.join(uploadDir, uploadedFile.filename);
    try {
      await req.files.paymentScreenshot.mv(finalPath);
      console.log(`File saved successfully to: ${finalPath}`);
    } catch (moveError) {
      console.error("Error moving file:", moveError);
      return res.status(500).json({
        success: false,
        message: "Failed to save payment proof file"
      });
    }

    // Create payment verification record
    const paymentVerification = new PaymentVerification({
      booking: bookingId,
      user: userId,
      monthNumber: parseInt(monthNumber),
      amount: parseFloat(amount),
      paymentProof: {
        url: getFileUrl(uploadedFile.filename),
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
        fileType: getFileType(uploadedFile.mimetype)
      },
      // Keep legacy field for backward compatibility
      paymentScreenshot: {
        url: getFileUrl(uploadedFile.filename),
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype
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

    // Create notification for admins using notification service
    try {
      await PaymentNotificationService.notifyPaymentSubmission(paymentVerification);
    } catch (notificationError) {
      console.error("Error creating admin notifications:", notificationError);
      // Don't fail the payment submission if notifications fail
    }

    // Log audit trail
    try {
      await PaymentAuditService.logPaymentSubmission(paymentVerification, req.user, req);
    } catch (auditError) {
      console.error("Error logging payment submission audit:", auditError);
      // Don't fail the payment submission if audit logging fails
    }

    res.status(201).json({
      success: true,
      message: "Payment proof submitted successfully",
      paymentVerification
    });

  } catch (error) {
    console.error("=== Payment Proof Submission Error ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
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

    // Store previous status for audit
    const previousStatus = payment.verificationStatus;

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
        paymentScheduleItem.paidAmount = payment.amount;
        paymentScheduleItem.verificationId = payment._id;

        // Check if all payments are completed
        const allPaid = booking.paymentSchedule.every(item => item.status === 'paid');
        if (allPaid) {
          booking.paymentStatus = 'completed';
        } else {
          booking.paymentStatus = 'partial';
        }

        await booking.save();
        console.log(`Updated payment schedule for booking ${booking._id}, month ${payment.monthNumber}`);
      }
    } else if (action === 'reject' && payment.booking) {
      // If rejected, ensure payment schedule reflects pending status
      const booking = payment.booking;
      const paymentScheduleItem = booking.paymentSchedule.find(
        item => item.monthNumber === payment.monthNumber
      );
      if (paymentScheduleItem && paymentScheduleItem.status !== 'paid') {
        paymentScheduleItem.status = 'pending';
        await booking.save();
      }
    }

    // Generate receipt for approved payments
    if (action === 'approve') {
      try {
        const receipt = await PaymentReceiptService.generateReceipt(payment);
        payment.receiptUrl = `/uploads/receipts/${receipt.filename}`;
        payment.receiptNumber = receipt.receiptNumber;
        await payment.save();
        console.log(`Generated receipt ${receipt.receiptNumber} for payment ${payment._id}`);
      } catch (receiptError) {
        console.error("Error generating payment receipt:", receiptError);
        // Don't fail the verification if receipt generation fails
      }
    }

    // Create notification for user about payment verification result
    try {
      await PaymentNotificationService.notifyPaymentDecision(payment, action, adminNotes);
    } catch (notificationError) {
      console.error("Error creating user notification:", notificationError);
      // Don't fail the verification if notifications fail
    }

    // Log audit trail
    try {
      await PaymentAuditService.logPaymentVerification(payment, req.user, action, adminNotes, previousStatus, req);
    } catch (auditError) {
      console.error("Error logging payment verification audit:", auditError);
      // Don't fail the verification if audit logging fails
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

// Download payment receipt
export const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id || req.user.id;

    // Find payment verification
    const payment = await PaymentVerification.findById(paymentId)
      .populate('user', 'name email')
      .populate('booking', 'accommodation', { populate: { path: 'accommodation', select: 'title' } });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check if user owns this payment or is admin
    const isOwner = payment.user._id.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Check if payment is approved
    if (payment.verificationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: "Receipt is only available for approved payments"
      });
    }

    // Generate receipt if it doesn't exist
    if (!payment.receiptUrl) {
      try {
        const receipt = await PaymentReceiptService.generateReceipt(payment);
        payment.receiptUrl = `/uploads/receipts/${receipt.filename}`;
        payment.receiptNumber = receipt.receiptNumber;
        await payment.save();
      } catch (receiptError) {
        console.error("Error generating receipt:", receiptError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate receipt"
        });
      }
    }

    // Get file path
    const filename = payment.receiptUrl.split('/').pop();
    const filepath = path.join(process.cwd(), 'uploads', 'receipts', filename);

    // Check if file exists
    if (!require('fs').existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: "Receipt file not found"
      });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt_${payment.receiptNumber}.pdf"`);

    // Log audit trail
    try {
      await PaymentAuditService.logReceiptDownload(payment, req.user, req);
    } catch (auditError) {
      console.error("Error logging receipt download audit:", auditError);
      // Don't fail the download if audit logging fails
    }

    // Stream file
    const fileStream = require('fs').createReadStream(filepath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Error downloading receipt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download receipt",
      error: error.message
    });
  }
};

// Export payments to Excel
export const exportPaymentsExcel = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      paymentMethod,
      includeUserDetails = true,
      includeBookingDetails = true,
      includeFinancialSummary = true
    } = req.query;

    const filters = {
      startDate,
      endDate,
      status,
      paymentMethod
    };

    const options = {
      includeUserDetails: includeUserDetails === 'true',
      includeBookingDetails: includeBookingDetails === 'true',
      includeFinancialSummary: includeFinancialSummary === 'true'
    };

    const exportResult = await PaymentExportService.exportToExcel(filters, options);

    // Log audit trail
    try {
      await PaymentAuditService.logPaymentExport(req.user, {
        format: 'excel',
        filters,
        recordCount: exportResult.recordCount,
        filename: exportResult.filename
      }, req);
    } catch (auditError) {
      console.error("Error logging export audit:", auditError);
      // Don't fail the export if audit logging fails
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

    // Stream file
    const fileStream = require('fs').createReadStream(exportResult.filepath);
    fileStream.pipe(res);

    // Clean up file after download (optional)
    fileStream.on('end', () => {
      setTimeout(() => {
        try {
          require('fs').unlinkSync(exportResult.filepath);
        } catch (error) {
          console.error('Error cleaning up export file:', error);
        }
      }, 5000); // Delete after 5 seconds
    });

  } catch (error) {
    console.error("Error exporting payments to Excel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export payments",
      error: error.message
    });
  }
};

// Export payments to CSV
export const exportPaymentsCSV = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      paymentMethod
    } = req.query;

    const filters = {
      startDate,
      endDate,
      status,
      paymentMethod
    };

    const exportResult = await PaymentExportService.exportToCSV(filters);

    // Log audit trail
    try {
      await PaymentAuditService.logPaymentExport(req.user, {
        format: 'csv',
        filters,
        recordCount: exportResult.recordCount,
        filename: exportResult.filename
      }, req);
    } catch (auditError) {
      console.error("Error logging export audit:", auditError);
      // Don't fail the export if audit logging fails
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

    // Stream file
    const fileStream = require('fs').createReadStream(exportResult.filepath);
    fileStream.pipe(res);

    // Clean up file after download
    fileStream.on('end', () => {
      setTimeout(() => {
        try {
          require('fs').unlinkSync(exportResult.filepath);
        } catch (error) {
          console.error('Error cleaning up export file:', error);
        }
      }, 5000);
    });

  } catch (error) {
    console.error("Error exporting payments to CSV:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export payments",
      error: error.message
    });
  }
};

// Get audit trail for a payment
export const getPaymentAuditTrail = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { page = 1, limit = 20, category, action } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      action
    };

    const auditTrail = await PaymentAuditService.getPaymentAuditTrail(paymentId, options);

    res.json({
      success: true,
      auditTrail: auditTrail.logs,
      pagination: auditTrail.pagination
    });

  } catch (error) {
    console.error("Error fetching payment audit trail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit trail",
      error: error.message
    });
  }
};

// Get audit statistics (admin only)
export const getAuditStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const options = {
      startDate,
      endDate
    };

    const statistics = await PaymentAuditService.getAuditStatistics(options);

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error("Error fetching audit statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit statistics",
      error: error.message
    });
  }
};
