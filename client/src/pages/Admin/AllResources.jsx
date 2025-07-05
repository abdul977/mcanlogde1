import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBook, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllResources = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "books", label: "Books" },
    { value: "articles", label: "Articles" },
    { value: "videos", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "documents", label: "Documents" },
    { value: "links", label: "Links" },
    { value: "apps", label: "Apps" },
    { value: "courses", label: "Courses" }
  ];

  const types = [
    { value: "all", label: "All Types" },
    { value: "file", label: "File" },
    { value: "link", label: "Link" },
    { value: "embedded", label: "Embedded" }
  ];

  // Fetch resources from server
  const fetchResources = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/resources/admin/get-all-resources`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setResources(data.resources || []);
        setFilteredResources(data.resources || []);
        if (showRefreshLoader) {
          toast.success("Resources refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching resources", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to fetch resources. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedType]);

  // Load resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchResources(true);
  };

  // Handle view resource
  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/resources/admin/get-resource-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        navigate(`/admin/view-resource/${id}`);
      } else {
        toast.error(data?.message || "Error fetching resource details");
      }
    } catch (error) {
      console.error("Error fetching resource:", error);
      toast.error("Failed to fetch resource details. Please try again.");
    }
  };

  // Handle edit resource
  const handleEdit = (id) => {
    navigate(`/admin/edit-resource/${id}`);
  };

  // Handle delete resource
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/resources/admin/delete-resource/${id}`,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );

        if (data?.success) {
          toast.success("Resource deleted successfully!");
          fetchResources();
        } else {
          toast.error(data?.message || "Error deleting resource");
        }
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast.error("Failed to delete resource. Please try again.");
      }
    }
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      books: "bg-blue-100 text-blue-800",
      articles: "bg-green-100 text-green-800",
      videos: "bg-red-100 text-red-800",
      audio: "bg-purple-100 text-purple-800",
      documents: "bg-yellow-100 text-yellow-800",
      links: "bg-indigo-100 text-indigo-800",
      apps: "bg-pink-100 text-pink-800",
      courses: "bg-orange-100 text-orange-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      file: "bg-blue-100 text-blue-800",
      link: "bg-green-100 text-green-800",
      embedded: "bg-purple-100 text-purple-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
                  <FaBook className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Resources</h1>
                  <p className="text-gray-600">View and manage all MCAN Islamic resources</p>
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
                  title="Refresh Resources"
                >
                  <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link
                  to="/admin/create-resource"
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus />
                  Add Resource
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
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  />
                </div>
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
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredResources.length} of {resources.length} resources
                </div>
              </div>
            </div>
          </div>

          {/* Resources List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading resources...</span>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-16">
                <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Resources Found</h3>
                <p className="text-gray-500 mb-4">
                  {resources.length === 0 
                    ? "No resources have been created yet." 
                    : "No resources match your current filters."
                  }
                </p>
                <Link
                  to="/admin/create-resource"
                  className="inline-flex items-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus className="mr-2" />
                  Create First Resource
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResources.map((resource) => (
                        <tr key={resource._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {resource.thumbnail && (
                                <img
                                  src={resource.thumbnail}
                                  alt={resource.title}
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {resource.title}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {resource.description}
                                </div>
                                {resource.featured && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mt-1">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{resource.author?.name || "Unknown"}</div>
                            <div className="text-sm text-gray-500">{resource.publisher?.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(resource.category)}`}>
                              {resource.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(resource.type)}`}>
                              {resource.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="text-xs">
                              <div>Views: {resource.statistics?.views || 0}</div>
                              <div>Downloads: {resource.statistics?.downloads || 0}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(resource._id)}
                                className="text-blue-600 hover:text-blue-900 transition duration-300"
                                title="View"
                              >
                                <FaEye />
                              </button>
                              {resource.type === 'file' && resource.content?.fileUrl && (
                                <a
                                  href={resource.content.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-900 transition duration-300"
                                  title="Download"
                                >
                                  <FaDownload />
                                </a>
                              )}
                              {resource.type === 'link' && resource.content?.externalUrl && (
                                <a
                                  href={resource.content.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-900 transition duration-300"
                                  title="Visit Link"
                                >
                                  <FaExternalLinkAlt />
                                </a>
                              )}
                              <button
                                onClick={() => handleEdit(resource._id)}
                                className="text-orange-600 hover:text-orange-900 transition duration-300"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(resource._id, resource.title)}
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

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredResources.map((resource) => (
                    <div key={resource._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          {resource.thumbnail && (
                            <div className="h-16 w-16 flex-shrink-0">
                              <img
                                src={resource.thumbnail}
                                alt={resource.title}
                                className="h-16 w-16 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {resource.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(resource.category)}`}>
                                {resource.category}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(resource.type)}`}>
                                {resource.type}
                              </span>
                              {resource.featured && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Featured
                                </span>
                              )}
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                {resource.statistics?.views || 0} views
                              </span>
                              <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {resource.statistics?.downloads || 0} downloads
                              </span>
                            </div>

                            {(resource.author?.name || resource.publisher?.name) && (
                              <div className="mb-3">
                                <div className="text-sm text-gray-900 font-medium">{resource.author?.name || "Unknown Author"}</div>
                                {resource.publisher?.name && (
                                  <div className="text-sm text-gray-500">{resource.publisher.name}</div>
                                )}
                              </div>
                            )}

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleView(resource._id)}
                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2"
                                title="View"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              {resource.type === 'file' && resource.content?.fileUrl && (
                                <a
                                  href={resource.content.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-900 transition-colors duration-200 p-2"
                                  title="Download"
                                >
                                  <FaDownload className="w-5 h-5" />
                                </a>
                              )}
                              {resource.type === 'link' && resource.content?.externalUrl && (
                                <a
                                  href={resource.content.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-900 transition-colors duration-200 p-2"
                                  title="Visit Link"
                                >
                                  <FaExternalLinkAlt className="w-5 h-5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleEdit(resource._id)}
                                className="text-orange-600 hover:text-orange-900 transition-colors duration-200 p-2"
                                title="Edit"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(resource._id, resource.title)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2"
                                title="Delete"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          {!loading && filteredResources.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-mcan-primary">{resources.length}</div>
                  <div className="text-sm text-gray-600">Total Resources</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {resources.filter(r => r.category === 'books').length}
                  </div>
                  <div className="text-sm text-gray-600">Books</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {resources.filter(r => r.category === 'videos').length}
                  </div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {resources.filter(r => r.category === 'audio').length}
                  </div>
                  <div className="text-sm text-gray-600">Audio</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllResources;
