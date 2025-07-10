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
      render: (category) => {
        if (!category) return <span className="text-gray-400">-</span>;
        return (
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
        );
      }
    },
    {
      key: "description",
      label: "Description",
      render: (category) => {
        if (!category) return <span className="text-gray-400">-</span>;
        return (
          <div className="max-w-xs truncate text-gray-600">
            {category.description}
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      render: (category) => {
        if (!category) return <span className="text-gray-400">-</span>;
        return (
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
        );
      }
    },
    {
      key: "productCount",
      label: "Products",
      render: (category) => {
        if (!category) return <span className="text-gray-400">-</span>;
        return (
          <span className="text-gray-900 font-medium">
            {category.productCount || 0}
          </span>
        );
      }
    },
    {
      key: "createdAt",
      label: "Created",
      render: (category) => {
        if (!category) return <span className="text-gray-400">-</span>;
        return (
          <span className="text-gray-600">
            {new Date(category.createdAt).toLocaleDateString()}
          </span>
        );
      }
    }
  ];

  const CategoryCard = ({ item: category, onEdit, onDelete, onView }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5 hover:shadow-md transition-shadow duration-200">
      {/* Header Section - Responsive Layout */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-3 gap-2 xs:gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {category.image && (
            <img
              src={category.image}
              alt={category.name}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base lg:text-lg truncate">
              {category.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">Level {category.level}</p>
          </div>
        </div>

        {/* Status and Featured - Responsive */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
            category.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
          {category.isFeatured && (
            <FaStar className="text-yellow-500 text-sm sm:text-base" />
          )}
        </div>
      </div>

      {/* Description - Responsive Text */}
      <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-3 line-clamp-2 leading-relaxed">
        {category.description}
      </p>

      {/* Stats Section - Responsive Layout */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs sm:text-sm text-gray-500 mb-4 gap-1 xs:gap-2">
        <span className="font-medium">{category.productCount || 0} products</span>
        <span className="text-gray-400 xs:text-gray-500">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons - Enhanced Responsive Layout */}
      <div className="flex flex-col xs:flex-row gap-2 xs:gap-1 sm:gap-2">
        <button
          onClick={() => onView(category)}
          className="flex-1 bg-blue-50 text-blue-600 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 transition-colors min-h-[44px] xs:min-h-[36px] sm:min-h-[40px] flex items-center justify-center"
        >
          <FaEye className="inline mr-1 text-xs sm:text-sm" />
          <span className="hidden xs:inline">View</span>
          <span className="xs:hidden">View Details</span>
        </button>
        <button
          onClick={() => onEdit(category)}
          className="flex-1 bg-yellow-50 text-yellow-600 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-100 transition-colors min-h-[44px] xs:min-h-[36px] sm:min-h-[40px] flex items-center justify-center"
        >
          <FaEdit className="inline mr-1 text-xs sm:text-sm" />
          <span className="hidden xs:inline">Edit</span>
          <span className="xs:hidden">Edit Category</span>
        </button>
        <button
          onClick={() => onDelete(category._id)}
          className="flex-1 bg-red-50 text-red-600 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition-colors min-h-[44px] xs:min-h-[36px] sm:min-h-[40px] flex items-center justify-center"
        >
          <FaTrash className="inline mr-1 text-xs sm:text-sm" />
          <span className="hidden xs:inline">Delete</span>
          <span className="xs:hidden">Delete Category</span>
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
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header Actions - Enhanced Responsive Layout */}
        <div className="flex flex-col sm:flex-row lg:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Search Section */}
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative flex-1 max-w-full sm:max-w-md lg:max-w-lg xl:max-w-xl">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <MobileInput
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Add Button - Responsive */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Link to="/admin/create-product-category" className="block w-full sm:w-auto">
              <MobileButton icon={FaPlus} className="w-full sm:w-auto justify-center sm:justify-start">
                <span className="sm:hidden">Add New Category</span>
                <span className="hidden sm:inline">Add Category</span>
              </MobileButton>
            </Link>
          </div>
        </div>

        {/* Filters - Enhanced Responsive Grid */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <FormField label="Status" className="w-full">
              <ResponsiveSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="text-sm sm:text-base"
              />
            </FormField>

            <FormField label="Level" className="w-full">
              <ResponsiveSelect
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                options={levelOptions}
                className="text-sm sm:text-base"
              />
            </FormField>

            <FormField label="Sort By" className="w-full xs:col-span-2 md:col-span-1">
              <ResponsiveSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
                className="text-sm sm:text-base"
              />
            </FormField>

            <FormField label="Order" className="w-full xs:col-span-2 md:col-span-1">
              <ResponsiveSelect
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                options={[
                  { value: "desc", label: "Descending" },
                  { value: "asc", label: "Ascending" }
                ]}
                className="text-sm sm:text-base"
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
