import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaChartBar, FaUsers, FaExclamationTriangle } from 'react-icons/fa';
import { MobileButton, MobileInput } from './Mobile/MobileLayout';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/UserContext';

/**
 * BookingLimitModal Component
 * Modal for editing individual accommodation booking limits
 */
const BookingLimitModal = ({ 
  isOpen, 
  onClose, 
  accommodation, 
  onSuccess 
}) => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(false);
  const [bookingStats, setBookingStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [formData, setFormData] = useState({
    maxBookings: ''
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when accommodation changes
  useEffect(() => {
    if (accommodation) {
      setFormData({
        maxBookings: accommodation.maxBookings || 20
      });
      fetchBookingStats();
    }
  }, [accommodation]);

  // Fetch current booking statistics
  const fetchBookingStats = async () => {
    if (!accommodation?._id) return;
    
    try {
      setStatsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/stats/${accommodation._id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.data.success) {
        setBookingStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      // Don't show error toast for stats as it's not critical
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    const maxBookings = parseInt(formData.maxBookings);

    if (!formData.maxBookings) {
      newErrors.maxBookings = 'Booking limit is required';
    } else if (isNaN(maxBookings)) {
      newErrors.maxBookings = 'Booking limit must be a number';
    } else if (maxBookings < 1) {
      newErrors.maxBookings = 'Booking limit must be at least 1';
    } else if (maxBookings > 100) {
      newErrors.maxBookings = 'Booking limit cannot exceed 100';
    } else if (bookingStats && maxBookings < bookingStats.bookingCounts.approved) {
      newErrors.maxBookings = `Cannot set limit below current approved bookings (${bookingStats.bookingCounts.approved})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/posts/admin/booking-limits/${accommodation._id}`,
        {
          maxBookings: parseInt(formData.maxBookings)
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Booking limit updated successfully');
        onSuccess && onSuccess(response.data.accommodation);
        onClose();
      }
    } catch (error) {
      console.error('Error updating booking limit:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking limit');
    } finally {
      setLoading(false);
    }
  };

  // Calculate availability metrics
  const getAvailabilityMetrics = () => {
    if (!bookingStats) return null;

    const { approved } = bookingStats.bookingCounts;
    const maxBookings = parseInt(formData.maxBookings) || accommodation?.maxBookings || 20;
    const availableSlots = maxBookings - approved;
    const occupancyRate = ((approved / maxBookings) * 100);

    let status = 'available';
    let statusColor = 'text-green-600';
    let bgColor = 'bg-green-50';

    if (occupancyRate >= 100) {
      status = 'full';
      statusColor = 'text-red-600';
      bgColor = 'bg-red-50';
    } else if (occupancyRate >= 80) {
      status = 'critical';
      statusColor = 'text-orange-600';
      bgColor = 'bg-orange-50';
    } else if (occupancyRate >= 60) {
      status = 'high';
      statusColor = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
    }

    return {
      approved,
      maxBookings,
      availableSlots,
      occupancyRate: occupancyRate.toFixed(1),
      status,
      statusColor,
      bgColor
    };
  };

  const metrics = getAvailabilityMetrics();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-2 rounded-lg">
              <FaChartBar className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Booking Limit</h2>
              <p className="text-sm text-gray-600">{accommodation?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Statistics */}
          {statsLoading ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mcan-primary"></div>
                <span className="ml-2 text-gray-600">Loading statistics...</span>
              </div>
            </div>
          ) : metrics && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Booking Statistics</h3>
              <div className={`p-4 rounded-lg ${metrics.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Occupancy</span>
                  <span className={`text-sm font-semibold ${metrics.statusColor}`}>
                    {metrics.approved}/{metrics.maxBookings} ({metrics.occupancyRate}%)
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metrics.status === 'full' ? 'bg-red-500' :
                      metrics.status === 'critical' ? 'bg-orange-500' :
                      metrics.status === 'high' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(parseFloat(metrics.occupancyRate), 100)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Available: {metrics.availableSlots} slots</span>
                  <span className={`font-medium ${metrics.statusColor} capitalize`}>
                    {metrics.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Bookings
              </label>
              <MobileInput
                type="number"
                name="maxBookings"
                value={formData.maxBookings}
                onChange={handleInputChange}
                placeholder="Enter booking limit (1-100)"
                min="1"
                max="100"
                error={errors.maxBookings}
                icon={FaUsers}
              />
              <p className="mt-1 text-xs text-gray-500">
                Set the maximum number of approved bookings for this accommodation
              </p>
            </div>

            {/* Warning for reducing limits */}
            {bookingStats && parseInt(formData.maxBookings) < bookingStats.bookingCounts.approved && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Warning!</p>
                    <p>
                      You cannot set the limit below the current number of approved bookings 
                      ({bookingStats.bookingCounts.approved}).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview of changes */}
            {metrics && parseInt(formData.maxBookings) !== metrics.maxBookings && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Changes</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Current limit:</span>
                    <span>{metrics.maxBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New limit:</span>
                    <span>{formData.maxBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New available slots:</span>
                    <span>{parseInt(formData.maxBookings) - metrics.approved}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <MobileButton
                type="button"
                onClick={onClose}
                variant="secondary"
                fullWidth
                disabled={loading}
              >
                Cancel
              </MobileButton>
              <MobileButton
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading || Object.keys(errors).length > 0}
                icon={loading ? null : FaSave}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </MobileButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingLimitModal;