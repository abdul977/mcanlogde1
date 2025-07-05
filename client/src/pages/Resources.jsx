import React, { useState, useEffect } from "react";
import { FaQuran, FaBook, FaVideo, FaFileAudio, FaDownload, FaSearch, FaSync, FaEye, FaHeart, FaStar, FaExternalLinkAlt, FaFileAlt, FaLink, FaPlay, FaFilter } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const categories = [
    { id: "all", name: "All Categories", icon: <FaSearch className="text-4xl text-mcan-primary mb-4" /> },
    { id: "books", name: "Islamic Books", icon: <FaBook className="text-4xl text-mcan-primary mb-4" /> },
    { id: "articles", name: "Articles", icon: <FaFileAlt className="text-4xl text-mcan-primary mb-4" /> },
    { id: "videos", name: "Videos", icon: <FaVideo className="text-4xl text-mcan-primary mb-4" /> },
    { id: "audio", name: "Audio", icon: <FaFileAudio className="text-4xl text-mcan-primary mb-4" /> },
    { id: "documents", name: "Documents", icon: <FaFileAlt className="text-4xl text-mcan-primary mb-4" /> },
    { id: "links", name: "External Links", icon: <FaLink className="text-4xl text-mcan-primary mb-4" /> },
    { id: "apps", name: "Apps & Tools", icon: <FaPlay className="text-4xl text-mcan-primary mb-4" /> },
    { id: "courses", name: "Courses", icon: <FaQuran className="text-4xl text-mcan-primary mb-4" /> },
  ];

  const difficulties = [
    { id: "all", name: "All Levels" },
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
  ];

  const languages = [
    { id: "all", name: "All Languages" },
    { id: "english", name: "English" },
    { id: "arabic", name: "Arabic" },
    { id: "hausa", name: "Hausa" },
    { id: "yoruba", name: "Yoruba" },
    { id: "igbo", name: "Igbo" },
  ];

  // Fetch resources from server
  const fetchResources = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedDifficulty !== "all" && { difficulty: selectedDifficulty }),
        ...(selectedLanguage !== "all" && { language: selectedLanguage }),
        ...(searchTerm && { search: searchTerm }),
      });

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/resources/get-all-resources?${params}`);

      if (data?.success) {
        setResources(data.resources || []);
        setPagination(data.pagination || {});
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

  // Fetch featured resources
  const fetchFeaturedResources = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/resources/featured`);

      if (data?.success) {
        setFeaturedResources(data.resources || []);
      }
    } catch (error) {
      console.error("Error fetching featured resources:", error);
    }
  };

  // Fetch popular resources
  const fetchPopularResources = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/resources/popular?limit=5`);

      if (data?.success) {
        setPopularResources(data.resources || []);
      }
    } catch (error) {
      console.error("Error fetching popular resources:", error);
    }
  };

  // Load resources on component mount and when filters change
  useEffect(() => {
    fetchResources();
  }, [currentPage, selectedCategory, selectedDifficulty, selectedLanguage, searchTerm]);

  // Load featured and popular resources on component mount
  useEffect(() => {
    fetchFeaturedResources();
    fetchPopularResources();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchResources(true);
    fetchFeaturedResources();
    fetchPopularResources();
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchResources();
  };

  // Handle download
  const handleDownload = async (resourceId, resourceTitle) => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/resources/download/${resourceId}`);
      toast.success(`${resourceTitle} download started!`, { position: "bottom-left" });
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  };

  // Get type icon
  const getTypeIcon = (type, category) => {
    if (type === "file") {
      switch (category) {
        case "books": return <FaBook className="text-mcan-primary" />;
        case "audio": return <FaFileAudio className="text-mcan-primary" />;
        case "videos": return <FaVideo className="text-mcan-primary" />;
        default: return <FaFileAlt className="text-mcan-primary" />;
      }
    } else if (type === "link") {
      return <FaExternalLinkAlt className="text-mcan-primary" />;
    } else if (type === "embedded") {
      return <FaPlay className="text-mcan-primary" />;
    }
    return <FaFileAlt className="text-mcan-primary" />;
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
            <FaQuran className="text-4xl text-mcan-primary" />
            <h1 className="text-4xl font-bold text-mcan-primary">Islamic Resources</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
              }`}
              title="Refresh Resources"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Access our comprehensive collection of Islamic educational materials, lectures, and resources
          </p>
          <div className="bg-mcan-primary/10 border border-mcan-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-mcan-primary italic">
              "And say: My Lord, increase me in knowledge" - Quran 20:114
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center bg-gray-50 rounded-lg p-2">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-mcan-primary text-white p-2 rounded-md hover:bg-mcan-secondary transition duration-300"
                >
                  <FaSearch className="text-xl" />
                </button>
              </div>
            </form>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                >
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-mcan-primary mb-8">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource, index) => (
                <div key={resource._id || index} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-yellow-500">
                  {resource.thumbnail && (
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(resource.category)}`}>
                        {resource.category}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="text-sm">Featured</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-mcan-primary mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaEye className="mr-1" />
                        <span>{resource.statistics?.views || 0} views</span>
                      </div>
                      <div className="flex items-center">
                        <FaDownload className="mr-1" />
                        <span>{resource.statistics?.downloads || 0} downloads</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6 text-center">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
              <FaQuran className="text-4xl text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Quran & Tafsir</h3>
              <p className="text-blue-700 text-sm mb-4">Quranic studies and interpretations</p>
              <button
                onClick={() => {
                  setSelectedCategory('books');
                  setSearchTerm('quran');
                  setCurrentPage(1);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Explore
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 text-center">
              <FaVideo className="text-4xl text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Islamic Lectures</h3>
              <p className="text-green-700 text-sm mb-4">Video lectures by renowned scholars</p>
              <button
                onClick={() => {
                  setSelectedCategory('videos');
                  setCurrentPage(1);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Watch Now
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 text-center">
              <FaFileAudio className="text-4xl text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Audio Resources</h3>
              <p className="text-purple-700 text-sm mb-4">Recitations and audio lectures</p>
              <button
                onClick={() => {
                  setSelectedCategory('audio');
                  setCurrentPage(1);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Listen
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(1).map((category, index) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 text-center ${
                  selectedCategory === category.id ? 'ring-2 ring-mcan-primary' : ''
                }`}
              >
                {category.icon}
                <h3 className="text-lg font-semibold text-mcan-primary mb-2">
                  {category.name}
                  </h3>
                <p className="text-gray-600 text-sm">
                  {resources.filter(r => r.category === category.id).length} resources
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* All Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8">
            All Resources
            {pagination.total > 0 && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({pagination.total} found)
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
              <span className="ml-3 text-gray-600">Loading resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16">
              <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Resources Found</h3>
              <p className="text-gray-500">
                No resources match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource, index) => (
                  <div
                    key={resource._id || index}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {resource.thumbnail && (
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(resource.category)}`}>
                          {resource.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          {getTypeIcon(resource.type, resource.category)}
                          <span className="ml-1 capitalize">{resource.type}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-mcan-primary mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

                      {resource.author?.name && (
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span>By: {resource.author.name}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <FaEye className="mr-1" />
                            <span>{resource.statistics?.views || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <FaDownload className="mr-1" />
                            <span>{resource.statistics?.downloads || 0}</span>
                          </div>
                          {resource.ratings?.average > 0 && (
                            <div className="flex items-center">
                              <FaStar className="mr-1 text-yellow-500" />
                              <span>{resource.ratings.average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        {resource.content?.fileSize && (
                          <span>{formatFileSize(resource.content.fileSize)}</span>
                        )}
                      </div>

                      {resource.topics && resource.topics.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {resource.topics.slice(0, 3).map((topic, idx) => (
                              <span key={idx} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 capitalize">
                          {resource.metadata?.language || 'English'}
                        </span>
                        {resource.metadata?.difficulty && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {resource.metadata.difficulty}
                          </span>
                        )}
                      </div>

                      {resource.type === 'file' && resource.content?.fileUrl ? (
                        <a
                          href={resource.content.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleDownload(resource._id, resource.title)}
                          className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300"
                        >
                          <FaDownload className="mr-2" />
                          Download
                        </a>
                      ) : resource.type === 'link' && resource.content?.externalUrl ? (
                        <a
                          href={resource.content.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300"
                        >
                          <FaExternalLinkAlt className="mr-2" />
                          Visit
                        </a>
                      ) : (
                        <button className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300">
                          <FaEye className="mr-2" />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 border rounded-md ${
                          currentPage === i + 1
                            ? 'bg-mcan-primary text-white border-mcan-primary'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage === pagination.pages}
                      className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Popular Resources Sidebar */}
        {popularResources.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-16">
            <h2 className="text-2xl font-bold text-mcan-primary mb-6">Popular Resources</h2>
            <div className="space-y-4">
              {popularResources.map((resource, index) => (
                <div
                  key={resource._id || index}
                  className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition duration-300"
                >
                  <div className="flex-shrink-0 mr-4">
                    {getTypeIcon(resource.type, resource.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{resource.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaEye className="mr-1" />
                      <span>{resource.statistics?.views || 0} views</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{resource.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mb-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6 text-center">How to Use Islamic Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Search</h3>
              <p className="text-sm text-gray-600">Use the search bar to find specific topics or keywords</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaFilter className="text-2xl text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Filter</h3>
              <p className="text-sm text-gray-600">Use filters to narrow down by category, language, or difficulty</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaDownload className="text-2xl text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Download</h3>
              <p className="text-sm text-gray-600">Download resources for offline reading and study</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-2xl text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Featured</h3>
              <p className="text-sm text-gray-600">Check out our featured resources for quality content</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-8">
            Can't find what you're looking for? Contact our resource team for assistance or suggest new resources
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Contact Us
            </a>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedLanguage('all');
                setCurrentPage(1);
              }}
              className="inline-flex items-center bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition duration-300"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        {!loading && resources.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-mcan-primary">{pagination.total || resources.length}</div>
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
  );
};

export default Resources;
