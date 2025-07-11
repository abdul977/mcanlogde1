import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaSearch, FaUsers, FaMapMarkerAlt, FaEyeSlash, FaCog, FaCheck, FaTimes, FaClock } from "react-icons/fa";
import { useAuth } from "../../context/UserContext";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const AllPost = () => {
  const [auth] = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const navigate = useNavigate();

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
        <div className="absolute top-2 left-2">
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
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
      </div>
    </MobileLayout>
  );
};

export default AllPost;
