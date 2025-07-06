import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaChalkboardTeacher, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaFilter } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

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
            Authorization: `Bearer ${auth?.token}`,
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
            Authorization: `Bearer ${auth?.token}`,
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

  // Define columns for ResponsiveDataDisplay
  const columns = [
    {
      key: 'title',
      label: 'Lecture',
      sortable: true,
      render: (lecture) => (
        <div className="font-medium text-gray-900 truncate max-w-xs">
          {lecture.title}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (lecture) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {lecture.type}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (lecture) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lecture.status)}`}>
          {lecture.status}
        </span>
      )
    },
    {
      key: 'speaker',
      label: 'Speaker',
      render: (lecture) => (
        <span className="text-gray-600">{lecture.speaker?.name || 'TBA'}</span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (lecture) => (
        <span className="text-gray-500 text-sm">
          {lecture.date ? formatDate(lecture.date) : 'TBA'}
        </span>
      )
    }
  ];

  // Lecture Card Component for mobile view
  const LectureCard = ({ item: lecture, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {lecture.title}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lecture.status)}`}>
          {lecture.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Type:</span>
          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {lecture.type}
          </span>
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Speaker:</span> {lecture.speaker?.name || 'TBA'}
        </p>
        <p className="text-gray-500 text-xs">
          Date: {lecture.date ? formatDate(lecture.date) : 'TBA'}
        </p>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => onView && onView(lecture)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="View Lecture"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit && onEdit(lecture)}
            className="text-mcan-primary hover:text-mcan-secondary p-1"
            title="Edit Lecture"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(lecture._id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Lecture"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout
      title="Lectures"
      subtitle="Manage lectures"
      icon={FaChalkboardTeacher}
      navbar={Navbar}
      headerActions={
        <Link to="/admin/create-lecture">
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
          title="Manage Lectures"
          subtitle="View and manage all MCAN lectures"
          icon={FaChalkboardTeacher}
          showOnMobile={false}
          actions={
            <div className="flex space-x-3">
              <MobileButton
                onClick={handleRefresh}
                variant="secondary"
                icon={FaSync}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </MobileButton>
              <Link to="/admin/create-lecture">
                <MobileButton
                  variant="primary"
                  icon={FaPlus}
                >
                  Create New Lecture
                </MobileButton>
              </Link>
            </div>
          }
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <FormField label="Search Lectures">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <MobileInput
                  type="text"
                  placeholder="Search lectures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>

            {/* Type Filter */}
            <FormField label="Type">
              <ResponsiveSelect
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={types}
              />
            </FormField>

            {/* Status Filter */}
            <FormField label="Status">
              <ResponsiveSelect
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={statuses}
              />
            </FormField>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <FaFilter className="mr-2" />
              {filteredLectures.length} of {lectures.length} lectures
            </div>
          </div>
        </div>

        {/* Data Display */}
        <ResponsiveDataDisplay
          data={filteredLectures}
          columns={columns}
          loading={loading}
          emptyMessage="Get started by creating your first lecture."
          emptyIcon={FaChalkboardTeacher}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={LectureCard}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllLectures;

