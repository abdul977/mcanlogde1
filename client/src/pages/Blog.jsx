import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendar, FaUser, FaClock, FaSearch, FaFilter, FaStar, FaTags, FaNewspaper, FaSync } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import MobileLayout, { MobilePageHeader, MobileButton, ResponsiveContainer } from "../components/Mobile/MobileLayout";
import { FormSection, ResponsiveSelect } from "../components/Mobile/ResponsiveForm";
import { useMobileResponsive } from "../hooks/useMobileResponsive";

const Blog = () => {
  const { isMobile, isTablet } = useMobileResponsive();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    tag: ""
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

  // Fetch blogs
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.tag && { tag: filters.tag })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/get-all-blogs?${params}`
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

  // Fetch featured blogs
  const fetchFeaturedBlogs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/featured-blogs?limit=3`
      );

      if (response.data.success) {
        setFeaturedBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(1);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    fetchFeaturedBlogs();
    fetchBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs(1);
  }, [filters.category]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBlogs(1).finally(() => setRefreshing(false));
    fetchFeaturedBlogs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">MCAN Blog</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Insights, Knowledge, and Islamic Guidance for Corps Members
            </p>
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="flex-1 px-4 py-3 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-mcan-primary rounded-r-md hover:bg-gray-100 transition duration-300"
                >
                  <FaSearch />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Blogs */}
        {featuredBlogs.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <FaStar className="text-yellow-500 mr-2" />
              <h2 className="text-3xl font-bold text-gray-800">Featured Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <div key={blog._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                  <div className="relative">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <FaStar className="mr-1" />
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <FaCalendar className="mr-2" />
                      <span>{formatDate(blog.publishDate)}</span>
                      <span className="mx-2">•</span>
                      <FaClock className="mr-2" />
                      <span>{blog.readTime} min read</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUser className="mr-2" />
                        <span>{blog.author}</span>
                      </div>
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="text-mcan-primary hover:text-mcan-secondary font-medium transition duration-300"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter by:</span>
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
            >
              {categories.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search by keyword..."
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
            </div>

            <div className="text-gray-600">
              {pagination.totalBlogs} article(s) found
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
            <span className="ml-3 text-gray-600">Loading articles...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-300 mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Articles Found</h3>
            <p className="text-gray-500">
              {filters.search || filters.category !== "all"
                ? "Try adjusting your search criteria or browse all categories."
                : "Check back later for new articles and insights."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((blog) => (
                <article key={blog._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                  <div className="relative">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-mcan-primary text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <FaCalendar className="mr-2" />
                      <span>{formatDate(blog.publishDate)}</span>
                      <span className="mx-2">•</span>
                      <FaClock className="mr-2" />
                      <span>{blog.readTime} min read</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex items-center mb-4">
                        <FaTags className="mr-2 text-gray-400" />
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUser className="mr-2" />
                        <span>{blog.author}</span>
                      </div>
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="text-mcan-primary hover:text-mcan-secondary font-medium transition duration-300"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchBlogs(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => fetchBlogs(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
