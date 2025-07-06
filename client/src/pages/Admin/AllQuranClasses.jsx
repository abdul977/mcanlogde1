import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaQuran, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaUsers } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";

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
            Authorization: `Bearer ${auth?.token}`,
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
            Authorization: `Bearer ${auth?.token}`,
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
              Authorization: `Bearer ${auth?.token}`,
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

  // Define columns for ResponsiveDataDisplay
  const columns = [
    {
      key: 'title',
      label: 'Class',
      render: (quranClass) => (
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
      )
    },
    {
      key: 'instructor',
      label: 'Instructor',
      render: (quranClass) => (
        <div>
          <div className="text-sm text-gray-900">{quranClass.instructor?.name || "TBA"}</div>
          <div className="text-sm text-gray-500">{quranClass.instructor?.title}</div>
        </div>
      )
    },
    {
      key: 'program',
      label: 'Program',
      render: (quranClass) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgramBadge(quranClass.program)}`}>
          {quranClass.program}
        </span>
      )
    },
    {
      key: 'level',
      label: 'Level',
      render: (quranClass) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(quranClass.level)}`}>
          {quranClass.level}
        </span>
      )
    },
    {
      key: 'students',
      label: 'Students',
      render: (quranClass) => (
        <div className="text-sm text-gray-900">
          {quranClass.enrollment?.currentStudents || 0}/{quranClass.enrollment?.maxStudents || quranClass.maxStudents || 0}
        </div>
      )
    }
  ];

  // Card component for mobile view
  const QuranClassCard = ({ item: quranClass, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
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
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {quranClass.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
            {quranClass.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgramBadge(quranClass.program)}`}>
          {quranClass.program}
        </span>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(quranClass.level)}`}>
          {quranClass.level}
        </span>
        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
          <FaUsers className="mr-1" />
          {quranClass.enrollment?.currentStudents || 0}/{quranClass.enrollment?.maxStudents || quranClass.maxStudents || 0}
        </span>
      </div>

      {quranClass.instructor && (
        <div className="text-xs text-gray-600">
          <div className="font-medium">{quranClass.instructor.name || "TBA"}</div>
          {quranClass.instructor.title && (
            <div>{quranClass.instructor.title}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-xs text-gray-500">
          Instructor: {quranClass.instructor?.name || "TBA"}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onView(quranClass._id)}
            className="text-blue-600 hover:text-blue-900 transition duration-300 p-1"
            title="View"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onEdit(quranClass._id)}
            className="text-green-600 hover:text-green-900 transition duration-300 p-1"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(quranClass._id, quranClass.title)}
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
      <Link to="/admin/create-quran-class">
        <MobileButton
          variant="primary"
          icon={FaPlus}
          fullWidth={true}
        >
          Add Class
        </MobileButton>
      </Link>
    </div>
  );

  return (
    <MobileLayout
      title="Manage Quran Classes"
      subtitle="View and manage all MCAN Quran classes"
      icon={FaQuran}
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
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
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
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-xs lg:text-sm text-gray-600 p-2">
                Showing {filteredClasses.length} of {classes.length} classes
              </div>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <ResponsiveDataDisplay
          data={filteredClasses}
          columns={columns}
          loading={loading}
          emptyMessage={
            classes.length === 0
              ? "No Quran classes have been created yet."
              : "No classes match your current filters."
          }
          emptyIcon={FaQuran}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={QuranClassCard}
          showViewToggle={true}
        />

        {/* Summary */}
        {!loading && filteredClasses.length > 0 && (
          <div className="mt-4 lg:mt-6 bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-mcan-primary">{classes.length}</div>
                <div className="text-xs lg:text-sm text-gray-600">Total Classes</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  {classes.filter(c => c.program === 'memorization').length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Memorization</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-blue-600">
                  {classes.filter(c => c.program === 'tajweed').length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Tajweed</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-purple-600">
                  {classes.filter(c => c.program === 'tafseer').length}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Tafseer</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AllQuranClasses;
