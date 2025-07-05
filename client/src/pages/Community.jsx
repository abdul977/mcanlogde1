import React, { useState, useEffect } from "react";
import { FaUsers, FaHandsHelping, FaMosque, FaGraduationCap, FaComment, FaSync, FaCalendar, FaMapMarkerAlt, FaStar, FaEye, FaHeart, FaAward, FaChartLine } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Community = () => {
  const [communityItems, setCommunityItems] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const types = [
    { id: "all", name: "All Types" },
    { id: "initiative", name: "Initiatives" },
    { id: "testimonial", name: "Testimonials" },
    { id: "story", name: "Stories" },
    { id: "achievement", name: "Achievements" },
    { id: "event", name: "Events" },
    { id: "project", name: "Projects" },
  ];

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "education", name: "Education" },
    { id: "welfare", name: "Welfare" },
    { id: "spiritual", name: "Spiritual" },
    { id: "social", name: "Social" },
    { id: "charity", name: "Charity" },
    { id: "youth", name: "Youth" },
    { id: "women", name: "Women" },
  ];

  // Icon mapping for different types and categories
  const typeIcons = {
    initiative: <FaHandsHelping className="text-4xl text-mcan-primary mb-4" />,
    testimonial: <FaComment className="text-4xl text-mcan-primary mb-4" />,
    story: <FaUsers className="text-4xl text-mcan-primary mb-4" />,
    achievement: <FaAward className="text-4xl text-mcan-primary mb-4" />,
    event: <FaCalendar className="text-4xl text-mcan-primary mb-4" />,
    project: <FaGraduationCap className="text-4xl text-mcan-primary mb-4" />,
  };

  // Fetch community items from server
  const fetchCommunityItems = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        ...(selectedType !== "all" && { type: selectedType }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
      });

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/community/get-all-community?${params}`);

      if (data?.success) {
        setCommunityItems(data.community || []);
        if (showRefreshLoader) {
          toast.success("Community items refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching community items", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching community items:", error);
      toast.error("Failed to fetch community items. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch featured community items
  const fetchFeaturedItems = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/community/featured`);

      if (data?.success) {
        setFeaturedItems(data.community || []);
      }
    } catch (error) {
      console.error("Error fetching featured items:", error);
    }
  };

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/community/testimonials`);

      if (data?.success) {
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchCommunityItems();
  }, [selectedType, selectedCategory]);

  // Load featured items and testimonials on component mount
  useEffect(() => {
    fetchFeaturedItems();
    fetchTestimonials();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchCommunityItems(true);
    fetchFeaturedItems();
    fetchTestimonials();
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      initiative: "bg-blue-100 text-blue-800",
      testimonial: "bg-green-100 text-green-800",
      story: "bg-purple-100 text-purple-800",
      achievement: "bg-yellow-100 text-yellow-800",
      event: "bg-red-100 text-red-800",
      project: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      education: "bg-blue-100 text-blue-800",
      welfare: "bg-green-100 text-green-800",
      spiritual: "bg-purple-100 text-purple-800",
      social: "bg-pink-100 text-pink-800",
      charity: "bg-orange-100 text-orange-800",
      youth: "bg-indigo-100 text-indigo-800",
      women: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-mcan-primary">MCAN Community</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
              }`}
              title="Refresh Community"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our vibrant community of Muslim corps members and participate in enriching activities
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-4 py-2 rounded-full transition duration-300 ${
                        selectedType === type.id
                          ? "bg-mcan-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-mcan-primary/10"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full transition duration-300 ${
                        selectedCategory === category.id
                          ? "bg-mcan-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-mcan-primary/10"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Items */}
        {featuredItems.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-mcan-primary mb-8">Featured Initiatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredItems.map((item, index) => (
                <div key={item._id || index} className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-yellow-500">
                  {item.primaryImage && (
                    <img
                      src={item.primaryImage}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="text-sm">Featured</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-mcan-primary mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>

                    {item.impact?.beneficiaries && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <FaUsers className="mr-2" />
                        <span>{formatNumber(item.impact.beneficiaries)} beneficiaries</span>
                      </div>
                    )}

                    {item.content?.highlights && item.content.highlights.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-semibold text-sm mb-2">Key Highlights:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {item.content.highlights.slice(0, 3).map((highlight, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-mcan-secondary rounded-full mr-2 mt-2 flex-shrink-0"></span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Community Items */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8">
            All Community Items
            {communityItems.length > 0 && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({communityItems.length} found)
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
              <span className="ml-3 text-gray-600">Loading community items...</span>
            </div>
          ) : communityItems.length === 0 ? (
            <div className="text-center py-16">
              <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Community Items Found</h3>
              <p className="text-gray-500">
                No items match your current filters. Try adjusting your selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityItems.map((item, index) => (
                <div
                  key={item._id || index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {item.primaryImage && (
                    <img
                      src={item.primaryImage}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(item.category)}`}>
                        {item.category}
                      </span>
                      {item.featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      {typeIcons[item.type] || typeIcons.initiative}
                      <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                    </div>

                    {item.impact && (
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center">
                          <FaChartLine className="mr-2 text-mcan-primary" />
                          Impact
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {item.impact.beneficiaries > 0 && (
                            <div className="text-center">
                              <div className="font-bold text-mcan-primary">{formatNumber(item.impact.beneficiaries)}</div>
                              <div className="text-gray-600">Beneficiaries</div>
                            </div>
                          )}
                          {item.impact.feedback?.averageRating > 0 && (
                            <div className="text-center">
                              <div className="font-bold text-mcan-primary flex items-center justify-center">
                                <FaStar className="mr-1 text-yellow-500" />
                                {item.impact.feedback.averageRating.toFixed(1)}
                              </div>
                              <div className="text-gray-600">Rating</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.participants?.featured && item.participants.featured.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">Featured Participants</h4>
                        <div className="space-y-2">
                          {item.participants.featured.slice(0, 2).map((participant, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                              {participant.image && (
                                <img
                                  src={participant.image}
                                  alt={participant.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium">{participant.name}</div>
                                <div className="text-xs text-gray-500">{participant.role}</div>
                              </div>
                              {participant.rating && (
                                <div className="flex items-center text-xs">
                                  <FaStar className="text-yellow-500 mr-1" />
                                  {participant.rating}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.location?.venue && (
                      <div className="flex items-center text-sm text-gray-500 mt-4">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{item.location.venue}, {item.location.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
              Community Voices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div key={testimonial._id || index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComment className="text-2xl text-mcan-primary" />
                    </div>
                    <p className="text-gray-600 italic mb-4">
                      "{testimonial.participants?.featured?.[0]?.testimonial || testimonial.description}"
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-mcan-primary">
                      {testimonial.participants?.featured?.[0]?.name || "Community Member"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {testimonial.participants?.featured?.[0]?.role || "Corps Member"}
                    </p>
                    {testimonial.participants?.featured?.[0]?.rating && (
                      <div className="flex items-center justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm ${
                              i < testimonial.participants.featured[0].rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join Community */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Join Our Community</h2>
          <p className="text-gray-600 mb-8">
            Become part of our growing family of Muslim corps members
          </p>
          <div className="space-x-4">
            <a
              href="/register"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Register Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center border-2 border-mcan-primary text-mcan-primary px-6 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Summary Statistics */}
        {!loading && communityItems.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-mcan-primary">{communityItems.length}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {communityItems.filter(item => item.type === 'initiative').length}
                </div>
                <div className="text-sm text-gray-600">Initiatives</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {communityItems.reduce((total, item) => total + (item.impact?.beneficiaries || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Beneficiaries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {communityItems.filter(item => item.featured).length}
                </div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
