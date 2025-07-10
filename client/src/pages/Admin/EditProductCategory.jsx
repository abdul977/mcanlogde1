import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFolder, FaImage, FaPlus, FaMinus, FaSave, FaUpload } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const EditProductCategory = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Complex state
  const [attributes, setAttributes] = useState([{ name: "", type: "text", required: false, options: [] }]);
  const [categoryImage, setCategoryImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  // Icon options
  const iconOptions = [
    { value: "shopping-bag", label: "Shopping Bag" },
    { value: "shirt", label: "Shirt" },
    { value: "book", label: "Book" },
    { value: "pray", label: "Prayer" },
    { value: "gift", label: "Gift" },
    { value: "star", label: "Star" },
    { value: "heart", label: "Heart" },
    { value: "home", label: "Home" }
  ];

  // Fetch category data and parent categories on component mount
  useEffect(() => {
    fetchCategory();
    fetchCategories();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/product-categories/admin/get-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        const category = data.category;
        setFormData({
          name: category.name || "",
          description: category.description || "",
          parent: category.parent || "",
          icon: category.icon || "shopping-bag",
          color: category.color || "#3B82F6",
          isActive: category.isActive !== undefined ? category.isActive : true,
          isVisible: category.isVisible !== undefined ? category.isVisible : true,
          isFeatured: category.isFeatured || false,
          displayOrder: category.displayOrder || 0,
          showInMenu: category.showInMenu !== undefined ? category.showInMenu : true,
          showOnHomepage: category.showOnHomepage || false,
          metaTitle: category.metaTitle || "",
          metaDescription: category.metaDescription || ""
        });

        setAttributes(category.attributes || [{ name: "", type: "text", required: false, options: [] }]);
        setCurrentImage(category.image || "");
      } else {
        toast.error("Failed to fetch category data");
        navigate("/admin/product-categories");
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Failed to load category details");
      navigate("/admin/product-categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/product-categories`);
      if (data?.success) {
        // Filter out categories that are already at max depth and the current category
        const rootCategories = data.categories.filter(cat => cat.level < 2 && cat._id !== id);
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

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should be less than 2MB");
        return;
      }
      setCategoryImage(file);
    }
  };

  // Handle attribute changes
  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", type: "text", required: false, options: [] }]);
  };

  const removeAttribute = (index) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

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

      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/product-categories/admin/update/${id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Category updated successfully!");
        navigate("/admin/product-categories");
      } else {
        toast.error(data?.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout
        title="Edit Product Category"
        subtitle="Loading category details..."
        icon={FaFolder}
        navbar={Navbar}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcan-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Edit Product Category"
      subtitle="Update category information"
      icon={FaFolder}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <div className="mb-6">
          <MobileButton
            onClick={() => navigate("/admin/product-categories")}
            variant="secondary"
            size="sm"
          >
            ← Back to Categories
          </MobileButton>
        </div>

        <ResponsiveForm onSubmit={handleSubmit}>
          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            description="Essential category details"
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

            <FormField label="Description" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this category"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
                required
              />
            </FormField>

            <FormField label="Parent Category">
              <ResponsiveSelect
                name="parent"
                value={formData.parent}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "No Parent (Root Category)" },
                  ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                ]}
                placeholder="Select parent category"
              />
            </FormField>
          </FormSection>

          {/* Display Settings */}
          <FormSection
            title="Display Settings"
            description="How this category appears"
          >
            <FormField label="Icon">
              <ResponsiveSelect
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                options={iconOptions}
              />
            </FormField>

            <FormField label="Color">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
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

          {/* Category Image */}
          <FormSection
            title="Category Image"
            description="Upload an image for this category"
          >
            {currentImage && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                <img 
                  src={currentImage} 
                  alt="Current category" 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            
            <FormField label="Upload New Image">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum file size: 2MB. Supported formats: JPG, PNG, WebP, GIF
              </p>
            </FormField>
          </FormSection>

          {/* Visibility Settings */}
          <FormSection
            title="Visibility Settings"
            description="Control where this category appears"
          >
            <div className="space-y-4">
              <FormField label="">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Active (category is enabled)</span>
                </label>
              </FormField>

              <FormField label="">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Visible (show to customers)</span>
                </label>
              </FormField>

              <FormField label="">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Featured category</span>
                </label>
              </FormField>

              <FormField label="">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="showInMenu"
                    checked={formData.showInMenu}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Show in navigation menu</span>
                </label>
              </FormField>

              <FormField label="">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="showOnHomepage"
                    checked={formData.showOnHomepage}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Show on homepage</span>
                </label>
              </FormField>
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <MobileButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/product-categories")}
            >
              Cancel
            </MobileButton>
            <MobileButton
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Update Category
                </>
              )}
            </MobileButton>
          </div>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default EditProductCategory;
