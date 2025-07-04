import React from "react";
import { FaUsers, FaHandsHelping, FaMosque, FaGraduationCap, FaComment } from "react-icons/fa";

const Community = () => {
  const initiatives = [
    {
      title: "Sister's Circle",
      description: "Weekly gatherings for female corps members to discuss Islamic topics and life experiences",
      icon: <FaUsers className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Every Saturday",
      location: "MCAN Sisters' Hall",
    },
    {
      title: "Brotherhood Forum",
      description: "Regular meetings for male corps members focusing on spiritual and professional growth",
      icon: <FaUsers className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Every Sunday",
      location: "MCAN Brothers' Hall",
    },
    {
      title: "Community Service",
      description: "Monthly outreach programs to serve the local Muslim community",
      icon: <FaHandsHelping className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Last Saturday",
      location: "Various Locations",
    },
    {
      title: "Study Circles",
      description: "Regular Islamic study sessions in small groups",
      icon: <FaGraduationCap className="text-4xl text-mcan-primary mb-4" />,
      schedule: "Weekdays",
      location: "MCAN Learning Center",
    },
  ];

  const testimonials = [
    {
      name: "Aisha Ibrahim",
      role: "Corps Member",
      batch: "2024 Batch A",
      text: "MCAN has been my family away from home. The sisterhood and support system is amazing.",
      image: "avatar1.jpg",
    },
    {
      name: "Abdullah Muhammad",
      role: "Ex-Corps Member",
      batch: "2023 Batch B",
      text: "The community activities helped me maintain my Islamic identity during service year.",
      image: "avatar2.jpg",
    },
    {
      name: "Fatima Usman",
      role: "Corps Member",
      batch: "2024 Batch A",
      text: "The study circles have greatly improved my understanding of Islam.",
      image: "avatar3.jpg",
    },
  ];

  const upcomingEvents = [
    {
      title: "New Corps Members Welcome Day",
      date: "February 15, 2025",
      time: "10:00 AM",
      location: "MCAN Main Hall",
    },
    {
      title: "Islamic Career Workshop",
      date: "February 20, 2025",
      time: "2:00 PM",
      location: "MCAN Training Center",
    },
    {
      title: "Community Iftar Planning",
      date: "February 25, 2025",
      time: "4:00 PM",
      location: "MCAN Conference Room",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">MCAN Community</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our vibrant community of Muslim corps members and participate in enriching activities
          </p>
        </div>

        {/* Community Initiatives */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            Community Initiatives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {initiatives.map((initiative, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center">
                  {initiative.icon}
                  <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                    {initiative.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{initiative.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Schedule: {initiative.schedule}</p>
                    <p>Location: {initiative.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            Upcoming Community Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:border-mcan-primary transition duration-300"
              >
                <h3 className="font-semibold text-lg text-mcan-primary mb-2">{event.title}</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Date: {event.date}</p>
                  <p>Time: {event.time}</p>
                  <p>Location: {event.location}</p>
                </div>
                <button className="mt-4 w-full bg-mcan-primary text-white py-2 rounded hover:bg-mcan-secondary transition duration-300">
                  Register
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Community Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8 text-center">
            Community Voices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaComment className="text-2xl text-mcan-primary" />
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-mcan-primary">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-mcan-secondary">{testimonial.batch}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Community;
