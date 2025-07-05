import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUsers, FaImage, FaPlus, FaMinus, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const CreateCommunity = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "initiative",
    category: "general",
    status: "draft",
    featured: false,
    priority: "medium"
  });
  
  const [content, setContent] = useState({
    fullText: "",
    excerpt: "",
    highlights: [""],
    achievements: []
  });
  
  const [participants, setParticipants] = useState({
    featured: [],
    totalCount: 0,
    demographics: {
      ageGroups: { youth: 0, adults: 0, seniors: 0 },
      gender: { male: 0, female: 0 }
    }
  });
  
  const [timeline, setTimeline] = useState({
    startDate: "",
    endDate: "",
    milestones: []
  });
  
  const [location, setLocation] = useState({
    venue: "",
    address: "",
    city: "Enugu",
    state: "Enugu State"
  });
  
  const [impact, setImpact] = useState({
    beneficiaries: 0,
    metrics: [],
    outcomes: [""],
    feedback: {
      positive: 0,
      neutral: 0,
      negative: 0,
      averageRating: 0
    }
  });
  
  const [tags, setTags] = useState([""]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Types
  const types = [
    { value: "initiative", label: "Initiative" },
    { value: "testimonial", label: "Testimonial" },
    { value: "story", label: "Story" },
    { value: "achievement", label: "Achievement" },
    { value: "event", label: "Event" },
    { value: "project", label: "Project" },
    { value: "announcement", label: "Announcement" }
  ];

  // Categories
  const categories = [
    { value: "general", label: "General" },
    { value: "education", label: "Education" },
    { value: "welfare", label: "Welfare" },
    { value: "spiritual", label: "Spiritual" },
    { value: "social", label: "Social" },
    { value: "charity", label: "Charity" },
    { value: "youth", label: "Youth" },
    { value: "women", label: "Women" }
  ];

  // Priority levels
  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (setter, field, value) => {
    setter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array inputs
  const handleArrayChange = (index, value, setter, array, field) => {
    if (field) {
      const newArray = [...array];
      newArray[index] = value;
      setter(prev => ({
        ...prev,
        [field]: newArray
      }));
    } else {
      // For simple arrays like tags
      const newArray = [...array];
      newArray[index] = value;
      setter(newArray);
    }
  };

  const addArrayItem = (setter, field, defaultValue = "") => {
    if (field) {
      setter(prev => ({
        ...prev,
        [field]: [...prev[field], defaultValue]
      }));
    } else {
      // For simple arrays like tags
      setter(prev => [...prev, defaultValue]);
    }
  };

  const removeArrayItem = (index, setter, field) => {
    if (field) {
      setter(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      // For simple arrays like tags
      setter(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Add featured participant
  const addFeaturedParticipant = () => {
    setParticipants(prev => ({
      ...prev,
      featured: [...prev.featured, {
        name: "",
        role: "",
        bio: "",
        testimonial: "",
        rating: 5
      }]
    }));
  };

  // Remove featured participant
  const removeFeaturedParticipant = (index) => {
    setParticipants(prev => ({
      ...prev,
      featured: prev.featured.filter((_, i) => i !== index)
    }));
  };

  // Handle participant change
  const handleParticipantChange = (index, field, value) => {
    setParticipants(prev => ({
      ...prev,
      featured: prev.featured.map((participant, i) => 
        i === index ? { ...participant, [field]: value } : participant
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add content data
      submitData.append('content', JSON.stringify({
        ...content,
        highlights: content.highlights.filter(h => h.trim() !== "")
      }));
      
      // Add participants data
      submitData.append('participants', JSON.stringify(participants));
      
      // Add timeline data
      submitData.append('timeline', JSON.stringify(timeline));
      
      // Add location data
      submitData.append('location', JSON.stringify(location));
      
      // Add impact data
      submitData.append('impact', JSON.stringify({
        ...impact,
        outcomes: impact.outcomes.filter(o => o.trim() !== "")
      }));
      
      // Add tags
      submitData.append('tags', JSON.stringify(tags.filter(t => t.trim() !== "")));
      
      // Add images
      images.forEach((image, index) => {
        submitData.append(`image${index}`, image);
        submitData.append(`image${index}_caption`, ""); // You can add caption input if needed
      });

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/community/admin/create-community`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Community item created successfully!");
        navigate("/admin/community");
      } else {
        toast.error(data?.message || "Error creating community item");
      }
    } catch (error) {
      console.error("Error creating community item:", error);
      toast.error("Failed to create community item. Please try again.");
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
                <FaUsers className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create Community Item</h1>
                <p className="text-gray-600">Add a new community initiative, story, or testimonial</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    placeholder="Enter title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  >
                    {types.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              {/* Content Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Details</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Text
                  </label>
                  <textarea
                    value={content.fullText}
                    onChange={(e) => handleNestedChange(setContent, 'fullText', e.target.value)}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    placeholder="Enter detailed content"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={content.excerpt}
                    onChange={(e) => handleNestedChange(setContent, 'excerpt', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    placeholder="Enter brief excerpt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Highlights
                  </label>
                  {content.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleArrayChange(index, e.target.value, setContent, content.highlights, 'highlights')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        placeholder="Enter highlight"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, setContent, 'highlights')}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FaMinus />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem(setContent, 'highlights')}
                    className="flex items-center text-mcan-primary hover:text-mcan-secondary"
                  >
                    <FaPlus className="mr-1" />
                    Add Highlight
                  </button>
                </div>
              </div>

              {/* Featured Participants */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Participants</h3>
                
                {participants.featured.map((participant, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={participant.name}
                        onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        placeholder="Participant name"
                      />
                      <input
                        type="text"
                        value={participant.role}
                        onChange={(e) => handleParticipantChange(index, 'role', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        placeholder="Role/Position"
                      />
                    </div>
                    <textarea
                      value={participant.testimonial}
                      onChange={(e) => handleParticipantChange(index, 'testimonial', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent mb-4"
                      placeholder="Testimonial or quote"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Rating:</label>
                        <select
                          value={participant.rating}
                          onChange={(e) => handleParticipantChange(index, 'rating', parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded-md"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>{rating} stars</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeaturedParticipant(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addFeaturedParticipant}
                  className="flex items-center text-mcan-primary hover:text-mcan-secondary"
                >
                  <FaPlus className="mr-1" />
                  Add Featured Participant
                </button>
              </div>

              {/* Impact Metrics */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Impact & Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Beneficiaries
                    </label>
                    <input
                      type="number"
                      value={impact.beneficiaries}
                      onChange={(e) => handleNestedChange(setImpact, 'beneficiaries', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="Number of people helped"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={impact.feedback.averageRating}
                      onChange={(e) => setImpact(prev => ({
                        ...prev,
                        feedback: { ...prev.feedback, averageRating: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="0.0 - 5.0"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Images</h3>
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  />
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Featured Item</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange(index, e.target.value, setTags, tags)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="Enter tag"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, setTags, tags)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(setTags, tags)}
                  className="flex items-center text-mcan-primary hover:text-mcan-secondary"
                >
                  <FaPlus className="mr-1" />
                  Add Tag
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/admin/community")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {loading ? "Creating..." : "Create Community Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;
