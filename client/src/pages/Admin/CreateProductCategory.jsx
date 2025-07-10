import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFolder, FaImage, FaPlus, FaMinus, FaSave, FaUpload } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const CreateProductCategory = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    icon: "shopping-bag",
    color: "#3B82F6",
    isActive: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 0,
    showInMenu: true,
    showOnHomepage: false,
    metaTitle: "",
    metaDescription: ""
  });
  
  const [attributes, setAttributes] = useState([{ name: "", type: "text", options: [""], isRequired: false, isFilterable: true }]);
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Icon options
  const iconOptions = [
    { value: "shopping-bag", label: "Shopping Bag" },
    { value: "shirt", label: "Shirt" },
    { value: "book", label: "Book" },
    { value: "pray", label: "Prayer" },
    { value: "star", label: "Star" },
    { value: "heart", label: "Heart" },
    { value: "gift", label: "Gift" },
    { value: "tag", label: "Tag" },
    { value: "crown", label: "Crown" },
    { value: "gem", label: "Gem" }
  ];

  // Attribute type options
  const attributeTypeOptions = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "select", label: "Select" },
    { value: "multiselect", label: "Multi-select" },
    { value: "boolean", label: "Yes/No" }
  ];

  // Fetch existing categories for parent selection
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/product-categories`);
      if (data?.success) {
        // Filter out categories that are already at max depth
        const rootCategories = data.categories.filter(cat => cat.level < 2);
        setCategories(rootCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
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

  // Handle attribute changes
  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleAttributeOptionChange = (attrIndex, optionIndex, value) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].options[optionIndex] = value;
    setAttributes(newAttributes);
  };

  const addAttributeOption = (attrIndex) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].options.push("");
    setAttributes(newAttributes);
  };

  const removeAttributeOption = (attrIndex, optionIndex) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].options.splice(optionIndex, 1);
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes(prev => [...prev, { 
      name: "", 
      type: "text", 
      options: [""], 
      isRequired: false, 
      isFilterable: true 
    }]);
  };

  const removeAttribute = (index) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCategoryImage(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add basic form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add attributes as JSON string
      const validAttributes = attributes.filter(attr => attr.name.trim());
      submitData.append('attributes', JSON.stringify(validAttributes));

      // Add image if provided
      if (categoryImage) {
        submitData.append('image', categoryImage);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/product-categories/admin/create`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Product category created successfully!");
        navigate("/admin/product-categories");
      } else {
        toast.error(data?.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      title="Create Product Category"
      subtitle="Add new category for MCAN Store products"
      icon={FaFolder}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <ResponsiveForm onSubmit={handleSubmit}>
          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            icon={FaFolder}
            columns={2}
          >
            <FormField label="Category Name" required>
              <MobileInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </FormField>

            <FormField label="Parent Category">
              <ResponsiveSelect
                name="parent"
                value={formData.parent}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "None (Root Category)" },
                  ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                ]}
                placeholder="Select parent category"
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

            <FormField label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <MobileInput
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </FormField>

            <FormField label="Display Order">
              <MobileInput
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </FormField>
          </FormSection>

          {/* Description */}
          <FormSection
            title="Description"
            icon={FaFolder}
            columns={1}
          >
            <FormField label="Category Description" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this category"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
                required
              />
            </FormField>
          </FormSection>

          {/* Category Image */}
          <FormSection
            title="Category Image"
            icon={FaImage}
            columns={1}
          >
            <FormField label="Upload Image">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="category-image"
                  />
                  <label
                    htmlFor="category-image"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <FaUpload />
                    Upload Image
                  </label>
                  <span className="text-sm text-gray-600">
                    JPG/PNG format, max 2MB
                  </span>
                </div>

                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </FormField>
          </FormSection>

          {/* Visibility Settings */}
          <FormSection
            title="Visibility Settings"
            icon={FaFolder}
            columns={2}
          >
            <FormField label="Active">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Category is active</span>
              </label>
            </FormField>

            <FormField label="Visible">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Show in public store</span>
              </label>
            </FormField>

            <FormField label="Featured">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Mark as featured category</span>
              </label>
            </FormField>

            <FormField label="Show in Menu">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showInMenu"
                  checked={formData.showInMenu}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Display in navigation menu</span>
              </label>
            </FormField>

            <FormField label="Show on Homepage">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showOnHomepage"
                  checked={formData.showOnHomepage}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Display on homepage</span>
              </label>
            </FormField>
          </FormSection>

          {/* SEO Settings */}
          <FormSection
            title="SEO Settings"
            icon={FaFolder}
            columns={1}
          >
            <FormField label="Meta Title">
              <MobileInput
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="SEO title (max 60 characters)"
                maxLength={60}
              />
            </FormField>

            <FormField label="Meta Description">
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="SEO description (max 160 characters)"
                maxLength={160}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[80px]"
              />
            </FormField>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8">
            <MobileButton
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/product-categories")}
            >
              Cancel
            </MobileButton>
            <MobileButton
              type="submit"
              loading={loading}
              icon={FaSave}
            >
              Create Category
            </MobileButton>
          </div>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateProductCategory;
