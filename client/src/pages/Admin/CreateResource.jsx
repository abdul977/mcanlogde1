import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBook, FaImage, FaPlus, FaMinus, FaSave, FaFile, FaLink, FaPlay } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const CreateResource = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "books",
    type: "file",
    status: "draft",
    featured: false
  });
  
  const [content, setContent] = useState({
    externalUrl: "",
    embedCode: "",
    fileName: ""
  });
  
  const [author, setAuthor] = useState({
    name: "",
    credentials: [""],
    bio: ""
  });
  
  const [publisher, setPublisher] = useState({
    name: "",
    website: "",
    publishedDate: ""
  });
  
  const [metadata, setMetadata] = useState({
    language: "english",
    pages: "",
    difficulty: "all",
    duration: ""
  });
  
  const [topics, setTopics] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [resourceFile, setResourceFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [authorImage, setAuthorImage] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [authorImagePreview, setAuthorImagePreview] = useState(null);

  // Categories
  const categories = [
    { value: "books", label: "Books" },
    { value: "articles", label: "Articles" },
    { value: "videos", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "documents", label: "Documents" },
    { value: "links", label: "External Links" },
    { value: "apps", label: "Apps & Tools" },
    { value: "courses", label: "Courses" }
  ];

  // Types
  const types = [
    { value: "file", label: "File Upload" },
    { value: "link", label: "External Link" },
    { value: "embedded", label: "Embedded Content" }
  ];

  // Languages
  const languages = [
    { value: "english", label: "English" },
    { value: "arabic", label: "Arabic" },
    { value: "hausa", label: "Hausa" },
    { value: "yoruba", label: "Yoruba" },
    { value: "igbo", label: "Igbo" }
  ];

  // Difficulty levels
  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
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
  const handleArrayChange = (index, value, setter, array) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (setter, array) => {
    setter([...array, ""]);
  };

  const removeArrayItem = (index, setter, array) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setter(newArray);
    }
  };

  // Handle image upload
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'thumbnail') {
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
      } else if (type === 'author') {
        setAuthorImage(file);
        setAuthorImagePreview(URL.createObjectURL(file));
      } else if (type === 'file') {
        setResourceFile(file);
        setContent(prev => ({ ...prev, fileName: file.name }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.type === 'link' && !content.externalUrl) {
      toast.error("Please provide an external URL for link type resources");
      return;
    }

    if (formData.type === 'file' && !resourceFile) {
      toast.error("Please upload a file for file type resources");
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
      submitData.append('content', JSON.stringify(content));
      
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
      if (authorImage) {
        submitData.append('authorImage', authorImage);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/resources/admin/create-resource`,
        submitData,
        {
          headers: {
            Authorization: auth?.token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Resource created successfully!");
        navigate("/admin/resources");
      } else {
        toast.error(data?.message || "Error creating resource");
      }
    } catch (error) {
      console.error("Error creating resource:", error);
      toast.error("Failed to create resource. Please try again.");
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
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Resource</h1>
                <p className="text-gray-600">Add a new Islamic resource to the MCAN library</p>
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

              {/* Resource Type and Content */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resource Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource Type
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

                  {formData.type === 'file' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload File *
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleImageChange(e, 'file')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.zip"
                      />
                      {content.fileName && (
                        <p className="text-sm text-gray-600 mt-1">Selected: {content.fileName}</p>
                      )}
                    </div>
                  )}

                  {formData.type === 'link' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        External URL *
                      </label>
                      <input
                        type="url"
                        value={content.externalUrl}
                        onChange={(e) => handleNestedChange(setContent, 'externalUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  {formData.type === 'embedded' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Embed Code
                      </label>
                      <textarea
                        value={content.embedCode}
                        onChange={(e) => handleNestedChange(setContent, 'embedCode', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                        placeholder="<iframe src='...'></iframe>"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Author Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Author Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => handleNestedChange(setAuthor, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="Enter author name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'author')}
                        className="hidden"
                        id="author-image"
                      />
                      <label
                        htmlFor="author-image"
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition duration-300"
                      >
                        <FaImage className="mr-2" />
                        Choose Image
                      </label>
                      {authorImagePreview && (
                        <img
                          src={authorImagePreview}
                          alt="Author preview"
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={metadata.language}
                      onChange={(e) => handleNestedChange(setMetadata, 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    >
                      {languages.map(language => (
                        <option key={language.value} value={language.value}>
                          {language.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={metadata.difficulty}
                      onChange={(e) => handleNestedChange(setMetadata, 'difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pages (for books)
                    </label>
                    <input
                      type="number"
                      value={metadata.pages}
                      onChange={(e) => handleNestedChange(setMetadata, 'pages', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                      placeholder="Number of pages"
                    />
                  </div>
                </div>
              </div>

              {/* Topics and Tags */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Topics & Tags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topics
                    </label>
                    {topics.map((topic, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => handleArrayChange(index, e.target.value, setTopics, topics)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                          placeholder="Enter topic"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, setTopics, topics)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <FaMinus />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem(setTopics, topics)}
                      className="flex items-center text-mcan-primary hover:text-mcan-secondary"
                    >
                      <FaPlus className="mr-1" />
                      Add Topic
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
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
                </div>
              </div>

              {/* Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured Resource</span>
                  </label>
                </div>
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
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {loading ? "Creating..." : "Create Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateResource;
