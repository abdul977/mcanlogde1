import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPen, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaSearch, FaStar } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllBlogs = () => {
  const [auth] = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: ""
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0
  });

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "islamic", label: "Islamic" },
    { value: "education", label: "Education" },
    { value: "community", label: "Community" },
    { value: "events", label: "Events" },
    { value: "announcements", label: "Announcements" }
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" }
  ];

  // Fetch blogs
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
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
            Authorization: auth?.token,
          },
        }
      );

      if (response.data.success) {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to fetch blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  // Delete blog
  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/blog/delete-blog/${blogId}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Blog deleted successfully");
        fetchBlogs(pagination.currentPage);
      } else {
        toast.error("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(1);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Strip HTML tags from content
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    fetchBlogs();
  }, [filters.status, filters.category]);

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
                  <FaPen className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Blog Posts</h1>
                  <p className="text-gray-600">Create, edit, and manage all blog content</p>
                </div>
              </div>
              <Link
                to="/admin/create-blog"
                className="bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300 flex items-center"
              >
                <FaPlus className="mr-2" />
                New Blog Post
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-mcan-primary text-white rounded-r-md hover:bg-mcan-secondary transition duration-300"
                >
                  <FaSearch />
                </button>
              </form>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {categories.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Results Count */}
              <div className="flex items-center text-gray-600">
                <FaFilter className="mr-2" />
                {pagination.totalBlogs} blog(s) found
              </div>
            </div>
          </div>

          {/* Blog List */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading blogs...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {blogs.length === 0 ? (
                <div className="p-8 text-center">
                  <FaPen className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first blog post.</p>
                  <Link
                    to="/admin/create-blog"
                    className="bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300 inline-flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Create Blog Post
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blog Post
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-4">
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {blog.title}
                                  </h3>
                                  {blog.featured && (
                                    <FaStar className="ml-2 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {blog.excerpt}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  By {blog.author} • {blog.readTime} min read
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 capitalize">
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(blog.status)}`}>
                              {blog.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(blog.publishDate || blog.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {blog.views.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                title="View Blog"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              <Link
                                to={`/admin/edit-blog/${blog._id}`}
                                className="text-mcan-primary hover:text-mcan-secondary transition-colors duration-200"
                                title="Edit Blog"
                              >
                                <FaEdit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(blog._id)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                title="Delete Blog"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => fetchBlogs(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => fetchBlogs(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                          <span className="font-medium">{pagination.totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => fetchBlogs(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => fetchBlogs(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBlogs;
