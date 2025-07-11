import React, { useState } from "react";
import { FaShoppingCart, FaTimes, FaSpinner, FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";

const OrderConfirmationModal = ({ 
  isOpen, 
  onClose, 
  cartItems = [],
  onOrderConfirm 
}) => {
  const [formData, setFormData] = useState({
    customerNotes: "",
    contactPreference: "whatsapp", // whatsapp, phone, email
    urgency: "normal", // normal, urgent
    deliveryPreference: "standard" // standard, express
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    // Free shipping over 50,000 NGN
    return subtotal > 50000 ? 0 : 1000;
  };

  const calculateTax = () => {
    // 7.5% VAT
    return calculateSubtotal() * 0.075;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity || 1,
          variants: item.selectedVariants || {}
        })),
        customerNotes: formData.customerNotes,
        contactPreference: formData.contactPreference,
        urgency: formData.urgency,
        deliveryPreference: formData.deliveryPreference,
        subtotal: calculateSubtotal(),
        shippingCost: calculateShipping(),
        taxAmount: calculateTax(),
        totalAmount: calculateTotal()
      };

      // Call the parent component's order confirmation handler
      await onOrderConfirm(orderData);
      
      // Reset form
      setFormData({
        customerNotes: "",
        contactPreference: "whatsapp",
        urgency: "normal",
        deliveryPreference: "standard"
      });
      
      onClose();
    } catch (error) {
      console.error("Order confirmation error:", error);
      toast.error("Failed to confirm order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-green-600" />
            Confirm Your Order
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={`${item._id}-${JSON.stringify(item.selectedVariants || {})}`} 
                     className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images?.find(img => img.isPrimary)?.url || item.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-xs text-gray-500">
                          {Object.entries(item.selectedVariants).map(([key, value]) => 
                            `${key}: ${value}`
                          ).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price * (item.quantity || 1))}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Price Breakdown */}
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatPrice(calculateShipping())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (7.5%):</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactPreference"
                  value="whatsapp"
                  checked={formData.contactPreference === "whatsapp"}
                  onChange={handleInputChange}
                  className="text-green-600"
                />
                <FaWhatsapp className="text-green-600" />
                <span>WhatsApp</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactPreference"
                  value="phone"
                  checked={formData.contactPreference === "phone"}
                  onChange={handleInputChange}
                  className="text-green-600"
                />
                <FaPhone className="text-green-600" />
                <span>Phone</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactPreference"
                  value="email"
                  checked={formData.contactPreference === "email"}
                  onChange={handleInputChange}
                  className="text-green-600"
                />
                <FaEnvelope className="text-green-600" />
                <span>Email</span>
              </label>
            </div>
          </div>

          {/* Order Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Urgency
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="normal">Normal (3-5 business days)</option>
              <option value="urgent">Urgent (1-2 business days)</option>
            </select>
          </div>

          {/* Delivery Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Preference
            </label>
            <select
              name="deliveryPreference"
              value={formData.deliveryPreference}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="standard">Standard Delivery</option>
              <option value="express">Express Delivery (+₦500)</option>
            </select>
          </div>

          {/* Customer Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Any special instructions for your order..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaWhatsapp />
                  Confirm & Contact Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
