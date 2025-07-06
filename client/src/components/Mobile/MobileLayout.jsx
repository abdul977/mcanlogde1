import React from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useMobileResponsive } from '../../hooks/useMobileResponsive.jsx';

/**
 * Universal Mobile Layout Component
 * Provides consistent mobile layout structure for all pages
 */
const MobileLayout = ({
  children,
  title,
  subtitle,
  icon: Icon,
  navbar: Navbar,
  headerActions,
  showMobileSidebar = true,
  sidebarWidth = 'w-64',
  backgroundColor = 'bg-gray-50',
  headerBackground = 'bg-white',
  logoSrc,
  logoAlt = 'Logo',
  fallbackLogoSrc,
}) => {
  const {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    isMobile,
    isDesktop,
    isDesktopSidebarOpen,
    toggleDesktopSidebar,
  } = useMobileResponsive();

  return (
    <div className={`min-h-screen ${backgroundColor}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className={`lg:hidden ${headerBackground} shadow-lg p-4 flex items-center justify-between sticky top-0 z-30`}>
          <div className="flex items-center space-x-3">
            {logoSrc && (
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-8 w-auto"
                onError={(e) => {
                  if (fallbackLogoSrc) {
                    e.target.src = fallbackLogoSrc;
                  }
                }}
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-mcan-primary">{title}</h2>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {headerActions}
            {showMobileSidebar && Navbar && (
              <button
                onClick={toggleMobileMenu}
                className="text-mcan-primary hover:text-mcan-secondary transition-colors p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Header with Sidebar Toggle */}
      {isDesktop && showMobileSidebar && (
        <div className={`hidden lg:block ${headerBackground} shadow-sm border-b border-gray-200 p-4 sticky top-0 z-30`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDesktopSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Toggle sidebar"
              >
                <FaBars size={20} />
              </button>
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-8 w-auto"
                  onError={(e) => {
                    if (fallbackLogoSrc) {
                      e.target.src = fallbackLogoSrc;
                    }
                  }}
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-mcan-primary">{title}</h2>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Mobile Sidebar */}
        {showMobileSidebar && Navbar && (
          <div
            className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Navbar onItemClick={closeMobileMenu} />
          </div>
        )}

        {/* Desktop Sidebar */}
        {showMobileSidebar && Navbar && isDesktop && isDesktopSidebarOpen && (
          <div className={`hidden lg:block ${sidebarWidth.includes('ml-') ? sidebarWidth : `ml-[4rem]`}`}>
            <Navbar />
          </div>
        )}

        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 ${isMobile ? 'pt-0' : isDesktop && showMobileSidebar ? 'pt-[72px]' : ''} ${showMobileSidebar && isDesktop && isDesktopSidebarOpen ? 'lg:ml-0' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile Page Header Component
 * Standardized header for all pages
 */
export const MobilePageHeader = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  showOnMobile = true,
  showOnDesktop = true,
  className = '',
}) => {
  const { isMobile } = useMobileResponsive();

  if ((isMobile && !showOnMobile) || (!isMobile && !showOnDesktop)) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary p-2 lg:p-3 rounded-lg">
              <Icon className="text-white text-lg lg:text-xl" />
            </div>
          )}
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-sm lg:text-base text-gray-600">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  );
};

/**
 * Responsive Container Component
 */
export const ResponsiveContainer = ({
  children,
  maxWidth = 'max-w-7xl',
  padding = 'px-4 sm:px-6 lg:px-8',
  className = '',
}) => {
  return (
    <div className={`${maxWidth} mx-auto ${padding} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Mobile-Optimized Button Component
 */
export const MobileButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const { isMobile } = useMobileResponsive();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white hover:opacity-90 focus:ring-mcan-primary',
    secondary: 'bg-white text-mcan-primary border border-mcan-primary hover:bg-mcan-primary hover:text-white focus:ring-mcan-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: isMobile ? 'px-3 py-2 text-sm min-h-[44px]' : 'px-3 py-2 text-sm',
    md: isMobile ? 'px-4 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-sm',
    lg: isMobile ? 'px-6 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${children ? 'mr-2' : ''} flex-shrink-0`} />}
      {children}
    </button>
  );
};

/**
 * Mobile-Optimized Input Component
 */
export const MobileInput = ({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const { isMobile } = useMobileResponsive();

  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
        <input
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 ${
            isMobile ? 'py-3 text-base min-h-[48px]' : 'py-2 text-sm'
          } border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:border-mcan-primary ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default MobileLayout;
