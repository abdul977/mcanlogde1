import Post from '../models/Post.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

/**
 * Utility functions for managing booking statistics and availability
 */

/**
 * Update booking statistics for an accommodation atomically
 * @param {string} accommodationId - The accommodation ID
 * @param {Object} session - MongoDB session for transaction (optional)
 * @returns {Promise<Object>} Updated booking statistics
 */
export const updateBookingStats = async (accommodationId, session = null) => {
  try {
    // Calculate current booking counts
    const [approvedCount, pendingCount, totalCount] = await Promise.all([
      Booking.countDocuments({
        accommodation: accommodationId,
        status: 'approved'
      }).session(session),
      Booking.countDocuments({
        accommodation: accommodationId,
        status: 'pending'
      }).session(session),
      Booking.countDocuments({
        accommodation: accommodationId,
        status: { $in: ['approved', 'pending', 'rejected', 'cancelled'] }
      }).session(session)
    ]);

    // Update the accommodation with new statistics
    const updatedPost = await Post.findByIdAndUpdate(
      accommodationId,
      {
        $set: {
          'bookingStats.approvedCount': approvedCount,
          'bookingStats.pendingCount': pendingCount,
          'bookingStats.totalCount': totalCount,
          'bookingStats.lastUpdated': new Date()
        }
      },
      { 
        new: true, 
        session,
        runValidators: true 
      }
    );

    if (!updatedPost) {
      throw new Error(`Accommodation with ID ${accommodationId} not found`);
    }

    // The isAvailable field will be automatically updated by the pre-save middleware
    console.log(`Updated booking stats for accommodation ${accommodationId}:`, {
      approved: approvedCount,
      pending: pendingCount,
      total: totalCount,
      maxBookings: updatedPost.maxBookings,
      isAvailable: updatedPost.isAvailable
    });

    return {
      approvedCount,
      pendingCount,
      totalCount,
      maxBookings: updatedPost.maxBookings,
      isAvailable: updatedPost.isAvailable
    };

  } catch (error) {
    console.error(`Error updating booking stats for accommodation ${accommodationId}:`, error);
    throw error;
  }
};

/**
 * Increment booking statistics when a booking status changes
 * @param {string} accommodationId - The accommodation ID
 * @param {string} oldStatus - Previous booking status
 * @param {string} newStatus - New booking status
 * @param {Object} session - MongoDB session for transaction (optional)
 * @returns {Promise<Object>} Updated booking statistics
 */
export const incrementBookingStats = async (accommodationId, oldStatus, newStatus, session = null) => {
  try {
    const updateOperations = {};

    // Handle status transitions
    if (oldStatus !== 'approved' && newStatus === 'approved') {
      updateOperations['$inc'] = { 'bookingStats.approvedCount': 1 };
    } else if (oldStatus === 'approved' && newStatus !== 'approved') {
      updateOperations['$inc'] = { 'bookingStats.approvedCount': -1 };
    }

    if (oldStatus !== 'pending' && newStatus === 'pending') {
      updateOperations['$inc'] = { ...updateOperations['$inc'], 'bookingStats.pendingCount': 1 };
    } else if (oldStatus === 'pending' && newStatus !== 'pending') {
      updateOperations['$inc'] = { ...updateOperations['$inc'], 'bookingStats.pendingCount': -1 };
    }

    // Always update the lastUpdated timestamp
    updateOperations['$set'] = { 'bookingStats.lastUpdated': new Date() };

    if (Object.keys(updateOperations['$inc'] || {}).length > 0) {
      const updatedPost = await Post.findByIdAndUpdate(
        accommodationId,
        updateOperations,
        { 
          new: true, 
          session,
          runValidators: true 
        }
      );

      if (!updatedPost) {
        throw new Error(`Accommodation with ID ${accommodationId} not found`);
      }

      console.log(`Incremented booking stats for accommodation ${accommodationId}:`, {
        oldStatus,
        newStatus,
        approved: updatedPost.bookingStats.approvedCount,
        pending: updatedPost.bookingStats.pendingCount,
        isAvailable: updatedPost.isAvailable
      });

      return {
        approvedCount: updatedPost.bookingStats.approvedCount,
        pendingCount: updatedPost.bookingStats.pendingCount,
        totalCount: updatedPost.bookingStats.totalCount,
        maxBookings: updatedPost.maxBookings,
        isAvailable: updatedPost.isAvailable
      };
    }

    // If no increment needed, just update timestamp and return current stats
    const post = await Post.findByIdAndUpdate(
      accommodationId,
      updateOperations,
      { new: true, session }
    );

    return {
      approvedCount: post.bookingStats.approvedCount,
      pendingCount: post.bookingStats.pendingCount,
      totalCount: post.bookingStats.totalCount,
      maxBookings: post.maxBookings,
      isAvailable: post.isAvailable
    };

  } catch (error) {
    console.error(`Error incrementing booking stats for accommodation ${accommodationId}:`, error);
    throw error;
  }
};

/**
 * Check if an accommodation is available for booking
 * @param {string} accommodationId - The accommodation ID
 * @returns {Promise<Object>} Availability information
 */
export const checkAccommodationAvailability = async (accommodationId) => {
  try {
    const accommodation = await Post.findById(accommodationId).select('maxBookings bookingStats isAvailable title');
    
    if (!accommodation) {
      throw new Error(`Accommodation with ID ${accommodationId} not found`);
    }

    const approvedCount = accommodation.bookingStats?.approvedCount || 0;
    const availableSlots = accommodation.maxBookings - approvedCount;

    return {
      accommodationId,
      title: accommodation.title,
      maxBookings: accommodation.maxBookings,
      approvedCount,
      availableSlots,
      isAvailable: accommodation.isAvailable,
      canBook: availableSlots > 0
    };

  } catch (error) {
    console.error(`Error checking availability for accommodation ${accommodationId}:`, error);
    throw error;
  }
};

/**
 * Get booking statistics for multiple accommodations
 * @param {Array<string>} accommodationIds - Array of accommodation IDs
 * @returns {Promise<Array>} Array of booking statistics
 */
export const getBulkBookingStats = async (accommodationIds) => {
  try {
    const accommodations = await Post.find({
      _id: { $in: accommodationIds }
    }).select('title maxBookings bookingStats isAvailable');

    return accommodations.map(acc => ({
      accommodationId: acc._id,
      title: acc.title,
      maxBookings: acc.maxBookings,
      bookingStats: acc.bookingStats,
      isAvailable: acc.isAvailable,
      availableSlots: acc.maxBookings - (acc.bookingStats?.approvedCount || 0)
    }));

  } catch (error) {
    console.error('Error getting bulk booking stats:', error);
    throw error;
  }
};