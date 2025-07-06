import React from 'react';
import { useMobileResponsive } from '../../hooks/useMobileResponsive.jsx';
import { MobileButton, MobileInput } from './MobileLayout';

/**
 * Universal Responsive Form Component
 * Automatically adapts form layout for mobile, tablet, and desktop
 */
export const ResponsiveForm = ({
  children,
  onSubmit,
  loading = false,
  className = '',
  sectionClassName = '',
  title,
  subtitle,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  showCancel = false,
}) => {
  const { isMobile } = useMobileResponsive();

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 lg:p-6 border-b border-gray-200">
          {title && <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}
      
      <form onSubmit={onSubmit} className={`p-4 lg:p-8 space-y-6 lg:space-y-8 ${sectionClassName}`}>
        {children}
        
        {/* Form Actions */}
        <div className={`pt-6 border-t border-gray-200 ${isMobile ? 'space-y-3' : 'flex space-x-4'}`}>
          <MobileButton
            type="submit"
            disabled={loading}
            fullWidth={isMobile}
            size="lg"
            className={isMobile ? 'order-1' : ''}
          >
            {loading ? 'Submitting...' : submitText}
          </MobileButton>
          
          {showCancel && onCancel && (
            <MobileButton
              type="button"
              variant="secondary"
              onClick={onCancel}
              fullWidth={isMobile}
              size="lg"
              className={isMobile ? 'order-2' : ''}
            >
              {cancelText}
            </MobileButton>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Form Section Component
 * Groups related form fields with responsive layout
 */
export const FormSection = ({
  title,
  subtitle,
  icon: Icon,
  children,
  columns = 'auto', // 'auto', 1, 2, 3, 4
  className = '',
}) => {
  const { isMobile, isTablet } = useMobileResponsive();

  // Determine grid columns based on screen size and columns prop
  const getGridColumns = () => {
    if (columns === 'auto') {
      if (isMobile) return 'grid-cols-1';
      if (isTablet) return 'grid-cols-2';
      return 'grid-cols-2';
    }
    
    if (typeof columns === 'number') {
      if (isMobile) return 'grid-cols-1';
      if (isTablet && columns > 2) return 'grid-cols-2';
      return `grid-cols-${Math.min(columns, 4)}`;
    }
    
    return 'grid-cols-1';
  };

  return (
    <div className={`bg-gray-50 p-4 lg:p-6 rounded-lg ${className}`}>
      {(title || subtitle || Icon) && (
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center mb-2">
            {Icon && <Icon className="mr-2 text-mcan-primary text-lg" />}
            {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          </div>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      
      <div className={`grid ${getGridColumns()} gap-4 lg:gap-6`}>
        {children}
      </div>
    </div>
  );
};

/**
 * Form Field Component
 * Wrapper for form inputs with consistent styling
 */
export const FormField = ({
  label,
  required = false,
  error,
  help,
  children,
  className = '',
  fullWidth = false,
}) => {
  return (
    <div className={`${fullWidth ? 'col-span-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {help && !error && (
        <p className="mt-1 text-sm text-gray-500">{help}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Responsive Select Component
 */
export const ResponsiveSelect = ({
  options = [],
  placeholder = 'Select an option',
  value,
  onChange,
  error,
  className = '',
  ...props
}) => {
  const { isMobile } = useMobileResponsive();

  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full ${
        isMobile ? 'py-3 text-base min-h-[48px]' : 'py-2 text-sm'
      } px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
};

/**
 * Responsive Textarea Component
 */
export const ResponsiveTextarea = ({
  rows = 4,
  error,
  className = '',
  ...props
}) => {
  const { isMobile } = useMobileResponsive();

  return (
    <textarea
      rows={isMobile ? Math.max(rows, 3) : rows}
      className={`w-full ${
        isMobile ? 'py-3 text-base' : 'py-2 text-sm'
      } px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary resize-vertical ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    />
  );
};

/**
 * File Upload Component
 */
export const ResponsiveFileUpload = ({
  accept,
  multiple = false,
  maxFiles = 1,
  onFileSelect,
  error,
  className = '',
  children,
}) => {
  const { isMobile } = useMobileResponsive();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (maxFiles > 1 && files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }
    onFileSelect(files);
  };

  return (
    <div className={className}>
      <label className={`block w-full ${
        isMobile ? 'py-6' : 'py-4'
      } px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-mcan-primary transition-colors ${
        error ? 'border-red-500' : ''
      }`}>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-center">
          {children || (
            <>
              <div className="text-gray-400 text-2xl mb-2">📁</div>
              <p className="text-sm text-gray-600">
                Click to upload {multiple ? 'files' : 'a file'}
              </p>
              {maxFiles > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum {maxFiles} files
                </p>
              )}
            </>
          )}
        </div>
      </label>
    </div>
  );
};

/**
 * Checkbox Group Component
 */
export const ResponsiveCheckboxGroup = ({
  options = [],
  value = [],
  onChange,
  columns = 'auto',
  className = '',
}) => {
  const { isMobile, isTablet } = useMobileResponsive();

  const getGridColumns = () => {
    if (columns === 'auto') {
      if (isMobile) return 'grid-cols-1';
      if (isTablet) return 'grid-cols-2';
      return 'grid-cols-3';
    }
    return `grid-cols-${columns}`;
  };

  const handleChange = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className={`grid ${getGridColumns()} gap-3 ${className}`}>
      {options.map((option, index) => (
        <label key={index} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(option.value || option)}
            onChange={() => handleChange(option.value || option)}
            className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">{option.label || option}</span>
        </label>
      ))}
    </div>
  );
};

/**
 * Radio Group Component
 */
export const ResponsiveRadioGroup = ({
  options = [],
  value,
  onChange,
  name,
  columns = 'auto',
  className = '',
}) => {
  const { isMobile, isTablet } = useMobileResponsive();

  const getGridColumns = () => {
    if (columns === 'auto') {
      if (isMobile) return 'grid-cols-1';
      if (isTablet) return 'grid-cols-2';
      return 'grid-cols-3';
    }
    return `grid-cols-${columns}`;
  };

  return (
    <div className={`grid ${getGridColumns()} gap-3 ${className}`}>
      {options.map((option, index) => (
        <label key={index} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value || option}
            checked={value === (option.value || option)}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-mcan-primary focus:ring-mcan-primary border-gray-300"
          />
          <span className="text-sm text-gray-700">{option.label || option}</span>
        </label>
      ))}
    </div>
  );
};

export default ResponsiveForm;
