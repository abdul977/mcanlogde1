
import React, { useState } from "react";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaMosque, FaGraduationCap } from "react-icons/fa";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Events" },
    { id: "educational", name: "Educational" },
    { id: "social", name: "Social" },
    { id: "spiritual", name: "Spiritual" },
    { id: "development", name: "Development" },
  ];

  const events = [
    {
      title: "Annual MCAN Conference",
      category: "educational",
      date: "March 15, 2025",
      time: "9:00 AM - 5:00 PM",
      location: "MCAN FCT Secretariat",
      description: "Annual gathering of Muslim corps members featuring keynote speakers and workshops",
      image: "conference.jpg",
      attendees: 200,
      status: "Upcoming",
    },
    {
      title: "Ramadan Preparation Workshop",
      category: "spiritual",
      date: "February 25, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Central Mosque",
      description: "Preparing for the blessed month with practical tips and spiritual guidance",
      image: "ramadan.jpg",
      attendees: 150,
      status: "Registration Open",
    },
    {
      title: "Career Development Seminar",
      category: "development",
      date: "March 5, 2025",
      time: "10:00 AM - 1:00 PM",
      location: "MCAN Training Center",
      description: "Professional development workshop for corps members",
      image: "career.jpg",
      attendees: 100,
      status: "Registration Open",
    },
    {
      title: "Islamic Social Mixer",
      category: "social",
      date: "February 20, 2025",
      time: "4:00 PM - 6:00 PM",
      location: "MCAN Recreation Center",
      description: "Networking event for Muslim corps members",
      image: "mixer.jpg",
      attendees: 80,
      status: "Limited Seats",
    },
  ];

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
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">Events & Activities</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-mcan-primary/10 flex items-center justify-center text-mcan-primary">
                      {iconMap[event.category]}
                    </div>
                    <span className="text-sm font-medium text-mcan-secondary capitalize">
                      {event.category}
                    </span>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    event.status === "Upcoming" 
                      ? "bg-green-100 text-green-800"
                      : event.status === "Limited Seats"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {event.status}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-mcan-primary mb-3">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4">{event.description}</p>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <FaCalendar className="mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-2" />
                    <span>{event.attendees} Expected Attendees</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <a
                  href={`/register-event/${index}`}
                  className="block w-full text-center bg-mcan-primary text-white py-2 rounded-md hover:bg-mcan-secondary transition duration-300"
                >
                  Register Now
                </a>
              </div>
            </div>
          ))}
        </div>

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
