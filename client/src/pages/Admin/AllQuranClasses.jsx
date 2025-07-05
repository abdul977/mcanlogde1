import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaQuran, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllQuranClasses = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const programs = [
    { value: "all", label: "All Programs" },
    { value: "memorization", label: "Memorization" },
    { value: "tajweed", label: "Tajweed" },
    { value: "tafseer", label: "Tafseer" },
    { value: "arabic", label: "Arabic" },
    { value: "general", label: "General" }
  ];

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  // Fetch classes from server
  const fetchClasses = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/quran-classes/admin/get-all-classes`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setClasses(data.classes || []);
        setFilteredClasses(data.classes || []);
        if (showRefreshLoader) {
          toast.success("Classes refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching classes", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter classes based on search and filters
  useEffect(() => {
    let filtered = classes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Program filter
    if (selectedProgram !== "all") {
      filtered = filtered.filter(cls => cls.program === selectedProgram);
    }

    // Level filter
    if (selectedLevel !== "all") {
      filtered = filtered.filter(cls => cls.level === selectedLevel);
    }

    setFilteredClasses(filtered);
  }, [classes, searchTerm, selectedProgram, selectedLevel]);

  // Load classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchClasses(true);
  };

  // Handle view class
  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/quran-classes/admin/get-class-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        // Navigate to a view page or show modal with class details
        navigate(`/admin/view-quran-class/${id}`);
      } else {
        toast.error(data?.message || "Error fetching class details");
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error("Failed to fetch class details. Please try again.");
    }
  };

  // Handle edit class
  const handleEdit = (id) => {
    navigate(`/admin/edit-quran-class/${id}`);
  };

  // Handle delete class
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/quran-classes/admin/delete-class/${id}`,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );

        if (data?.success) {
          toast.success("Class deleted successfully!");
          fetchClasses();
        } else {
          toast.error(data?.message || "Error deleting class");
        }
      } catch (error) {
        console.error("Error deleting class:", error);
        toast.error("Failed to delete class. Please try again.");
      }
    }
  };

  // Get program badge color
  const getProgramBadge = (program) => {
    const colors = {
      memorization: "bg-green-100 text-green-800",
      tajweed: "bg-blue-100 text-blue-800",
      tafseer: "bg-purple-100 text-purple-800",
      arabic: "bg-orange-100 text-orange-800",
      general: "bg-gray-100 text-gray-800"
    };
    return colors[program] || "bg-gray-100 text-gray-800";
  };

  // Get level badge color
  const getLevelBadge = (level) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
      all: "bg-blue-100 text-blue-800"
    };
    return colors[level] || "bg-gray-100 text-gray-800";
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
                  <FaQuran className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Quran Classes</h1>
                  <p className="text-gray-600">View and manage all MCAN Quran classes</p>
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
                  title="Refresh Classes"
                >
                  <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link
                  to="/admin/create-quran-class"
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus />
                  Add Class
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
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {programs.map(program => (
                    <option key={program.value} value={program.value}>
                      {program.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredClasses.length} of {classes.length} classes
                </div>
              </div>
            </div>
          </div>

          {/* Classes List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading classes...</span>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-16">
                <FaQuran className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Classes Found</h3>
                <p className="text-gray-500 mb-4">
                  {classes.length === 0 
                    ? "No Quran classes have been created yet." 
                    : "No classes match your current filters."
                  }
                </p>
                <Link
                  to="/admin/create-quran-class"
                  className="inline-flex items-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus className="mr-2" />
                  Create First Class
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
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClasses.map((quranClass) => (
                        <tr key={quranClass._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {quranClass.image && (
                                <img
                                  src={quranClass.image}
                                  alt={quranClass.title}
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {quranClass.title}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {quranClass.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{quranClass.instructor?.name || "TBA"}</div>
                            <div className="text-sm text-gray-500">{quranClass.instructor?.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgramBadge(quranClass.program)}`}>
                              {quranClass.program}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(quranClass.level)}`}>
                              {quranClass.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {quranClass.enrollment?.currentStudents || 0}/{quranClass.enrollment?.maxStudents || quranClass.maxStudents || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(quranClass._id)}
                                className="text-blue-600 hover:text-blue-900 transition duration-300"
                                title="View"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEdit(quranClass._id)}
                                className="text-green-600 hover:text-green-900 transition duration-300"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(quranClass._id, quranClass.title)}
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
                  {filteredClasses.map((quranClass) => (
                    <div key={quranClass._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          {quranClass.image && (
                            <div className="h-16 w-16 flex-shrink-0">
                              <img
                                src={quranClass.image}
                                alt={quranClass.title}
                                className="h-16 w-16 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {quranClass.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {quranClass.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgramBadge(quranClass.program)}`}>
                                {quranClass.program}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(quranClass.level)}`}>
                                {quranClass.level}
                              </span>
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                {quranClass.enrollment?.currentStudents || 0}/{quranClass.enrollment?.maxStudents || quranClass.maxStudents || 0} Students
                              </span>
                            </div>

                            {quranClass.instructor && (
                              <div className="mb-3">
                                <div className="text-sm text-gray-900 font-medium">{quranClass.instructor.name || "TBA"}</div>
                                {quranClass.instructor.title && (
                                  <div className="text-sm text-gray-500">{quranClass.instructor.title}</div>
                                )}
                              </div>
                            )}

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleView(quranClass._id)}
                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2"
                                title="View"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(quranClass._id)}
                                className="text-green-600 hover:text-green-900 transition-colors duration-200 p-2"
                                title="Edit"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(quranClass._id, quranClass.title)}
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

                {/* Summary */}
                {!loading && filteredClasses.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-mcan-primary">{classes.length}</div>
                  <div className="text-sm text-gray-600">Total Classes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {classes.filter(c => c.program === 'memorization').length}
                  </div>
                  <div className="text-sm text-gray-600">Memorization</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {classes.filter(c => c.program === 'tajweed').length}
                  </div>
                  <div className="text-sm text-gray-600">Tajweed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {classes.filter(c => c.program === 'tafseer').length}
                  </div>
                  <div className="text-sm text-gray-600">Tafseer</div>
                </div>
              </div>
            </div>
          )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllQuranClasses;
