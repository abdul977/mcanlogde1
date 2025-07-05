import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaChalkboardTeacher, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaFilter } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllLectures = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const types = [
    { value: "all", label: "All Types" },
    { value: "regular", label: "Regular" },
    { value: "special", label: "Special" },
    { value: "workshop", label: "Workshop" },
    { value: "seminar", label: "Seminar" },
    { value: "conference", label: "Conference" }
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" }
  ];

  // Fetch lectures from server
  const fetchLectures = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/lectures/admin/get-all-lectures`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setLectures(data.lectures || []);
        setFilteredLectures(data.lectures || []);
        if (showRefreshLoader) {
          toast.success("Lectures refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching lectures", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast.error("Failed to fetch lectures. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter lectures based on search and filters
  useEffect(() => {
    let filtered = lectures;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lecture =>
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.speaker?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(lecture => lecture.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(lecture => lecture.status === selectedStatus);
    }

    setFilteredLectures(filtered);
  }, [lectures, searchTerm, selectedType, selectedStatus]);

  // Load lectures on component mount
  useEffect(() => {
    fetchLectures();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchLectures(true);
  };

  // Handle view lecture
  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/lectures/admin/get-lecture-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        // Navigate to a view page or show modal with lecture details
        navigate(`/admin/view-lecture/${id}`);
      } else {
        toast.error(data?.message || "Error fetching lecture details");
      }
    } catch (error) {
      console.error("Error fetching lecture:", error);
      toast.error("Failed to fetch lecture details. Please try again.");
    }
  };

  // Handle edit lecture
  const handleEdit = (id) => {
    navigate(`/admin/edit-lecture/${id}`);
  };

  // Handle delete lecture
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/lectures/admin/delete-lecture/${id}`,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );

        if (data?.success) {
          toast.success("Lecture deleted successfully!");
          fetchLectures();
        } else {
          toast.error(data?.message || "Error deleting lecture");
        }
      } catch (error) {
        console.error("Error deleting lecture:", error);
        toast.error("Failed to delete lecture. Please try again.");
      }
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      draft: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      regular: "bg-blue-100 text-blue-800",
      special: "bg-purple-100 text-purple-800",
      workshop: "bg-green-100 text-green-800",
      seminar: "bg-orange-100 text-orange-800",
      conference: "bg-red-100 text-red-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                  <FaChalkboardTeacher className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Lectures</h1>
                  <p className="text-gray-600">View and manage all MCAN lectures</p>
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
                  title="Refresh Lectures"
                >
                  <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link
                  to="/admin/create-lecture"
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus />
                  Add Lecture
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
                    placeholder="Search lectures..."
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
                  Showing {filteredLectures.length} of {lectures.length} lectures
                </div>
              </div>
            </div>
          </div>

          {/* Lectures List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading lectures...</span>
              </div>
            ) : filteredLectures.length === 0 ? (
              <div className="text-center py-16">
                <FaChalkboardTeacher className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Lectures Found</h3>
                <p className="text-gray-500 mb-4">
                  {lectures.length === 0 
                    ? "No lectures have been created yet." 
                    : "No lectures match your current filters."
                  }
                </p>
                <Link
                  to="/admin/create-lecture"
                  className="inline-flex items-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus className="mr-2" />
                  Create First Lecture
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lecture
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Speaker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                    {filteredLectures.map((lecture) => (
                      <tr key={lecture._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {lecture.image && (
                              <img
                                src={lecture.image}
                                alt={lecture.title}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {lecture.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {lecture.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lecture.speaker?.name || "TBA"}</div>
                          <div className="text-sm text-gray-500">{lecture.speaker?.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(lecture.type)}`}>
                            {lecture.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(lecture.schedule?.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(lecture.status)}`}>
                            {lecture.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(lecture._id)}
                              className="text-blue-600 hover:text-blue-900 transition duration-300"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEdit(lecture._id)}
                              className="text-green-600 hover:text-green-900 transition duration-300"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(lecture._id, lecture.title)}
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
          {!loading && filteredLectures.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-mcan-primary">{lectures.length}</div>
                  <div className="text-sm text-gray-600">Total Lectures</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {lectures.filter(l => l.status === 'published').length}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {lectures.filter(l => l.status === 'draft').length}
                  </div>
                  <div className="text-sm text-gray-600">Draft</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {lectures.filter(l => l.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllLectures;
