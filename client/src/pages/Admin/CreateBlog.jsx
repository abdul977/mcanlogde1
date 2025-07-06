import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPen, FaImage, FaTags, FaEye, FaSave, FaBook, FaEdit, FaFileAlt } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveTextarea, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

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
            Authorization: `Bearer ${auth?.token}`,
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
    <MobileLayout
      title="Create Blog Post"
      subtitle="Content management"
      icon={FaBook}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={() => navigate('/admin/all-blogs')}
          variant="secondary"
          size="sm"
          icon={FaFileAlt}
        >
          View Blogs
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Create New Blog Post"
          subtitle="Share knowledge and insights with the MCAN community"
          icon={FaPen}
          showOnMobile={false}
        />

        {/* Form */}
        <ResponsiveForm
          title="Create New Blog Post"
          subtitle="Fill in the details below to create a new blog post"
          onSubmit={handleSubmit}
        >
          {/* Basic Information Section */}
          <FormSection
            title="Basic Information"
            icon={FaEdit}
            columns={1}
          >
            <FormField label="Blog Title" required fullWidth>
              <MobileInput
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter an engaging blog title..."
                icon={FaPen}
                required
              />
            </FormField>

            <FormField label="Excerpt" required fullWidth>
              <ResponsiveTextarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief description of the blog post..."
                rows={3}
                required
              />
            </FormField>

            <FormField label="Blog Content" required fullWidth>
              <div className="border border-gray-300 rounded-md min-h-[300px]">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your blog content here..."
                  className="h-64"
                />
              </div>
            </FormField>
          </FormSection>

          {/* Settings Section */}
          <FormSection
            title="Blog Settings"
            icon={FaTags}
            columns={2}
          >
            <FormField label="Category" required>
              <ResponsiveSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories}
                placeholder="Select category"
                required
              />
            </FormField>

            <FormField label="Status">
              <ResponsiveSelect
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' }
                ]}
                placeholder="Select status"
              />
            </FormField>

            <FormField label="Tags" fullWidth>
              <MobileInput
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas"
                icon={FaTags}
              />
            </FormField>

            <FormField label="Author" fullWidth>
              <MobileInput
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Author name"
                icon={FaPen}
              />
            </FormField>
          </FormSection>

          {/* Image Upload Section */}
          <FormSection
            title="Featured Image"
            icon={FaImage}
            columns={1}
          >
            <FormField label="Upload Featured Image" fullWidth>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:p-6 text-center hover:border-mcan-primary transition-colors">
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <FaImage className="text-3xl lg:text-4xl text-gray-400 mb-2" />
                    <span className="text-gray-600 font-medium">Upload Featured Image</span>
                    <span className="text-sm text-gray-500 mt-1">Click to select file</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded-lg mx-auto"
                    />
                  </div>
                )}
              </div>
            </FormField>
          </FormSection>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <MobileButton
              type="button"
              onClick={() => navigate("/admin/all-blogs")}
              variant="secondary"
              size="lg"
            >
              Cancel
            </MobileButton>

            <MobileButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              icon={loading ? null : FaSave}
              className={loading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Blog Post'
              )}
            </MobileButton>
          </div>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateBlog;
