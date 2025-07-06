import React, { useState, useRef } from 'react';
import { FaTimes, FaImage, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const ImageUploadModal = ({ isOpen, onClose, onSend, sending }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = () => {
    if (selectedImage) {
      onSend(selectedImage, caption);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCaption('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Send Image</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={sending}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!selectedImage ? (
            <div className="text-center">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-mcan-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaImage className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600">Click to select an image</p>
                <p className="text-sm text-gray-400 mt-2">Max size: 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={sending}
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent resize-none"
                  rows="3"
                  maxLength="200"
                  disabled={sending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {caption.length}/200 characters
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedImage && (
          <div className="flex justify-end space-x-3 p-4 border-t">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-mcan-primary text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadModal;
