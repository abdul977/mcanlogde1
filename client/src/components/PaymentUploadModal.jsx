import React, { useState, useEffect } from "react";
import { FaTimes, FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaFilePdf, FaImage, FaUniversity, FaMobile, FaCopy } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const PaymentUploadModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  monthNumber, 
  paymentAmount,
  onUploadSuccess 
}) => {
  const [formData, setFormData] = useState({
    paymentMethod: "bank_transfer",
    transactionReference: "",
    paymentDate: new Date().toISOString().split('T')[0],
    userNotes: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentDetails();
    }
  }, [isOpen]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payment-config/details`
      );
      if (response.data.success) {
        setPaymentDetails(response.data.paymentDetails);
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (images and PDFs)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select an image file (JPEG, PNG, GIF) or PDF");
        return;
      }

      // Validate file size (max 10MB for PDFs, 5MB for images)
      const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      const maxSizeText = file.type === 'application/pdf' ? '10MB' : '5MB';
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${maxSizeText}`);
        return;
      }

      setSelectedFile(file);

      // Create preview URL for images only
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, clear preview
        setPreviewUrl(null);
      }
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select a payment proof (image or PDF)");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('paymentScreenshot', selectedFile);
      uploadData.append('bookingId', booking._id);
      uploadData.append('monthNumber', monthNumber);
      uploadData.append('amount', paymentAmount);
      uploadData.append('paymentMethod', formData.paymentMethod);
      uploadData.append('transactionReference', formData.transactionReference);
      uploadData.append('paymentDate', formData.paymentDate);
      uploadData.append('userNotes', formData.userNotes);

      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/payments/submit-proof`,
        uploadData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success("Payment proof submitted successfully!");
        onUploadSuccess && onUploadSuccess(response.data.paymentVerification);
        onClose();
        
        // Reset form
        setFormData({
          paymentMethod: "bank_transfer",
          transactionReference: "",
          paymentDate: new Date().toISOString().split('T')[0],
          userNotes: ""
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      toast.error(error.response?.data?.message || "Failed to submit payment proof");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUpload className="text-blue-600 text-sm sm:text-base" />
            <span className="hidden sm:inline">Submit Payment Proof</span>
            <span className="sm:hidden">Payment Proof</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-2 -m-2"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Payment Details */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Payment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-blue-700 font-medium">Booking:</span>
                <span className="sm:ml-2 font-medium truncate">{booking.accommodation?.title}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-blue-700 font-medium">Month:</span>
                <span className="sm:ml-2 font-medium">{monthNumber}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:col-span-2">
                <span className="text-blue-700 font-medium">Amount:</span>
                <span className="sm:ml-2 font-medium text-green-600 text-lg">₦{paymentAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          {paymentDetails && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">Payment Account Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bank Details */}
                {paymentDetails.bankDetails && paymentDetails.bankDetails.accountNumber && (
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <FaUniversity className="text-blue-600" />
                      <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Account Name:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs">{paymentDetails.bankDetails.accountName}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(paymentDetails.bankDetails.accountName, "Account name")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FaCopy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Account Number:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium font-mono">{paymentDetails.bankDetails.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(paymentDetails.bankDetails.accountNumber, "Account number")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FaCopy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium text-sm">{paymentDetails.bankDetails.bankName}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Payment */}
                {paymentDetails.mobilePayments && paymentDetails.mobilePayments.length > 0 && (
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMobile className="text-green-600" />
                      <h4 className="font-medium text-gray-900">Mobile Money</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      {paymentDetails.mobilePayments.slice(0, 2).map((mobile, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{mobile.provider}:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium font-mono text-sm">{mobile.number}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(mobile.number, `${mobile.provider} number`)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <FaCopy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              {paymentDetails.paymentInstructions && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>Instructions:</strong> {paymentDetails.paymentInstructions.general}
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full p-3 sm:p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              required
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="cash">Cash Payment</option>
              <option value="card">Card Payment</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Reference (Optional)
            </label>
            <input
              type="text"
              name="transactionReference"
              value={formData.transactionReference}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter transaction reference or receipt number"
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date *
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Proof (Image or PDF) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center relative">
              {selectedFile ? (
                <div className="space-y-3 sm:space-y-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Payment proof preview"
                      className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md"
                    />
                  ) : selectedFile.type === 'application/pdf' ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <FaFilePdf className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
                      <div className="text-center sm:text-left">
                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-xs">{selectedFile.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          PDF • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <FaImage className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500" />
                      <div className="text-center sm:text-left">
                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-xs">{selectedFile.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Image • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div>
                  <FaUpload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">
                    <span className="hidden sm:inline">Click to upload or drag and drop</span>
                    <span className="sm:hidden">Tap to upload file</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Images (PNG, JPG, JPEG) up to 5MB or PDF up to 10MB
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* User Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="userNotes"
              value={formData.userNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information about this payment..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 py-3 px-4 sm:px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="order-1 sm:order-2 flex-1 py-3 px-4 sm:px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">Submitting</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span className="hidden sm:inline">Submit Payment Proof</span>
                  <span className="sm:hidden">Submit Proof</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentUploadModal;
