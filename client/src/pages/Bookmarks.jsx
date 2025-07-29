import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBookmark, FaCalendar, FaClock, FaSearch, FaFilter, FaTrash, FaEye } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/auth";
import MobileLayout, { MobilePageHeader, MobileButton, ResponsiveContainer } from "../components/Mobile/MobileLayout";
import { FormSection, ResponsiveSelect } from "../components/Mobile/ResponsiveForm";
import { useMobileResponsive } from "../hooks/useMobileResponsive";

const Bookmarks = () => {
  const [auth] = useAuth();
  const { isMobile } = useMobileResponsive();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    collection: "all",
    readingStatus: "all",
    priority: "all"
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookmarks: 0
  });

  useEffect(() => {
    if (auth?.token) {
      fetchBookmarks();
      fetchBookmarkStats();
    }
  }, [auth?.token, filters]);

  // Fetch bookmarks
  const fetchBookmarks = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(filters.collection !== "all" && { collection: filters.collection }),
        ...(filters.readingStatus !== "all" && { readingStatus: filters.readingStatus }),
        ...(filters.priority !== "all" && { priority: filters.priority }),
        ...(filters.search && { search: filters.search })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/user/bookmarks?${params}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        setBookmarks(response.data.bookmarks);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to fetch bookmarks");
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast.error("Failed to fetch bookmarks");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookmark statistics
  const fetchBookmarkStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/user/bookmark-stats`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching bookmark stats:", error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookmarks(1);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Remove bookmark
  const handleRemoveBookmark = async (blogId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blog/${blogId}/bookmark`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.blog._id !== blogId));
        toast.success("Bookmark removed successfully");
        fetchBookmarkStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Failed to remove bookmark");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!auth?.token) {
    return (
      <MobileLayout
        title="Bookmarks"
        subtitle="Your saved articles"
        icon={FaBookmark}
        headerActions={
          <MobileButton
            onClick={() => window.history.back()}
            variant="ghost"
            size="sm"
            icon={FaArrowLeft}
            title="Go back"
          />
        }
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaBookmark className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to view your bookmarks</p>
            <Link
              to="/login"
              className="bg-mcan-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-mcan-secondary transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="My Bookmarks"
      subtitle={`${pagination.totalBookmarks} saved articles`}
      icon={FaBookmark}
      headerActions={
        <MobileButton
          onClick={() => window.history.back()}
          variant="ghost"
          size="sm"
          icon={FaArrowLeft}
          title="Go back"
        />
      }
    >
      <div className="min-h-screen bg-gray-50">
        <ResponsiveContainer>
          {/* Statistics */}
          {stats && (
            <FormSection title="Reading Progress" icon={FaEye} columns={1} className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl font-bold text-mcan-primary">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">{stats.toRead}</div>
                  <div className="text-sm text-gray-600">To Read</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{stats.reading}</div>
                  <div className="text-sm text-gray-600">Reading</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </FormSection>
          )}

          {/* Search and Filters */}
          <FormSection title="Search & Filter" icon={FaSearch} columns={1} className="mb-8">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-mcan-primary text-white px-6 py-2 rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaSearch />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResponsiveSelect
                label="Collection"
                value={filters.collection}
                onChange={(value) => handleFilterChange('collection', value)}
                options={[
                  { value: "all", label: "All Collections" },
                  { value: "default", label: "Default" },
                  { value: "favorites", label: "Favorites" },
                  { value: "to_read", label: "To Read" }
                ]}
              />
              <ResponsiveSelect
                label="Reading Status"
                value={filters.readingStatus}
                onChange={(value) => handleFilterChange('readingStatus', value)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "to_read", label: "To Read" },
                  { value: "reading", label: "Reading" },
                  { value: "completed", label: "Completed" }
                ]}
              />
              <ResponsiveSelect
                label="Priority"
                value={filters.priority}
                onChange={(value) => handleFilterChange('priority', value)}
                options={[
                  { value: "all", label: "All Priorities" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" }
                ]}
              />
            </div>
          </FormSection>

          {/* Bookmarks Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <FaBookmark className="mx-auto text-6xl text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No bookmarks found</h2>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.collection !== "all" || filters.readingStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start bookmarking articles to see them here"}
              </p>
              <Link
                to="/blog"
                className="bg-mcan-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-mcan-secondary transition duration-300"
              >
                Explore Articles
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {bookmarks.map((bookmark) => (
                  <article key={bookmark._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                    <div className="relative">
                      <img
                        src={bookmark.blog.featuredImage}
                        alt={bookmark.blog.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-mcan-primary text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                          {bookmark.blog.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => handleRemoveBookmark(bookmark.blog._id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-300"
                          title="Remove bookmark"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <FaCalendar className="mr-2" />
                        <span>{formatDate(bookmark.blog.publishDate)}</span>
                        <span className="mx-2">•</span>
                        <FaClock className="mr-2" />
                        <span>{bookmark.blog.readTime} min</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                        {bookmark.blog.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {bookmark.blog.excerpt}
                      </p>
                      
                      {/* Bookmark metadata */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Collection: <span className="font-medium">{bookmark.collection}</span></span>
                          <span className="text-gray-600">Status: <span className="font-medium capitalize">{bookmark.readingStatus.replace('_', ' ')}</span></span>
                        </div>
                        {bookmark.readingProgress?.percentage > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{bookmark.readingProgress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${bookmark.readingProgress.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/blog/${bookmark.blog.slug}`}
                        className="inline-block bg-mcan-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-mcan-secondary transition duration-300"
                      >
                        Continue Reading
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mb-8">
                  <button
                    onClick={() => fetchBookmarks(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => fetchBookmarks(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
};

export default Bookmarks;
