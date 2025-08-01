import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FaUsers, 
  FaSync, 
  FaSearch, 
  FaCheck, 
  FaTimes, 
  FaPause, 
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaFilter
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout from "../../components/Mobile/MobileLayout";
import { MobileButton } from "../../components/Mobile/MobileLayout";

const AllChatCommunities = () => {
  const [auth] = useAuth();
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusCounts, setStatusCounts] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const statusOptions = [
    { value: "all", label: "All Status", icon: FaFilter },
    { value: "pending", label: "Pending", icon: FaClock },
    { value: "approved", label: "Approved", icon: FaCheckCircle },
    { value: "rejected", label: "Rejected", icon: FaTimesCircle },
    { value: "suspended", label: "Suspended", icon: FaBan }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "education", label: "Education" },
    { value: "welfare", label: "Welfare" },
    { value: "spiritual", label: "Spiritual" },
    { value: "social", label: "Social" },
    { value: "charity", label: "Charity" },
    { value: "youth", label: "Youth" },
    { value: "women", label: "Women" },
    { value: "technology", label: "Technology" },
    { value: "health", label: "Health" }
  ];

  // Fetch communities from server
  const fetchCommunities = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/chat-communities/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        setCommunities(data.communities || []);
        setFilteredCommunities(data.communities || []);
        setStatusCounts(data.statusCounts || {});
        if (showRefreshLoader) {
          toast.success("Communities refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching communities", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to fetch communities. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter communities based on search and filters
  useEffect(() => {
    let filtered = communities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.creator?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(community => community.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(community => community.category === selectedCategory);
    }

    setFilteredCommunities(filtered);
  }, [communities, searchTerm, selectedStatus, selectedCategory]);

  // Handle community approval
  const handleApprove = async (communityId, communityName) => {
    const adminNotes = prompt(`Approve "${communityName}"?\n\nOptional admin notes:`);
    if (adminNotes === null) return; // User cancelled

    try {
      setActionLoading(prev => ({ ...prev, [communityId]: 'approving' }));
      
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/chat-communities/admin/${communityId}/approve`,
        { adminNotes },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        toast.success(`Community "${communityName}" approved successfully!`, { position: "bottom-left" });
        fetchCommunities(true);
      } else {
        toast.error(data?.message || "Error approving community", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error approving community:", error);
      toast.error("Failed to approve community. Please try again.", { position: "bottom-left" });
    } finally {
      setActionLoading(prev => ({ ...prev, [communityId]: null }));
    }
  };

  // Handle community rejection
  const handleReject = async (communityId, communityName) => {
    const rejectionReason = prompt(`Reject "${communityName}"?\n\nRejection reason (required):`);
    if (!rejectionReason || rejectionReason.trim() === "") {
      toast.error("Rejection reason is required", { position: "bottom-left" });
      return;
    }

    const adminNotes = prompt("Optional admin notes:");
    if (adminNotes === null) return; // User cancelled

    try {
      setActionLoading(prev => ({ ...prev, [communityId]: 'rejecting' }));
      
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/chat-communities/admin/${communityId}/reject`,
        { rejectionReason, adminNotes },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        toast.success(`Community "${communityName}" rejected successfully!`, { position: "bottom-left" });
        fetchCommunities(true);
      } else {
        toast.error(data?.message || "Error rejecting community", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error rejecting community:", error);
      toast.error("Failed to reject community. Please try again.", { position: "bottom-left" });
    } finally {
      setActionLoading(prev => ({ ...prev, [communityId]: null }));
    }
  };

  // Handle community suspension
  const handleSuspend = async (communityId, communityName) => {
    const reason = prompt(`Suspend "${communityName}"?\n\nSuspension reason (required):`);
    if (!reason || reason.trim() === "") {
      toast.error("Suspension reason is required", { position: "bottom-left" });
      return;
    }

    const adminNotes = prompt("Optional admin notes:");
    if (adminNotes === null) return; // User cancelled

    try {
      setActionLoading(prev => ({ ...prev, [communityId]: 'suspending' }));
      
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/chat-communities/admin/${communityId}/suspend`,
        { reason, adminNotes },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        toast.success(`Community "${communityName}" suspended successfully!`, { position: "bottom-left" });
        fetchCommunities(true);
      } else {
        toast.error(data?.message || "Error suspending community", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error suspending community:", error);
      toast.error("Failed to suspend community. Please try again.", { position: "bottom-left" });
    } finally {
      setActionLoading(prev => ({ ...prev, [communityId]: null }));
    }
  };

  const handleRefresh = () => {
    fetchCommunities(true);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      suspended: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    const icons = {
      pending: FaClock,
      approved: FaCheckCircle,
      rejected: FaTimesCircle,
      suspended: FaBan
    };

    const Icon = icons[status] || FaClock;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        <Icon className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MobileLayout
        title="Chat Communities"
        subtitle="Loading communities..."
        icon={FaUsers}
        navbar={Navbar}
        backgroundColor="bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  const headerActions = (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
      <MobileButton
        onClick={handleRefresh}
        disabled={refreshing}
        variant="secondary"
        icon={FaSync}
        className={refreshing ? 'animate-spin' : ''}
      >
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </MobileButton>
    </div>
  );

  return (
    <MobileLayout
      title="Chat Communities"
      subtitle="Manage community approval and moderation"
      icon={FaUsers}
      navbar={Navbar}
      headerActions={headerActions}
      backgroundColor="bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5"
    >
      <div className="p-4 lg:p-8">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {statusOptions.slice(1).map((status) => {
            const Icon = status.icon;
            const count = statusCounts[status.value] || 0;
            return (
              <div
                key={status.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedStatus === status.value
                    ? 'border-mcan-primary bg-mcan-primary/10'
                    : 'border-gray-200 hover:border-mcan-primary/50'
                }`}
                onClick={() => setSelectedStatus(selectedStatus === status.value ? 'all' : status.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <Icon className="text-2xl text-mcan-primary" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Communities List */}
        {filteredCommunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaUsers className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Communities Found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? 'No communities match your current filters.'
                : 'No communities have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommunities.map((community) => (
              <div
                key={community._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {community.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {community.description}
                        </p>
                      </div>
                      {getStatusBadge(community.status)}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Creator:</span> {community.creator?.name || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {community.category}
                      </div>
                      <div>
                        <span className="font-medium">Members:</span> {community.memberCount || 0}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(community.createdAt)}
                      </div>
                    </div>

                    {community.approvalInfo?.reviewedAt && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Reviewed by:</span> {community.approvalInfo.reviewedBy?.name || 'Unknown'}
                          <span className="ml-2">on {formatDate(community.approvalInfo.reviewedAt)}</span>
                        </div>
                        {community.approvalInfo.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">
                            <span className="font-medium">Reason:</span> {community.approvalInfo.rejectionReason}
                          </div>
                        )}
                        {community.approvalInfo.adminNotes && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Notes:</span> {community.approvalInfo.adminNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 lg:ml-6">
                    {community.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(community._id, community.name)}
                          disabled={actionLoading[community._id]}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <FaCheck className="mr-1" />
                          {actionLoading[community._id] === 'approving' ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(community._id, community.name)}
                          disabled={actionLoading[community._id]}
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <FaTimes className="mr-1" />
                          {actionLoading[community._id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}

                    {community.status === 'approved' && (
                      <button
                        onClick={() => handleSuspend(community._id, community.name)}
                        disabled={actionLoading[community._id]}
                        className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <FaPause className="mr-1" />
                        {actionLoading[community._id] === 'suspending' ? 'Suspending...' : 'Suspend'}
                      </button>
                    )}

                    <button
                      onClick={() => window.open(`/communities/${community.slug}`, '_blank')}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <FaEye className="mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AllChatCommunities;
