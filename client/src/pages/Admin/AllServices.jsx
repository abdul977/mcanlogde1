import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaHandsHelping, FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";
import { FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const AllServices = () => {
  const [auth] = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        setServices(data.services || []);
        if (showRefreshLoader) {
          toast.success("Services refreshed successfully!", { position: "bottom-left" });
        }
      } else {
        toast.error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle delete service
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_BASE_URL}/api/services/admin/delete-service/${id}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        if (data?.success) {
          toast.success("Service deleted successfully!");
          fetchServices();
        } else {
          toast.error("Failed to delete service");
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service. Please try again.");
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchServices(true);
  };

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services based on selected category
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

  // Define columns for ResponsiveDataDisplay
  const columns = [
    {
      key: 'title',
      label: 'Service',
      sortable: true,
      render: (service) => (
        <div className="font-medium text-gray-900 truncate max-w-xs">
          {service.title}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (service) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(service.category)}`}>
          {service.category}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (service) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(service.status)}`}>
          {service.status}
        </span>
      )
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (service) => (
        <span className="text-gray-600">{service.displayOrder || 0}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (service) => (
        <span className="text-gray-500 text-sm">
          {new Date(service.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Service Card Component for mobile view
  const ServiceCard = ({ item: service, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {service.title}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(service.status)}`}>
          {service.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Category:</span> 
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(service.category)}`}>
            {service.category}
          </span>
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Order:</span> {service.displayOrder || 0}
        </p>
        <p className="text-gray-500 text-xs">
          Created: {new Date(service.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => onView && onView(service)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="View Service"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit && onEdit(service)}
            className="text-mcan-primary hover:text-mcan-secondary p-1"
            title="Edit Service"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(service._id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Service"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Handle actions
  const handleView = (service) => {
    // Navigate to service details or open modal
    console.log('View service:', service);
  };

  const handleEdit = (service) => {
    // Navigate to edit service page
    console.log('Edit service:', service);
  };

  return (
    <MobileLayout
      title="Services"
      subtitle="Manage services"
      icon={FaHandsHelping}
      navbar={Navbar}
      headerActions={
        <Link to="/admin/create-service">
          <MobileButton
            variant="primary"
            size="sm"
            icon={FaPlus}
          >
            Add
          </MobileButton>
        </Link>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Manage Services"
          subtitle="View and manage all MCAN services"
          icon={FaHandsHelping}
          showOnMobile={false}
          actions={
            <div className="flex space-x-3">
              <MobileButton
                onClick={handleRefresh}
                variant="secondary"
                icon={FaSync}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </MobileButton>
              <Link to="/admin/create-service">
                <MobileButton
                  variant="primary"
                  icon={FaPlus}
                >
                  Create New Service
                </MobileButton>
              </Link>
            </div>
          }
        />

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6">
          <FormField label="Filter by Category">
            <ResponsiveSelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categories}
            />
          </FormField>
        </div>

        {/* Data Display */}
        <ResponsiveDataDisplay
          data={filteredServices}
          columns={columns}
          loading={loading}
          emptyMessage="Get started by creating your first service."
          emptyIcon={FaHandsHelping}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={ServiceCard}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllServices;
