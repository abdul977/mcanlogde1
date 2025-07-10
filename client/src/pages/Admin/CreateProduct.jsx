import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaShoppingBag, FaImage, FaPlus, FaMinus, FaSave, FaUpload } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const CreateProduct = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    comparePrice: "",
    sku: "",
    category: "",
    brand: "MCAN",
    collection: "",
    metaTitle: "",
    metaDescription: "",
    isFeatured: false,
    status: "draft"
  });
  
  const [tags, setTags] = useState([""]);
  const [variants, setVariants] = useState([{ name: "", options: [{ value: "", priceAdjustment: 0 }] }]);
  const [specifications, setSpecifications] = useState([{ name: "", value: "" }]);
  const [inventory, setInventory] = useState({
    trackQuantity: true,
    quantity: 0,
    lowStockThreshold: 5,
    allowBackorder: false
  });
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
    unit: "cm"
  });
  const [weight, setWeight] = useState({
    value: "",
    unit: "kg"
  });
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Brand options
  const brandOptions = [
    { value: "MCAN", label: "MCAN" },
    { value: "MCAN FCT", label: "MCAN FCT" },
    { value: "MCAN Store", label: "MCAN Store" }
  ];

  // Collection options
  const collectionOptions = [
    { value: "Islamic Wear", label: "Islamic Wear" },
    { value: "Casual Wear", label: "Casual Wear" },
    { value: "Accessories", label: "Accessories" },
    { value: "Books", label: "Books" },
    { value: "Prayer Items", label: "Prayer Items" },
    { value: "Limited Edition", label: "Limited Edition" }
  ];

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/product-categories`);
      if (data?.success) {
        setCategories(data.categories);
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

  // Handle nested object changes
  const handleNestedChange = (parent, field, value) => {
    if (parent === 'inventory') {
      setInventory(prev => ({ ...prev, [field]: value }));
    } else if (parent === 'dimensions') {
      setDimensions(prev => ({ ...prev, [field]: value }));
    } else if (parent === 'weight') {
      setWeight(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (index, value, arrayName, setter) => {
    const newArray = [...eval(arrayName)];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (arrayName, setter, defaultValue) => {
    setter(prev => [...prev, defaultValue]);
  };

  const removeArrayItem = (index, arrayName, setter) => {
    const newArray = [...eval(arrayName)];
    newArray.splice(index, 1);
    setter(newArray);
  };

  // Handle variant changes
  const handleVariantChange = (variantIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex][field] = value;
    setVariants(newVariants);
  };

  const handleVariantOptionChange = (variantIndex, optionIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options[optionIndex][field] = value;
    setVariants(newVariants);
  };

  const addVariantOption = (variantIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options.push({ value: "", priceAdjustment: 0 });
    setVariants(newVariants);
  };

  const removeVariantOption = (variantIndex, optionIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options.splice(optionIndex, 1);
    setVariants(newVariants);
  };

  // Handle specification changes
  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + productImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setProductImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...productImages];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setProductImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Generate SKU automatically
  const generateSKU = () => {
    const prefix = formData.brand.replace(/\s+/g, '').toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${timestamp}${random}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (productImages.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add basic form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add complex data as JSON strings
      submitData.append('tags', tags.filter(tag => tag.trim()).join(','));
      submitData.append('variants', JSON.stringify(variants.filter(v => v.name.trim())));
      submitData.append('specifications', JSON.stringify(specifications.filter(s => s.name.trim() && s.value.trim())));
      submitData.append('inventory', JSON.stringify(inventory));
      submitData.append('dimensions', JSON.stringify(dimensions));
      submitData.append('weight', JSON.stringify(weight));

      // Add images
      productImages.forEach((image, index) => {
        submitData.append('images', image);
      });

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/products/admin/create`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data?.success) {
        toast.success("Product created successfully!");
        navigate("/admin/products");
      } else {
        toast.error(data?.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      title="Create Product"
      subtitle="Add new product to MCAN Store"
      icon={FaShoppingBag}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <ResponsiveForm onSubmit={handleSubmit}>
          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            icon={FaShoppingBag}
            columns={2}
          >
            <FormField label="Product Name" required>
              <MobileInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </FormField>

            <FormField label="SKU" required>
              <div className="flex gap-2">
                <MobileInput
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Product SKU"
                  required
                />
                <MobileButton
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({ ...prev, sku: generateSKU() }))}
                >
                  Generate
                </MobileButton>
              </div>
            </FormField>

            <FormField label="Category" required>
              <ResponsiveSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                placeholder="Select category"
                required
              />
            </FormField>

            <FormField label="Brand">
              <ResponsiveSelect
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                options={brandOptions}
              />
            </FormField>

            <FormField label="Collection">
              <ResponsiveSelect
                name="collection"
                value={formData.collection}
                onChange={handleInputChange}
                options={collectionOptions}
                placeholder="Select collection"
              />
            </FormField>

            <FormField label="Status">
              <ResponsiveSelect
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statusOptions}
              />
            </FormField>
          </FormSection>

          {/* Pricing */}
          <FormSection
            title="Pricing"
            icon={FaShoppingBag}
            columns={2}
          >
            <FormField label="Price (NGN)" required>
              <MobileInput
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </FormField>

            <FormField label="Compare Price (NGN)">
              <MobileInput
                type="number"
                name="comparePrice"
                value={formData.comparePrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </FormField>
          </FormSection>

          {/* Description */}
          <FormSection
            title="Description"
            icon={FaShoppingBag}
            columns={1}
          >
            <FormField label="Short Description">
              <MobileInput
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief product description"
                maxLength={300}
              />
            </FormField>

            <FormField label="Full Description" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed product description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px]"
                required
              />
            </FormField>
          </FormSection>

          {/* Product Images */}
          <FormSection
            title="Product Images"
            icon={FaImage}
            columns={1}
          >
            <FormField label="Upload Images" required>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-images"
                  />
                  <label
                    htmlFor="product-images"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <FaUpload />
                    Upload Images
                  </label>
                  <span className="text-sm text-gray-600">
                    Maximum 5 images, JPG/PNG format
                  </span>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </FormSection>

          {/* Inventory */}
          <FormSection
            title="Inventory Management"
            icon={FaShoppingBag}
            columns={2}
          >
            <FormField label="Track Quantity">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inventory.trackQuantity}
                  onChange={(e) => handleNestedChange('inventory', 'trackQuantity', e.target.checked)}
                  className="rounded"
                />
                <span>Track inventory quantity</span>
              </label>
            </FormField>

            {inventory.trackQuantity && (
              <>
                <FormField label="Quantity">
                  <MobileInput
                    type="number"
                    value={inventory.quantity}
                    onChange={(e) => handleNestedChange('inventory', 'quantity', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </FormField>

                <FormField label="Low Stock Threshold">
                  <MobileInput
                    type="number"
                    value={inventory.lowStockThreshold}
                    onChange={(e) => handleNestedChange('inventory', 'lowStockThreshold', Number(e.target.value))}
                    placeholder="5"
                    min="0"
                  />
                </FormField>

                <FormField label="Allow Backorder">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inventory.allowBackorder}
                      onChange={(e) => handleNestedChange('inventory', 'allowBackorder', e.target.checked)}
                      className="rounded"
                    />
                    <span>Allow orders when out of stock</span>
                  </label>
                </FormField>
              </>
            )}
          </FormSection>

          {/* Tags */}
          <FormSection
            title="Tags"
            icon={FaShoppingBag}
            columns={1}
          >
            <FormField label="Product Tags">
              <div className="space-y-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <MobileInput
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'tags', setTags)}
                      placeholder="Enter tag"
                    />
                    {tags.length > 1 && (
                      <MobileButton
                        type="button"
                        variant="outline"
                        onClick={() => removeArrayItem(index, 'tags', setTags)}
                        icon={FaMinus}
                      />
                    )}
                  </div>
                ))}
                <MobileButton
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('tags', setTags, "")}
                  icon={FaPlus}
                >
                  Add Tag
                </MobileButton>
              </div>
            </FormField>
          </FormSection>

          {/* SEO */}
          <FormSection
            title="SEO Settings"
            icon={FaShoppingBag}
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

            <FormField label="Featured Product">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Mark as featured product</span>
              </label>
            </FormField>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8">
            <MobileButton
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </MobileButton>
            <MobileButton
              type="submit"
              loading={loading}
              icon={FaSave}
            >
              Create Product
            </MobileButton>
          </div>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default CreateProduct;
