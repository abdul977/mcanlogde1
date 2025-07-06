import { useState, useEffect, createContext, useContext } from 'react';
import React from 'react';

/**
 * Universal Mobile Responsive Hook
 * Provides consistent mobile state management and utilities across all pages
 */
export const useMobileResponsive = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Update screen size and device type
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile menu handlers
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  // Close mobile menu when screen becomes desktop
  useEffect(() => {
    if (isDesktop && isMobileMenuOpen) {
      closeMobileMenu();
    }
  }, [isDesktop, isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileMenuOpen]);

  // Responsive breakpoint utilities
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  const isBreakpoint = (breakpoint) => {
    return screenSize.width >= breakpoints[breakpoint];
  };

  const isBetweenBreakpoints = (min, max) => {
    return screenSize.width >= breakpoints[min] && screenSize.width < breakpoints[max];
  };

  // Touch device detection
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // Responsive grid columns calculator
  const getResponsiveColumns = (mobileColumns = 1, tabletColumns = 2, desktopColumns = 3) => {
    if (isMobile) return mobileColumns;
    if (isTablet) return tabletColumns;
    return desktopColumns;
  };

  // Safe area utilities for mobile devices
  const getSafeAreaInsets = () => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
    
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    };
  };

  return {
    // State
    isMobileMenuOpen,
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    
    // Actions
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu,
    
    // Utilities
    isBreakpoint,
    isBetweenBreakpoints,
    isTouchDevice,
    getResponsiveColumns,
    getSafeAreaInsets,
    
    // Responsive classes helper
    getResponsiveClasses: (mobileClass, tabletClass, desktopClass) => {
      const classes = [];
      if (mobileClass) classes.push(mobileClass);
      if (tabletClass) classes.push(`md:${tabletClass}`);
      if (desktopClass) classes.push(`lg:${desktopClass}`);
      return classes.join(' ');
    },
  };
};

/**
 * Hook for managing responsive table/list views
 */
export const useResponsiveView = (defaultView = 'card') => {
  const { isMobile, isTablet } = useMobileResponsive();
  const [viewMode, setViewMode] = useState(defaultView);

  // Auto-switch view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    } else if (isTablet) {
      setViewMode('grid');
    } else {
      setViewMode('table');
    }
  }, [isMobile, isTablet]);

  const toggleView = () => {
    const modes = ['card', 'grid', 'table'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  return {
    viewMode,
    setViewMode,
    toggleView,
    isCardView: viewMode === 'card',
    isGridView: viewMode === 'grid',
    isTableView: viewMode === 'table',
  };
};

/**
 * Mobile Context Provider
 * Provides global mobile state management
 */

const MobileContext = createContext();

export const MobileProvider = ({ children }) => {
  const mobileState = useMobileResponsive();

  return (
    <MobileContext.Provider value={mobileState}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobileContext = () => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobileContext must be used within a MobileProvider');
  }
  return context;
};

/**
 * Higher-Order Component for Mobile Optimization
 */
export const withMobileOptimization = (WrappedComponent) => {
  return function MobileOptimizedComponent(props) {
    const mobileState = useMobileResponsive();

    return <WrappedComponent {...props} mobile={mobileState} />;
  };
};
