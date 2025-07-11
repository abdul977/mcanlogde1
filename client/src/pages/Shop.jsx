import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaShoppingBag, 
  FaSearch, 
  FaFilter, 
  FaSort,
  FaStar,
  FaHeart,
  FaRegHeart,
  FaShoppingCart
} from "react-icons/fa";
import axios from "axios";
import { useCart } from "../context/Cart";
import { useAuth } from "../context/UserContext";
import OrderConfirmationModal from "../components/OrderConfirmationModal";

const Shop = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || "desc");
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sortOptions = [
    { value: "createdAt-desc", label: "Newest First" },
    { value: "createdAt-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "price-asc", label: "Price Low to High" },
    { value: "price-desc", label: "Price High to Low" },
    { value: "salesCount-desc", label: "Best Selling" }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, selectedCategory, sortBy, sortOrder, minPrice, maxPrice]);

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

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (currentPage > 1) params.set('page', currentPage);
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, sortOrder, minPrice, maxPrice, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort: sortBy,
        order: sortOrder
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/products?${params}`
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
        `${import.meta.env.VITE_BASE_URL}/api/products/search/${encodeURIComponent(searchTerm)}?page=${currentPage}&limit=12`
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

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      toast.info("Product already in cart");
      return;
    }

    const cartItem = {
      ...product,
      quantity: 1,
      type: 'product'
    };

    setCart([...cart, cartItem]);
    localStorage.setItem("cart", JSON.stringify([...cart, cartItem]));
    toast.success("Product added to cart");
  };

  const handleBuyNow = (product) => {
    const cartItem = {
      ...product,
      quantity: 1,
      type: 'product'
    };
    setSelectedProduct(cartItem);
    setShowOrderConfirmation(true);
  };

  const handleOrderConfirm = async (orderData) => {
    try {
      // Generate WhatsApp message
      const orderSummary = `• ${selectedProduct.name} (Qty: 1) - ${formatPrice(selectedProduct.price)}`;

      const message = `🛍️ *New Order Request*\n\n` +
        `*Order Details:*\n${orderSummary}\n\n` +
        `*Total Amount:* ${formatPrice(orderData.totalAmount)}\n` +
        `*Contact Preference:* ${orderData.contactPreference}\n` +
        `*Urgency:* ${orderData.urgency}\n` +
        `*Delivery:* ${orderData.deliveryPreference}\n\n` +
        `${orderData.customerNotes ? `*Special Instructions:* ${orderData.customerNotes}\n\n` : ''}` +
        `Please confirm this order and provide payment details.`;

      // WhatsApp admin number (you should replace this with actual admin number)
      const adminWhatsApp = "2348123456789"; // Replace with actual admin WhatsApp number
      const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      toast.success("Order details sent! Please complete the order via WhatsApp.");
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("Failed to process order");
      throw error;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleWishlistToggle = (productId) => {
    if (!auth?.token) {
      toast.error("Please login to add to wishlist");
      return;
    }

    const isInWishlist = wishlist.includes(productId);
    if (isInWishlist) {
      setWishlist(prev => prev.filter(id => id !== productId));
      toast.success("Removed from wishlist");
    } else {
      setWishlist(prev => [...prev, productId]);
      toast.success("Added to wishlist");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaShoppingBag className="text-green-600" />
                MCAN Store
              </h1>
              <p className="text-gray-600 mt-1">
                Discover quality Islamic merchandise and MCAN branded items
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {totalProducts} products found
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (NGN)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <FaShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Try adjusting your search terms or filters" : "No products available at the moment"}
                </p>
                {(searchTerm || selectedCategory || minPrice || maxPrice) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                      <div className="relative">
                        <Link to={`/shop/product/${product.slug}`}>
                          <img
                            src={product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        
                        {/* Wishlist Button */}
                        <button
                          onClick={() => handleWishlistToggle(product._id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                        >
                          {wishlist.includes(product._id) ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart className="text-gray-400" />
                          )}
                        </button>

                        {/* Featured Badge */}
                        {product.isFeatured && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </div>
                        )}

                        {/* Sale Badge */}
                        {product.comparePrice && product.comparePrice > product.price && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Sale
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="mb-2">
                          <Link 
                            to={`/shop/product/${product.slug}`}
                            className="text-sm text-gray-500 hover:text-blue-600"
                          >
                            {product.category?.name}
                          </Link>
                        </div>
                        
                        <Link to={`/shop/product/${product.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        {product.shortDescription && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.shortDescription}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
                          </div>
                          
                          {product.rating?.average > 0 && (
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-400 text-sm" />
                              <span className="text-sm text-gray-600">
                                {product.rating.average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {product.isAvailable ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 py-2 px-3 border border-green-600 text-green-600 rounded-lg font-medium transition-colors hover:bg-green-50 flex items-center justify-center gap-1"
                            >
                              <FaShoppingCart className="text-sm" />
                              Add to Cart
                            </button>
                            <button
                              onClick={() => handleBuyNow(product)}
                              className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg font-medium transition-colors hover:bg-green-700 flex items-center justify-center gap-1"
                            >
                              Buy Now
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 px-4 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <FaShoppingCart />
                            Out of Stock
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Order Confirmation Modal */}
        <OrderConfirmationModal
          isOpen={showOrderConfirmation}
          onClose={() => setShowOrderConfirmation(false)}
          cartItems={selectedProduct ? [selectedProduct] : []}
          onOrderConfirm={handleOrderConfirm}
        />
      </div>
    </div>
  );
};

export default Shop;
