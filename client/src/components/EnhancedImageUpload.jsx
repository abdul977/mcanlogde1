import React, { useState, useRef, useCallback } from 'react';
import { FaImage, FaUpload, FaTimes, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useMobileResponsive } from '../hooks/useMobileResponsive.jsx';

/**
 * Enhanced Image Upload Component with Drag-and-Drop and Preview
 * Features:
 * - Drag and drop interface
 * - Real-time image preview
 * - File validation (type, size, count)
 * - Upload progress tracking
 * - Mobile-responsive design
 * - Accessibility support
 */
const EnhancedImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 3,
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  required = false,
  error = null,
  disabled = false,
  className = '',
  uploadProgress = {},
  onUploadStart,
  onUploadComplete,
  onUploadError,
}) => {
  const { isMobile } = useMobileResponsive();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Validate files
  const validateFiles = useCallback((files) => {
    const errors = [];
    const fileArray = Array.from(files);

    // Check file count
    if (images.length + fileArray.length > maxImages) {
      errors.push(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`);
      return { isValid: false, errors };
    }

    // Validate each file
    fileArray.forEach((file, index) => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Please upload JPG, PNG, or WebP images.`);
      }

      // Check file size
      if (file.size > maxSizePerImage) {
        const maxSizeMB = (maxSizePerImage / (1024 * 1024)).toFixed(1);
        errors.push(`File ${index + 1}: File size too large. Maximum ${maxSizeMB}MB allowed.`);
      }

      // Check if file is actually an image
      if (!file.type.startsWith('image/')) {
        errors.push(`File ${index + 1}: Please select only image files.`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }, [images.length, maxImages, maxSizePerImage, acceptedTypes]);

  // Handle file selection
  const handleFileSelect = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const validation = validateFiles(files);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    const fileArray = Array.from(files);
    const newImages = [];

    // Create preview URLs and file objects
    for (const file of fileArray) {
      const previewUrl = URL.createObjectURL(file);
      const imageData = {
        id: Date.now() + Math.random(), // Temporary ID
        file,
        preview: previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending', // pending, uploading, completed, error
        progress: 0,
        error: null
      };
      newImages.push(imageData);
    }

    // Update images array
    const updatedImages = [...images, ...newImages];
    onImagesChange(updatedImages);

    // Clear validation errors on successful selection
    setValidationErrors([]);

    // Trigger upload start callback
    if (onUploadStart) {
      onUploadStart(newImages);
    }
  }, [images, onImagesChange, validateFiles, onUploadStart]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    handleFileSelect(files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  // Remove image
  const removeImage = useCallback((imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // Revoke object URL to prevent memory leaks
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  // Replace image
  const replaceImage = useCallback((imageId, newFile) => {
    const validation = validateFiles([newFile]);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    const updatedImages = images.map(img => {
      if (img.id === imageId) {
        // Revoke old preview URL
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
        
        return {
          ...img,
          file: newFile,
          preview: URL.createObjectURL(newFile),
          name: newFile.name,
          size: newFile.size,
          type: newFile.type,
          status: 'pending',
          progress: 0,
          error: null
        };
      }
      return img;
    });

    onImagesChange(updatedImages);
    setValidationErrors([]);
  }, [images, onImagesChange, validateFiles]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get upload status icon
  const getStatusIcon = (status, progress) => {
    switch (status) {
      case 'uploading':
        return <FaSpinner className="animate-spin text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  const hasImages = images.length > 0;
  const canAddMore = images.length < maxImages;
  const hasErrors = validationErrors.length > 0 || error;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
            dragActive
              ? 'border-mcan-primary bg-blue-50'
              : hasErrors
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-mcan-primary hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
            isMobile ? 'p-6' : 'p-8'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          role="button"
          tabIndex={0}
          aria-label={`Upload images. ${images.length} of ${maxImages} images selected.`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFileDialog();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
            aria-describedby="upload-description"
          />

          <div className="text-center">
            <div className={`mx-auto ${isMobile ? 'mb-3' : 'mb-4'}`}>
              <FaImage className={`mx-auto text-gray-400 ${isMobile ? 'text-3xl' : 'text-4xl'}`} />
            </div>
            
            <div className="space-y-2">
              <p className={`font-medium text-gray-700 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {dragActive ? 'Drop images here' : 'Upload Images'}
              </p>
              
              <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`} id="upload-description">
                {isMobile ? 'Tap to select' : 'Click to select or drag and drop'}
              </p>
              
              <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} space-y-1`}>
                <p>
                  {images.length} of {maxImages} images selected
                </p>
                <p>
                  JPG, PNG, WebP up to {(maxSizePerImage / (1024 * 1024)).toFixed(1)}MB each
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress Overlay */}
          {dragActive && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <FaUpload className="mx-auto text-2xl text-mcan-primary mb-2" />
                <p className="text-mcan-primary font-medium">Drop to upload</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Previews */}
      {hasImages && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Images ({images.length}/{maxImages})
          </h4>
          
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
          }`}>
            {images.map((image) => (
              <div
                key={image.id}
                className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                {/* Image Preview */}
                <div className="aspect-video relative bg-gray-100">
                  <img
                    src={image.preview || image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDNIMTNMMTEgMUg1QzMuODkgMSAzIDEuODkgMyAzVjE5QzMgMjAuMTEgMy44OSAyMSA1IDIxSDE5QzIwLjExIDIxIDIxIDIwLjExIDIxIDE5VjNaTTUgM0gxMC4xN0wxMi4xNyA1SDE5VjE5SDVWM1oiIGZpbGw9IiM5Q0E3QjAiLz4KPC9zdmc+';
                    }}
                  />
                  
                  {/* Status Overlay */}
                  {image.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <FaSpinner className="animate-spin mx-auto mb-2" />
                        <p className="text-sm">{image.progress}%</p>
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                    aria-label={`Remove ${image.name}`}
                    disabled={disabled}
                  >
                    <FaTimes className="text-xs" />
                  </button>

                  {/* Status Icon */}
                  {image.status !== 'pending' && (
                    <div className="absolute top-2 left-2">
                      {getStatusIcon(image.status, image.progress)}
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                      {image.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {image.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-mcan-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${image.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {image.status === 'error' && image.error && (
                    <p className="text-xs text-red-600">{image.error}</p>
                  )}

                  {/* Replace Button */}
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = acceptedTypes.join(',');
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          replaceImage(image.id, file);
                        }
                      };
                      input.click();
                    }}
                    className="w-full text-xs text-mcan-primary hover:text-mcan-secondary transition-colors py-1"
                    disabled={disabled || image.status === 'uploading'}
                  >
                    Replace Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="space-y-1">
              {error && <p className="text-sm text-red-700">{error}</p>}
              {validationErrors.map((err, index) => (
                <p key={index} className="text-sm text-red-700">{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Required Field Indicator */}
      {required && images.length === 0 && (
        <p className="text-sm text-gray-600">
          <span className="text-red-500">*</span> Please upload at least one image
        </p>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: JPG, PNG, WebP</p>
        <p>• Maximum file size: {(maxSizePerImage / (1024 * 1024)).toFixed(1)}MB per image</p>
        <p>• Maximum {maxImages} images allowed</p>
        <p>• Images will be automatically resized for optimal performance</p>
      </div>
    </div>
  );
};

export default EnhancedImageUpload;