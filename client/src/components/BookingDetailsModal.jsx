import React from "react";
import { FaTimes, FaCalendar, FaHome, FaBook, FaMapMarkerAlt, FaUsers, FaUser, FaClock, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-gray-500" />;
      case 'pending':
      default:
        return <FaExclamationTriangle className="text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return badges[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTypeBadge = (type) => {
    const badges = {
      accommodation: "bg-blue-100 text-blue-800 border-blue-200",
      quran_class: "bg-purple-100 text-purple-800 border-purple-200",
      lecture: "bg-green-100 text-green-800 border-green-200",
      event: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return badges[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(booking.status)}
              <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getTypeBadge(booking.bookingType)}`}>
                {booking.bookingType.replace('_', ' ')}
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadge(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {booking.accommodation?.title || booking.program?.title || 'Booking Information'}
            </h3>
            
            {booking.accommodation?.description && (
              <p className="text-gray-600 mb-4">{booking.accommodation.description}</p>
            )}
            
            {booking.program?.description && (
              <p className="text-gray-600 mb-4">{booking.program.description}</p>
            )}
          </div>

          {/* Accommodation Details */}
          {booking.bookingType === 'accommodation' && booking.accommodation && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaHome className="mr-2 text-mcan-primary" />
                Accommodation Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-3 text-mcan-primary" />
                    <div>
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{booking.accommodation.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaHome className="mr-3 text-mcan-primary" />
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{booking.accommodation.accommodationType}</span>
                    </div>
                  </div>
                  {booking.numberOfGuests && (
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Guests:</span>
                        <span className="ml-2">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {booking.checkInDate && (
                    <div className="flex items-center text-gray-600">
                      <FaCalendar className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Check-in:</span>
                        <span className="ml-2">{formatDateOnly(booking.checkInDate)}</span>
                      </div>
                    </div>
                  )}
                  {booking.checkOutDate && (
                    <div className="flex items-center text-gray-600">
                      <FaCalendar className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Check-out:</span>
                        <span className="ml-2">{formatDateOnly(booking.checkOutDate)}</span>
                      </div>
                    </div>
                  )}
                  {booking.accommodation.pricePerNight && (
                    <div className="flex items-center text-gray-600">
                      <FaInfoCircle className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Price per night:</span>
                        <span className="ml-2">₦{booking.accommodation.pricePerNight.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Program Details */}
          {booking.bookingType !== 'accommodation' && booking.program && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaBook className="mr-2 text-mcan-primary" />
                Program Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {booking.program.instructor && (
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Instructor:</span>
                        <span className="ml-2">{booking.program.instructor.name}</span>
                      </div>
                    </div>
                  )}
                  {booking.program.duration && (
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Duration:</span>
                        <span className="ml-2">{booking.program.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {booking.program.schedule && (
                    <div className="flex items-center text-gray-600">
                      <FaCalendar className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Schedule:</span>
                        <span className="ml-2">{booking.program.schedule}</span>
                      </div>
                    </div>
                  )}
                  {booking.program.fee && (
                    <div className="flex items-center text-gray-600">
                      <FaInfoCircle className="mr-3 text-mcan-primary" />
                      <div>
                        <span className="font-medium">Fee:</span>
                        <span className="ml-2">₦{booking.program.fee.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking Information */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-mcan-primary" />
              Booking Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <FaCalendar className="mr-3 text-mcan-primary" />
                  <div>
                    <span className="font-medium">Request Date:</span>
                    <span className="ml-2">{formatDate(booking.requestDate)}</span>
                  </div>
                </div>
                {booking.createdAt && (
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-3 text-mcan-primary" />
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {booking.updatedAt && (
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-3 text-mcan-primary" />
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2">{formatDate(booking.updatedAt)}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <FaInfoCircle className="mr-3 text-mcan-primary" />
                  <div>
                    <span className="font-medium">Booking ID:</span>
                    <span className="ml-2 font-mono text-sm">{booking._id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {(booking.userNotes || booking.adminNotes) && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Notes</h4>
              {booking.userNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-blue-800 mb-2">Your Notes:</h5>
                  <p className="text-blue-700">{booking.userNotes}</p>
                </div>
              )}
              {booking.adminNotes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-800 mb-2">Admin Notes:</h5>
                  <p className="text-green-700">{booking.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
