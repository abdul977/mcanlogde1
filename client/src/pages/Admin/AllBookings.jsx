import React, { useState, useEffect } from "react";
import { FaCalendar, FaUser, FaHome, FaBook, FaEye, FaCheck, FaTimes, FaSync, FaFilter, FaBars } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [stats, setStats] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            Authorization: auth?.token
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

  // Update booking status
  const updateBookingStatus = async (bookingId, status, adminNotes = "") => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/admin/${bookingId}/status`,
        { status, adminNotes },
        {
          headers: {
            Authorization: auth?.token
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-mcan-primary">All Bookings</h2>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="text-mcan-primary hover:text-mcan-secondary transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Navbar onItemClick={closeMobileMenu} />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block ml-[4rem]">
          <Navbar />
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={closeMobileMenu}
          ></div>
        )}

        <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Booking Management</h1>
                <p className="text-gray-600 mt-2">Manage all accommodation and program bookings</p>
              </div>
              <button
                onClick={() => fetchBookings(true)}
                disabled={refreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  refreshing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
                }`}
              >
                <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Statistics */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">{stat._id}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                    <div className={`p-3 rounded-full ${getStatusBadge(stat._id)}`}>
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
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4">
              <FaFilter className="text-gray-500" />
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <FaCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Bookings Found</h3>
                <p className="text-gray-500">No bookings match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User & Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
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
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-mcan-primary flex items-center justify-center">
                                <FaUser className="text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.user?.email}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(booking.bookingType)}`}>
                                {booking.bookingType.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.accommodation?.title || booking.program?.title || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.accommodation?.location || booking.program?.description?.substring(0, 50) + '...' || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.requestDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'approved')}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                  title="Approve"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'rejected')}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                  title="Reject"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {/* TODO: Open booking details modal */}}
                              className="text-mcan-primary hover:text-mcan-secondary flex items-center"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllBookings;
