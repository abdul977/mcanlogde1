import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPen, FaImage, FaTags, FaEye, FaSave } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";

const CreateBlog = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "MCAN Admin",
    status: "draft",
    category: "general",
    tags: "",
    featured: false,
    metaDescription: ""
  });
  
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Categories for blog posts
  const categories = [
    { value: "general", label: "General" },
    { value: "islamic", label: "Islamic" },
    { value: "education", label: "Education" },
    { value: "community", label: "Community" },
    { value: "events", label: "Events" },
    { value: "announcements", label: "Announcements" }
  ];

  // Rich text editor modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'video', 'color', 'background',
    'align', 'script'
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle content change from rich text editor
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
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
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast.error("Title, content, and excerpt are required");
      return;
    }
    
    if (!featuredImage) {
      toast.error("Featured image is required");
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append("featuredImage", featuredImage);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blog/create-blog`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: auth?.token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Blog post created successfully!");
        navigate("/admin/blogs");
      } else {
        toast.error(response.data.message || "Failed to create blog post");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(error.response?.data?.message || "Failed to create blog post");
    } finally {
      setLoading(false);
    }
  };

  // Handle save as draft
  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, status: "draft" }));
    setTimeout(() => {
      document.getElementById('blog-form').requestSubmit();
    }, 100);
  };

  // Handle publish
  const handlePublish = () => {
    setFormData(prev => ({ ...prev, status: "published" }));
    setTimeout(() => {
      document.getElementById('blog-form').requestSubmit();
    }, 100);
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
                <FaPen className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Blog Post</h1>
                <p className="text-gray-600">Share knowledge and insights with the MCAN community</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter an engaging blog title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Content Editor */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Content *
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your blog content here..."
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief summary of the blog post (max 300 characters)..."
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.excerpt.length}/300 characters
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Featured Image */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaImage className="inline mr-2" />
                    Featured Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    required
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

                {/* Blog Settings */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Blog Settings</h3>
                  
                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                  </div>

                  {/* Category */}
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
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaTags className="inline mr-2" />
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas (e.g., islam, education, community)
                    </p>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Featured post
                    </label>
                  </div>
                </div>

                {/* SEO */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      placeholder="Brief description for search engines..."
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleSaveAsDraft}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300 disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    Save as Draft
                  </button>
                  
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300 disabled:opacity-50"
                  >
                    <FaEye className="mr-2" />
                    {loading ? "Publishing..." : "Publish Now"}
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

export default CreateBlog;
