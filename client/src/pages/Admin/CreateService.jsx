import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHandsHelping, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const CreateService = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "FaHandsHelping",
    category: "welfare",
    status: "active",
    displayOrder: 0,
    applicationProcess: "",
    contactInfo: {
      email: "",
      phone: "",
      department: ""
    }
  });
  
  const [features, setFeatures] = useState([""]);
  const [eligibility, setEligibility] = useState([""]);
  const [requirements, setRequirements] = useState([""]);
  const [serviceImage, setServiceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Service categories
  const categories = [
    { value: "accommodation", label: "Accommodation" },
    { value: "education", label: "Education" },
    { value: "spiritual", label: "Spiritual" },
    { value: "welfare", label: "Welfare" },
    { value: "career", label: "Career" },
    { value: "social", label: "Social" }
  ];

  // Icon options
  const iconOptions = [
    { value: "FaHandsHelping", label: "Helping Hands" },
    { value: "FaHome", label: "Home" },
    { value: "FaBookReader", label: "Book Reader" },
    { value: "FaPray", label: "Prayer" },
    { value: "FaGraduationCap", label: "Graduation Cap" },
    { value: "FaHeart", label: "Heart" },
    { value: "FaUsers", label: "Users" },
    { value: "FaMosque", label: "Mosque" }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (index, value, field, setter) => {
    const newArray = [...field];
    newArray[index] = value;
    setter(newArray);
  };

  // Add array item
  const addArrayItem = (field, setter) => {
    setter([...field, ""]);
  };

  // Remove array item
  const removeArrayItem = (index, field, setter) => {
    if (field.length > 1) {
      const newArray = field.filter((_, i) => i !== index);
      setter(newArray);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || features.filter(f => f.trim()).length === 0) {
      toast.error("Title, description, and at least one feature are required");
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'contactInfo') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add arrays
      submitData.append("features", JSON.stringify(features.filter(f => f.trim())));
      submitData.append("eligibility", JSON.stringify(eligibility.filter(e => e.trim())));
      submitData.append("requirements", JSON.stringify(requirements.filter(r => r.trim())));
      
      // Add image if provided
      if (serviceImage) {
        submitData.append("image", serviceImage);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/services/admin/create-service`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: auth?.token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Service created successfully!");
        navigate("/admin/services");
      } else {
        toast.error(response.data.message || "Failed to create service");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error(error.response?.data?.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                <FaHandsHelping className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Service</h1>
                <p className="text-gray-600">Add a new service for MCAN community</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Accommodation Support"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the service and what it offers..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icon
                        </label>
                        <select
                          name="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        >
                          {iconOptions.map(icon => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Features *</h3>
                  
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleArrayChange(index, e.target.value, features, setFeatures)}
                        placeholder="Enter a service feature"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, features, setFeatures)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        disabled={features.length === 1}
                      >
                        <FaMinus />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => addArrayItem(features, setFeatures)}
                    className="flex items-center space-x-2 text-mcan-primary hover:text-mcan-secondary"
                  >
                    <FaPlus />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Service Image */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaImage className="inline mr-2" />
                    Service Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Service Settings */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {loading ? "Creating..." : "Create Service"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/admin/services")}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;
