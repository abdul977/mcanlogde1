import React from "react";
import { FaQuran, FaHandshake, FaGraduationCap, FaUsers } from "react-icons/fa";
import mcanLogo from "../assets/mcan-logo.png";

// Fallback logo URL
const FALLBACK_LOGO = "https://www.mcanenugu.org.ng/img/core-img/logo.png";

const About = () => {
  const values = [
    {
      title: "Islamic Knowledge",
      description: "Promoting understanding and practice of Islam among corps members",
      icon: <FaQuran className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      title: "Brotherhood/Sisterhood",
      description: "Fostering strong bonds and support networks among Muslim corps members",
      icon: <FaUsers className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      title: "Service Excellence",
      description: "Encouraging exemplary service and dedication to national development",
      icon: <FaHandshake className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      title: "Professional Growth",
      description: "Supporting career development and personal growth of members",
      icon: <FaGraduationCap className="text-4xl text-mcan-primary mb-4" />,
    },
  ];

  const leadership = [
    {
      name: "Ustadh Ahmad Ibrahim",
      position: "State Coordinator",
      description: "Leading MCAN activities and strategic direction",
    },
    {
      name: "Hajia Aisha Yusuf",
      position: "Deputy Coordinator",
      description: "Coordinating programs and membership activities",
    },
    {
      name: "Br. Abdullahi Mohammed",
      position: "General Secretary",
      description: "Managing administrative affairs and communications",
    },
    {
      name: "Sr. Fatima Usman",
      position: "Welfare Secretary",
      description: "Overseeing member welfare and support services",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img
            src={mcanLogo}
            alt="MCAN Logo"
            className="h-24 mx-auto mb-6"
            onError={(e) => {
              e.target.src = FALLBACK_LOGO;
            }}
          />
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">About MCAN</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Muslim Corpers' Association of Nigeria (MCAN) is dedicated to serving
            and supporting Muslim youth corps members throughout their service year.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-mcan-primary mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To provide spiritual, moral, and social support to Muslim corps members while promoting
              excellence in national service and fostering Islamic brotherhood/sisterhood.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-mcan-primary mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To be the foremost organization supporting Muslim corps members in their spiritual
              growth and professional development during and after their service year.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-mcan-primary mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                {value.icon}
                <h3 className="text-xl font-semibold text-mcan-primary mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-mcan-primary mb-8 text-center">Our Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center">
                  <div className="w-20 h-20 bg-mcan-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="text-3xl text-mcan-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-mcan-primary mb-1">{leader.name}</h3>
                  <p className="text-mcan-secondary font-medium mb-2">{leader.position}</p>
                  <p className="text-gray-600 text-sm">{leader.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join MCAN */}
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Join MCAN Today</h2>
          <p className="text-gray-600 mb-6">
            Be part of a vibrant community of Muslim corps members. Join us in our mission
            to serve Allah and contribute to national development.
          </p>
          <a
            href="/register"
            className="inline-block bg-mcan-primary text-white py-3 px-8 rounded-md hover:bg-mcan-secondary transition duration-300"
          >
            Register Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
