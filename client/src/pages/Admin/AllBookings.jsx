import React, { useState, useEffect } from "react";
import { FaCalendar, FaUser, FaHome, FaBook, FaEye, FaCheck, FaTimes, FaSync, FaFilter, FaBars, FaMapMarkerAlt, FaClock, FaExclamationTriangle, FaCreditCard, FaBell } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [stats, setStats] = useState({});
  const [pendingPayments, setPendingPayments] = useState([]);
  const [auth] = useAuth();

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "accommodation", label: "Accommodations" },
    { value: "quran_class", label: "Quran Classes" },
    { value: "lecture", label: "Lectures" },
    { value: "event", label: "Events" }
  ];

  // Fetch bookings
  const fetchBookings = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedType !== "all") params.append("bookingType", selectedType);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/admin/all?${params}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        setBookings(response.data.bookings);
        setStats(response.data.stats);
        if (showRefreshLoader) {
          toast.success("Bookings refreshed successfully!");
        }
      }

      // Fetch pending payment verifications
      const paymentsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/admin/verifications?status=pending&limit=10`,
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );

      if (paymentsResponse.data.success) {
        setPendingPayments(paymentsResponse.data.payments);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, selectedType]);

  // Check if booking has pending payment verifications
  const getPaymentAlerts = (booking) => {
    if (booking.bookingType !== 'accommodation') return null;

    const bookingPayments = pendingPayments.filter(payment =>
      payment.booking._id === booking._id
    );

    return bookingPayments.length > 0 ? bookingPayments.length : null;
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, status, adminNotes = "") => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/admin/${bookingId}/status`,
        { status, adminNotes },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Booking ${status} successfully!`);
        fetchBookings(true);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadge = (type) => {
    const badges = {
      accommodation: "bg-blue-100 text-blue-800",
      quran_class: "bg-purple-100 text-purple-800",
      lecture: "bg-green-100 text-green-800",
      event: "bg-orange-100 text-orange-800"
    };
    return badges[type] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle actions
  const handleView = (booking) => {
    // Could open a modal or navigate to booking details
    console.log('View booking:', booking);
  };

  const handleApprove = (booking) => {
    updateBookingStatus(booking._id, 'approved', 'Booking approved by admin');
  };

  const handleReject = (booking) => {
    updateBookingStatus(booking._id, 'rejected', 'Booking rejected by admin');
  };

  // Define columns for table view
  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (value, booking) => (
        <div className="flex items-center">
          <FaUser className="mr-2 text-mcan-primary" />
          <div>
            <div className="font-medium">{booking.user?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{booking.user?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'bookingType',
      header: 'Type',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(value)}`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'itemTitle',
      header: 'Item',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'checkInDate',
      header: 'Date',
      render: (value, booking) => (
        <div className="flex items-center">
          <FaClock className="mr-1 text-mcan-secondary" />
          <div>
            <div className="text-sm">{formatDate(value)}</div>
            {booking.checkOutDate && (
              <div className="text-xs text-gray-500">to {formatDate(booking.checkOutDate)}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>
          {value.toUpperCase()}
        </span>
      )
    }
  ];

  // Custom card component for bookings
  const BookingCard = ({ item, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-mcan-primary/10 to-mcan-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaUser className="mr-2 text-mcan-primary" />
            <div>
              <div className="font-semibold text-gray-900">{item.user?.name || 'N/A'}</div>
              <div className="text-sm text-gray-600">{item.user?.email || 'N/A'}</div>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
            {item.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.bookingType)} mr-3`}>
            {item.bookingType.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {item.itemTitle}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <FaClock className="mr-2 text-mcan-secondary" />
            <span>Check-in: {formatDate(item.checkInDate)}</span>
          </div>
          {item.checkOutDate && (
            <div className="flex items-center">
              <FaClock className="mr-2 text-mcan-secondary" />
              <span>Check-out: {formatDate(item.checkOutDate)}</span>
            </div>
          )}
          {item.guests && (
            <div className="flex items-center">
              <FaUser className="mr-2 text-gray-500" />
              <span>{item.guests} guests</span>
            </div>
          )}
        </div>

        {item.specialRequests && (
          <div className="mt-3 p-2 bg-gray-50 rounded">
            <div className="text-xs font-medium text-gray-700 mb-1">Special Requests:</div>
            <div className="text-sm text-gray-600">{item.specialRequests}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
        <div className="flex space-x-2">
          <MobileButton
            onClick={() => onView(item)}
            variant="ghost"
            size="sm"
            icon={FaEye}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          />
          {item.status === 'pending' && (
            <>
              <MobileButton
                onClick={() => handleApprove(item)}
                variant="ghost"
                size="sm"
                icon={FaCheck}
                className="text-green-600 hover:text-green-900"
                title="Approve"
              />
              <MobileButton
                onClick={() => handleReject(item)}
                variant="ghost"
                size="sm"
                icon={FaTimes}
                className="text-red-600 hover:text-red-900"
                title="Reject"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout
      title="Bookings"
      subtitle="Manage bookings"
      icon={FaBook}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={() => fetchBookings(true)}
          variant="secondary"
          size="sm"
          icon={FaSync}
        >
          Refresh
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Booking Management"
          subtitle="Manage all accommodation and program bookings"
          icon={FaBook}
          showOnMobile={false}
          actions={
            <MobileButton
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              variant="secondary"
              icon={FaSync}
              className={refreshing ? 'animate-spin' : ''}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </MobileButton>
          }
        />

        {/* Statistics */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">{stat._id}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`p-2 lg:p-3 rounded-full ${getStatusBadge(stat._id)}`}>
                    {stat._id === 'pending' && <FaCalendar />}
                    {stat._id === 'approved' && <FaCheck />}
                    {stat._id === 'rejected' && <FaTimes />}
                    {stat._id === 'cancelled' && <FaTimes />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaFilter className="mr-2 text-mcan-primary" />
            Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Status">
              <ResponsiveSelect
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={statusOptions}
                placeholder="All Status"
              />
            </FormField>

            <FormField label="Type">
              <ResponsiveSelect
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={typeOptions}
                placeholder="All Types"
              />
            </FormField>

            <FormField label="Actions">
              <MobileButton
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedType('');
                }}
                variant="secondary"
                fullWidth
              >
                Clear Filters
              </MobileButton>
            </FormField>
          </div>
        </div>

        {/* Data Display */}
        <ResponsiveDataDisplay
          data={bookings}
          columns={columns}
          loading={loading}
          emptyMessage="No bookings match your current filters."
          emptyIcon={FaBook}
          onView={handleView}
          cardComponent={BookingCard}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllBookings;
