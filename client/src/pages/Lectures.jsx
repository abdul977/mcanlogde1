import React, { useState, useEffect } from "react";
import { FaPlay, FaCalendar, FaClock, FaUser, FaDownload, FaSync, FaVideo, FaUsers, FaTag, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const lectureTypes = [
    { id: "all", name: "All Types" },
    { id: "regular", name: "Regular" },
    { id: "special", name: "Special" },
    { id: "workshop", name: "Workshop" },
    { id: "seminar", name: "Seminar" },
  ];

  const lectureLevels = [
    { id: "all", name: "All Levels" },
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
  ];

  // Fetch lectures from server
  const fetchLectures = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/lectures/get-all-lectures`);

      if (data?.success) {
        setLectures(data.lectures || []);
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

  // Fetch upcoming lectures
  const fetchUpcomingLectures = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/lectures/upcoming`);

      if (data?.success) {
        setUpcomingLectures(data.lectures || []);
      }
    } catch (error) {
      console.error("Error fetching upcoming lectures:", error);
    }
  };

  // Load lectures on component mount
  useEffect(() => {
    fetchLectures();
    fetchUpcomingLectures();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchLectures(true);
    fetchUpcomingLectures();
  };

  // Filter lectures by type and level
  const filteredLectures = lectures.filter(lecture => {
    const typeMatch = selectedType === "all" || lecture.type === selectedType;
    const levelMatch = selectedLevel === "all" || lecture.level === selectedLevel;
    return typeMatch && levelMatch;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format schedule for display
  const formatSchedule = (schedule, date) => {
    if (schedule.frequency === 'once') {
      return formatDate(date);
    }

    const frequencyMap = {
      daily: "Daily",
      weekly: `Every ${schedule.dayOfWeek}`,
      monthly: "Monthly",
      custom: "Custom Schedule"
    };

    return frequencyMap[schedule.frequency] || "TBD";
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const colors = {
      regular: "bg-blue-100 text-blue-800",
      special: "bg-purple-100 text-purple-800",
      workshop: "bg-green-100 text-green-800",
      seminar: "bg-orange-100 text-orange-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
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
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-mcan-primary">Islamic Lectures</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
              }`}
              title="Refresh Lectures"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your Islamic knowledge through our regular lectures and educational programs
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <div className="flex flex-wrap gap-2">
                  {lectureTypes.map((type) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Level</label>
                <div className="flex flex-wrap gap-2">
                  {lectureLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`px-4 py-2 rounded-full transition duration-300 ${
                        selectedLevel === level.id
                          ? "bg-mcan-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-mcan-primary/10"
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Lectures Section */}
        {upcomingLectures.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-mcan-primary mb-8">Upcoming Special Lectures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingLectures.slice(0, 3).map((lecture, index) => (
                <div key={lecture._id || index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-mcan-secondary">
                  <h3 className="text-lg font-semibold text-mcan-primary mb-2">{lecture.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaCalendar className="mr-2" />
                      <span>{formatSchedule(lecture.schedule, lecture.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>{lecture.schedule?.time}</span>
                    </div>
                    <div className="flex items-center">
                      <FaUser className="mr-2" />
                      <span>{lecture.speaker?.name}</span>
                    </div>
                    {lecture.venue?.isOnline && (
                      <div className="flex items-center">
                        <FaVideo className="mr-2" />
                        <span>Online Event</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Lecture Series */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8">
            All Lectures
            {filteredLectures.length > 0 && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({filteredLectures.length} found)
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
              <span className="ml-3 text-gray-600">Loading lectures...</span>
            </div>
          ) : filteredLectures.length === 0 ? (
            <div className="text-center py-16">
              <FaPlay className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Lectures Found</h3>
              <p className="text-gray-500">
                No lectures match your current filters. Try adjusting your selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredLectures.map((lecture, index) => (
                <div key={lecture._id || index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {lecture.image && (
                    <img
                      src={lecture.image}
                      alt={lecture.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(lecture.type)}`}>
                        {lecture.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(lecture.level)}`}>
                        {lecture.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                      {lecture.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{lecture.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaUser className="mr-2 text-mcan-primary" />
                        <span>{lecture.speaker?.name}</span>
                        {lecture.speaker?.title && (
                          <span className="text-sm text-gray-500 ml-1">({lecture.speaker.title})</span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaCalendar className="mr-2 text-mcan-primary" />
                        <span>{formatSchedule(lecture.schedule, lecture.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2 text-mcan-primary" />
                        <span>{lecture.schedule?.time} ({lecture.schedule?.duration || 90} mins)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-mcan-primary" />
                        <span>{lecture.venue?.name}</span>
                        {lecture.venue?.isOnline && (
                          <FaVideo className="ml-2 text-green-600" title="Online Event" />
                        )}
                      </div>
                      {lecture.registrationRequired && (
                        <div className="flex items-center text-gray-600">
                          <FaUsers className="mr-2 text-mcan-primary" />
                          <span>
                            {lecture.currentAttendees || 0}
                            {lecture.maxAttendees && `/${lecture.maxAttendees}`} registered
                          </span>
                        </div>
                      )}
                    </div>

                    {lecture.topics && lecture.topics.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-2">Topics Covered:</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {lecture.topics.map((topic, idx) => (
                            <li key={idx}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {lecture.tags && lecture.tags.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {lecture.tags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              <FaTag className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Language:</span>
                      <span className="text-sm font-medium text-mcan-secondary capitalize">
                        {lecture.language || 'English'}
                      </span>
                    </div>
                    {lecture.venue?.isOnline && lecture.venue?.onlineLink ? (
                      <a
                        href={lecture.venue.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300"
                      >
                        <FaVideo className="mr-2" />
                        Join Online
                      </a>
                    ) : (
                      <button className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300">
                        <FaPlay className="mr-2" />
                        Learn More
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resources Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6">Lecture Resources</h2>
          <div className="inline-flex space-x-4">
            <a
              href="/resources"
              className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              <FaDownload className="mr-2" />
              Download Materials
            </a>
            <a
              href="/contact"
              className="inline-flex items-center border-2 border-mcan-primary text-mcan-primary px-6 py-3 rounded-md hover:bg-mcan-primary hover:text-white transition duration-300"
            >
              Request Recording
            </a>
          </div>
        </div>

        {/* Summary Statistics */}
        {!loading && lectures.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-mcan-primary">{lectures.length}</div>
                <div className="text-sm text-gray-600">Total Lectures</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {lectures.filter(l => l.type === 'regular').length}
                </div>
                <div className="text-sm text-gray-600">Regular Series</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {lectures.filter(l => l.type === 'special').length}
                </div>
                <div className="text-sm text-gray-600">Special Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {lectures.filter(l => l.type === 'workshop').length}
                </div>
                <div className="text-sm text-gray-600">Workshops</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lectures;
