import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaEye, FaDownload, FaFilter, FaSearch, FaCreditCard, FaSort, FaCalendarAlt, FaUser, FaFilePdf, FaImage, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import MobileLayout, { MobilePageHeader } from "../../components/Mobile/MobileLayout";
import { PaymentPendingAlert, PaymentNotificationBadge } from "../../components/PaymentAlert";
import Navbar from "./Navbar";
import { useAuth } from "../../context/UserContext";

const PaymentVerification = () => {
  const [auth] = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [stats, setStats] = useState({});

  // Advanced filtering states
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [accommodationFilter, setAccommodationFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    today: false,
    thisWeek: false,
    thisMonth: false,
    highAmount: false
  });

  useEffect(() => {
    fetchPayments();
  }, [filter, sortBy, sortOrder, dateFilter, paymentMethodFilter, accommodationFilter, monthFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = auth?.token;

      // Build query parameters
      const params = new URLSearchParams({
        status: filter,
        sortBy,
        sortOrder,
        ...(dateFilter && { dateFilter }),
        ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }),
        ...(accommodationFilter && { accommodation: accommodationFilter }),
        ...(monthFilter && { month: monthFilter }),
        ...(amountRange.min && { minAmount: amountRange.min }),
        ...(amountRange.max && { maxAmount: amountRange.max })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/admin/verifications?${params}`,
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

  // Advanced filtering functions
  const applyQuickFilter = (filterType) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setQuickFilters(prev => ({ ...prev, [filterType]: !prev[filterType] }));

    switch (filterType) {
      case 'today':
        setDateFilter(new Date().toISOString().split('T')[0]);
        break;
      case 'thisWeek':
        setDateFilter(startOfWeek.toISOString().split('T')[0]);
        break;
      case 'thisMonth':
        setDateFilter(startOfMonth.toISOString().split('T')[0]);
        break;
      case 'highAmount':
        setAmountRange({ min: '100000', max: '' }); // 100k and above
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setFilter('pending');
    setSearchTerm('');
    setPaymentMethodFilter('');
    setAmountRange({ min: '', max: '' });
    setAccommodationFilter('');
    setMonthFilter('');
    setUserFilter('');
    setDateFilter('');
    setQuickFilters({
      today: false,
      thisWeek: false,
      thisMonth: false,
      highAmount: false
    });
  };

  const getFilteredPayments = () => {
    let filtered = payments;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.accommodation?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // User filter
    if (userFilter) {
      filtered = filtered.filter(payment =>
        payment.user?.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
        payment.user?.email?.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    return filtered;
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

  const filteredPayments = getFilteredPayments();

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
    <MobileLayout
      title="Payment Verification"
      subtitle="Review and verify payment proofs"
      icon={FaCreditCard}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Payment Verification"
          subtitle="Review and verify payment proofs submitted by users"
          icon={FaCreditCard}
          showOnMobile={false}
        />

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          {/* Basic Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaFilter className="text-gray-500" />
              Advanced
              {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
            {Object.entries(quickFilters).map(([key, active]) => (
              <button
                key={key}
                onClick={() => applyQuickFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {key === 'today' && 'Today'}
                {key === 'thisWeek' && 'This Week'}
                {key === 'thisMonth' && 'This Month'}
                {key === 'highAmount' && 'High Amount (₦100k+)'}
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Methods</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="cash">Cash Payment</option>
                    <option value="card">Card Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month Number</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Month {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (₦)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (₦)</label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="submittedAt">Submission Date</option>
                    <option value="amount">Amount</option>
                    <option value="monthNumber">Month Number</option>
                    <option value="paymentDate">Payment Date</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
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
                  src={selectedPayment.paymentProof?.url || selectedPayment.paymentScreenshot?.url}
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
    </MobileLayout>
  );
};

export default PaymentVerification;
