import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPen, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaSearch, FaFilter } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const AllBlogs = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalBlogs: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all"
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "islamic-teachings", label: "Islamic Teachings" },
    { value: "community-news", label: "Community News" },
    { value: "events", label: "Events" },
    { value: "announcements", label: "Announcements" },
    { value: "spiritual-guidance", label: "Spiritual Guidance" }
  ];

  // Fetch blogs
  const fetchBlogs = async (page = 1, showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        toast.info("Refreshing blogs...", { position: "bottom-left" });
      } else {
        setLoading(true);
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.search && { search: filters.search })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/admin/get-all-blogs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.data.success) {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination);
        setCurrentPage(page);
        if (showRefreshLoader) {
          toast.success("Blogs refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error("Failed to fetch blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchBlogs(page);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/blog/admin/delete-blog/${id}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Blog post deleted successfully");
          fetchBlogs(currentPage);
        } else {
          toast.error("Failed to delete blog post");
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
        toast.error("Failed to delete blog post. Please try again.");
      }
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Strip HTML tags from content
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    fetchBlogs();
  }, [filters.status, filters.category]);

  // Define columns for ResponsiveDataDisplay
  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (blog) => (
        <div className="font-medium text-gray-900 truncate max-w-xs">
          {blog.title}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (blog) => (
        <span className="text-gray-600">{blog.author || 'Admin'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (blog) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          blog.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : blog.status === 'draft'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {blog.status}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (blog) => (
        <span className="text-gray-600">{blog.category || 'General'}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (blog) => (
        <span className="text-gray-500 text-sm">
          {new Date(blog.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Blog Card Component for mobile view
  const BlogCard = ({ item: blog, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {blog.title}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          blog.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : blog.status === 'draft'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {blog.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Author:</span> {blog.author || 'Admin'}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Category:</span> {blog.category || 'General'}
        </p>
        <p className="text-gray-500 text-xs">
          Created: {new Date(blog.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => onView && onView(blog)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="View Blog"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit && onEdit(blog)}
            className="text-mcan-primary hover:text-mcan-secondary p-1"
            title="Edit Blog"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(blog._id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Blog"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Handle actions
  const handleView = (blog) => {
    window.open(`/blog/${blog.slug}`, '_blank');
  };

  const handleEdit = (blog) => {
    navigate(`/admin/edit-blog/${blog._id}`);
  };

  const handleRefresh = () => {
    fetchBlogs(currentPage, true);
  };

  return (
    <MobileLayout
      title="Blog Posts"
      subtitle="Manage content"
      icon={FaPen}
      navbar={Navbar}
      headerActions={
        <Link to="/admin/create-blog">
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
          title="Manage Blog Posts"
          subtitle="Create, edit, and manage all blog content"
          icon={FaPen}
          showOnMobile={false}
          actions={
            <div className="flex space-x-3">
              <MobileButton
                onClick={handleRefresh}
                variant="secondary"
                icon={FaSync}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </MobileButton>
              <Link to="/admin/create-blog">
                <MobileButton
                  variant="primary"
                  icon={FaPlus}
                >
                  Create New Blog Post
                </MobileButton>
              </Link>
            </div>
          }
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <FormField label="Search Blogs">
              <div className="flex">
                <MobileInput
                  type="text"
                  placeholder="Search blogs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="flex-1 rounded-r-none"
                />
                <MobileButton
                  onClick={handleSearch}
                  variant="primary"
                  className="rounded-l-none px-4"
                  icon={FaSearch}
                />
              </div>
            </FormField>

            {/* Status Filter */}
            <FormField label="Status">
              <ResponsiveSelect
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                options={statusOptions}
              />
            </FormField>

            {/* Category Filter */}
            <FormField label="Category">
              <ResponsiveSelect
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                options={categories}
              />
            </FormField>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <FaFilter className="mr-2" />
              {pagination.totalBlogs} blog(s) found
            </div>
          </div>
        </div>

        {/* Data Display */}
        <ResponsiveDataDisplay
          data={blogs}
          columns={columns}
          loading={loading}
          emptyMessage={blogs.length === 0 ? "Get started by creating your first blog post." : "Try adjusting your search criteria or clear the filters."}
          emptyIcon={FaPen}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={BlogCard}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllBlogs;
