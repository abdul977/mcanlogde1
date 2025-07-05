import React, { useState, useEffect } from "react";
import { FaQuran, FaBook, FaUserGraduate, FaCalendar, FaClock, FaUsers, FaSync, FaMapMarkerAlt, FaVideo, FaTag, FaDollarSign, FaGraduationCap } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Quran = () => {
  const [classes, setClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const programs = [
    { id: "all", name: "All Programs" },
    { id: "tajweed", name: "Tajweed" },
    { id: "memorization", name: "Memorization (Hifz)" },
    { id: "tafseer", name: "Tafseer" },
    { id: "arabic", name: "Arabic" },
    { id: "general", name: "General Studies" },
  ];

  const levels = [
    { id: "all", name: "All Levels" },
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
  ];

  // Icon mapping for different programs
  const programIcons = {
    tajweed: <FaBook className="text-4xl text-mcan-primary mb-4" />,
    memorization: <FaQuran className="text-4xl text-mcan-primary mb-4" />,
    tafseer: <FaUserGraduate className="text-4xl text-mcan-primary mb-4" />,
    arabic: <FaGraduationCap className="text-4xl text-mcan-primary mb-4" />,
    general: <FaBook className="text-4xl text-mcan-primary mb-4" />,
  };

  // Fetch classes from server
  const fetchClasses = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/quran-classes/get-all-classes`);

      if (data?.success) {
        setClasses(data.classes || []);
        if (showRefreshLoader) {
          toast.success("Classes refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching classes", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch available classes for enrollment
  const fetchAvailableClasses = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/quran-classes/available`);

      if (data?.success) {
        setAvailableClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Error fetching available classes:", error);
    }
  };

  // Load classes on component mount
  useEffect(() => {
    fetchClasses();
    fetchAvailableClasses();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchClasses(true);
    fetchAvailableClasses();
  };

  // Filter classes by program and level
  const filteredClasses = classes.filter(quranClass => {
    const programMatch = selectedProgram === "all" || quranClass.program === selectedProgram;
    const levelMatch = selectedLevel === "all" || quranClass.level === selectedLevel;
    return programMatch && levelMatch;
  });

  // Format schedule for display
  const formatSchedule = (schedule) => {
    if (schedule.frequency === 'daily') {
      return `Daily (${schedule.daysOfWeek?.join(', ') || 'Mon-Fri'})`;
    } else if (schedule.frequency === 'weekly') {
      return `Weekly (${schedule.daysOfWeek?.join(', ') || 'TBD'})`;
    } else if (schedule.frequency === 'monthly') {
      return 'Monthly';
    }
    return schedule.frequency || 'TBD';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get program badge color
  const getProgramBadge = (program) => {
    const colors = {
      tajweed: "bg-blue-100 text-blue-800",
      memorization: "bg-green-100 text-green-800",
      tafseer: "bg-purple-100 text-purple-800",
      arabic: "bg-orange-100 text-orange-800",
      general: "bg-gray-100 text-gray-800"
    };
    return colors[program] || "bg-gray-100 text-gray-800";
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

  const features = [
    {
      title: "Small Group Classes",
      description: "Personalized attention in groups of 5-10 students",
      icon: <FaUsers />,
    },
    {
      title: "Flexible Timing",
      description: "Multiple time slots to suit your schedule",
      icon: <FaClock />,
    },
    {
      title: "Qualified Teachers",
      description: "Learn from certified Quran teachers",
      icon: <FaUserGraduate />,
    },
    {
      title: "Regular Assessment",
      description: "Track your progress with periodic evaluations",
      icon: <FaBook />,
    },
  ];

  const testimonials = [
    {
      text: "The Quran memorization program has transformed my relationship with the Quran.",
      name: "Sr. Aisha Muhammad",
      role: "Corps Member",
    },
    {
      text: "The tajweed classes helped me improve my recitation significantly.",
      name: "Br. Yusuf Ibrahim",
      role: "Corps Member",
    },
    {
      text: "I've learned so much about the deeper meanings of the Quran through the tafsir classes.",
      name: "Sr. Fatima Ahmad",
      role: "Corps Member",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-mcan-primary">Quran Classes</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
              }`}
              title="Refresh Classes"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with the Book of Allah through our comprehensive Quranic education programs
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Program</label>
                <div className="flex flex-wrap gap-2">
                  {programs.map((program) => (
                    <button
                      key={program.id}
                      onClick={() => setSelectedProgram(program.id)}
                      className={`px-4 py-2 rounded-full transition duration-300 ${
                        selectedProgram === program.id
                          ? "bg-mcan-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-mcan-primary/10"
                      }`}
                    >
                      {program.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Level</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
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

        {/* Available Classes for Enrollment */}
        {availableClasses.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-mcan-primary mb-8">Available for Enrollment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.slice(0, 3).map((quranClass, index) => (
                <div key={quranClass._id || index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgramBadge(quranClass.program)}`}>
                      {quranClass.program}
                    </span>
                    <span className="text-green-600 text-sm font-medium">Open for Enrollment</span>
                  </div>
                  <h3 className="text-lg font-semibold text-mcan-primary mb-2">{quranClass.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaUserGraduate className="mr-2" />
                      <span>{quranClass.instructor?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendar className="mr-2" />
                      <span>{formatSchedule(quranClass.schedule)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>{quranClass.schedule?.time}</span>
                    </div>
                    {quranClass.enrollment?.maxStudents && (
                      <div className="flex items-center">
                        <FaUsers className="mr-2" />
                        <span>
                          {quranClass.enrollment.currentStudents || 0}/{quranClass.enrollment.maxStudents} enrolled
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Programs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8">
            All Programs
            {filteredClasses.length > 0 && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({filteredClasses.length} found)
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
              <span className="ml-3 text-gray-600">Loading classes...</span>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-16">
              <FaQuran className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Classes Found</h3>
              <p className="text-gray-500">
                No classes match your current filters. Try adjusting your selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClasses.map((quranClass, index) => (
                <div
                  key={quranClass._id || index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  {quranClass.image && (
                    <img
                      src={quranClass.image}
                      alt={quranClass.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgramBadge(quranClass.program)}`}>
                      {quranClass.program}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(quranClass.level)}`}>
                      {quranClass.level}
                    </span>
                  </div>

                  <div className="text-center mb-4">
                    {programIcons[quranClass.program] || programIcons.general}
                    <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                      {quranClass.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{quranClass.description}</p>
                  </div>

                  <div className="space-y-2 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <FaUserGraduate className="mr-2 text-mcan-primary" />
                      <span>{quranClass.instructor?.name}</span>
                      {quranClass.instructor?.title && (
                        <span className="text-sm text-gray-500 ml-1">({quranClass.instructor.title})</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <FaCalendar className="mr-2 text-mcan-primary" />
                      <span>{formatSchedule(quranClass.schedule)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-mcan-primary" />
                      <span>{quranClass.schedule?.time} ({quranClass.schedule?.duration || 60} mins)</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-mcan-primary" />
                      <span>{quranClass.venue?.name}</span>
                      {quranClass.venue?.isOnline && (
                        <FaVideo className="ml-2 text-green-600" title="Online Class" />
                      )}
                    </div>
                    {quranClass.enrollment?.maxStudents && (
                      <div className="flex items-center">
                        <FaUsers className="mr-2 text-mcan-primary" />
                        <span>
                          {quranClass.enrollment.currentStudents || 0}/{quranClass.enrollment.maxStudents} enrolled
                        </span>
                      </div>
                    )}
                    {quranClass.fees?.amount > 0 && (
                      <div className="flex items-center">
                        <FaDollarSign className="mr-2 text-mcan-primary" />
                        <span>
                          {quranClass.fees.currency} {quranClass.fees.amount.toLocaleString()}
                          {quranClass.fees.paymentSchedule !== 'one-time' && ` (${quranClass.fees.paymentSchedule})`}
                        </span>
                      </div>
                    )}
                  </div>

                  {quranClass.curriculum?.objectives && quranClass.curriculum.objectives.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm">
                        {quranClass.curriculum.objectives.slice(0, 3).map((objective, idx) => (
                          <li key={idx}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {quranClass.tags && quranClass.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {quranClass.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            <FaTag className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Language:</span>
                      <span className="text-sm font-medium text-mcan-secondary capitalize">
                        {quranClass.language || 'English'}
                      </span>
                    </div>
                    {quranClass.enrollment?.isOpen ? (
                      <span className="text-green-600 text-sm font-medium">Open for Enrollment</span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">Enrollment Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">Program Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto bg-mcan-primary/10 rounded-full flex items-center justify-center text-mcan-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            Student Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-mcan-primary">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Join Our Classes Today</h2>
          <p className="text-gray-600 mb-8">
            Take the first step towards a stronger connection with the Quran
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
              Learn More
            </a>
          </div>
        </div>

        {/* Summary Statistics */}
        {!loading && classes.length > 0 && (
          <div className="mt-16 bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-mcan-primary">{classes.length}</div>
                <div className="text-sm text-gray-600">Total Classes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {classes.filter(c => c.program === 'memorization').length}
                </div>
                <div className="text-sm text-gray-600">Memorization</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {classes.filter(c => c.program === 'tajweed').length}
                </div>
                <div className="text-sm text-gray-600">Tajweed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {classes.filter(c => c.program === 'tafseer').length}
                </div>
                <div className="text-sm text-gray-600">Tafseer</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quran;
