import React, { useState, useEffect } from "react";
import { FaCalendar, FaHome, FaBook, FaEye, FaTimes, FaSync, FaFilter, FaMapMarkerAlt, FaUsers, FaBars, FaUser, FaClock } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import BookingDetailsModal from "../../components/BookingDetailsModal";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  // Fetch user's bookings
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
        `${import.meta.env.VITE_BASE_URL}/api/bookings/my-bookings?${params}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        setBookings(response.data.bookings);
        if (showRefreshLoader) {
          toast.success("Bookings refreshed successfully!");
        }
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

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Booking cancelled successfully!");
        fetchBookings(true);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
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
      day: 'numeric'
    });
  };

  // Handle actions
  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCancel = (booking) => {
    cancelBooking(booking._id);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  // Define columns for table view
  const columns = [
    {
      key: 'bookingType',
      header: 'Type',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(value)}`}>
          {value && typeof value === 'string' ? value.replace('_', ' ').toUpperCase() : String(value || '').toUpperCase()}
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
      key: 'totalAmount',
      header: 'Price',
      render: (value, booking) => (
        <div className="text-sm">
          {value && value > 0 ? (
            <span className="font-semibold text-green-600">
              ₦{value.toLocaleString()}
            </span>
          ) : booking.accommodation?.price ? (
            <span className="font-semibold text-green-600">
              ₦{booking.accommodation.price.toLocaleString()}/month
            </span>
          ) : booking.program?.fees?.amount && booking.program.fees.amount > 0 ? (
            <span className="font-semibold text-green-600">
              ₦{booking.program.fees.amount.toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-500 text-xs">Free</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(value)}`}>
          {value && typeof value === 'string' ? value.toUpperCase() : String(value || '').toUpperCase()}
        </span>
      )
    }
  ];

  // Custom card component for user bookings
  const BookingCard = ({ item, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-mcan-primary/10 to-mcan-secondary/10">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.bookingType)}`}>
            {item.bookingType && typeof item.bookingType === 'string' ? item.bookingType.replace('_', ' ').toUpperCase() : String(item.bookingType || '').toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
            {item.status && typeof item.status === 'string' ? item.status.toUpperCase() : String(item.status || '').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
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
              <FaUsers className="mr-2 text-gray-500" />
              <span>{item.guests} guests</span>
            </div>
          )}
          <div className="flex items-center">
            <FaCalendar className="mr-2 text-gray-500" />
            <span>Booked: {formatDate(item.requestDate)}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">💰</span>
            {item.totalAmount && item.totalAmount > 0 ? (
              <span className="font-semibold text-green-600">
                ₦{item.totalAmount.toLocaleString()}
              </span>
            ) : item.accommodation?.price ? (
              <span className="font-semibold text-green-600">
                ₦{item.accommodation.price.toLocaleString()}/month
              </span>
            ) : item.program?.fees?.amount && item.program.fees.amount > 0 ? (
              <span className="font-semibold text-green-600">
                ₦{item.program.fees.amount.toLocaleString()}
              </span>
            ) : (
              <span className="text-gray-500">Free</span>
            )}
          </div>
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
            <MobileButton
              onClick={() => handleCancel(item)}
              variant="ghost"
              size="sm"
              icon={FaTimes}
              className="text-red-600 hover:text-red-900"
              title="Cancel Booking"
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout
      title="My Bookings"
      subtitle="View bookings"
      icon={FaBook}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={() => fetchBookings(true)}
          variant="secondary"
          size="sm"
          icon={FaSync}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="My Bookings"
          subtitle="Track your accommodation and program bookings"
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
                  setSelectedStatus('all');
                  setSelectedType('all');
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
          emptyMessage="You haven't made any bookings yet."
          emptyIcon={FaBook}
          onView={handleView}
          cardComponent={BookingCard}
          showViewToggle={true}
        />

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetailsModal}
          onClose={handleCloseDetailsModal}
        />
      </div>
    </MobileLayout>
  );
};

export default MyBookings;
