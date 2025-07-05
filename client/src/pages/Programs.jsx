import React, { useState, useEffect } from "react";
import { FaCalendar, FaUsers, FaBook, FaMosque, FaSync } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Programs = () => {
  const programs = [
    {
      title: "Weekly Ta'alim",
      description: "Regular Islamic study circles and knowledge sharing sessions",
      icon: <FaBook className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Every Saturday, 2:00 PM",
    },
    {
      title: "Community Outreach",
      description: "Engaging with the local community through various Islamic activities",
      icon: <FaUsers className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Monthly",
    },
    {
      title: "Ramadan Programs",
      description: "Special activities during the blessed month including Iftar gatherings",
      icon: <FaMosque className="text-4xl text-mcan-primary mb-4" />,
      schedule: "During Ramadan",
    },
    {
      title: "Islamic Seminars",
      description: "Educational seminars on various Islamic topics and current issues",
      icon: <FaCalendar className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Quarterly",
    },
  ];

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getUpcomingEvents();
  }, []);

  const getUpcomingEvents = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("Fetching upcoming events from:", `${import.meta.env.VITE_BASE_URL}/api/events/upcoming-events`);
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events/upcoming-events`);
      console.log("API Response:", data);

      if (data?.success) {
        setUpcomingEvents(data.events);
        console.log("Events set:", data.events);
        if (showRefreshLoader) {
          toast.success("Events refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        console.error("API Error:", data);
        toast.error(data?.message || "Error fetching events", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error fetching upcoming events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    getUpcomingEvents(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">Our Programs</h1>
          <p className="text-xl text-gray-600 mb-12">
            Enriching the lives of Muslim Corps members through various educational and spiritual programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-center">
                {program.icon}
                <h3 className="text-xl font-semibold text-mcan-primary mb-2">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <p className="text-sm text-mcan-secondary font-medium">{program.schedule}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-mcan-primary">Upcoming Events</h2>
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
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading events...</span>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No upcoming events found</p>
                <p className="text-sm text-gray-400">
                  API URL: {import.meta.env.VITE_BASE_URL}/api/events/upcoming-events
                </p>
                <button
                  onClick={() => console.log("Current events state:", upcomingEvents)}
                  className="text-xs text-blue-500 underline mt-2"
                >
                  Debug: Log events state
                </button>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event._id} className="border-l-4 border-mcan-primary pl-4">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-gray-600">{event.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-mcan-secondary">
                      {new Date(event.date).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programs;
