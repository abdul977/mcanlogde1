import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHandsHelping, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

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
    <MobileLayout
      title="Create Service"
      subtitle="Add new service"
      icon={FaHandsHelping}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={() => navigate("/admin/services")}
          variant="secondary"
          size="sm"
        >
          Back to Services
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Create New Service"
          subtitle="Add a new service for MCAN community"
          icon={FaHandsHelping}
          showOnMobile={false}
          actions={
            <MobileButton
              onClick={() => navigate("/admin/services")}
              variant="secondary"
            >
              Back to Services
            </MobileButton>
          }
        />

        {/* Form */}
        <ResponsiveForm
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Create Service"
          cancelText="Cancel"
          onCancel={() => navigate("/admin/services")}
          showCancel={true}
        >
          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            subtitle="Enter the main details for the service"
            icon={FaHandsHelping}
            columns={1}
          >
            <FormField label="Service Title *" required>
              <MobileInput
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Accommodation Support"
                required
              />
            </FormField>

            <FormField label="Description *" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the service and what it offers..."
                rows={4}
                className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent text-sm lg:text-base"
                required
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Category">
                <ResponsiveSelect
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={categories}
                />
              </FormField>

              <FormField label="Icon">
                <ResponsiveSelect
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  options={iconOptions}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Features */}
          <FormSection
            title="Service Features"
            subtitle="List the key features and benefits of this service"
            icon={FaPlus}
            columns={1}
          >
            <FormField label="Features *" required>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <MobileInput
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange(index, e.target.value, features, setFeatures)}
                      placeholder="Enter a service feature"
                      className="flex-1"
                    />
                    <MobileButton
                      type="button"
                      onClick={() => removeArrayItem(index, features, setFeatures)}
                      variant="secondary"
                      size="sm"
                      disabled={features.length === 1}
                      icon={FaMinus}
                    />
                  </div>
                ))}

                <MobileButton
                  type="button"
                  onClick={() => addArrayItem(features, setFeatures)}
                  variant="secondary"
                  size="sm"
                  icon={FaPlus}
                >
                  Add Feature
                </MobileButton>
              </div>
            </FormField>
          </FormSection>

          {/* Service Image */}
          <FormSection
            title="Service Image"
            subtitle="Upload an image to represent this service"
            icon={FaImage}
            columns={1}
          >
            <FormField label="Service Image">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent text-sm lg:text-base"
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
            </FormField>
          </FormSection>

          {/* Service Settings */}
          <FormSection
            title="Settings"
            subtitle="Configure service status and display options"
            columns={2}
          >
            <FormField label="Status">
              <ResponsiveSelect
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "draft", label: "Draft" }
                ]}
              />
            </FormField>

            <FormField label="Display Order">
              <MobileInput
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
              />
            </FormField>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateService;
