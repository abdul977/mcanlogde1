import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCheckCircle, FaShoppingCart, FaHome, FaTruck, FaCopy } from "react-icons/fa";
import axios from "axios";

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/orders/track/${orderNumber}`
      );

      if (data?.success) {
        setOrder(data.order);
      } else {
        toast.error("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success("Order number copied to clipboard");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-100",
      confirmed: "text-blue-600 bg-blue-100",
      processing: "text-purple-600 bg-purple-100",
      shipped: "text-indigo-600 bg-indigo-100",
      delivered: "text-green-600 bg-green-100",
      cancelled: "text-red-600 bg-red-100"
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600 mb-6">The order number you're looking for doesn't exist or has been removed.</p>
          <Link to="/shop" className="text-blue-600 hover:text-blue-800">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FaCheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We'll send you updates as your order progresses.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Details</h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-mono font-semibold text-gray-900">#{orderNumber}</span>
                <button
                  onClick={copyOrderNumber}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy order number"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Order Date: {formatDate(order.createdAt)}</p>
                <p>Items: {order.items?.length || 0}</p>
                {order.estimatedDelivery && (
                  <p>Estimated Delivery: {formatDate(order.estimatedDelivery)}</p>
                )}
                {order.trackingNumber && (
                  <p>Tracking Number: <span className="font-mono">{order.trackingNumber}</span></p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">What's Next?</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {order.status === 'pending' && (
                  <>
                    <p>• We're reviewing your order</p>
                    <p>• You'll receive a confirmation email shortly</p>
                    <p>• Payment instructions will be sent if needed</p>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <>
                    <p>• Your order has been confirmed</p>
                    <p>• We're preparing your items for shipment</p>
                    <p>• You'll receive tracking information soon</p>
                  </>
                )}
                {order.status === 'processing' && (
                  <>
                    <p>• Your order is being prepared</p>
                    <p>• Items are being packed for shipment</p>
                    <p>• Tracking information will be available soon</p>
                  </>
                )}
                {order.status === 'shipped' && (
                  <>
                    <p>• Your order has been shipped</p>
                    <p>• Track your package using the tracking number</p>
                    <p>• Estimated delivery date provided above</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FaShoppingCart className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.productSnapshot?.name || 'Product'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    SKU: {item.productSnapshot?.sku || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaShoppingCart />
            Continue Shopping
          </Link>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaHome />
            Back to Home
          </Link>

          <Link
            to={`/track-order/${orderNumber}`}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaTruck />
            Track Order
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Contact Support
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="mailto:support@mcanfct.org"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              support@mcanfct.org
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="tel:+2348000000000"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              +234 800 000 0000
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
