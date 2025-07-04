import React from "react";
import { FaQuran, FaBook, FaVideo, FaFileAudio, FaDownload, FaSearch } from "react-icons/fa";

const Resources = () => {
  const categories = [
    {
      title: "Quran Resources",
      description: "Digital Quran, tafseer, and recitation materials",
      icon: <FaQuran className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      title: "Islamic Books",
      description: "Collection of authentic Islamic literature",
      icon: <FaBook className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      title: "Lecture Videos",
      description: "Recorded lectures and educational content",
      icon: <FaVideo className="text-4xl text-mcan-primary mb-4" />,
    },
    {
      title: "Audio Content",
      description: "Islamic lectures and Quran recitations",
      icon: <FaFileAudio className="text-4xl text-mcan-primary mb-4" />,
    },
  ];

  const featuredResources = [
    {
      title: "Understanding the Basics of Islam",
      type: "PDF",
      description: "Comprehensive guide for new Muslims and corps members",
      size: "2.5 MB",
      downloads: 1250,
      category: "Books",
    },
    {
      title: "Tafseer of Common Surahs",
      type: "Video",
      description: "Detailed explanation of frequently recited surahs",
      size: "450 MB",
      downloads: 850,
      category: "Quran",
    },
    {
      title: "Daily Adhkar Collection",
      type: "PDF",
      description: "Morning and evening supplications with translations",
      size: "1.2 MB",
      downloads: 2100,
      category: "Books",
    },
    {
      title: "Islamic Ethics Lecture Series",
      type: "Audio",
      description: "Series on building good character in Islam",
      size: "180 MB",
      downloads: 675,
      category: "Lectures",
    },
  ];

  const recentlyAdded = [
    {
      title: "Ramadan Preparation Guide",
      date: "2 days ago",
      category: "Books",
    },
    {
      title: "Understanding Hadith Sciences",
      date: "5 days ago",
      category: "Lectures",
    },
    {
      title: "Islamic Finance Workshop",
      date: "1 week ago",
      category: "Videos",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mcan-primary mb-4">Islamic Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access our collection of Islamic educational materials, lectures, and resources
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex items-center bg-white rounded-lg shadow-md p-2">
            <input
              type="text"
              placeholder="Search resources..."
              className="flex-1 px-4 py-2 focus:outline-none"
            />
            <button className="bg-mcan-primary text-white p-2 rounded-md hover:bg-mcan-secondary transition duration-300">
              <FaSearch className="text-xl" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-center">
                {category.icon}
                <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-mcan-primary mb-8">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredResources.map((resource, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-mcan-primary mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Type: {resource.type}</span>
                      <span>Size: {resource.size}</span>
                    </div>
                    <span>{resource.downloads} downloads</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-mcan-secondary">
                    {resource.category}
                  </span>
                  <button className="flex items-center text-mcan-primary hover:text-mcan-secondary transition duration-300">
                    <FaDownload className="mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6">Recently Added</h2>
          <div className="space-y-4">
            {recentlyAdded.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg transition duration-300"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">Added {item.date}</p>
                </div>
                <span className="text-sm text-mcan-secondary">{item.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-mcan-primary mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-8">
            Can't find what you're looking for? Contact our resource team for assistance
          </p>
          <a
            href="/contact"
            className="inline-flex items-center bg-mcan-primary text-white px-6 py-3 rounded-md hover:bg-mcan-secondary transition duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default Resources;
