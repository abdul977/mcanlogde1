import React, { useState, useEffect } from "react";
import { FaCalendar, FaUsers, FaBook, FaMosque } from "react-icons/fa";
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

  useEffect(() => {
    getUpcomingEvents();
  }, []);

  const getUpcomingEvents = async () => {
    try {
      const { data } = await axios.get("/api/events/upcoming-events");
      if (data?.success) {
        setUpcomingEvents(data.events);
      } else {
        toast.error(data?.message || "Error fetching events", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error fetching upcoming events");
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-mcan-primary mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming events scheduled</p>
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
