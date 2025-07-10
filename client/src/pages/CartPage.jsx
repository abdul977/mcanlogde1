import React, { useState } from "react";
import { FaTrashAlt, FaPlus, FaMinus, FaShoppingCart, FaHome } from "react-icons/fa";
import { useAuth } from "../context/UserContext";
import { useCart } from "../context/Cart";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  console.log("All Information about cart:", cart);

  // Separate cart items by type
  const accommodations = cart.filter(item => item.type !== 'product');
  const products = cart.filter(item => item.type === 'product');

  const handleCheckIn = () => {
    if (!auth?.token) {
      toast.error("Authentication required to proceed!");
      return navigate("/login");
    }

    if (!cart.length) {
      toast.error("You haven't saved any accommodations yet.");
      return;
    }

    // Log the total price and product details
    console.log("Total Price:", totalPrice());

    // Pass cart details to the payment page
    navigate("/payment", {
      state: {
        totalPrice: totalPrice(),
        products: cart.map((product) => ({
          title: product.title,
          postId: product._id,
          price: product.price,
        })),
      },
    });
  };

  const handleRemove = (id, selectedVariants = null) => {
    try {
      let myCart = [...cart];
      let index;

      if (selectedVariants) {
        // For products with variants, match both ID and variants
        index = myCart.findIndex((item) =>
          item._id === id &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
        );
      } else {
        // For accommodations or products without variants
        index = myCart.findIndex((item) => item._id === id);
      }

      if (index !== -1) {
        myCart.splice(index, 1);
        setCart(myCart);
        localStorage.setItem("cart", JSON.stringify(myCart));
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove item");
    }
  };

  const handleQuantityChange = (id, selectedVariants, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) =>
        item._id === id &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
      );

      if (index !== -1) {
        myCart[index].quantity = newQuantity;
        setCart(myCart);
        localStorage.setItem("cart", JSON.stringify(myCart));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update quantity");
    }
  };

  const totalPrice = () => {
    try {
      const total = cart.reduce((total, item) => {
        if (item.type === 'product') {
          return total + (item.price * (item.quantity || 1));
        } else {
          return total + item.price;
        }
      }, 0);

      return total.toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
      });
    } catch (error) {
      console.log(error);
      return "₦0.00";
    }
  };

  const accommodationTotal = () => {
    try {
      const total = accommodations.reduce((total, item) => total + item.price, 0);
      return total.toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
      });
    } catch (error) {
      return "₦0.00";
    }
  };

  const productTotal = () => {
    try {
      const total = products.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
      return total.toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
      });
    } catch (error) {
      return "₦0.00";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaShoppingCart className="text-blue-600" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">
            Review your saved accommodations and selected products
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/accommodations"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaHome />
                Browse Accommodations
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FaShoppingCart />
                Browse Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Cart Items */}
            <div className="flex-1">
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'all'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      All Items ({cart.length})
                    </button>
                    {accommodations.length > 0 && (
                      <button
                        onClick={() => setActiveTab('accommodations')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'accommodations'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Accommodations ({accommodations.length})
                      </button>
                    )}
                    {products.length > 0 && (
                      <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'products'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Products ({products.length})
                      </button>
                    )}
                  </nav>
                </div>
              </div>

              {/* Cart Items */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Display items based on active tab */}
                {(() => {
                  let itemsToShow = [];
                  if (activeTab === 'all') itemsToShow = cart;
                  else if (activeTab === 'accommodations') itemsToShow = accommodations;
                  else if (activeTab === 'products') itemsToShow = products;

                  return itemsToShow.map((item) => (
                    <div
                      key={`${item._id}-${JSON.stringify(item.selectedVariants || {})}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-gray-200 last:border-none"
                    >
                      {/* Product Image */}
                      <img
                        src={
                          item.type === 'product'
                            ? (item.images?.find(img => img.isPrimary)?.url || item.images?.[0]?.url || '/placeholder-product.jpg')
                            : (item.images?.[0] || '/placeholder-accommodation.jpg')
                        }
                        alt={item.name || item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                      />

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name || item.title}
                        </h3>

                        {item.type === 'product' ? (
                          <>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.category?.name} • {item.brand}
                            </p>

                            {/* Product Variants */}
                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {Object.entries(item.selectedVariants).map(([key, value]) => (
                                  <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <div className="flex items-center border border-gray-300 rounded">
                                <button
                                  onClick={() => handleQuantityChange(item._id, item.selectedVariants, (item.quantity || 1) - 1)}
                                  className="p-1 hover:bg-gray-50"
                                  disabled={(item.quantity || 1) <= 1}
                                >
                                  <FaMinus className="text-xs" />
                                </button>
                                <span className="px-3 py-1 text-sm border-x border-gray-300 min-w-[40px] text-center">
                                  {item.quantity || 1}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item._id, item.selectedVariants, (item.quantity || 1) + 1)}
                                  className="p-1 hover:bg-gray-50"
                                >
                                  <FaPlus className="text-xs" />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description?.substring(0, 100)}...
                          </p>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-lg font-semibold text-gray-900">
                          {item.type === 'product'
                            ? formatPrice(item.price * (item.quantity || 1))
                            : formatPrice(item.price)
                          }
                        </div>

                        {item.type === 'product' && item.quantity > 1 && (
                          <div className="text-sm text-gray-500">
                            {formatPrice(item.price)} each
                          </div>
                        )}

                        <button
                          onClick={() => handleRemove(item._id, item.selectedVariants)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2"
                          title="Remove from cart"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>

                {/* Summary by type */}
                {accommodations.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-gray-700 mb-2">
                      <span>Accommodations ({accommodations.length})</span>
                      <span className="font-semibold">{accommodationTotal()}</span>
                    </div>
                  </div>
                )}

                {products.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-gray-700 mb-2">
                      <span>Products ({products.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
                      <span className="font-semibold">{productTotal()}</span>
                    </div>
                  </div>
                )}

                <hr className="my-4 border-gray-200" />

                {/* Total */}
                <div className="flex justify-between items-center font-bold text-xl text-gray-900 mb-6">
                  <span>Total:</span>
                  <span>{totalPrice()}</span>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-3">
                  {auth?.token ? (
                    <>
                      {accommodations.length > 0 && (
                        <button
                          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                          onClick={handleCheckIn}
                        >
                          Book Accommodations
                        </button>
                      )}

                      {products.length > 0 && (
                        <button
                          className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                          onClick={() => navigate('/checkout')}
                        >
                          Checkout Products
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                      onClick={() => navigate("/login")}
                    >
                      Login to Continue
                    </button>
                  )}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Link
                      to="/accommodations"
                      className="flex-1 text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      More Accommodations
                    </Link>
                    <Link
                      to="/shop"
                      className="flex-1 text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
