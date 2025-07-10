import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaFolder, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaSearch,
  FaFilter,
  FaSort,
  FaShoppingBag
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";
import { ResponsiveDataDisplay } from "../../components/Mobile/ResponsiveDataDisplay";

const AllProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/product-categories`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load product categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/product-categories/admin/delete/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    navigate(`/admin/edit-product-category/${category._id}`);
  };

  const handleView = (category) => {
    navigate(`/admin/view-product-category/${category._id}`);
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || 
                           (statusFilter === "active" && category.isActive) ||
                           (statusFilter === "inactive" && !category.isActive);
      const matchesLevel = !levelFilter || category.level.toString() === levelFilter;
      
      return matchesSearch && matchesStatus && matchesLevel;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  const levelOptions = [
    { value: "", label: "All Levels" },
    { value: "0", label: "Root Categories" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" }
  ];

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
    { value: "displayOrder", label: "Display Order" },
    { value: "productCount", label: "Product Count" }
  ];

  const columns = [
    {
      key: "name",
      label: "Category",
      render: (category) => (
        <div className="flex items-center space-x-3">
          {category.image && (
            <img 
              src={category.image} 
              alt={category.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">Level {category.level}</div>
          </div>
        </div>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (category) => (
        <div className="max-w-xs truncate text-gray-600">
          {category.description}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (category) => (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            category.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
          {category.isFeatured && (
            <FaStar className="text-yellow-500" />
          )}
        </div>
      )
    },
    {
      key: "productCount",
      label: "Products",
      render: (category) => (
        <span className="text-gray-900 font-medium">
          {category.productCount || 0}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "Created",
      render: (category) => (
        <span className="text-gray-600">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  const CategoryCard = ({ item: category, onEdit, onDelete, onView }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {category.image && (
            <img 
              src={category.image} 
              alt={category.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="font-medium text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">Level {category.level}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            category.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
          {category.isFeatured && (
            <FaStar className="text-yellow-500" />
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {category.description}
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{category.productCount || 0} products</span>
        <span>{new Date(category.createdAt).toLocaleDateString()}</span>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onView(category)}
          className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <FaEye className="inline mr-1" />
          View
        </button>
        <button
          onClick={() => onEdit(category)}
          className="flex-1 bg-yellow-50 text-yellow-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
        >
          <FaEdit className="inline mr-1" />
          Edit
        </button>
        <button
          onClick={() => onDelete(category._id)}
          className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <FaTrash className="inline mr-1" />
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <MobileLayout
      title="Product Categories"
      subtitle={`Manage MCAN Store categories (${filteredCategories.length} total)`}
      icon={FaFolder}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <MobileInput
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Link to="/admin/create-product-category">
            <MobileButton icon={FaPlus}>
              Add Category
            </MobileButton>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField label="Status">
              <ResponsiveSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
              />
            </FormField>

            <FormField label="Level">
              <ResponsiveSelect
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                options={levelOptions}
              />
            </FormField>

            <FormField label="Sort By">
              <ResponsiveSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
              />
            </FormField>

            <FormField label="Order">
              <ResponsiveSelect
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                options={[
                  { value: "desc", label: "Descending" },
                  { value: "asc", label: "Ascending" }
                ]}
              />
            </FormField>
          </div>
        </div>

        {/* Categories Display */}
        <ResponsiveDataDisplay
          data={filteredCategories}
          columns={columns}
          loading={loading}
          emptyMessage="Get started by creating your first product category."
          emptyIcon={FaFolder}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cardComponent={CategoryCard}
          showViewToggle={true}
        />
      </div>
    </MobileLayout>
  );
};

export default AllProductCategories;
