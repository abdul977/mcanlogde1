import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHandsHelping, FaChalkboardTeacher, FaQuran, FaBook, FaUsers, FaDonate, FaPlus, FaEye, FaSync } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const [stats, setStats] = useState({
    services: 0,
    lectures: 0,
    quranClasses: 0,
    resources: 0,
    community: 0,
    donations: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics from all endpoints
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const endpoints = [
        { key: 'services', url: '/api/services/admin/get-all-services' },
        { key: 'lectures', url: '/api/lectures/admin/get-all-lectures' },
        { key: 'quranClasses', url: '/api/quran-classes/admin/get-all-classes' },
        { key: 'resources', url: '/api/resources/admin/get-all-resources' },
        { key: 'community', url: '/api/community/admin/get-all-community' },
        { key: 'donations', url: '/api/donations/admin/get-all-donations' }
      ];

      const newStats = { ...stats };

      for (const endpoint of endpoints) {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_BASE_URL}${endpoint.url}`,
            {
              headers: {
                Authorization: auth?.token,
              },
            }
          );
          
          if (data?.success) {
            newStats[endpoint.key] = data.count || data[endpoint.key]?.length || 0;
          }
        } catch (error) {
          console.error(`Error fetching ${endpoint.key}:`, error);
          newStats[endpoint.key] = 0;
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const sections = [
    {
      title: "Services",
      count: stats.services,
      icon: <FaHandsHelping className="text-4xl text-white" />,
      color: "from-blue-500 to-blue-600",
      createLink: "/admin/create-service",
      viewLink: "/admin/services",
      description: "Manage MCAN services and offerings"
    },
    {
      title: "Lectures",
      count: stats.lectures,
      icon: <FaChalkboardTeacher className="text-4xl text-white" />,
      color: "from-green-500 to-green-600",
      createLink: "/admin/create-lecture",
      viewLink: "/admin/lectures",
      description: "Manage Islamic lectures and events"
    },
    {
      title: "Quran Classes",
      count: stats.quranClasses,
      icon: <FaQuran className="text-4xl text-white" />,
      color: "from-purple-500 to-purple-600",
      createLink: "/admin/create-quran-class",
      viewLink: "/admin/quran-classes",
      description: "Manage Quranic education programs"
    },
    {
      title: "Resources",
      count: stats.resources,
      icon: <FaBook className="text-4xl text-white" />,
      color: "from-orange-500 to-orange-600",
      createLink: "/admin/create-resource",
      viewLink: "/admin/resources",
      description: "Manage Islamic educational resources"
    },
    {
      title: "Community",
      count: stats.community,
      icon: <FaUsers className="text-4xl text-white" />,
      color: "from-pink-500 to-pink-600",
      createLink: "/admin/create-community",
      viewLink: "/admin/community",
      description: "Manage community initiatives and testimonials"
    },
    {
      title: "Donations",
      count: stats.donations,
      icon: <FaDonate className="text-4xl text-white" />,
      color: "from-red-500 to-red-600",
      createLink: "/admin/create-donation",
      viewLink: "/admin/donations",
      description: "Manage donation campaigns and sponsorships"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5">
      <div className="flex">
        <div className="ml-[4rem]">
          <Navbar />
        </div>
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">MCAN Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage all MCAN content and activities</p>
              </div>
              <button
                onClick={fetchStats}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
                }`}
              >
                <FaSync className={`${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh Stats'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${section.color} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-xl font-semibold">{section.title}</h3>
                      <p className="text-white/80 text-sm mt-1">{section.description}</p>
                    </div>
                    {section.icon}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-gray-800">
                      {loading ? '...' : section.count}
                    </div>
                    <div className="text-sm text-gray-500">Total Items</div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={section.createLink}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 text-sm"
                    >
                      <FaPlus className="text-xs" />
                      Create
                    </Link>
                    <Link
                      to={section.viewLink}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-mcan-primary text-mcan-primary rounded-md hover:bg-mcan-primary hover:text-white transition duration-300 text-sm"
                    >
                      <FaEye className="text-xs" />
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Content Management</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services</span>
                    <span className="font-medium">{stats.services} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lectures</span>
                    <span className="font-medium">{stats.lectures} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quran Classes</span>
                    <span className="font-medium">{stats.quranClasses} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resources</span>
                    <span className="font-medium">{stats.resources} items</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Community & Donations</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community Items</span>
                    <span className="font-medium">{stats.community} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donation Campaigns</span>
                    <span className="font-medium">{stats.donations} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Content</span>
                    <span className="font-medium text-mcan-primary">
                      {Object.values(stats).reduce((a, b) => a + b, 0)} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sections.map((section, index) => (
                <Link
                  key={index}
                  to={section.createLink}
                  className={`flex flex-col items-center p-4 rounded-lg bg-gradient-to-r ${section.color} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="text-2xl mb-2">{section.icon}</div>
                  <span className="text-sm font-medium text-center">Add {section.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
