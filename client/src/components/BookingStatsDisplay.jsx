import React from 'react';
import { FaUsers, FaChartBar, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

/**
 * BookingStatsDisplay Component
 * Shows current booking counts with progress bar visualization and color-coded status indicators
 */
const BookingStatsDisplay = ({ 
  accommodation, 
  showDetails = false, 
  size = 'md',
  className = '' 
}) => {
  // Extract booking data
  const approvedCount = accommodation?.bookingStats?.approvedCount || 0;
  const pendingCount = accommodation?.bookingStats?.pendingCount || 0;
  const totalCount = accommodation?.bookingStats?.totalCount || 0;
  const maxBookings = accommodation?.maxBookings || 20;
  
  // Calculate metrics
  const availableSlots = maxBookings - approvedCount;
  const occupancyRate = ((approvedCount / maxBookings) * 100);
  
  // Determine status and colors
  const getStatusInfo = () => {
    if (occupancyRate >= 100) {
      return {
        status: 'full',
        label: 'Fully Booked',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        progressColor: 'bg-red-500',
        icon: FaExclamationTriangle
      };
    } else if (occupancyRate >= 80) {
      return {
        status: 'critical',
        label: 'Nearly Full',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        progressColor: 'bg-orange-500',
        icon: FaExclamationTriangle
      };
    } else if (occupancyRate >= 60) {
      return {
        status: 'high',
        label: 'High Occupancy',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        progressColor: 'bg-yellow-500',
        icon: FaChartBar
      };
    } else {
      return {
        status: 'available',
        label: 'Available',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        progressColor: 'bg-green-500',
        icon: FaCheckCircle
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-2',
      text: 'text-xs',
      progressHeight: 'h-1',
      iconSize: 'text-sm',
      spacing: 'space-y-1'
    },
    md: {
      container: 'p-3',
      text: 'text-sm',
      progressHeight: 'h-2',
      iconSize: 'text-base',
      spacing: 'space-y-2'
    },
    lg: {
      container: 'p-4',
      text: 'text-base',
      progressHeight: 'h-3',
      iconSize: 'text-lg',
      spacing: 'space-y-3'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Compact display (for table cells)
  if (!showDetails) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <FaUsers className={`${statusInfo.color} ${config.iconSize}`} />
          <span className={`font-medium ${statusInfo.color} ${config.text}`}>
            {approvedCount}/{maxBookings}
          </span>
        </div>
        
        {/* Mini progress bar */}
        <div className={`w-12 bg-gray-200 rounded-full ${config.progressHeight}`}>
          <div
            className={`${config.progressHeight} rounded-full transition-all duration-300 ${statusInfo.progressColor}`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          ></div>
        </div>
        
        <span className={`${config.text} ${statusInfo.color} font-medium`}>
          {occupancyRate.toFixed(0)}%
        </span>
      </div>
    );
  }

  // Detailed display (for cards and detailed views)
  return (
    <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg ${config.container} ${config.spacing} ${className}`}>
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`${statusInfo.color} ${config.iconSize}`} />
          <span className={`font-medium ${statusInfo.color} ${config.text}`}>
            {statusInfo.label}
          </span>
        </div>
        <span className={`${config.text} font-semibold ${statusInfo.color}`}>
          {occupancyRate.toFixed(1)}%
        </span>
      </div>

      {/* Booking counts */}
      <div className="flex items-center justify-between">
        <span className={`${config.text} text-gray-700`}>
          Bookings:
        </span>
        <span className={`${config.text} font-medium text-gray-900`}>
          {approvedCount}/{maxBookings}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className={`w-full bg-gray-200 rounded-full ${config.progressHeight}`}>
          <div
            className={`${config.progressHeight} rounded-full transition-all duration-300 ${statusInfo.progressColor}`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Additional details */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center">
          <div className={`${config.text} text-gray-600`}>Available</div>
          <div className={`font-semibold ${statusInfo.color} ${config.text}`}>
            {availableSlots}
          </div>
        </div>
        
        {pendingCount > 0 && (
          <div className="text-center">
            <div className={`${config.text} text-gray-600`}>Pending</div>
            <div className={`font-semibold text-yellow-600 ${config.text}`}>
              {pendingCount}
            </div>
          </div>
        )}
      </div>

      {/* Warning for overbooked */}
      {occupancyRate > 100 && (
        <div className="flex items-center space-x-1 text-red-600">
          <FaExclamationTriangle className={config.iconSize} />
          <span className={`${config.text} font-medium`}>
            Overbooked by {approvedCount - maxBookings}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * BookingStatsGrid Component
 * Grid layout for multiple booking stats
 */
export const BookingStatsGrid = ({ accommodations = [], onAccommodationClick }) => {
  if (!accommodations.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No accommodations to display
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {accommodations.map((accommodation) => (
        <div
          key={accommodation._id}
          className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onAccommodationClick && onAccommodationClick(accommodation)}
        >
          {/* Accommodation info */}
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 text-sm truncate">
              {accommodation.title}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {accommodation.location}
            </p>
          </div>
          
          {/* Booking stats */}
          <div className="p-3">
            <BookingStatsDisplay 
              accommodation={accommodation} 
              showDetails={true}
              size="sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * BookingStatsSummary Component
 * Summary statistics for multiple accommodations
 */
export const BookingStatsSummary = ({ accommodations = [] }) => {
  if (!accommodations.length) return null;

  // Calculate summary statistics
  const totalAccommodations = accommodations.length;
  const totalSlots = accommodations.reduce((sum, acc) => sum + (acc.maxBookings || 20), 0);
  const totalApproved = accommodations.reduce((sum, acc) => sum + (acc.bookingStats?.approvedCount || 0), 0);
  const totalPending = accommodations.reduce((sum, acc) => sum + (acc.bookingStats?.pendingCount || 0), 0);
  const totalAvailable = totalSlots - totalApproved;
  const overallOccupancy = totalSlots > 0 ? ((totalApproved / totalSlots) * 100) : 0;

  // Count by status
  const statusCounts = accommodations.reduce((counts, acc) => {
    const approvedCount = acc.bookingStats?.approvedCount || 0;
    const maxBookings = acc.maxBookings || 20;
    const occupancyRate = ((approvedCount / maxBookings) * 100);
    
    if (occupancyRate >= 100) counts.full++;
    else if (occupancyRate >= 80) counts.critical++;
    else if (occupancyRate >= 60) counts.high++;
    else counts.available++;
    
    return counts;
  }, { available: 0, high: 0, critical: 0, full: 0 });

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Overview</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalAccommodations}</div>
          <div className="text-sm text-gray-600">Total Accommodations</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalSlots}</div>
          <div className="text-sm text-gray-600">Total Slots</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalApproved}</div>
          <div className="text-sm text-gray-600">Approved Bookings</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{overallOccupancy.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Overall Occupancy</div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-green-600">{statusCounts.available}</div>
          <div className="text-xs text-green-700">Available</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-yellow-600">{statusCounts.high}</div>
          <div className="text-xs text-yellow-700">High Occupancy</div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-orange-600">{statusCounts.critical}</div>
          <div className="text-xs text-orange-700">Nearly Full</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-red-600">{statusCounts.full}</div>
          <div className="text-xs text-red-700">Fully Booked</div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatsDisplay;