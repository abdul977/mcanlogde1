import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaHandsHelping, FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const AllServices = () => {
  const [auth] = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "accommodation", label: "Accommodation" },
    { value: "education", label: "Education" },
    { value: "spiritual", label: "Spiritual" },
    { value: "welfare", label: "Welfare" },
    { value: "career", label: "Career" },
    { value: "social", label: "Social" }
  ];

  // Fetch services from server
  const fetchServices = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/services/admin/get-all-services`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

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

  // Handle delete service
  const handleDelete = async (serviceId, serviceName) => {
    if (window.confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/services/admin/delete-service/${serviceId}`,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );

        if (data?.success) {
          toast.success("Service deleted successfully!");
          fetchServices();
        } else {
          toast.error(data?.message || "Error deleting service");
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service. Please try again.");
      }
    }
  };

  // Filter services by category
  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter(service => service.category === selectedCategory);

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      draft: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      accommodation: "bg-blue-100 text-blue-800",
      education: "bg-purple-100 text-purple-800",
      spiritual: "bg-green-100 text-green-800",
      welfare: "bg-orange-100 text-orange-800",
      career: "bg-indigo-100 text-indigo-800",
      social: "bg-pink-100 text-pink-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5">
      <div className="flex">
        <div className="ml-[4rem]">
          <Navbar />
        </div>
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                  <FaHandsHelping className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Manage Services</h1>
                  <p className="text-gray-600">View and manage all MCAN services</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    refreshing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Refresh Services"
                >
                  <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link
                  to="/admin/create-service"
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus />
                  Add Service
                </Link>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full transition duration-300 ${
                    selectedCategory === category.value
                      ? "bg-mcan-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-mcan-primary/10"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services List */}
          <div className="bg-white rounded-lg shadow-lg">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
                <span className="ml-3 text-gray-600">Loading services...</span>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-16">
                <FaHandsHelping className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Services Found</h3>
                <p className="text-gray-500 mb-4">
                  {selectedCategory === "all"
                    ? "No services are currently available."
                    : `No ${selectedCategory} services found.`
                  }
                </p>
                <Link
                  to="/admin/create-service"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:bg-mcan-secondary transition duration-300"
                >
                  <FaPlus />
                  Create First Service
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Features
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {service.image && (
                              <img
                                src={service.image}
                                alt={service.title}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {service.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {service.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(service.category)}`}>
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(service.status)}`}>
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {service.features?.length || 0} features
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.displayOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/services/${service.slug}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Service"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/admin/edit-service/${service._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Service"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(service._id, service.title)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Service"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary */}
          {!loading && filteredServices.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-mcan-primary">{services.length}</div>
                  <div className="text-sm text-gray-600">Total Services</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {services.filter(s => s.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {services.filter(s => s.status === 'draft').length}
                  </div>
                  <div className="text-sm text-gray-600">Draft</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {services.filter(s => s.status === 'inactive').length}
                  </div>
                  <div className="text-sm text-gray-600">Inactive</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllServices;
