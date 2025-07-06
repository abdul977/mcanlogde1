import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBook, FaImage, FaPlus, FaMinus, FaSave, FaFile, FaLink, FaPlay } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField } from "../../components/Mobile/ResponsiveForm";

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
            Authorization: `Bearer ${auth?.token}`,
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
    <MobileLayout
      title="Create New Resource"
      subtitle="Add a new Islamic resource to the MCAN library"
      icon={FaBook}
      navbar={Navbar}
      backgroundColor="bg-gradient-to-r from-mcan-primary/5 to-mcan-secondary/5"
    >
      <div className="p-4 lg:p-8">
        {/* Form */}
        <ResponsiveForm
          onSubmit={handleSubmit}
          loading={loading}
          submitText={loading ? "Creating..." : "Create Resource"}
          showCancel={true}
          onCancel={() => navigate("/admin/resources")}
          cancelText="Cancel"
          className="bg-white rounded-lg shadow-lg"
        >
          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            icon={FaBook}
            columns={2}
          >
            <FormField label="Resource Title *" required>
              <MobileInput
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter resource title"
              />
            </FormField>

            <FormField label="Category">
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Description *" className="lg:col-span-2" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                placeholder="Enter resource description"
              />
            </FormField>
          </FormSection>

          {/* Resource Type and Content */}
          <FormSection
            title="Resource Content"
            icon={FaFile}
            columns={2}
          >
            <FormField label="Resource Type">
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>

            {formData.type === 'file' && (
              <FormField label="Upload File *" required>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'file')}
                  className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.zip"
                />
                {content.fileName && (
                  <p className="text-xs lg:text-sm text-gray-600 mt-1">Selected: {content.fileName}</p>
                )}
              </FormField>
            )}

            {formData.type === 'link' && (
              <FormField label="External URL *" required>
                <MobileInput
                  type="url"
                  value={content.externalUrl}
                  onChange={(e) => handleNestedChange(setContent, 'externalUrl', e.target.value)}
                  placeholder="https://example.com"
                />
              </FormField>
            )}

            {formData.type === 'embedded' && (
              <FormField label="Embed Code" className="lg:col-span-2">
                <textarea
                  value={content.embedCode}
                  onChange={(e) => handleNestedChange(setContent, 'embedCode', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  placeholder="<iframe src='...'></iframe>"
                />
              </FormField>
            )}
          </FormSection>

          {/* Author Information */}
          <FormSection
            title="Author Information"
            icon={FaImage}
            columns={2}
          >
            <FormField label="Author Name">
              <MobileInput
                type="text"
                value={author.name}
                onChange={(e) => handleNestedChange(setAuthor, 'name', e.target.value)}
                placeholder="Enter author name"
              />
            </FormField>

            <FormField label="Author Image">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'author')}
                  className="hidden"
                  id="author-image"
                />
                <label
                  htmlFor="author-image"
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition duration-300 text-sm lg:text-base"
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
            </FormField>
          </FormSection>

          {/* Metadata */}
          <FormSection
            title="Metadata"
            icon={FaBook}
            columns={3}
          >
            <FormField label="Language">
              <select
                value={metadata.language}
                onChange={(e) => handleNestedChange(setMetadata, 'language', e.target.value)}
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {languages.map(language => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Difficulty Level">
              <select
                value={metadata.difficulty}
                onChange={(e) => handleNestedChange(setMetadata, 'difficulty', e.target.value)}
                className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Pages (for books)">
              <MobileInput
                type="number"
                value={metadata.pages}
                onChange={(e) => handleNestedChange(setMetadata, 'pages', e.target.value)}
                placeholder="Number of pages"
              />
            </FormField>
          </FormSection>

          {/* Topics and Tags */}
          <FormSection
            title="Topics & Tags"
            icon={FaPlus}
            columns={2}
          >
            <FormField label="Topics">
              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <MobileInput
                      value={topic}
                      onChange={(e) => handleArrayChange(index, e.target.value, setTopics, topics)}
                      placeholder="Enter topic"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, setTopics, topics)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <MobileButton
                  type="button"
                  onClick={() => addArrayItem(setTopics, topics)}
                  variant="secondary"
                  size="sm"
                  icon={FaPlus}
                >
                  Add Topic
                </MobileButton>
              </div>
            </FormField>

            <FormField label="Tags">
              <div className="space-y-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <MobileInput
                      value={tag}
                      onChange={(e) => handleArrayChange(index, e.target.value, setTags, tags)}
                      placeholder="Enter tag"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, setTags, tags)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <MobileButton
                  type="button"
                  onClick={() => addArrayItem(setTags, tags)}
                  variant="secondary"
                  size="sm"
                  icon={FaPlus}
                >
                  Add Tag
                </MobileButton>
              </div>
            </FormField>
          </FormSection>

          {/* Settings */}
          <FormSection
            title="Settings"
            icon={FaSave}
            columns={1}
          >
            <FormField>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm lg:text-base text-gray-700">Featured Resource</span>
                </label>
              </div>
            </FormField>
          </FormSection>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateResource;
