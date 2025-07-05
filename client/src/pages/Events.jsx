
import React, { useState, useEffect } from "react";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaMosque, FaGraduationCap, FaSync } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: "all", name: "All Events" },
    { id: "educational", name: "Educational" },
    { id: "social", name: "Social" },
    { id: "spiritual", name: "Spiritual" },
    { id: "development", name: "Development" },
  ];

  // Fetch events from server
  const fetchEvents = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/get-all-events`);

      if (data?.success) {
        setEvents(data.events || []);
        if (showRefreshLoader) {
          toast.success("Events refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching events", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchEvents(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = selectedCategory === "all"
    ? events
    : events.filter(event => event.category === selectedCategory);

  const iconMap = {
    educational: <FaGraduationCap className="text-2xl" />,
    social: <FaUsers className="text-2xl" />,
    spiritual: <FaMosque className="text-2xl" />,
    development: <FaGraduationCap className="text-2xl" />,
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-mcan-primary">Events & Activities</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
              }`}
              title="Refresh Events"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay connected with the MCAN community through our diverse range of events and activities
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full transition duration-300 ${
                selectedCategory === category.id
                  ? "bg-mcan-primary text-white"
                  : "bg-white text-gray-600 hover:bg-mcan-primary/10"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
            <span className="ml-3 text-gray-600">Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <FaCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
            <p className="text-gray-500">
              {selectedCategory === "all"
                ? "No events are currently available. Check back later!"
                : `No ${selectedCategory} events found. Try selecting a different category.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div
                key={event._id || index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {event.image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-mcan-primary/10 flex items-center justify-center text-mcan-primary">
                        {iconMap[event.category] || <FaCalendar className="text-2xl" />}
                      </div>
                      <span className="text-sm font-medium text-mcan-secondary capitalize">
                        {event.category || 'General'}
                      </span>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      event.status === "published"
                        ? "bg-green-100 text-green-800"
                        : event.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {event.status === "published" ? "Available" : event.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-mcan-primary mb-3">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <FaCalendar className="mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>{formatTime(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <Link
                    to={`/events/${event.slug}`}
                    className="block w-full text-center bg-mcan-primary text-white py-2 rounded-md hover:bg-mcan-secondary transition duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add to Calendar Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Never Miss an Event</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our calendar to stay updated with all MCAN events
          </p>
          <div className="space-x-4">
            <a
              href="/calendar.ics"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              <FaCalendar className="mr-2" />
              Add to Calendar
            </a>
            <a
              href="/contact"
              className="inline-flex items-center border-2 border-mcan-primary text-mcan-primary px-6 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Contact Organizer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
