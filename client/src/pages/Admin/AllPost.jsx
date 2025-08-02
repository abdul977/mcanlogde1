import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaSearch, FaUsers, FaMapMarkerAlt, FaEyeSlash, FaCog, FaCheck, FaTimes, FaClock, FaChartBar, FaCheckSquare } from "react-icons/fa";
import { useAuth } from "../../context/UserContext";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";
import BookingLimitModal from "../../components/BookingLimitModal";
import BulkBookingLimitModal from "../../components/BulkBookingLimitModal";
import BookingStatsDisplay, { BookingStatsSummary } from "../../components/BookingStatsDisplay";

const AllPost = () => {
  const [auth] = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const navigate = useNavigate();

  // Booking limit modal states
  const [bookingLimitModal, setBookingLimitModal] = useState({
    isOpen: false,
    accommodation: null
  });
  const [bulkBookingLimitModal, setBulkBookingLimitModal] = useState({
    isOpen: false
  });
  const [selectedAccommodations, setSelectedAccommodations] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/post/get-all-post?includeHidden=true`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setPosts(response.data.posts);
      setFilteredPosts(response.data.posts);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch accommodations");
    } finally {
      setLoading(false);
    }
  };

  // Handle actions
  const handleView = (post) => {
    window.open(`/accommodation/${post.slug}`, '_blank');
  };

  const handleEdit = (post) => {
    navigate(`/admin/edit/${post.slug}`);
  };

  // Delete post
  const handleDelete = async (post) => {
    if (!window.confirm("Are you sure you want to delete this accommodation?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/post/delete-post/${post._id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Accommodation deleted successfully");
        fetchPosts(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete accommodation");
    }
  };

  // Update accommodation status
  const updateAccommodationStatus = async (postId, adminStatus, adminNotes = "", isVisible = true) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/post/admin/status/${postId}`,
        { adminStatus, adminNotes, isVisible },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Accommodation status updated successfully");
        fetchPosts(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update accommodation status");
    }
  };

  // Quick status actions
  const handleStatusChange = (post, newStatus) => {
    const statusMessages = {
      active: "Make this accommodation active and visible to users?",
      hidden: "Hide this accommodation from public view?",
      coming_soon: "Mark this accommodation as 'Coming Soon'?",
      maintenance: "Mark this accommodation as under maintenance?",
      not_available: "Mark this accommodation as not available?"
    };

    if (window.confirm(statusMessages[newStatus])) {
      const isVisible = newStatus !== 'hidden';
      updateAccommodationStatus(post._id, newStatus, "", isVisible);
    }
  };

  // Booking limit handlers
  const handleEditBookingLimit = (accommodation) => {
    setBookingLimitModal({
      isOpen: true,
      accommodation
    });
  };

  const handleBookingLimitSuccess = (updatedAccommodation) => {
    // Update the accommodation in the posts list
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === updatedAccommodation.id
          ? { ...post, maxBookings: updatedAccommodation.maxBookings, bookingStats: updatedAccommodation.bookingStats }
          : post
      )
    );
    
    // Refresh the posts to get updated booking statistics
    fetchPosts();
  };

  const handleBulkModeToggle = () => {
    setBulkMode(!bulkMode);
    setSelectedAccommodations(new Set());
  };

  const handleAccommodationSelect = (accommodationId) => {
    setSelectedAccommodations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accommodationId)) {
        newSet.delete(accommodationId);
      } else {
        newSet.add(accommodationId);
      }
      return newSet;
    });
  };

  const handleBulkUpdateBookingLimits = () => {
    if (selectedAccommodations.size === 0) {
      toast.warn('Please select at least one accommodation');
      return;
    }

    const selectedAccommodationData = posts.filter(post =>
      selectedAccommodations.has(post._id)
    );

    setBulkBookingLimitModal({
      isOpen: true,
      accommodations: selectedAccommodationData
    });
  };

  const handleBulkBookingLimitSuccess = () => {
    // Reset bulk mode and selections
    setBulkMode(false);
    setSelectedAccommodations(new Set());
    
    // Refresh the posts to get updated booking statistics
    fetchPosts();
  };

  // Status badge helper functions
  const getStatusBadge = (adminStatus, isVisible) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      hidden: { color: "bg-gray-100 text-gray-800", label: "Hidden" },
      coming_soon: { color: "bg-blue-100 text-blue-800", label: "Coming Soon" },
      maintenance: { color: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
      not_available: { color: "bg-red-100 text-red-800", label: "Not Available" }
    };

    const config = statusConfig[adminStatus] || statusConfig.active;
    const visibilityPrefix = !isVisible ? "Hidden - " : "";

    return {
      color: config.color,
      label: visibilityPrefix + config.label
    };
  };

  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable
      ? { color: "bg-green-100 text-green-800", label: "Available" }
      : { color: "bg-red-100 text-red-800", label: "Booked" };
  };

  // Filter posts based on search and filters
  useEffect(() => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter(post => post.genderRestriction === filterGender);
    }

    // Availability filter
    if (filterAvailability !== "") {
      filtered = filtered.filter(post => post.isAvailable.toString() === filterAvailability);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, filterGender, filterAvailability]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Define columns for table view
  const columns = [
    // Bulk selection column (only shown in bulk mode)
    ...(bulkMode ? [{
      key: 'select',
      header: (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedAccommodations.size === filteredPosts.length && filteredPosts.length > 0}
            onChange={() => {
              if (selectedAccommodations.size === filteredPosts.length) {
                setSelectedAccommodations(new Set());
              } else {
                setSelectedAccommodations(new Set(filteredPosts.map(post => post._id)));
              }
            }}
            className="rounded border-gray-300 text-mcan-primary focus:ring-mcan-primary"
          />
        </div>
      ),
      render: (value, item) => (
        <input
          type="checkbox"
          checked={selectedAccommodations.has(item._id)}
          onChange={() => handleAccommodationSelect(item._id)}
          className="rounded border-gray-300 text-mcan-primary focus:ring-mcan-primary"
        />
      )
    }] : []),
    {
      key: 'title',
      header: 'Title',
      render: (value, item) => <span className="font-medium">{value}</span>
    },
    {
      key: 'location',
      header: 'Location',
      render: (value, item) => (
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-1 text-mcan-primary" />
          {value}
        </div>
      )
    },
    {
      key: 'guest',
      header: 'Guests',
      render: (value, item) => (
        <div className="flex items-center">
          <FaUsers className="mr-1 text-mcan-secondary" />
          {value}
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (value, item) => `₦${value?.toLocaleString()}/month`
    },
    {
      key: 'bookingLimits',
      header: 'Booking Limits',
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <BookingStatsDisplay accommodation={item} showDetails={false} size="sm" />
          <button
            onClick={() => handleEditBookingLimit(item)}
            className="text-mcan-primary hover:text-mcan-secondary transition-colors"
            title="Edit Booking Limit"
          >
            <FaChartBar />
          </button>
        </div>
      )
    },
    {
      key: 'adminStatus',
      header: 'Admin Status',
      render: (value, item) => {
        const statusBadge = getStatusBadge(value || 'active', item.isVisible !== false);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
        );
      }
    },
    {
      key: 'isAvailable',
      header: 'Booking Status',
      render: (value) => {
        const availabilityBadge = getAvailabilityBadge(value);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${availabilityBadge.color}`}>
            {availabilityBadge.label}
          </span>
        );
      }
    }
  ];

  // Custom card component for accommodations
  const AccommodationCard = ({ item, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Bulk selection checkbox */}
      {bulkMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={selectedAccommodations.has(item._id)}
            onChange={() => handleAccommodationSelect(item._id)}
            className="w-5 h-5 rounded border-gray-300 text-mcan-primary focus:ring-mcan-primary bg-white shadow-lg"
          />
        </div>
      )}

      {/* Image */}
      <div className="relative h-48">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=Accommodation';
          }}
        />
        <div className="absolute top-2 right-2 space-y-1">
          {/* Admin Status Badge */}
          {(() => {
            const statusBadge = getStatusBadge(item.adminStatus || 'active', item.isVisible !== false);
            return (
              <div className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                {statusBadge.label}
              </div>
            );
          })()}
          {/* Booking Status Badge */}
          {(() => {
            const availabilityBadge = getAvailabilityBadge(item.isAvailable);
            return (
              <div className={`px-2 py-1 text-xs font-semibold rounded-full ${availabilityBadge.color}`}>
                {availabilityBadge.label}
              </div>
            );
          })()}
        </div>
        <div className={`absolute top-2 ${bulkMode ? 'left-8' : 'left-2'}`}>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-mcan-primary text-white">
            {item.genderRestriction === 'brothers' ? 'Brothers' :
             item.genderRestriction === 'sisters' ? 'Sisters' :
             item.genderRestriction === 'family' ? 'Family' : 'Any'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center text-gray-600 mb-2">
          <FaMapMarkerAlt className="mr-2 text-mcan-primary" />
          <span className="text-sm">{item.location}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-4">
          <FaUsers className="mr-2 text-mcan-secondary" />
          <span className="text-sm">Up to {item.guest} guests</span>
        </div>
        
        {/* Booking Statistics */}
        <div className="mb-4">
          <BookingStatsDisplay accommodation={item} showDetails={true} size="sm" />
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-mcan-primary">
            ₦{item.price?.toLocaleString()}
            <span className="text-sm font-normal text-gray-600">/month</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        {/* Main Actions */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex space-x-2">
            <MobileButton
              onClick={() => onView(item)}
              variant="ghost"
              size="sm"
              icon={FaEye}
              className="text-blue-600 hover:text-blue-900"
              title="View Accommodation"
            />
            <MobileButton
              onClick={() => onEdit(item)}
              variant="ghost"
              size="sm"
              icon={FaEdit}
              className="text-mcan-primary hover:text-mcan-secondary"
              title="Edit Accommodation"
            />
            <MobileButton
              onClick={() => handleEditBookingLimit(item)}
              variant="ghost"
              size="sm"
              icon={FaChartBar}
              className="text-green-600 hover:text-green-900"
              title="Edit Booking Limit"
            />
            <MobileButton
              onClick={() => onDelete(item)}
              variant="ghost"
              size="sm"
              icon={FaTrash}
              className="text-red-600 hover:text-red-900"
              title="Delete Accommodation"
            />
          </div>
        </div>

        {/* Status Management */}
        <div className="border-t pt-3">
          <div className="text-xs text-gray-600 mb-2">Quick Status Actions:</div>
          <div className="flex flex-wrap gap-1">
            <MobileButton
              onClick={() => handleStatusChange(item, 'active')}
              variant="ghost"
              size="xs"
              icon={FaCheck}
              className="text-green-600 hover:text-green-900"
              title="Make Active"
            />
            <MobileButton
              onClick={() => handleStatusChange(item, 'hidden')}
              variant="ghost"
              size="xs"
              icon={FaEyeSlash}
              className="text-gray-600 hover:text-gray-900"
              title="Hide"
            />
            <MobileButton
              onClick={() => handleStatusChange(item, 'coming_soon')}
              variant="ghost"
              size="xs"
              icon={FaClock}
              className="text-blue-600 hover:text-blue-900"
              title="Coming Soon"
            />
            <MobileButton
              onClick={() => handleStatusChange(item, 'maintenance')}
              variant="ghost"
              size="xs"
              icon={FaCog}
              className="text-yellow-600 hover:text-yellow-900"
              title="Maintenance"
            />
            <MobileButton
              onClick={() => handleStatusChange(item, 'not_available')}
              variant="ghost"
              size="xs"
              icon={FaTimes}
              className="text-red-600 hover:text-red-900"
              title="Not Available"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout
      title="Accommodations"
      subtitle="Manage listings"
      icon={FaHome}
      navbar={Navbar}
      headerActions={
        <Link to="/admin/add-accommodation">
          <MobileButton
            variant="primary"
            size="sm"
            icon={FaPlus}
          >
            Add
          </MobileButton>
        </Link>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Manage Accommodations"
          subtitle="View and manage all accommodation listings"
          icon={FaHome}
          showOnMobile={false}
          actions={
            <Link to="/admin/add-accommodation">
              <MobileButton
                variant="primary"
                icon={FaPlus}
              >
                Add New Accommodation
              </MobileButton>
            </Link>
          }
        />

        {/* Booking Statistics Summary */}
        <BookingStatsSummary accommodations={filteredPosts} />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters & Actions</h3>
            <div className="flex items-center space-x-2">
              {/* Bulk Mode Toggle */}
              <MobileButton
                onClick={handleBulkModeToggle}
                variant={bulkMode ? "primary" : "secondary"}
                size="sm"
                icon={FaCheckSquare}
              >
                {bulkMode ? 'Exit Bulk Mode' : 'Bulk Mode'}
              </MobileButton>
              
              {/* Bulk Update Button */}
              {bulkMode && selectedAccommodations.size > 0 && (
                <MobileButton
                  onClick={handleBulkUpdateBookingLimits}
                  variant="primary"
                  size="sm"
                  icon={FaChartBar}
                >
                  Update Limits ({selectedAccommodations.size})
                </MobileButton>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Search">
              <MobileInput
                type="text"
                placeholder="Search accommodations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FaSearch}
              />
            </FormField>

            <FormField label="Gender">
              <ResponsiveSelect
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                options={[
                  { value: 'brothers', label: 'Brothers Only' },
                  { value: 'sisters', label: 'Sisters Only' },
                  { value: 'family', label: 'Family' }
                ]}
                placeholder="All Genders"
              />
            </FormField>

            <FormField label="Availability">
              <ResponsiveSelect
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                options={[
                  { value: 'true', label: 'Available' },
                  { value: 'false', label: 'Not Available' }
                ]}
                placeholder="All Status"
              />
            </FormField>

            <FormField label="Actions">
              <MobileButton
                onClick={() => {
                  setSearchTerm("");
                  setFilterGender("");
                  setFilterAvailability("");
                  setBulkMode(false);
                  setSelectedAccommodations(new Set());
                }}
                variant="secondary"
                fullWidth
              >
                Clear All
              </MobileButton>
            </FormField>
          </div>

          {/* Bulk Mode Info */}
          {bulkMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  <FaCheckSquare className="inline mr-2" />
                  Bulk mode active - Select accommodations to update booking limits
                </span>
                <span className="text-sm font-medium text-blue-900">
                  {selectedAccommodations.size} selected
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Data Display */}
        <ResponsiveDataDisplay
          data={filteredPosts}
          columns={columns}
          loading={loading}
          emptyMessage={posts.length === 0 ? "Get started by creating your first accommodation listing." : "Try adjusting your search criteria or clear the filters."}
          emptyIcon={FaHome}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={AccommodationCard}
          showViewToggle={true}
        />

        {/* Booking Limit Modals */}
        <BookingLimitModal
          isOpen={bookingLimitModal.isOpen}
          onClose={() => setBookingLimitModal({ isOpen: false, accommodation: null })}
          accommodation={bookingLimitModal.accommodation}
          onSuccess={handleBookingLimitSuccess}
        />

        <BulkBookingLimitModal
          isOpen={bulkBookingLimitModal.isOpen}
          onClose={() => setBulkBookingLimitModal({ isOpen: false })}
          accommodations={posts.filter(post => selectedAccommodations.has(post._id))}
          onSuccess={handleBulkBookingLimitSuccess}
        />
      </div>
    </MobileLayout>
  );
};

export default AllPost;
