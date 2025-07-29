import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaImage, FaUpload, FaTimes, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/UserContext";

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const { user } = auth;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    tags: [],
    isPrivate: false,
    requireApproval: false,
    maxMembers: 1000,
    messageRateLimit: { enabled: true, seconds: 5 },
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
  const [tagInput, setTagInput] = useState("");

  const categories = [
    { id: "general", name: "General", icon: "💬" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "welfare", name: "Welfare", icon: "🤝" },
    { id: "spiritual", name: "Spiritual", icon: "🕌" },
    { id: "social", name: "Social", icon: "👥" },
    { id: "charity", name: "Charity", icon: "❤️" },
    { id: "youth", name: "Youth", icon: "🌟" },
    { id: "women", name: "Women", icon: "👩" },
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "health", name: "Health", icon: "🏥" }
  ];

  // Check if user is authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && formData[key] !== null) {
          submitData.append(key, JSON.stringify(formData[key]));
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

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/chat-communities/create`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Community created successfully! It's pending admin approval.");
        navigate('/communities');
      } else {
        toast.error(response.data.message || "Failed to create community");
      }
    } catch (error) {
      console.error("Error creating community:", error);
      toast.error(error.response?.data?.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FaUsers className="text-4xl text-mcan-primary" />
            <h1 className="text-3xl font-bold text-mcan-primary">Create Community</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a new community for Muslim corps members to connect, share, and grow together. 
            Your community will be reviewed by admins before going live.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                  placeholder="Enter community name"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                placeholder="Describe your community's purpose and goals"
                maxLength={500}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Images */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Community Images</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Avatar
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previews.avatar ? (
                    <div className="relative">
                      <img
                        src={previews.avatar}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full mx-auto object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('avatar')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FaImage className="mx-auto text-gray-400 text-3xl mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Upload community avatar</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary cursor-pointer"
                      >
                        <FaUpload className="mr-2" />
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Banner
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previews.banner ? (
                    <div className="relative">
                      <img
                        src={previews.banner}
                        alt="Banner preview"
                        className="w-full h-24 rounded-lg mx-auto object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('banner')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FaImage className="mx-auto text-gray-400 text-3xl mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Upload community banner</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'banner')}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="inline-flex items-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary cursor-pointer"
                      >
                        <FaUpload className="mr-2" />
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-mcan-primary/10 text-mcan-primary rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-mcan-primary hover:text-red-500"
                  >
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                placeholder="Add tags (press Enter)"
                maxLength={30}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary"
              >
                Add
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Community Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  min={10}
                  max={10000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Rate Limit (seconds)
                </label>
                <input
                  type="number"
                  name="messageRateLimit.seconds"
                  value={formData.messageRateLimit.seconds}
                  onChange={handleInputChange}
                  min={2}
                  max={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Private Community (invite only)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requireApproval"
                  checked={formData.requireApproval}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Require approval to join</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowMediaSharing"
                  checked={formData.allowMediaSharing}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Allow media sharing</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowFileSharing"
                  checked={formData.allowFileSharing}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Allow file sharing</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/communities')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity;
