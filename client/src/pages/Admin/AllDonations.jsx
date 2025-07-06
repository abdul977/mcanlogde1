import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDonate, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaMoneyBillWave, FaUsers, FaCalendar } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllDonations = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const types = [
    { value: "all", label: "All Types" },
    { value: "lodge_sponsorship", label: "Lodge Sponsorship" },
    { value: "general_donation", label: "General Donation" },
    { value: "scholarship_fund", label: "Scholarship Fund" },
    { value: "event_sponsorship", label: "Event Sponsorship" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "welfare", label: "Welfare" },
    { value: "emergency_fund", label: "Emergency Fund" }
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "paused", label: "Paused" }
  ];

  // Fetch donations from server
  const fetchDonations = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/donations/admin/get-all-donations`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        setDonations(data.donations || []);
        setFilteredDonations(data.donations || []);
        if (showRefreshLoader) {
          toast.success("Donations refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching donations", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to fetch donations. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter donations based on search and filters
  useEffect(() => {
    let filtered = donations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(donation =>
        donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(donation => donation.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(donation => donation.status === selectedStatus);
    }

    setFilteredDonations(filtered);
  }, [donations, searchTerm, selectedType, selectedStatus]);

  // Load donations on component mount
  useEffect(() => {
    fetchDonations();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchDonations(true);
  };

  // Handle view donation
  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/donations/admin/get-donation-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        navigate(`/admin/view-donation/${id}`);
      } else {
        toast.error(data?.message || "Error fetching donation details");
      }
    } catch (error) {
      console.error("Error fetching donation:", error);
      toast.error("Failed to fetch donation details. Please try again.");
    }
  };

  // Handle edit donation
  const handleEdit = (id) => {
    navigate(`/admin/edit-donation/${id}`);
  };

  // Handle delete donation
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/donations/admin/delete-donation/${id}`,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );

        if (data?.success) {
          toast.success("Donation deleted successfully!");
          fetchDonations();
        } else {
          toast.error(data?.message || "Error deleting donation");
        }
      } catch (error) {
        console.error("Error deleting donation:", error);
        toast.error("Failed to delete donation. Please try again.");
      }
    }
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      lodge_sponsorship: "bg-blue-100 text-blue-800",
      general_donation: "bg-green-100 text-green-800",
      scholarship_fund: "bg-purple-100 text-purple-800",
      event_sponsorship: "bg-yellow-100 text-yellow-800",
      infrastructure: "bg-indigo-100 text-indigo-800",
      welfare: "bg-pink-100 text-pink-800",
      emergency_fund: "bg-red-100 text-red-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      paused: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Format currency
  const formatCurrency = (amount, currency = "NGN") => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (raised, target) => {
    return Math.min(100, Math.round((raised / target) * 100));
  };

  // Get days remaining
  const getDaysRemaining = (endDate) => {
    if (!endDate) return "No deadline";
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Expired";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5">
      <div className="flex">
        <div className="ml-[4rem]">
          <Navbar />
        </div>
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                  <FaDonate className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Donations</h1>
                  <p className="text-gray-600">View and manage all donation campaigns</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    refreshing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Refresh Donations"
                >
                  <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link
                  to="/admin/create-donation"
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus />
                  Add Campaign
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredDonations.length} of {donations.length} campaigns
                </div>
              </div>
            </div>
          </div>

          {/* Donations List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading donations...</span>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-16">
                <FaDonate className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Donation Campaigns Found</h3>
                <p className="text-gray-500 mb-4">
                  {donations.length === 0 
                    ? "No donation campaigns have been created yet." 
                    : "No campaigns match your current filters."
                  }
                </p>
                <Link
                  to="/admin/create-donation"
                  className="inline-flex items-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus className="mr-2" />
                  Create First Campaign
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timeline
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
                    {filteredDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {donation.primaryImage && (
                              <img
                                src={donation.primaryImage}
                                alt={donation.title}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {donation.title}
                                {donation.featured && (
                                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Featured
                                  </span>
                                )}
                                {donation.urgent && (
                                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {donation.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(donation.type)}`}>
                            {donation.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-2 mb-1">
                              <FaMoneyBillWave className="text-green-500" />
                              <span>{formatCurrency(donation.amount?.raised, donation.amount?.currency)}</span>
                              <span className="text-gray-500">/ {formatCurrency(donation.amount?.target, donation.amount?.currency)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage(donation.amount?.raised, donation.amount?.target)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {getProgressPercentage(donation.amount?.raised, donation.amount?.target)}% complete
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <FaCalendar className="text-gray-400" />
                            <span>{getDaysRemaining(donation.timeline?.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <FaUsers className="text-gray-400" />
                            <span>{donation.sponsors?.length || 0} sponsors</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(donation.status)}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(donation._id)}
                              className="text-blue-600 hover:text-blue-900 transition duration-300"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEdit(donation._id)}
                              className="text-green-600 hover:text-green-900 transition duration-300"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(donation._id, donation.title)}
                              className="text-red-600 hover:text-red-900 transition duration-300"
                              title="Delete"
                            >
                              <FaTrash />
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

          {/* Summary */}
          {!loading && filteredDonations.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-mcan-primary">{donations.length}</div>
                  <div className="text-sm text-gray-600">Total Campaigns</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(donations.reduce((total, d) => total + (d.amount?.raised || 0), 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Raised</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {donations.reduce((total, d) => total + (d.sponsors?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Sponsors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {donations.filter(d => d.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Campaigns</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllDonations;
