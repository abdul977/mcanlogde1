import React, { useState, useEffect } from "react";
import { FaCalendar, FaUpload, FaCheckCircle, FaExclamationTriangle, FaClock, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import MobileLayout from "../../components/Mobile/MobileLayout";
import PaymentUploadModal from "../../components/PaymentUploadModal";

const PaymentDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      // Fetch bookings with payment schedules
      const bookingsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/user`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Fetch payment history
      const paymentsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/history`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (bookingsResponse.data.success) {
        // Filter bookings with payment schedules
        const bookingsWithPayments = bookingsResponse.data.bookings.filter(
          booking => booking.paymentSchedule && booking.paymentSchedule.length > 0
        );
        setBookings(bookingsWithPayments);
      }

      if (paymentsResponse.data.success) {
        setPaymentHistory(paymentsResponse.data.payments);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error("Failed to fetch payment information");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = (booking, monthNumber, amount) => {
    setUploadData({ booking, monthNumber, amount });
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setUploadData(null);
    fetchData(); // Refresh data
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock, text: "Pending" },
      paid: { color: "bg-green-100 text-green-800", icon: FaCheckCircle, text: "Paid" },
      overdue: { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle, text: "Overdue" },
      waived: { color: "bg-blue-100 text-blue-800", icon: FaCheckCircle, text: "Waived" }
    };
    return badges[status] || badges.pending;
  };

  const isOverdue = (dueDate, status) => {
    return status === 'pending' && new Date() > new Date(dueDate);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaMoneyBillWave className="text-green-600" />
            Payment Dashboard
          </h1>
          <p className="text-gray-600">Manage your accommodation payments</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <FaCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Schedules</h3>
            <p className="text-gray-600">You don't have any bookings with payment schedules yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border">
                {/* Booking Header */}
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.accommodation?.title}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>Duration: {booking.bookingDuration?.months} months</span>
                    <span className="mx-2">•</span>
                    <span>Total: ₦{booking.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Schedule */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Payment Schedule</h4>
                  <div className="space-y-3">
                    {booking.paymentSchedule?.map((payment, index) => {
                      const badge = getStatusBadge(
                        isOverdue(payment.dueDate, payment.status) ? 'overdue' : payment.status
                      );
                      const IconComponent = badge.icon;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                              {payment.monthNumber}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                Month {payment.monthNumber}
                              </div>
                              <div className="text-sm text-gray-600">
                                Due: {formatDate(payment.dueDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ₦{payment.amount?.toLocaleString()}
                              </div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                <IconComponent className="w-3 h-3 mr-1" />
                                {badge.text}
                              </div>
                            </div>
                            
                            {(payment.status === 'pending' || isOverdue(payment.dueDate, payment.status)) && (
                              <button
                                onClick={() => handleUploadPayment(booking, payment.monthNumber, payment.amount)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <FaUpload className="w-3 h-3" />
                                Upload
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Payment Progress */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Payment Progress</span>
                      <span>
                        {booking.paymentSchedule?.filter(p => p.status === 'paid').length || 0} of {booking.paymentSchedule?.length || 0} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((booking.paymentSchedule?.filter(p => p.status === 'paid').length || 0) / (booking.paymentSchedule?.length || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Payment History */}
        {paymentHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Payment Submissions</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="divide-y divide-gray-200">
                {paymentHistory.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {payment.booking?.accommodation?.title} - Month {payment.monthNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        Submitted: {formatDate(payment.submittedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ₦{payment.amount?.toLocaleString()}
                      </div>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        payment.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        payment.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.verificationStatus?.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Upload Modal */}
        {showUploadModal && uploadData && (
          <PaymentUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            booking={uploadData.booking}
            monthNumber={uploadData.monthNumber}
            paymentAmount={uploadData.amount}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </MobileLayout>
  );
};

export default PaymentDashboard;
