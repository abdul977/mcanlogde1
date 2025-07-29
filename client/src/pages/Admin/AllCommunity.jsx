import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaStar, FaHeart } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { MobileButton } from "../../components/Mobile/MobileLayout";

const AllCommunity = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [communityItems, setCommunityItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const types = [
    { value: "all", label: "All Types" },
    { value: "initiative", label: "Initiative" },
    { value: "testimonial", label: "Testimonial" },
    { value: "story", label: "Story" },
    { value: "achievement", label: "Achievement" },
    { value: "event", label: "Event" },
    { value: "project", label: "Project" },
    { value: "announcement", label: "Announcement" }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "education", label: "Education" },
    { value: "welfare", label: "Welfare" },
    { value: "spiritual", label: "Spiritual" },
    { value: "social", label: "Social" },
    { value: "charity", label: "Charity" },
    { value: "youth", label: "Youth" },
    { value: "women", label: "Women" }
  ];

  // Fetch community items from server
  const fetchCommunityItems = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/community/admin/get-all-community`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        setCommunityItems(data.community || []);
        setFilteredItems(data.community || []);
        if (showRefreshLoader) {
          toast.success("Community items refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching community items", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching community items:", error);
      toast.error("Failed to fetch community items. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = communityItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [communityItems, searchTerm, selectedType, selectedCategory]);

  // Load community items on component mount
  useEffect(() => {
    fetchCommunityItems();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchCommunityItems(true);
  };

  // Handle view community item
  const handleView = async (itemOrId) => {
    try {
      // Extract ID from item object or use directly if it's already an ID
      const id = typeof itemOrId === 'object' ? itemOrId._id || itemOrId.id : itemOrId;

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/community/admin/get-community-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        navigate(`/admin/view-community/${id}`);
      } else {
        toast.error(data?.message || "Error fetching community details");
      }
    } catch (error) {
      console.error("Error fetching community item:", error);
      toast.error("Failed to fetch community details. Please try again.");
    }
  };

  // Handle edit community item
  const handleEdit = (itemOrId) => {
    // Extract ID from item object or use directly if it's already an ID
    const id = typeof itemOrId === 'object' ? itemOrId._id || itemOrId.id : itemOrId;
    navigate(`/admin/edit-community/${id}`);
  };

  // Handle delete community item
  const handleDelete = async (itemOrId, title) => {
    // Extract ID and title from item object or use directly if they're already provided
    const id = typeof itemOrId === 'object' ? itemOrId._id || itemOrId.id : itemOrId;
    const itemTitle = typeof itemOrId === 'object' ? itemOrId.title : title;

    if (window.confirm(`Are you sure you want to delete "${itemTitle}"?`)) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/community/admin/delete-community/${id}`,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );

        if (data?.success) {
          toast.success("Community item deleted successfully!");
          fetchCommunityItems();
        } else {
          toast.error(data?.message || "Error deleting community item");
        }
      } catch (error) {
        console.error("Error deleting community item:", error);
        toast.error("Failed to delete community item. Please try again.");
      }
    }
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      initiative: "bg-blue-100 text-blue-800",
      testimonial: "bg-green-100 text-green-800",
      story: "bg-purple-100 text-purple-800",
      achievement: "bg-yellow-100 text-yellow-800",
      event: "bg-red-100 text-red-800",
      project: "bg-indigo-100 text-indigo-800",
      announcement: "bg-pink-100 text-pink-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      general: "bg-gray-100 text-gray-800",
      education: "bg-blue-100 text-blue-800",
      welfare: "bg-green-100 text-green-800",
      spiritual: "bg-purple-100 text-purple-800",
      social: "bg-pink-100 text-pink-800",
      charity: "bg-orange-100 text-orange-800",
      youth: "bg-indigo-100 text-indigo-800",
      women: "bg-red-100 text-red-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Get priority badge color
  const getPriorityBadge = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  // Format number
  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };

  // Define columns for ResponsiveDataDisplay
  const columns = [
    {
      key: 'title',
      label: 'Item',
      render: (item) => (
        <div className="flex items-center">
          {item.primaryImage && (
            <img
              src={item.primaryImage}
              alt={item.title}
              className="w-10 h-10 rounded-lg object-cover mr-3"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 line-clamp-1">
              {item.title}
              {item.featured && (
                <FaStar className="inline ml-2 text-yellow-500" />
              )}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {item.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.type)}`}>
          {item.type}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(item.category)}`}>
          {item.category}
        </span>
      )
    },
    {
      key: 'impact',
      label: 'Impact',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <FaUsers className="text-gray-400" />
          <span>{formatNumber(item.impact?.beneficiaries || 0)}</span>
          {item.impact?.feedback?.averageRating > 0 && (
            <>
              <FaStar className="text-yellow-500 ml-2" />
              <span>{item.impact.feedback.averageRating.toFixed(1)}</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
          {item.priority}
        </span>
      )
    }
  ];

  // Card component for mobile view
  const CommunityCard = ({ item, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-1">
          {item.primaryImage && (
            <img
              src={item.primaryImage}
              alt={item.title}
              className="w-12 h-12 rounded-lg object-cover mr-3"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {item.title}
              {item.featured && (
                <FaStar className="inline ml-2 text-yellow-500" />
              )}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
              {item.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.type)}`}>
          {item.type}
        </span>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(item.category)}`}>
          {item.category}
        </span>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
          {item.priority}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaUsers className="text-gray-400" />
          <span>{formatNumber(item.impact?.beneficiaries || 0)}</span>
          {item.impact?.feedback?.averageRating > 0 && (
            <>
              <FaStar className="text-yellow-500 ml-2" />
              <span>{item.impact.feedback.averageRating.toFixed(1)}</span>
            </>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onView(item._id)}
            className="text-blue-600 hover:text-blue-900 transition duration-300 p-1"
            title="View"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onEdit(item._id)}
            className="text-green-600 hover:text-green-900 transition duration-300 p-1"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(item._id, item.title)}
            className="text-red-600 hover:text-red-900 transition duration-300 p-1"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );

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
      <Link to="/admin/create-community">
        <MobileButton
          variant="primary"
          icon={FaPlus}
          fullWidth={true}
        >
          Add Community Item
        </MobileButton>
      </Link>
    </div>
  );

  return (
    <MobileLayout
      title="Manage Community"
      subtitle="View and manage all MCAN community items"
      icon={FaUsers}
      navbar={Navbar}
      headerActions={headerActions}
      backgroundColor="bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5"
    >
      <div className="p-4 lg:p-8">

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search community items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-xs lg:text-sm text-gray-600 p-2">
                Showing {filteredItems.length} of {communityItems.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Community Items List */}
        <ResponsiveDataDisplay
          data={filteredItems}
          columns={columns}
          loading={loading}
          emptyMessage={
            communityItems.length === 0
              ? "No community items have been created yet."
              : "No items match your current filters."
          }
          emptyIcon={FaUsers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={CommunityCard}
          showViewToggle={true}
        />

        {/* Summary */}
        {!loading && filteredItems.length > 0 && (
          <div className="mt-4 lg:mt-6 bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-mcan-primary">{communityItems.length}</div>
                <div className="text-xs lg:text-sm text-gray-600">Total Items</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-blue-600">
                  {communityItems.filter(item => item.type === 'initiative').length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Initiatives</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  {communityItems.reduce((total, item) => total + (item.impact?.beneficiaries || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Total Beneficiaries</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-yellow-600">
                  {communityItems.filter(item => item.featured).length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Featured</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AllCommunity;
