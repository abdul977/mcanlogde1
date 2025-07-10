import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaShoppingBag, FaImage, FaPlus, FaMinus, FaSave, FaUpload } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { ResponsiveForm, FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const EditProduct = () => {
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
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);

  // Collection options
  const collectionOptions = [
    { value: "", label: "Select Collection" },
    { value: "Islamic Wear", label: "Islamic Wear" },
    { value: "Casual Wear", label: "Casual Wear" },
    { value: "Accessories", label: "Accessories" },
    { value: "Books", label: "Books" },
    { value: "Prayer Items", label: "Prayer Items" },
    { value: "Limited Edition", label: "Limited Edition" }
  ];

  // Brand options
  const brandOptions = [
    { value: "MCAN", label: "MCAN" },
    { value: "MCAN FCT", label: "MCAN FCT" },
    { value: "MCAN Store", label: "MCAN Store" }
  ];

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  // Fetch product data and categories on component mount
  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/products/admin/get-product-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        const product = data.product;
        
        // Set basic form data
        setFormData({
          name: product.name || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          price: product.price || "",
          comparePrice: product.comparePrice || "",
          sku: product.sku || "",
          category: product.category?._id || "",
          brand: product.brand || "MCAN",
          collection: product.collection || "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          isFeatured: product.isFeatured || false,
          status: product.status || "draft"
        });

        // Set tags
        setTags(product.tags && product.tags.length > 0 ? product.tags : [""]);

        // Set variants
        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants);
        }

        // Set specifications
        if (product.specifications && product.specifications.length > 0) {
          setSpecifications(product.specifications);
        }

        // Set inventory
        setInventory({
          trackQuantity: product.inventory?.trackQuantity ?? true,
          quantity: product.inventory?.quantity || 0,
          lowStockThreshold: product.inventory?.lowStockThreshold || 5,
          allowBackorder: product.inventory?.allowBackorder || false
        });

        // Set dimensions
        setDimensions({
          length: product.dimensions?.length || "",
          width: product.dimensions?.width || "",
          height: product.dimensions?.height || "",
          unit: product.dimensions?.unit || "cm"
        });

        // Set weight
        setWeight({
          value: product.weight?.value || "",
          unit: product.weight?.unit || "kg"
        });

        // Set current images
        setCurrentImages(product.images || []);

      } else {
        toast.error("Failed to fetch product data");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

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

  // Handle specifications
  const addSpecification = () => {
    setSpecifications(prev => [...prev, { name: "", value: "" }]);
  };

  const updateSpecification = (index, field, value) => {
    setSpecifications(prev => 
      prev.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    );
  };

  const removeSpecification = (index) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  // Handle variants
  const addVariant = () => {
    setVariants(prev => [...prev, { name: "", options: [{ value: "", priceAdjustment: 0 }] }]);
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => 
      prev.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const addVariantOption = (variantIndex) => {
    setVariants(prev => 
      prev.map((variant, i) => 
        i === variantIndex 
          ? { ...variant, options: [...variant.options, { value: "", priceAdjustment: 0 }] }
          : variant
      )
    );
  };

  const updateVariantOption = (variantIndex, optionIndex, field, value) => {
    setVariants(prev => 
      prev.map((variant, i) => 
        i === variantIndex 
          ? {
              ...variant,
              options: variant.options.map((option, j) => 
                j === optionIndex ? { ...option, [field]: value } : option
              )
            }
          : variant
      )
    );
  };

  const removeVariantOption = (variantIndex, optionIndex) => {
    setVariants(prev => 
      prev.map((variant, i) => 
        i === variantIndex 
          ? { ...variant, options: variant.options.filter((_, j) => j !== optionIndex) }
          : variant
      )
    );
  };

  // Handle image uploads
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeCurrentImage = (index) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const submitData = new FormData();

      // Add basic form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add complex data as JSON strings
      submitData.append('tags', JSON.stringify(tags.filter(tag => tag.trim())));
      submitData.append('variants', JSON.stringify(variants.filter(v => v.name.trim())));
      submitData.append('specifications', JSON.stringify(specifications.filter(s => s.name.trim() && s.value.trim())));
      submitData.append('inventory', JSON.stringify(inventory));
      submitData.append('dimensions', JSON.stringify(dimensions));
      submitData.append('weight', JSON.stringify(weight));

      // Add current images (to preserve existing ones)
      submitData.append('currentImages', JSON.stringify(currentImages));

      // Add new images
      images.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/products/admin/update/${id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout
        title="Edit Product"
        subtitle="Loading product details..."
        icon={FaShoppingBag}
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
      title="Edit Product"
      subtitle="Update product information"
      icon={FaShoppingBag}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <div className="mb-6">
          <MobileButton
            onClick={() => navigate("/admin/products")}
            variant="secondary"
            size="sm"
          >
            ← Back to Products
          </MobileButton>
        </div>

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
              <MobileInput
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Enter SKU"
                required
              />
            </FormField>

            <FormField label="Category" required>
              <ResponsiveSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </ResponsiveSelect>
            </FormField>

            <FormField label="Brand">
              <ResponsiveSelect
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
              >
                {brandOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </ResponsiveSelect>
            </FormField>

            <FormField label="Collection">
              <ResponsiveSelect
                name="collection"
                value={formData.collection}
                onChange={handleInputChange}
              >
                {collectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </ResponsiveSelect>
            </FormField>

            <FormField label="Status">
              <ResponsiveSelect
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </ResponsiveSelect>
            </FormField>
          </FormSection>

          {/* Description */}
          <FormSection title="Description" columns={1}>
            <FormField label="Short Description">
              <MobileInput
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief product description"
              />
            </FormField>

            <FormField label="Full Description" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed product description"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary"
                required
              />
            </FormField>
          </FormSection>

          {/* Pricing */}
          <FormSection title="Pricing" columns={2}>
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

          {/* Inventory */}
          <FormSection title="Inventory" columns={2}>
            <FormField label="Track Quantity">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={inventory.trackQuantity}
                  onChange={(e) => handleNestedChange(setInventory, 'trackQuantity', e.target.checked)}
                  className="mr-2"
                />
                Track inventory quantity
              </label>
            </FormField>

            {inventory.trackQuantity && (
              <>
                <FormField label="Quantity">
                  <MobileInput
                    type="number"
                    value={inventory.quantity}
                    onChange={(e) => handleNestedChange(setInventory, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </FormField>

                <FormField label="Low Stock Threshold">
                  <MobileInput
                    type="number"
                    value={inventory.lowStockThreshold}
                    onChange={(e) => handleNestedChange(setInventory, 'lowStockThreshold', parseInt(e.target.value) || 5)}
                    placeholder="5"
                    min="0"
                  />
                </FormField>

                <FormField label="Allow Backorder">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={inventory.allowBackorder}
                      onChange={(e) => handleNestedChange(setInventory, 'allowBackorder', e.target.checked)}
                      className="mr-2"
                    />
                    Allow orders when out of stock
                  </label>
                </FormField>
              </>
            )}
          </FormSection>

          {/* Product Settings */}
          <FormSection title="Product Settings" columns={2}>
            <FormField label="Featured Product">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Feature this product
              </label>
            </FormField>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <MobileButton
              type="button"
              onClick={() => navigate("/admin/products")}
              variant="secondary"
            >
              Cancel
            </MobileButton>
            <MobileButton
              type="submit"
              disabled={submitting}
              icon={FaSave}
            >
              {submitting ? "Updating..." : "Update Product"}
            </MobileButton>
          </div>
        </ResponsiveForm>
      </div>
    </MobileLayout>
  );
};

export default EditProduct;
