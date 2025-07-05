import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaFolder, FaPlus, FaEdit, FaTrash, FaUsers, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";

const CreateCategory = () => {
  const [auth] = useAuth();
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "home",
    features: [],
    targetGender: "any",
    requirements: [],
    displayOrder: 0,
    isActive: true
  });
  const [newFeature, setNewFeature] = useState("");
  const [newRequirement, setNewRequirement] = useState("");

  // Available icons for categories
  const iconOptions = [
    { value: "home", label: "Home" },
    { value: "users", label: "Users" },
    { value: "building", label: "Building" },
    { value: "bed", label: "Bed" },
    { value: "door-open", label: "Room" },
    { value: "user-friends", label: "Shared" },
    { value: "heart", label: "Family" },
    { value: "star", label: "Premium" }
  ];

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/category/get-category`
      );
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add feature to the list
  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  // Remove feature from the list
  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Add requirement to the list
  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  // Remove requirement from the list
  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission for adding/updating category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0
      };

      if (editId) {
        // Update category
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/category/update-category/${editId}`,
          payload,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/category/create-category`,
          payload,
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );
        toast.success("Category created successfully");
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        icon: "home",
        features: [],
        targetGender: "any",
        requirements: [],
        displayOrder: 0,
        isActive: true
      });
      setEditId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/category/delete-category/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setEditId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "home",
      features: category.features || [],
      targetGender: category.targetGender || "any",
      requirements: category.requirements || [],
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== undefined ? category.isActive : true
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    setFormData({
      name: "",
      description: "",
      icon: "home",
      features: [],
      targetGender: "any",
      requirements: [],
      displayOrder: 0,
      isActive: true
    });
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

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
                <FaFolder className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {editId ? "Edit Category" : "Create New Category"}
                </h1>
                <p className="text-gray-600">Manage accommodation categories for MCAN members</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Shared Accommodation"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe this category and what types of accommodations it includes..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Gender
                      </label>
                      <select
                        name="targetGender"
                        value={formData.targetGender}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      >
                        <option value="any">Any Gender</option>
                        <option value="brothers">Brothers Only</option>
                        <option value="sisters">Sisters Only</option>
                        <option value="family">Family</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                    />
                    <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2 text-mcan-primary focus:ring-mcan-primary"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Active (visible to users)
                    </label>
                  </div>
                </div>

                {/* Features Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Features</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-3 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-mcan-primary/10 text-mcan-primary rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Requirements</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a requirement..."
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="px-4 py-3 bg-mcan-primary text-white rounded-md hover:bg-mcan-secondary transition duration-300"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((requirement, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                      >
                        {requirement}
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                  {editId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white rounded-md hover:opacity-90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editId ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {editId ? "Update Category" : "Create Category"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Existing Categories</h3>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <FaFolder className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-600">No categories created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              category.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              <FaUsers className="inline mr-1" />
                              {category.targetGender === 'any' ? 'Any Gender' :
                               category.targetGender === 'brothers' ? 'Brothers' :
                               category.targetGender === 'sisters' ? 'Sisters' : 'Family'}
                            </span>
                            <span>Order: {category.displayOrder}</span>
                          </div>
                          {category.features && category.features.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {category.features.slice(0, 3).map((feature, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-mcan-primary/10 text-mcan-primary rounded text-xs"
                                  >
                                    {feature}
                                  </span>
                                ))}
                                {category.features.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{category.features.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-mcan-primary hover:text-mcan-secondary transition-colors duration-200"
                            title="Edit Category"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Delete Category"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
  