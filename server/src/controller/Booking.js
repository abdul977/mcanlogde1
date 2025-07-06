import Booking from "../models/Booking.js";
import Post from "../models/Post.js";
import QuranClass from "../models/QuranClass.js";
import Lecture from "../models/Lecture.js";
import Event from "../models/Event.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

// Utility function to sync accommodation availability based on approved bookings
export const syncAccommodationAvailability = async () => {
  try {
    console.log("Starting accommodation availability sync...");

    // Get all accommodations
    const accommodations = await Post.find({});

    for (const accommodation of accommodations) {
      // Check if there are any approved bookings for this accommodation
      const approvedBooking = await Booking.findOne({
        accommodation: accommodation._id,
        status: 'approved'
      });

      const shouldBeAvailable = !approvedBooking;

      // Update if status doesn't match
      if (accommodation.isAvailable !== shouldBeAvailable) {
        await Post.findByIdAndUpdate(accommodation._id, {
          isAvailable: shouldBeAvailable
        });
        console.log(`Updated accommodation ${accommodation._id} availability to ${shouldBeAvailable}`);
      }
    }

    console.log("Accommodation availability sync completed");
    return { success: true, message: "Sync completed successfully" };
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

      // Check if accommodation exists and is available
      const accommodation = await Post.findById(accommodationId);
      if (!accommodation) {
        return res.status(404).json({
          success: false,
          message: "Accommodation not found"
        });
      }

      if (!accommodation.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "This accommodation is not currently available"
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

    // Update accommodation availability if this is an accommodation booking
    if (booking.bookingType === 'accommodation' && booking.accommodation) {
      const Post = mongoose.model('Post');

      if (status === 'approved') {
        // Mark accommodation as unavailable when booking is approved
        await Post.findByIdAndUpdate(booking.accommodation._id, {
          isAvailable: false
        });
        console.log(`Accommodation ${booking.accommodation._id} marked as unavailable due to approved booking`);
      } else if (status === 'rejected' || status === 'cancelled') {
        // Check if there are any other approved bookings for this accommodation
        const otherApprovedBookings = await Booking.findOne({
          accommodation: booking.accommodation._id,
          status: 'approved',
          _id: { $ne: booking._id } // Exclude current booking
        });

        // If no other approved bookings, mark accommodation as available
        if (!otherApprovedBookings) {
          await Post.findByIdAndUpdate(booking.accommodation._id, {
            isAvailable: true
          });
          console.log(`Accommodation ${booking.accommodation._id} marked as available - no other approved bookings`);
        }
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

    // Update accommodation availability if this is an accommodation booking
    if (booking.bookingType === 'accommodation' && booking.accommodation) {
      const Post = mongoose.model('Post');

      // Check if there are any other approved bookings for this accommodation
      const otherApprovedBookings = await Booking.findOne({
        accommodation: booking.accommodation,
        status: 'approved',
        _id: { $ne: booking._id } // Exclude current booking
      });

      // If no other approved bookings, mark accommodation as available
      if (!otherApprovedBookings) {
        await Post.findByIdAndUpdate(booking.accommodation, {
          isAvailable: true
        });
        console.log(`Accommodation ${booking.accommodation} marked as available after user cancellation`);
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
