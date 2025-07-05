import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaStar, FaHeart } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

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
            Authorization: auth?.token,
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
  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/community/admin/get-community-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
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
  const handleEdit = (id) => {
    navigate(`/admin/edit-community/${id}`);
  };

  // Handle delete community item
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
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
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Community</h1>
                  <p className="text-gray-600">View and manage all MCAN community items</p>
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
                  title="Refresh Community Items"
                >
                  <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link
                  to="/admin/create-community"
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus />
                  Add Community Item
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
                    placeholder="Search community items..."
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredItems.length} of {communityItems.length} items
                </div>
              </div>
            </div>
          </div>

          {/* Community Items List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading community items...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Community Items Found</h3>
                <p className="text-gray-500 mb-4">
                  {communityItems.length === 0 
                    ? "No community items have been created yet." 
                    : "No items match your current filters."
                  }
                </p>
                <Link
                  to="/admin/create-community"
                  className="inline-flex items-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus className="mr-2" />
                  Create First Community Item
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.type)}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(item._id)}
                              className="text-blue-600 hover:text-blue-900 transition duration-300"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEdit(item._id)}
                              className="text-green-600 hover:text-green-900 transition duration-300"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id, item.title)}
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
          {!loading && filteredItems.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-mcan-primary">{communityItems.length}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {communityItems.filter(item => item.type === 'initiative').length}
                  </div>
                  <div className="text-sm text-gray-600">Initiatives</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {communityItems.reduce((total, item) => total + (item.impact?.beneficiaries || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Beneficiaries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {communityItems.filter(item => item.featured).length}
                  </div>
                  <div className="text-sm text-gray-600">Featured</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCommunity;
