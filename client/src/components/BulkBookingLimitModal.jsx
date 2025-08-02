import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUsers, FaCheckSquare, FaSquare, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { MobileButton, MobileInput } from './Mobile/MobileLayout';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/UserContext';

/**
 * BulkBookingLimitModal Component
 * Modal for bulk updating booking limits for multiple accommodations
 */
const BulkBookingLimitModal = ({ 
  isOpen, 
  onClose, 
  accommodations = [], 
  onSuccess 
}) => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAccommodations, setSelectedAccommodations] = useState(new Set());
  const [bulkLimit, setBulkLimit] = useState('');
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedAccommodations(new Set());
      setBulkLimit('');
      setErrors({});
      setProgress({ current: 0, total: 0 });
    }
  }, [isOpen]);

  // Handle accommodation selection
  const handleAccommodationToggle = (accommodationId) => {
    setSelectedAccommodations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accommodationId)) {
        newSet.delete(accommodationId);
      } else {
        newSet.add(accommodationId);
      }
      return newSet;
    });
  };

  // Select all accommodations
  const handleSelectAll = () => {
    if (selectedAccommodations.size === accommodations.length) {
      setSelectedAccommodations(new Set());
    } else {
      setSelectedAccommodations(new Set(accommodations.map(acc => acc._id)));
    }
  };

  // Handle bulk limit input change
  const handleBulkLimitChange = (e) => {
    setBulkLimit(e.target.value);
    if (errors.bulkLimit) {
      setErrors(prev => ({ ...prev, bulkLimit: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (selectedAccommodations.size === 0) {
      newErrors.selection = 'Please select at least one accommodation';
    }

    if (!bulkLimit) {
      newErrors.bulkLimit = 'Booking limit is required';
    } else {
      const limit = parseInt(bulkLimit);
      if (isNaN(limit)) {
        newErrors.bulkLimit = 'Booking limit must be a number';
      } else if (limit < 1) {
        newErrors.bulkLimit = 'Booking limit must be at least 1';
      } else if (limit > 100) {
        newErrors.bulkLimit = 'Booking limit cannot exceed 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle bulk update submission
  const handleBulkUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const updates = Array.from(selectedAccommodations).map(postId => ({
        postId,
        maxBookings: parseInt(bulkLimit)
      }));

      setProgress({ current: 0, total: updates.length });

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/posts/admin/booking-limits/bulk`,
        { updates },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
          onUploadProgress: (progressEvent) => {
            // Simulate progress for better UX
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(prev => ({ ...prev, current: Math.floor((progress / 100) * prev.total) }));
          }
        }
      );

      if (response.data.success) {
        const { summary, results } = response.data;
        
        if (summary.failed > 0) {
          // Show detailed results if there were failures
          const failedItems = results.filter(r => !r.success);
          toast.warn(
            `Bulk update completed with ${summary.successful} successful and ${summary.failed} failed updates. Check console for details.`,
            { autoClose: 5000 }
          );
          console.warn('Failed updates:', failedItems);
        } else {
          toast.success(`Successfully updated booking limits for ${summary.successful} accommodations`);
        }

        onSuccess && onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking limits');
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Get selected accommodations data
  const getSelectedAccommodationsData = () => {
    return accommodations.filter(acc => selectedAccommodations.has(acc._id));
  };

  if (!isOpen) return null;

  const selectedData = getSelectedAccommodationsData();
  const allSelected = selectedAccommodations.size === accommodations.length;
  const someSelected = selectedAccommodations.size > 0 && selectedAccommodations.size < accommodations.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-2 rounded-lg">
              <FaUsers className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bulk Update Booking Limits</h2>
              <p className="text-sm text-gray-600">
                Update booking limits for multiple accommodations
              </p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Bulk Limit Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Booking Limit
            </label>
            <MobileInput
              type="number"
              value={bulkLimit}
              onChange={handleBulkLimitChange}
              placeholder="Enter booking limit (1-100)"
              min="1"
              max="100"
              error={errors.bulkLimit}
              icon={FaUsers}
            />
            <p className="mt-1 text-xs text-gray-500">
              This limit will be applied to all selected accommodations
            </p>
          </div>

          {/* Selection Summary */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedAccommodations.size} of {accommodations.length} accommodations selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={loading}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {errors.selection && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{errors.selection}</span>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {loading && progress.total > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FaSpinner className="text-green-600 animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-green-700 mb-1">
                    <span>Updating accommodations...</span>
                    <span>{progress.current}/{progress.total}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Accommodations List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Select Accommodations to Update
            </h3>
            
            {accommodations.map((accommodation) => {
              const isSelected = selectedAccommodations.has(accommodation._id);
              const currentBookings = accommodation.bookingStats?.approvedCount || 0;
              const currentLimit = accommodation.maxBookings || 20;
              const occupancyRate = ((currentBookings / currentLimit) * 100).toFixed(1);
              
              return (
                <div
                  key={accommodation._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-mcan-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !loading && handleAccommodationToggle(accommodation._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <FaCheckSquare className="text-mcan-primary" />
                      ) : (
                        <FaSquare className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {accommodation.title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2">
                          {currentBookings}/{currentLimit} ({occupancyRate}%)
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-600 truncate">
                          {accommodation.location}
                        </p>
                        
                        {/* Mini progress bar */}
                        <div className="w-16 bg-gray-200 rounded-full h-1 ml-2">
                          <div
                            className={`h-1 rounded-full transition-all ${
                              parseFloat(occupancyRate) >= 100 ? 'bg-red-500' :
                              parseFloat(occupancyRate) >= 80 ? 'bg-orange-500' :
                              parseFloat(occupancyRate) >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(parseFloat(occupancyRate), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview Changes */}
          {selectedData.length > 0 && bulkLimit && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Preview Changes</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedData.map((accommodation) => {
                  const currentLimit = accommodation.maxBookings || 20;
                  const newLimit = parseInt(bulkLimit);
                  const currentBookings = accommodation.bookingStats?.approvedCount || 0;
                  
                  return (
                    <div key={accommodation._id} className="flex justify-between text-xs">
                      <span className="truncate flex-1 mr-2">{accommodation.title}</span>
                      <span className="text-gray-600">
                        {currentLimit} → {newLimit}
                        {newLimit < currentBookings && (
                          <span className="text-red-600 ml-1">⚠️</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex space-x-3">
            <MobileButton
              onClick={onClose}
              variant="secondary"
              fullWidth
              disabled={loading}
            >
              Cancel
            </MobileButton>
            <MobileButton
              onClick={handleBulkUpdate}
              variant="primary"
              fullWidth
              disabled={loading || selectedAccommodations.size === 0 || !bulkLimit}
              icon={loading ? null : FaSave}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                `Update ${selectedAccommodations.size} Accommodation${selectedAccommodations.size !== 1 ? 's' : ''}`
              )}
            </MobileButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkBookingLimitModal;