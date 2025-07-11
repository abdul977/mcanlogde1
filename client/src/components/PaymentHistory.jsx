import React, { useState, useEffect } from "react";
import { FaHistory, FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const PaymentHistory = ({ bookingId, isOpen, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchPaymentHistory();
    }
  }, [isOpen, bookingId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/history?bookingId=${bookingId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock, text: "Under Review" },
      approved: { color: "bg-green-100 text-green-800", icon: FaCheckCircle, text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", icon: FaTimesCircle, text: "Rejected" },
      requires_clarification: { color: "bg-blue-100 text-blue-800", icon: FaClock, text: "Needs Clarification" }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewImage = (payment) => {
    setSelectedPayment(payment);
    setShowImageModal(true);
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/receipt/${paymentId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payment-receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-blue-600" />
            Payment History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-600">No payments have been submitted for this booking yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const badge = getStatusBadge(payment.verificationStatus);
                const IconComponent = badge.icon;
                
                return (
                  <div key={payment._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                            {payment.monthNumber}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Month {payment.monthNumber} Payment
                            </h4>
                            <p className="text-sm text-gray-600">
                              ₦{payment.amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Payment Date:</span>
                            <span className="ml-2 font-medium">{formatDate(payment.paymentDate)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Submitted:</span>
                            <span className="ml-2 font-medium">{formatDate(payment.submittedAt)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Method:</span>
                            <span className="ml-2 font-medium">{payment.paymentMethod?.replace('_', ' ').toUpperCase()}</span>
                          </div>
                          {payment.transactionReference && (
                            <div>
                              <span className="text-gray-600">Reference:</span>
                              <span className="ml-2 font-medium">{payment.transactionReference}</span>
                            </div>
                          )}
                        </div>

                        {payment.userNotes && (
                          <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                            <span className="text-gray-600">Notes:</span>
                            <p className="mt-1">{payment.userNotes}</p>
                          </div>
                        )}

                        {payment.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                            <span className="text-blue-700 font-medium">Admin Notes:</span>
                            <p className="mt-1 text-blue-800">{payment.adminNotes}</p>
                          </div>
                        )}

                        {payment.verificationStatus === 'approved' && payment.verifiedAt && (
                          <div className="mt-3 text-sm text-green-600">
                            ✓ Approved on {formatDate(payment.verifiedAt)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3 ml-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                          <IconComponent className="w-4 h-4 mr-1" />
                          {badge.text}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewImage(payment)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                            title="View Payment Screenshot"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          
                          {payment.verificationStatus === 'approved' && (
                            <button
                              onClick={() => handleDownloadReceipt(payment._id)}
                              className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                              title="Download Receipt"
                            >
                              <FaDownload className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Image Modal */}
        {showImageModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payment Screenshot - Month {selectedPayment.monthNumber}</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedPayment.paymentProof?.url || selectedPayment.paymentScreenshot?.url}
                  alt="Payment screenshot"
                  className="max-w-full h-auto mx-auto"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Amount:</strong> ₦{selectedPayment.amount?.toLocaleString()}</p>
                  <p><strong>Payment Date:</strong> {formatDate(selectedPayment.paymentDate)}</p>
                  <p><strong>Method:</strong> {selectedPayment.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
                  {selectedPayment.transactionReference && (
                    <p><strong>Reference:</strong> {selectedPayment.transactionReference}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
