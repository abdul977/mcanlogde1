import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaEye, FaDownload, FaFilter, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import AdminLayout from "../../components/Layout/AdminLayout";

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/admin/verifications?status=${filter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payment verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, action, notes = "") => {
    try {
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/payments/admin/verify`,
        {
          paymentId,
          action, // 'approve' or 'reject'
          adminNotes: notes
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(`Payment ${action}d successfully`);
        fetchPayments(); // Refresh the list
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error(error.response?.data?.message || "Failed to verify payment");
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.booking?.accommodation?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      requires_clarification: "bg-blue-100 text-blue-800"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification</h1>
          <p className="text-gray-600">Review and verify payment proofs submitted by users</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="requires_clarification">Needs Clarification</option>
                <option value="all">All Payments</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user name, accommodation, or transaction reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No payment verifications found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User & Booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount & Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.user?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.booking?.accommodation?.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            Month {payment.monthNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {payment.paymentMethod?.replace('_', ' ').toUpperCase()}
                          </div>
                          {payment.transactionReference && (
                            <div className="text-sm text-gray-500">
                              Ref: {payment.transactionReference}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ₦{payment.amount?.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(payment.paymentDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.verificationStatus)}`}>
                          {payment.verificationStatus?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowImageModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Screenshot"
                          >
                            <FaEye />
                          </button>
                          
                          {payment.verificationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyPayment(payment._id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve Payment"
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt("Reason for rejection (optional):");
                                  if (reason !== null) {
                                    handleVerifyPayment(payment._id, 'reject', reason);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject Payment"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Image Modal */}
        {showImageModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payment Screenshot</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedPayment.paymentScreenshot?.url}
                  alt="Payment screenshot"
                  className="max-w-full h-auto mx-auto"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>User:</strong> {selectedPayment.user?.name}</p>
                  <p><strong>Amount:</strong> ₦{selectedPayment.amount?.toLocaleString()}</p>
                  <p><strong>Payment Date:</strong> {formatDate(selectedPayment.paymentDate)}</p>
                  {selectedPayment.userNotes && (
                    <p><strong>Notes:</strong> {selectedPayment.userNotes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentVerification;
