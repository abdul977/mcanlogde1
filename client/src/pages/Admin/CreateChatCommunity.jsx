import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUsers, FaImage, FaSave, FaUpload } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const CreateChatCommunity = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    tags: "",
    isPrivate: false,
    requireApproval: false,
    maxMembers: 1000,
    allowMediaSharing: true,
    allowFileSharing: true
  });
  
  const [files, setFiles] = useState({
    avatar: null,
    banner: null
  });

  const [previews, setPreviews] = useState({
    avatar: null,
    banner: null
  });

  const categories = [
    { value: "general", label: "General Discussion" },
    { value: "education", label: "Education & Learning" },
    { value: "youth", label: "Youth Programs" },
    { value: "family", label: "Family & Community" },
    { value: "business", label: "Business & Professional" },
    { value: "charity", label: "Charity & Volunteering" },
    { value: "events", label: "Events & Activities" },
    { value: "support", label: "Support & Help" }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFiles(prev => ({ ...prev, [type]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, [type]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Community name and description are required");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          // Convert tags string to array
          const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          submitData.append(key, JSON.stringify(tagsArray));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (files.avatar) {
        submitData.append('avatar', files.avatar);
      }
      if (files.banner) {
        submitData.append('banner', files.banner);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/chat-communities/create`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Chat community created successfully!");
        navigate("/admin/chat-communities");
      } else {
        toast.error(data?.message || "Error creating chat community");
      }
    } catch (error) {
      console.error("Error creating chat community:", error);
      toast.error(error.response?.data?.message || "Failed to create chat community. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      title="Create Chat Community"
      subtitle="Setup new chat community"
      icon={FaUsers}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <ResponsiveForm
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Create Chat Community"
          submitIcon={FaSave}
        >
          <FormSection
            title="Basic Information"
            icon={FaUsers}
          >
            <FormField label="Community Name *" required>
              <MobileInput
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter community name"
                maxLength={100}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.name.length}/100 characters
              </div>
            </FormField>

            <FormField label="Description *" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose and goals of this community"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </div>
            </FormField>

            <FormField label="Category">
              <ResponsiveSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories}
              />
            </FormField>

            <FormField label="Tags">
              <MobileInput
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas (e.g., education, youth, support)"
              />
              <div className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas
              </div>
            </FormField>
          </FormSection>

          <FormSection
            title="Community Settings"
            icon={FaUsers}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Maximum Members">
                <MobileInput
                  name="maxMembers"
                  type="number"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  min={10}
                  max={10000}
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Private Community</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="requireApproval"
                  checked={formData.requireApproval}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Require Admin Approval for New Members</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="allowMediaSharing"
                  checked={formData.allowMediaSharing}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Allow Media Sharing</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="allowFileSharing"
                  checked={formData.allowFileSharing}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Allow File Sharing</span>
              </label>
            </div>
          </FormSection>

          <FormSection
            title="Community Images"
            icon={FaImage}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <FormField label="Community Avatar">
                <div className="space-y-3">
                  {previews.avatar ? (
                    <div className="relative">
                      <img
                        src={previews.avatar}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('avatar')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <FaImage className="text-gray-400 text-xl" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <FaUpload className="mr-2" />
                    Choose Avatar
                  </label>
                  <p className="text-xs text-gray-500">
                    Optional. Square image recommended. Max 5MB.
                  </p>
                </div>
              </FormField>

              {/* Banner Upload */}
              <FormField label="Community Banner">
                <div className="space-y-3">
                  {previews.banner ? (
                    <div className="relative">
                      <img
                        src={previews.banner}
                        alt="Banner preview"
                        className="w-full h-24 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('banner')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <FaImage className="text-gray-400 text-xl" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <FaUpload className="mr-2" />
                    Choose Banner
                  </label>
                  <p className="text-xs text-gray-500">
                    Optional. Wide image recommended. Max 5MB.
                  </p>
                </div>
              </FormField>
            </div>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateChatCommunity;
