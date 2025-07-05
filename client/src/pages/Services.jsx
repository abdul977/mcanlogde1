import React, { useState, useEffect } from "react";
import { FaHandsHelping, FaGraduationCap, FaPray, FaHome, FaHeart, FaBookReader, FaUsers, FaMosque, FaSync } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Services" },
    { id: "accommodation", name: "Accommodation" },
    { id: "education", name: "Education" },
    { id: "spiritual", name: "Spiritual" },
    { id: "welfare", name: "Welfare" },
    { id: "career", name: "Career" },
    { id: "social", name: "Social" },
  ];

  // Icon mapping for dynamic icons
  const iconMap = {
    FaHandsHelping: <FaHandsHelping className="text-4xl text-mcan-primary mb-4" />,
    FaHome: <FaHome className="text-4xl text-mcan-primary mb-4" />,
    FaBookReader: <FaBookReader className="text-4xl text-mcan-primary mb-4" />,
    FaPray: <FaPray className="text-4xl text-mcan-primary mb-4" />,
    FaGraduationCap: <FaGraduationCap className="text-4xl text-mcan-primary mb-4" />,
    FaHeart: <FaHeart className="text-4xl text-mcan-primary mb-4" />,
    FaUsers: <FaUsers className="text-4xl text-mcan-primary mb-4" />,
    FaMosque: <FaMosque className="text-4xl text-mcan-primary mb-4" />,
  };

  // Fetch services from server
  const fetchServices = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/services/get-all-services`);

      if (data?.success) {
        setServices(data.services || []);
        if (showRefreshLoader) {
          toast.success("Services refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error(data?.message || "Error fetching services", { position: "bottom-left" });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services. Please try again.", { position: "bottom-left" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchServices(true);
  };

  // Filter services by category
  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-mcan-primary">Our Services</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mcan-primary text-white hover:bg-mcan-secondary'
              }`}
              title="Refresh Services"
            >
              <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-600 mb-12">
            Supporting Muslim Corps Members Throughout Their Service Year
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

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
            <span className="ml-3 text-gray-600">Loading services...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <FaHandsHelping className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Services Found</h3>
            <p className="text-gray-500">
              {selectedCategory === "all"
                ? "No services are currently available. Check back later!"
                : `No ${selectedCategory} services found. Try selecting a different category.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <div
                key={service._id || index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center mb-6">
                  {iconMap[service.icon] || iconMap.FaHandsHelping}
                  <h3 className="text-xl font-semibold text-mcan-primary mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-32 object-cover rounded-md mb-4"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <ul className="space-y-2">
                  {service.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-mcan-secondary rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {service.contactInfo?.email && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Contact: {service.contactInfo.email}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Service Request Section */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-mcan-primary mb-6">Need Assistance?</h2>
          <p className="text-gray-600 mb-6">
            If you require any of our services or have questions, please don't hesitate to reach out.
            We're here to support you during your service year.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/contact"
              className="bg-mcan-primary text-white text-center py-3 px-6 rounded-md hover:bg-mcan-secondary transition duration-300"
            >
              Contact Us
            </a>
            <a
              href="/register"
              className="bg-mcan-accent text-white text-center py-3 px-6 rounded-md hover:bg-mcan-primary transition duration-300"
            >
              Join MCAN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
