import Booking from "../models/Booking.js";
import Post from "../models/Post.js";
import QuranClass from "../models/QuranClass.js";
import Lecture from "../models/Lecture.js";
import Event from "../models/Event.js";
import Message from "../models/Message.js";
import PaymentReminder from "../models/PaymentReminder.js";
import mongoose from "mongoose";
import { checkAccommodationAvailability, updateBookingStats, incrementBookingStats } from "../utils/bookingStatsUtils.js";

// Utility function to generate payment schedule for yearly bookings
const generatePaymentSchedule = (startDate, duration, monthlyAmount) => {
  const schedule = [];
  const start = new Date(startDate);

  for (let i = 0; i < duration; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      monthNumber: i + 1,
      dueDate: dueDate,
      amount: monthlyAmount,
      status: "pending"
    });
  }

  return schedule;
};

// Enhanced utility function to sync accommodation availability using count-based system
export const syncAccommodationAvailability = async () => {
  try {
    console.log("Starting accommodation availability sync with count-based system...");

    // Get all accommodations
    const accommodations = await Post.find({});
    console.log(`Found ${accommodations.length} accommodations to sync`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const accommodation of accommodations) {
      try {
        // Update booking statistics for this accommodation
        const updatedStats = await updateBookingStats(accommodation._id);
        
        syncedCount++;
        console.log(`Synced accommodation ${accommodation._id} (${accommodation.title}):`, {
          approvedCount: updatedStats.approvedCount,
          maxBookings: updatedStats.maxBookings,
          isAvailable: updatedStats.isAvailable,
          availableSlots: updatedStats.maxBookings - updatedStats.approvedCount
        });

      } catch (error) {
        errorCount++;
        console.error(`Error syncing accommodation ${accommodation._id}:`, error.message);
      }
    }

    console.log("Accommodation availability sync completed");
    console.log(`Successfully synced: ${syncedCount}, Errors: ${errorCount}`);
    
    return {
      success: true,
      message: "Sync completed successfully",
      stats: {
        total: accommodations.length,
        synced: syncedCount,
        errors: errorCount
      }
    };
  } catch (error) {
    console.error("Error syncing accommodation availability:", error);
    return { success: false, error: error.message };
  }
};

// Create a new booking request
export const createBookingController = async (req, res) => {
  try {
    console.log("=== Booking Creation Debug ===");
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);

    const {
      bookingType,
      accommodationId,
      programId,
      programModel,
      checkInDate,
      checkOutDate,
      bookingDuration,
      totalAmount,
      numberOfGuests,
      userNotes,
      contactInfo,
      enrollmentDetails
    } = req.body;

    const userId = req.user._id || req.user.id;
    console.log("Extracted userId:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in authentication token"
      });
    }

    // Validate required fields based on booking type
    if (bookingType === 'accommodation') {
      if (!accommodationId) {
        return res.status(400).json({
          success: false,
          message: "Accommodation ID is required for accommodation bookings"
        });
      }

      // Check if accommodation exists and is available using new count-based logic
      const accommodation = await Post.findById(accommodationId);
      if (!accommodation) {
        return res.status(404).json({
          success: false,
          message: "Accommodation not found"
        });
      }

      // Use the new availability checking utility
      const availabilityInfo = await checkAccommodationAvailability(accommodationId);
      
      if (!availabilityInfo.canBook) {
        return res.status(400).json({
          success: false,
          message: `This accommodation is fully booked. ${availabilityInfo.approvedCount}/${availabilityInfo.maxBookings} slots are occupied.`,
          availabilityInfo
        });
      }

      // Check for existing pending/approved bookings for the same accommodation
      const existingBooking = await Booking.findOne({
        user: userId,
        accommodation: accommodationId,
        status: { $in: ['pending', 'approved'] }
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending or approved booking for this accommodation"
        });
      }
    } else {
      // For program bookings
      if (!programId || !programModel) {
        return res.status(400).json({
          success: false,
          message: "Program ID and model are required for program bookings"
        });
      }

      // Validate program exists
      let program;
      switch (programModel) {
        case 'QuranClass':
          program = await QuranClass.findById(programId);
          break;
        case 'Lecture':
          program = await Lecture.findById(programId);
          break;
        case 'Event':
          program = await Event.findById(programId);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid program model"
          });
      }

      if (!program) {
        return res.status(404).json({
          success: false,
          message: "Program not found"
        });
      }

      // Check for existing enrollment
      const existingEnrollment = await Booking.findOne({
        user: userId,
        program: programId,
        programModel,
        status: { $in: ['pending', 'approved'] }
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending or approved enrollment for this program"
        });
      }
    }

    // Create booking
    const bookingData = {
      user: userId,
      bookingType,
      userNotes,
      contactInfo
    };

    if (bookingType === 'accommodation') {
      bookingData.accommodation = accommodationId;
      bookingData.checkInDate = checkInDate;
      bookingData.checkOutDate = checkOutDate;
      bookingData.numberOfGuests = numberOfGuests;

      // Get accommodation for pricing
      const accommodation = await Post.findById(accommodationId);
      const monthlyAmount = accommodation.price;

      // Handle booking duration and payment schedule
      if (bookingDuration && bookingDuration.months > 1) {
        // Multi-month booking
        bookingData.bookingDuration = bookingDuration;
        bookingData.totalAmount = totalAmount;

        // Generate payment schedule for multiple months
        bookingData.paymentSchedule = generatePaymentSchedule(
          checkInDate,
          bookingDuration.months,
          monthlyAmount
        );
      } else {
        // Single month booking - still create payment schedule
        bookingData.totalAmount = monthlyAmount;
        bookingData.bookingDuration = {
          months: 1,
          startDate: checkInDate,
          endDate: checkOutDate
        };

        // Generate payment schedule for single month
        bookingData.paymentSchedule = generatePaymentSchedule(
          checkInDate,
          1,
          monthlyAmount
        );
      }
    } else {
      bookingData.program = programId;
      bookingData.programModel = programModel;
      bookingData.enrollmentDetails = enrollmentDetails;
    }

    const newBooking = new Booking(bookingData);
    await newBooking.save();

    // Populate the booking for response
    await newBooking.populate([
      { path: 'user', select: 'name email' },
      { path: 'accommodation', select: 'title location price accommodationType' },
      { path: 'program' }
    ]);

    // Send notification message to admin
    const adminUsers = await mongoose.model('User').find({ role: 'admin' });
    const notificationPromises = adminUsers.map(admin => {
      const threadId = Message.generateThreadId(userId, admin._id);
      const notificationMessage = new Message({
        sender: userId,
        recipient: admin._id,
        content: `New ${bookingType} booking request submitted. Booking ID: ${newBooking._id}`,
        messageType: 'booking_update',
        relatedBooking: newBooking._id,
        threadId,
        priority: 'normal'
      });
      return notificationMessage.save();
    });

    await Promise.all(notificationPromises);

    // Create payment reminders for accommodation bookings
    if (bookingType === 'accommodation' && newBooking.paymentSchedule && newBooking.paymentSchedule.length > 0) {
      try {
        const reminderPromises = newBooking.paymentSchedule.map(payment => {
          return PaymentReminder.createUpcomingReminder(
            newBooking,
            payment.monthNumber,
            payment.dueDate,
            payment.amount
          );
        });

        await Promise.all(reminderPromises);
        console.log(`Created ${reminderPromises.length} payment reminders for booking ${newBooking._id}`);
      } catch (reminderError) {
        console.error("Error creating payment reminders:", reminderError);
        // Don't fail the booking creation if reminders fail
      }
    }

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      booking: newBooking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking request",
      error: error.message
    });
  }
};

// Get user's bookings
export const getUserBookingsController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status, bookingType, page = 1, limit = 10 } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;
    if (bookingType) filter.bookingType = bookingType;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('accommodation', 'title location price accommodationType images')
      .populate('program')
      .sort({ requestDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalBookings: total
      }
    });

  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

// Get all bookings (admin only)
export const getAllBookingsController = async (req, res) => {
  try {
    const { status, bookingType, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (bookingType) filter.bookingType = bookingType;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('accommodation', 'title location price accommodationType')
      .populate('program')
      .sort({ requestDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Booking.countDocuments(filter);

    // Get booking statistics
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      bookings,
      stats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalBookings: total
      }
    });

  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

// Update booking status (admin only)
export const updateBookingStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user._id || req.user.id;

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be approved, rejected, or cancelled"
      });
    }

    const booking = await Booking.findById(id)
      .populate('user', 'name email')
      .populate('accommodation', 'title')
      .populate('program');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Update booking
    booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;
    await booking.save();

    // Update accommodation booking statistics if this is an accommodation booking
    if (booking.bookingType === 'accommodation' && booking.accommodation) {
      try {
        const oldStatus = booking.status;
        
        // Update booking statistics using the new count-based system
        const updatedStats = await incrementBookingStats(
          booking.accommodation._id,
          oldStatus,
          status
        );

        console.log(`Updated booking statistics for accommodation ${booking.accommodation._id}:`, {
          oldStatus,
          newStatus: status,
          approvedCount: updatedStats.approvedCount,
          maxBookings: updatedStats.maxBookings,
          isAvailable: updatedStats.isAvailable,
          availableSlots: updatedStats.maxBookings - updatedStats.approvedCount
        });

      } catch (statsError) {
        console.error(`Error updating booking statistics for accommodation ${booking.accommodation._id}:`, statsError);
        // Don't fail the booking status update if stats update fails
        // Fall back to the old method as a safety measure
        await updateBookingStats(booking.accommodation._id);
      }
    }

    // Send notification to user
    const threadId = Message.generateThreadId(adminId, booking.user._id);
    const statusMessages = {
      approved: `Your ${booking.bookingType} booking has been approved!`,
      rejected: `Your ${booking.bookingType} booking has been rejected. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
      cancelled: `Your ${booking.bookingType} booking has been cancelled. ${adminNotes ? 'Reason: ' + adminNotes : ''}`
    };

    const notificationMessage = new Message({
      sender: adminId,
      recipient: booking.user._id,
      content: statusMessages[status],
      messageType: 'booking_update',
      relatedBooking: booking._id,
      threadId,
      priority: status === 'approved' ? 'high' : 'normal'
    });

    await notificationMessage.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message
    });
  }
};

// Get single booking details
export const getBookingController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate('user', 'name email')
      .populate('accommodation', 'title location price accommodationType images facilities')
      .populate('program');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check authorization - users can only see their own bookings, admins can see all
    if (userRole !== 'admin' && booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      booking
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message
    });
  }
};

// Cancel booking (user only)
export const cancelBookingController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Check if booking can be cancelled
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled"
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Update accommodation booking statistics if this is an accommodation booking
    if (booking.bookingType === 'accommodation' && booking.accommodation) {
      try {
        const oldStatus = booking.status;
        
        // Update booking statistics using the new count-based system
        const updatedStats = await incrementBookingStats(
          booking.accommodation,
          oldStatus,
          'cancelled'
        );

        console.log(`Updated booking statistics after user cancellation for accommodation ${booking.accommodation}:`, {
          oldStatus,
          newStatus: 'cancelled',
          approvedCount: updatedStats.approvedCount,
          maxBookings: updatedStats.maxBookings,
          isAvailable: updatedStats.isAvailable,
          availableSlots: updatedStats.maxBookings - updatedStats.approvedCount
        });

      } catch (statsError) {
        console.error(`Error updating booking statistics for accommodation ${booking.accommodation}:`, statsError);
        // Fall back to the old method as a safety measure
        await updateBookingStats(booking.accommodation);
      }
    }

    // Notify admin
    const adminUsers = await mongoose.model('User').find({ role: 'admin' });
    const notificationPromises = adminUsers.map(admin => {
      const threadId = Message.generateThreadId(userId, admin._id);
      const notificationMessage = new Message({
        sender: userId,
        recipient: admin._id,
        content: `User has cancelled their ${booking.bookingType} booking. Booking ID: ${booking._id}`,
        messageType: 'booking_update',
        relatedBooking: booking._id,
        threadId,
        priority: 'normal'
      });
      return notificationMessage.save();
    });

    await Promise.all(notificationPromises);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message
    });
  }
};

// Get overdue payments (admin only)
export const getOverduePayments = async (req, res) => {
  try {
    const now = new Date();

    // Find all approved bookings with payment schedules
    const bookings = await Booking.find({
      status: 'approved',
      'paymentSchedule.0': { $exists: true }
    })
    .populate('user', 'name email phone')
    .populate('accommodation', 'title location price')
    .sort({ requestDate: -1 });

    const overduePayments = [];

    // Process each booking to find overdue payments
    bookings.forEach(booking => {
      if (booking.paymentSchedule && booking.paymentSchedule.length > 0) {
        booking.paymentSchedule.forEach(payment => {
          if (payment.status === 'pending' || payment.status === 'overdue') {
            const dueDate = new Date(payment.dueDate);
            const daysPastDue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));

            if (daysPastDue > 0) {
              // Calculate escalation level based on days overdue
              let escalationLevel = 'normal';
              if (daysPastDue >= 30) escalationLevel = 'critical';
              else if (daysPastDue >= 21) escalationLevel = 'final';
              else if (daysPastDue >= 14) escalationLevel = 'firm';
              else if (daysPastDue >= 7) escalationLevel = 'gentle';

              overduePayments.push({
                bookingId: booking._id,
                bookingType: booking.bookingType,
                user: {
                  _id: booking.user._id,
                  name: booking.user.name,
                  email: booking.user.email,
                  phone: booking.user.phone
                },
                accommodation: booking.accommodation ? {
                  _id: booking.accommodation._id,
                  title: booking.accommodation.title,
                  location: booking.accommodation.location,
                  price: booking.accommodation.price
                } : null,
                payment: {
                  monthNumber: payment.monthNumber,
                  dueDate: payment.dueDate,
                  amount: payment.amount,
                  status: payment.status,
                  overdueSince: payment.overdueSince
                },
                daysPastDue,
                escalationLevel,
                totalAmount: booking.totalAmount,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                requestDate: booking.requestDate
              });
            }
          }
        });
      }
    });

    // Sort by days past due (most overdue first)
    overduePayments.sort((a, b) => b.daysPastDue - a.daysPastDue);

    // Calculate summary statistics
    const summary = {
      totalOverdue: overduePayments.length,
      totalAmount: overduePayments.reduce((sum, payment) => sum + payment.payment.amount, 0),
      escalationBreakdown: {
        gentle: overduePayments.filter(p => p.escalationLevel === 'gentle').length,
        firm: overduePayments.filter(p => p.escalationLevel === 'firm').length,
        final: overduePayments.filter(p => p.escalationLevel === 'final').length,
        critical: overduePayments.filter(p => p.escalationLevel === 'critical').length
      },
      averageDaysOverdue: overduePayments.length > 0
        ? Math.round(overduePayments.reduce((sum, p) => sum + p.daysPastDue, 0) / overduePayments.length)
        : 0
    };

    res.status(200).json({
      success: true,
      message: "Overdue payments retrieved successfully",
      overduePayments,
      summary,
      total: overduePayments.length
    });

  } catch (error) {
    console.error("Error fetching overdue payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching overdue payments",
      error: error.message
    });
  }
};

// Get booking statistics for a specific accommodation
export const getAccommodationBookingStats = async (req, res) => {
  try {
    const { accommodationId } = req.params;

    // Validate accommodation exists
    const accommodation = await Post.findById(accommodationId).select('title maxBookings bookingStats isAvailable');
    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found"
      });
    }

    // Get detailed booking breakdown
    const [approvedBookings, pendingBookings, rejectedBookings, cancelledBookings] = await Promise.all([
      Booking.find({ accommodation: accommodationId, status: 'approved' })
        .populate('user', 'name email')
        .select('user checkInDate checkOutDate requestDate totalAmount'),
      Booking.find({ accommodation: accommodationId, status: 'pending' })
        .populate('user', 'name email')
        .select('user checkInDate checkOutDate requestDate totalAmount'),
      Booking.find({ accommodation: accommodationId, status: 'rejected' })
        .populate('user', 'name email')
        .select('user checkInDate checkOutDate requestDate totalAmount adminNotes'),
      Booking.find({ accommodation: accommodationId, status: 'cancelled' })
        .populate('user', 'name email')
        .select('user checkInDate checkOutDate requestDate totalAmount')
    ]);

    const stats = {
      accommodationInfo: {
        id: accommodation._id,
        title: accommodation.title,
        maxBookings: accommodation.maxBookings,
        isAvailable: accommodation.isAvailable
      },
      bookingCounts: {
        approved: approvedBookings.length,
        pending: pendingBookings.length,
        rejected: rejectedBookings.length,
        cancelled: cancelledBookings.length,
        total: approvedBookings.length + pendingBookings.length + rejectedBookings.length + cancelledBookings.length
      },
      availability: {
        availableSlots: accommodation.maxBookings - approvedBookings.length,
        occupancyRate: ((approvedBookings.length / accommodation.maxBookings) * 100).toFixed(2),
        canAcceptBookings: approvedBookings.length < accommodation.maxBookings
      },
      bookingDetails: {
        approved: approvedBookings,
        pending: pendingBookings,
        rejected: rejectedBookings,
        cancelled: cancelledBookings
      },
      lastUpdated: accommodation.bookingStats?.lastUpdated || new Date()
    };

    res.status(200).json({
      success: true,
      message: "Booking statistics retrieved successfully",
      stats
    });

  } catch (error) {
    console.error("Error fetching accommodation booking stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking statistics",
      error: error.message
    });
  }
};

// Get booking overview for all accommodations (admin only)
export const getBookingOverview = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'occupancyRate', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Get all accommodations with their booking statistics
    const accommodations = await Post.find({})
      .select('title location maxBookings bookingStats isAvailable createdAt')
      .sort({ createdAt: -1 });

    // Calculate detailed statistics for each accommodation
    const accommodationStats = await Promise.all(
      accommodations.map(async (accommodation) => {
        const [approvedCount, pendingCount, totalCount] = await Promise.all([
          Booking.countDocuments({ accommodation: accommodation._id, status: 'approved' }),
          Booking.countDocuments({ accommodation: accommodation._id, status: 'pending' }),
          Booking.countDocuments({ accommodation: accommodation._id })
        ]);

        const availableSlots = accommodation.maxBookings - approvedCount;
        const occupancyRate = ((approvedCount / accommodation.maxBookings) * 100);

        return {
          accommodationId: accommodation._id,
          title: accommodation.title,
          location: accommodation.location,
          maxBookings: accommodation.maxBookings,
          bookingCounts: {
            approved: approvedCount,
            pending: pendingCount,
            total: totalCount
          },
          availability: {
            availableSlots,
            occupancyRate: parseFloat(occupancyRate.toFixed(2)),
            isAvailable: accommodation.isAvailable,
            canAcceptBookings: availableSlots > 0
          },
          lastUpdated: accommodation.bookingStats?.lastUpdated || accommodation.createdAt
        };
      })
    );

    // Sort the results
    accommodationStats.sort((a, b) => {
      const aValue = a.availability[sortBy] || a.bookingCounts[sortBy] || 0;
      const bValue = b.availability[sortBy] || b.bookingCounts[sortBy] || 0;
      
      if (sortOrder === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });

    // Apply pagination
    const paginatedStats = accommodationStats.slice(skip, skip + parseInt(limit));

    // Calculate summary statistics
    const summary = {
      totalAccommodations: accommodations.length,
      availableAccommodations: accommodationStats.filter(acc => acc.availability.canAcceptBookings).length,
      fullyBookedAccommodations: accommodationStats.filter(acc => !acc.availability.canAcceptBookings).length,
      totalBookingSlots: accommodationStats.reduce((sum, acc) => sum + acc.maxBookings, 0),
      totalApprovedBookings: accommodationStats.reduce((sum, acc) => sum + acc.bookingCounts.approved, 0),
      totalPendingBookings: accommodationStats.reduce((sum, acc) => sum + acc.bookingCounts.pending, 0),
      averageOccupancyRate: parseFloat(
        (accommodationStats.reduce((sum, acc) => sum + acc.availability.occupancyRate, 0) / accommodations.length).toFixed(2)
      )
    };

    res.status(200).json({
      success: true,
      message: "Booking overview retrieved successfully",
      summary,
      accommodations: paginatedStats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(accommodations.length / limit),
        count: paginatedStats.length,
        totalAccommodations: accommodations.length
      }
    });

  } catch (error) {
    console.error("Error fetching booking overview:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking overview",
      error: error.message
    });
  }
};
