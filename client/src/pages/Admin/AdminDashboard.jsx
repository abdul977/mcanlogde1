import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHandsHelping, FaChalkboardTeacher, FaQuran, FaBook, FaUsers, FaDonate, FaPlus, FaEye, FaSync, FaBars, FaTimes, FaTachometerAlt, FaChartBar } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";
import { FormSection, FormField } from "../../components/Mobile/ResponsiveForm";

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
    <MobileLayout
      title="Admin Dashboard"
      subtitle="MCAN management center"
      icon={FaTachometerAlt}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={fetchStats}
          variant="secondary"
          size="sm"
          icon={FaSync}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
          {/* Page Header for Desktop */}
        <MobilePageHeader
          title="MCAN Admin Dashboard"
          subtitle="Manage all MCAN content and activities"
          icon={FaTachometerAlt}
          showOnMobile={false}
          actions={
            <MobileButton
              onClick={fetchStats}
              disabled={loading}
              variant="secondary"
              icon={FaSync}
              className={loading ? 'animate-spin' : ''}
            >
              {loading ? 'Loading...' : 'Refresh Stats'}
            </MobileButton>
          }
        />

        {/* Quick Stats */}
        <FormSection
          title="Overview Statistics"
          icon={FaChartBar}
          columns={1}
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`bg-gradient-to-r ${section.color} p-4 lg:p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-lg lg:text-xl font-semibold">{section.title}</h3>
                      <p className="text-white/80 text-xs lg:text-sm mt-1">{section.description}</p>
                    </div>
                    <div className="text-white text-2xl lg:text-3xl">
                      {section.icon}
                    </div>
                  </div>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-800">
                      {loading ? '...' : section.count}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-500">Total Items</div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <MobileButton
                      as={Link}
                      to={section.createLink}
                      variant="primary"
                      size="sm"
                      icon={FaPlus}
                      fullWidth
                    >
                      Create
                    </MobileButton>
                    <MobileButton
                      as={Link}
                      to={section.viewLink}
                      variant="secondary"
                      size="sm"
                      icon={FaEye}
                      fullWidth
                    >
                      View All
                    </MobileButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        {/* System Overview */}
        <FormSection
          title="System Overview"
          icon={FaChartBar}
          columns={2}
        >
          <FormField label="Content Management" fullWidth>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center">
                  <FaHandsHelping className="mr-2 text-mcan-primary" />
                  Services
                </span>
                <span className="font-medium">{stats.services} items</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center">
                  <FaChalkboardTeacher className="mr-2 text-mcan-primary" />
                  Lectures
                </span>
                <span className="font-medium">{stats.lectures} items</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center">
                  <FaQuran className="mr-2 text-mcan-primary" />
                  Quran Classes
                </span>
                <span className="font-medium">{stats.quranClasses} items</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center">
                  <FaBook className="mr-2 text-mcan-primary" />
                  Resources
                </span>
                <span className="font-medium">{stats.resources} items</span>
              </div>
            </div>
          </FormField>

          <FormField label="Community & Donations" fullWidth>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center">
                  <FaUsers className="mr-2 text-mcan-primary" />
                  Community Items
                </span>
                <span className="font-medium">{stats.community} items</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center">
                  <FaDonate className="mr-2 text-mcan-primary" />
                  Donation Campaigns
                </span>
                <span className="font-medium">{stats.donations} items</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-mcan-primary/10 rounded border border-mcan-primary">
                <span className="text-mcan-primary font-medium flex items-center">
                  <FaChartBar className="mr-2" />
                  Total Content
                </span>
                <span className="font-bold text-mcan-primary">
                  {Object.values(stats).reduce((a, b) => a + b, 0)} items
                </span>
              </div>
            </div>
          </FormField>
        </FormSection>

        {/* Quick Actions */}
        <FormSection
          title="Quick Actions"
          icon={FaPlus}
          columns={1}
          className="mt-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {sections.map((section, index) => (
              <Link
                key={index}
                to={section.createLink}
                className={`flex flex-col items-center p-3 lg:p-4 rounded-lg bg-gradient-to-r ${section.color} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <div className="text-xl lg:text-2xl mb-2">{section.icon}</div>
                <span className="text-xs lg:text-sm font-medium text-center">Add {section.title}</span>
              </Link>
            ))}
          </div>
        </FormSection>
      </div>
    </MobileLayout>
  );
};

export default AdminDashboard;
