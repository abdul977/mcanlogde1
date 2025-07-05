import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUsers, FaSave, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const EditCommunity = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "initiative",
    category: "social",
    status: "draft",
    featured: false,
    priority: "medium"
  });
  
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  });
  
  const [location, setLocation] = useState({
    address: "",
    city: "Enugu",
    state: "Enugu",
    country: "Nigeria"
  });
  
  const [schedule, setSchedule] = useState({
    startDate: "",
    endDate: "",
    frequency: "once",
    time: ""
  });
  
  const [tags, setTags] = useState([""]);
  const [communityImage, setCommunityImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  // Types and categories
  const types = [
    { value: "initiative", label: "Community Initiative" },
    { value: "testimonial", label: "Testimonial" },
    { value: "event", label: "Community Event" },
    { value: "program", label: "Community Program" },
    { value: "outreach", label: "Outreach Activity" }
  ];

  const categories = [
    { value: "social", label: "Social" },
    { value: "educational", label: "Educational" },
    { value: "charitable", label: "Charitable" },
    { value: "religious", label: "Religious" },
    { value: "youth", label: "Youth" }
  ];

  // Fetch community data
  useEffect(() => {
    fetchCommunity();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/community/admin/get-community-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        const community = data.community;
        setFormData({
          title: community.title || "",
          description: community.description || "",
          type: community.type || "initiative",
          category: community.category || "social",
          status: community.status || "draft",
          featured: community.featured || false,
          priority: community.priority || "medium"
        });
        
        setContact({
          name: community.contact?.name || "",
          email: community.contact?.email || "",
          phone: community.contact?.phone || "",
          role: community.contact?.role || ""
        });
        
        setLocation({
          address: community.location?.address || "",
          city: community.location?.city || "Enugu",
          state: community.location?.state || "Enugu",
          country: community.location?.country || "Nigeria"
        });
        
        setSchedule({
          startDate: community.schedule?.startDate ? new Date(community.schedule.startDate).toISOString().split('T')[0] : "",
          endDate: community.schedule?.endDate ? new Date(community.schedule.endDate).toISOString().split('T')[0] : "",
          frequency: community.schedule?.frequency || "once",
          time: community.schedule?.time || ""
        });
        
        setTags(community.tags && community.tags.length > 0 ? community.tags : [""]);
        setCurrentImage(community.image || "");
      } else {
        toast.error(data?.message || "Error fetching community item");
        navigate("/admin/community");
      }
    } catch (error) {
      console.error("Error fetching community item:", error);
      toast.error("Failed to fetch community details");
      navigate("/admin/community");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (setter, field, value) => {
    setter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array fields
  const addArrayItem = (setter) => {
    setter(prev => [...prev, ""]);
  };

  const updateArrayItem = (index, value, setter) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeArrayItem = (index, setter) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCommunityImage(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add contact data
      submitData.append('contact', JSON.stringify(contact));
      
      // Add location data
      submitData.append('location', JSON.stringify(location));
      
      // Add schedule data
      submitData.append('schedule', JSON.stringify(schedule));
      
      // Add tags
      submitData.append('tags', JSON.stringify(tags.filter(t => t.trim() !== "")));
      
      // Add image if selected
      if (communityImage) {
        submitData.append('image', communityImage);
      }

      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/community/admin/update-community/${id}`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Community item updated successfully!");
        navigate("/admin/community");
      } else {
        toast.error(data?.message || "Error updating community item");
      }
    } catch (error) {
      console.error("Error updating community item:", error);
      toast.error("Failed to update community item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5">
        <div className="flex">
          <div className="ml-[4rem]">
            <Navbar />
          </div>
          <div className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading community details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-3 rounded-lg">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Edit Community Item</h1>
                  <p className="text-gray-600">Update community information</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/community")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                <FaArrowLeft />
                Back to Community
              </button>
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
                  disabled={submitting}
                  className="flex items-center px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {submitting ? "Updating..." : "Update Community Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCommunity;
