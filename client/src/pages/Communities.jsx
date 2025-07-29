import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaPlus, FaSearch, FaFilter, FaMobile, FaDownload } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/UserContext";

const Communities = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const { user } = auth;
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const categories = [
    { id: "all", name: "All Categories", icon: "🌟" },
    { id: "general", name: "General", icon: "💬" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "welfare", name: "Welfare", icon: "🤝" },
    { id: "spiritual", name: "Spiritual", icon: "🕌" },
    { id: "social", name: "Social", icon: "👥" },
    { id: "charity", name: "Charity", icon: "❤️" },
    { id: "youth", name: "Youth", icon: "🌟" },
    { id: "women", name: "Women", icon: "👩" },
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "health", name: "Health", icon: "🏥" }
  ];

  useEffect(() => {
    fetchCommunities();
  }, [selectedCategory, showFeaturedOnly, searchTerm]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (showFeaturedOnly) {
        params.append("featured", "true");
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/chat-communities?${params.toString()}`
      );

      if (response.data.success) {
        setCommunities(response.data.communities);
      } else {
        toast.error("Failed to fetch communities");
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to fetch communities");
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityClick = (community) => {
    // Show mobile app download prompt
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Redirect to app store or show download instructions
      toast.info("Please download the MCAN mobile app to join community chats!");
      // You can add actual app store links here
    } else {
      // Show desktop download prompt
      setShowMobilePrompt(true);
    }
  };

  const [showMobilePrompt, setShowMobilePrompt] = useState(false);

  const MobilePromptModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <FaMobile className="text-6xl text-mcan-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Community Chat Available on Mobile
          </h3>
          <p className="text-gray-600 mb-6">
            Community chat features are optimized for mobile devices. Download the MCAN mobile app to join conversations and connect with fellow corps members.
          </p>
          
          <div className="space-y-3">
            <button className="w-full bg-mcan-primary text-white py-3 px-4 rounded-lg hover:bg-mcan-secondary transition duration-300 flex items-center justify-center gap-2">
              <FaDownload />
              Download for Android
            </button>
            <button className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center gap-2">
              <FaDownload />
              Download for iOS
            </button>
          </div>
          
          <button
            onClick={() => setShowMobilePrompt(false)}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-mcan-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <FaUsers className="text-5xl" />
              <h1 className="text-4xl font-bold">MCAN Communities</h1>
            </div>
            <p className="text-xl text-mcan-light max-w-3xl mx-auto">
              Connect with fellow Muslim corps members, share experiences, and grow together in faith and service.
            </p>
            
            {user && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/create-community')}
                  className="bg-white text-mcan-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 flex items-center gap-2 mx-auto"
                >
                  <FaPlus />
                  Create Community
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mcan-primary"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="rounded text-mcan-primary focus:ring-mcan-primary"
                />
                <span className="text-sm text-gray-600">Featured only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No communities found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <div
                key={community._id}
                onClick={() => handleCommunityClick(community)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer overflow-hidden"
              >
                {/* Community Banner */}
                {community.banner && (
                  <div className="h-32 bg-gradient-to-r from-mcan-primary to-mcan-secondary">
                    <img
                      src={community.banner}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Community Avatar and Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-mcan-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {community.avatar ? (
                        <img
                          src={community.avatar}
                          alt={community.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        community.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{community.name}</h3>
                        {community.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {categories.find(cat => cat.id === community.category)?.icon} {categories.find(cat => cat.id === community.category)?.name}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {community.description}
                  </p>

                  {/* Tags */}
                  {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-mcan-primary/10 text-mcan-primary text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {community.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{community.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaUsers />
                      {community.memberCount} members
                    </span>
                    <span>
                      {new Date(community.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Mobile indicator */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-mcan-primary">
                      <FaMobile />
                      <span>Chat available on mobile app</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Prompt Modal */}
      {showMobilePrompt && <MobilePromptModal />}
    </div>
  );
};

export default Communities;
