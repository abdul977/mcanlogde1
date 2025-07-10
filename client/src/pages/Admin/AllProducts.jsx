import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaShoppingBag, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaSearch,
  FaFilter,
  FaSort
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MobileLayout, { MobilePageHeader, MobileButton, MobileInput } from "../../components/Mobile/MobileLayout";
import { FormSection, FormField, ResponsiveSelect } from "../../components/Mobile/ResponsiveForm";

const AllProducts = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" }
  ];

  const sortOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "name", label: "Name" },
    { value: "price", label: "Price" },
    { value: "salesCount", label: "Sales Count" },
    { value: "viewCount", label: "View Count" }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, selectedCategory, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm) {
        searchProducts();
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: sortBy,
        order: sortOrder
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (statusFilter) params.append('status', statusFilter);

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/products/admin/all?${params}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        setProducts(data.products);
        setTotalPages(data.pagination?.pages || 1);
        setTotalProducts(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
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
    }
  };

  const searchProducts = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/products/search/${encodeURIComponent(searchTerm)}?page=${currentPage}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        setProducts(data.products);
        setTotalPages(data.pagination?.pages || 1);
        setTotalProducts(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/products/admin/status/${productId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleFeaturedToggle = async (productId, currentFeatured) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/products/admin/status/${productId}`,
        { isFeatured: !currentFeatured },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        toast.success(`Product ${!currentFeatured ? 'marked as featured' : 'removed from featured'}`);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/products/admin/delete/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (data?.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      archived: "bg-yellow-100 text-yellow-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <MobileLayout
      title="All Products"
      subtitle={`Manage MCAN Store products (${totalProducts} total)`}
      icon={FaShoppingBag}
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <ResponsiveSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: "", label: "All Categories" },
                  ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                ]}
                className="min-w-[150px]"
              />

              <ResponsiveSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="min-w-[120px]"
              />

              <ResponsiveSelect
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                options={[
                  ...sortOptions.map(opt => ({ 
                    value: `${opt.value}-desc`, 
                    label: `${opt.label} (Newest)` 
                  })),
                  ...sortOptions.map(opt => ({ 
                    value: `${opt.value}-asc`, 
                    label: `${opt.label} (Oldest)` 
                  }))
                ]}
                className="min-w-[150px]"
              />
            </div>
          </div>

          <Link to="/admin/create-product">
            <MobileButton icon={FaPlus}>
              Add Product
            </MobileButton>
          </Link>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first product"}
            </p>
            <Link to="/admin/create-product">
              <MobileButton icon={FaPlus}>
                Create Product
              </MobileButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '/placeholder-product.jpg'}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.inventory?.trackQuantity ? (
                          <span className={`${product.inventory.quantity <= product.inventory.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                            {product.inventory.quantity}
                          </span>
                        ) : (
                          <span className="text-gray-500">Not tracked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(product.status)}
                          {product.isFeatured && (
                            <FaStar className="text-yellow-500" title="Featured" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusToggle(product._id, product.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              product.status === 'active' 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {product.status === 'active' ? <FaEye /> : <FaEyeSlash />}
                          </button>

                          <button
                            onClick={() => handleFeaturedToggle(product._id, product.isFeatured)}
                            className={`p-2 rounded-lg transition-colors ${
                              product.isFeatured 
                                ? 'text-yellow-500 hover:bg-yellow-50' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={product.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            {product.isFeatured ? <FaStar /> : <FaRegStar />}
                          </button>

                          <Link
                            to={`/admin/edit-product/${product._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>

                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                      src={product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={product.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                          <p className="text-xs text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusBadge(product.status)}
                          {product.isFeatured && (
                            <FaStar className="text-yellow-500 text-xs" />
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stock: {product.inventory?.trackQuantity ? product.inventory.quantity : 'Not tracked'}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleStatusToggle(product._id, product.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.status === 'active' 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {product.status === 'active' ? <FaEye /> : <FaEyeSlash />}
                        </button>

                        <button
                          onClick={() => handleFeaturedToggle(product._id, product.isFeatured)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isFeatured 
                              ? 'text-yellow-500 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {product.isFeatured ? <FaStar /> : <FaRegStar />}
                        </button>

                        <Link
                          to={`/admin/edit-product/${product._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </Link>

                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <MobileButton
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </MobileButton>
                
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <MobileButton
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </MobileButton>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AllProducts;
