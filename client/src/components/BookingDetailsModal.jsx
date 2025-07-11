import React from "react";
import { FaTimes, FaCalendar, FaHome, FaBook, FaMapMarkerAlt, FaUsers, FaUser, FaClock, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaMoneyBillWave, FaCreditCard, FaHistory } from "react-icons/fa";

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

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock, text: "Pending" },
      paid: { color: "bg-green-100 text-green-800", icon: FaCheckCircle, text: "Paid" },
      overdue: { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle, text: "Overdue" },
      waived: { color: "bg-blue-100 text-blue-800", icon: FaCheckCircle, text: "Waived" }
    };
    return badges[status] || badges.pending;
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'paid' || status === 'waived') return false;
    return new Date(dueDate) < new Date();
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

          {/* Pricing Information */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-600" />
              Pricing Information
            </h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.totalAmount && booking.totalAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₦{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                ) : booking.accommodation?.price ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Monthly Rate:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₦{booking.accommodation.price.toLocaleString()}/month
                    </span>
                  </div>
                ) : booking.program?.fees?.amount && booking.program.fees.amount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Program Fee:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₦{booking.program.fees.amount.toLocaleString()}
                      {booking.program.fees.paymentSchedule && booking.program.fees.paymentSchedule !== 'one-time' && (
                        <span className="text-sm text-gray-600 ml-1">
                          /{booking.program.fees.paymentSchedule}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Cost:</span>
                    <span className="text-2xl font-bold text-green-600">Free</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.paymentStatus === 'not_required' ? 'Not Required' :
                     booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>

              {booking.bookingType === 'accommodation' && booking.checkInDate && booking.checkOutDate && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="text-sm text-gray-600">
                    {booking.bookingDuration?.months > 1 ? (
                      <>
                        <div className="flex justify-between">
                          <span>Booking Duration:</span>
                          <span className="font-medium">
                            {booking.bookingDuration.months} months
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Monthly Rate:</span>
                          <span className="font-medium">
                            ₦{booking.accommodation?.price?.toLocaleString()}/month
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Start Date:</span>
                          <span className="font-medium">
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>End Date:</span>
                          <span className="font-medium">
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                        {booking.accommodation?.price && (
                          <div className="flex justify-between mt-1">
                            <span>Daily Rate:</span>
                            <span className="font-medium">
                              ₦{Math.round(booking.accommodation.price / 30).toLocaleString()}/day
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Schedule for Yearly Bookings */}
          {booking.bookingType === 'accommodation' && booking.paymentSchedule && booking.paymentSchedule.length > 1 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaCalendar className="mr-2 text-blue-600" />
                Payment Schedule
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-3">
                  {booking.paymentSchedule.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.monthNumber}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            Month {payment.monthNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ₦{payment.amount?.toLocaleString()}
                        </div>
                        <div className={`text-xs font-medium ${
                          payment.status === 'paid' ? 'text-green-600' :
                          payment.status === 'overdue' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {payment.status === 'paid' ? '✓ Paid' :
                           payment.status === 'overdue' ? '⚠ Overdue' :
                           '⏳ Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">
                      Payments: {booking.paymentSchedule.filter(p => p.status === 'paid').length} of {booking.paymentSchedule.length} completed
                    </span>
                    <span className="font-semibold text-blue-800">
                      Total: ₦{booking.totalAmount?.toLocaleString()}
                    </span>
                  </div>
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

          {/* Payment Schedule Section */}
          {booking.bookingType === 'accommodation' && booking.paymentSchedule && booking.paymentSchedule.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-mcan-primary" />
                Payment Schedule
              </h4>

              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">₦{booking.totalAmount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {booking.paymentSchedule.filter(p => p.status === 'paid').length}
                    </div>
                    <div className="text-sm text-gray-600">Payments Made</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {booking.paymentSchedule.filter(p => p.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending Payments</div>
                  </div>
                </div>
              </div>

              {/* Payment Schedule Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {booking.paymentSchedule.map((payment, index) => {
                      const status = isOverdue(payment.dueDate, payment.status) ? 'overdue' : payment.status;
                      const badge = getPaymentStatusBadge(status);
                      const IconComponent = badge.icon;

                      return (
                        <tr key={index} className={`hover:bg-gray-50 ${status === 'overdue' ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaCalendar className="mr-2 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">Month {payment.monthNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₦{payment.amount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                              <IconComponent className="w-3 h-3 mr-1" />
                              {badge.text}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Payment History Link */}
              <div className="mt-4 text-center">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors">
                  <FaHistory className="mr-2" />
                  View Payment History
                </button>
              </div>
            </div>
          )}

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
