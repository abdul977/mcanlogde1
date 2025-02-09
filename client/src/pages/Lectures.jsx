import React from "react";
import { FaPlay, FaCalendar, FaClock, FaUser, FaDownload } from "react-icons/fa";

const Lectures = () => {
  const lectures = [
    {
      title: "Understanding the Fundamentals of Islam",
      speaker: "Sheikh Abdullah Muhammad",
      date: "Every Saturday",
      time: "10:00 AM - 12:00 PM",
      description: "A comprehensive series on the basics of Islamic faith and practice",
      topics: ["Tawheed", "Salah", "Fasting", "Zakat", "Hajj"],
      level: "Beginner",
    },
    {
      title: "Contemporary Fiqh Issues",
      speaker: "Dr. Ahmad Yusuf",
      date: "Every Sunday",
      time: "2:00 PM - 4:00 PM",
      description: "Discussion of modern challenges and their Islamic solutions",
      topics: ["Modern Finance", "Social Media", "Medical Ethics", "Family Life"],
      level: "Intermediate",
    },
    {
      title: "Seerah Studies",
      speaker: "Ustadh Ibrahim Hassan",
      date: "Every Wednesday",
      time: "7:00 PM - 8:30 PM",
      description: "Detailed study of the life of Prophet Muhammad (SAW)",
      topics: ["Meccan Period", "Migration", "Medinan Period", "Battles"],
      level: "All Levels",
    },
    {
      title: "Arabic Language",
      speaker: "Ustadha Aisha Ahmad",
      date: "Every Monday & Thursday",
      time: "5:00 PM - 6:30 PM",
      description: "Learn Arabic grammar and vocabulary",
      topics: ["Basic Grammar", "Conversation", "Quranic Arabic"],
      level: "Beginner to Intermediate",
    },
  ];

  const upcomingLectures = [
    {
      title: "Islam and Youth Development",
      date: "Next Saturday",
      time: "2:00 PM",
      speaker: "Sheikh Muhammad Ibrahim",
    },
    {
      title: "Understanding Surah Al-Kahf",
      date: "Next Sunday",
      time: "10:00 AM",
      speaker: "Ustadh Abdurrahman",
    },
    {
      title: "Islamic Financial Planning",
      date: "Next Wednesday",
      time: "7:00 PM",
      speaker: "Dr. Yusuf Abdullah",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">Islamic Lectures</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your Islamic knowledge through our regular lectures and educational programs
          </p>
        </div>

        {/* Regular Lecture Series */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8">Regular Lecture Series</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lectures.map((lecture, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                    {lecture.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{lecture.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-2" />
                      <span>{lecture.speaker}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendar className="mr-2" />
                      <span>{lecture.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2" />
                      <span>{lecture.time}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Topics Covered:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {lecture.topics.map((topic, idx) => (
                        <li key={idx}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-mcan-secondary">
                    Level: {lecture.level}
                  </span>
                  <button className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300">
                    <FaPlay className="mr-2" />
                    Join Online
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Special Lectures */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6">Upcoming Special Lectures</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingLectures.map((lecture, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-mcan-primary transition duration-300"
              >
                <h3 className="font-semibold text-lg mb-2">{lecture.title}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaCalendar className="mr-2" />
                    <span>{lecture.date}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>{lecture.time}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    <span>{lecture.speaker}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
      </div>
    </div>
  );
};

export default Lectures;
