import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBook, FaSave, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const EditResource = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "books",
    subcategory: "",
    type: "file",
    status: "draft",
    featured: false
  });
  
  const [author, setAuthor] = useState({
    name: "",
    bio: "",
    credentials: [""]
  });
  
  const [publisher, setPublisher] = useState({
    name: "",
    website: "",
    publishedDate: ""
  });
  
  const [metadata, setMetadata] = useState({
    difficulty: "beginner",
    language: "english",
    pages: 0,
    fileSize: "",
    format: "pdf"
  });
  
  const [topics, setTopics] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [resourceFile, setResourceFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState("");

  // Categories
  const categories = [
    { value: "books", label: "Books" },
    { value: "articles", label: "Articles" },
    { value: "videos", label: "Videos" },
    { value: "audios", label: "Audio" },
    { value: "documents", label: "Documents" }
  ];

  // Fetch resource data
  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/resources/admin/get-resource-by-id/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        const resource = data.resource;
        setFormData({
          title: resource.title || "",
          description: resource.description || "",
          category: resource.category || "books",
          subcategory: resource.subcategory || "",
          type: resource.type || "file",
          status: resource.status || "draft",
          featured: resource.featured || false
        });
        
        setAuthor({
          name: resource.author?.name || "",
          bio: resource.author?.bio || "",
          credentials: resource.author?.credentials && resource.author.credentials.length > 0 ? resource.author.credentials : [""]
        });
        
        setPublisher({
          name: resource.publisher?.name || "",
          website: resource.publisher?.website || "",
          publishedDate: resource.publisher?.publishedDate ? new Date(resource.publisher.publishedDate).toISOString().split('T')[0] : ""
        });
        
        setMetadata({
          difficulty: resource.metadata?.difficulty || "beginner",
          language: resource.metadata?.language || "english",
          pages: resource.metadata?.pages || 0,
          fileSize: resource.metadata?.fileSize || "",
          format: resource.metadata?.format || "pdf"
        });
        
        setTopics(resource.topics && resource.topics.length > 0 ? resource.topics : [""]);
        setTags(resource.tags && resource.tags.length > 0 ? resource.tags : [""]);
        setCurrentThumbnail(resource.thumbnail || "");
      } else {
        toast.error(data?.message || "Error fetching resource");
        navigate("/admin/resources");
      }
    } catch (error) {
      console.error("Error fetching resource:", error);
      toast.error("Failed to fetch resource details");
      navigate("/admin/resources");
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

  // Handle file upload
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'resource') {
        setResourceFile(file);
      } else if (type === 'thumbnail') {
        setThumbnail(file);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
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
      
      // Add author data
      submitData.append('author', JSON.stringify({
        ...author,
        credentials: author.credentials.filter(c => c.trim() !== "")
      }));
      
      // Add publisher data
      submitData.append('publisher', JSON.stringify(publisher));
      
      // Add metadata
      submitData.append('metadata', JSON.stringify(metadata));
      
      // Add topics and tags
      submitData.append('topics', JSON.stringify(topics.filter(t => t.trim() !== "")));
      submitData.append('tags', JSON.stringify(tags.filter(t => t.trim() !== "")));
      
      // Add files
      if (resourceFile) {
        submitData.append('file', resourceFile);
      }
      if (thumbnail) {
        submitData.append('thumbnail', thumbnail);
      }

      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/resources/admin/update-resource/${id}`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Resource updated successfully!");
        navigate("/admin/resources");
      } else {
        toast.error(data?.message || "Error updating resource");
      }
    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("Failed to update resource. Please try again.");
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
                <p className="mt-4 text-gray-600">Loading resource details...</p>
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
                  <FaBook className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Edit Resource</h1>
                  <p className="text-gray-600">Update resource information</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/resources")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                <FaArrowLeft />
                Back to Resources
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
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    placeholder="Enter resource title"
                  />
                </div>
                
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
                  placeholder="Enter resource description"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/admin/resources")}
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
                  {submitting ? "Updating..." : "Update Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditResource;
