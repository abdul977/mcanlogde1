import { useState, useEffect, createContext, useContext } from 'react';

// Mobile breakpoints
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

// Custom hook for mobile responsiveness
export const useMobileResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });
      setIsMobile(width < BREAKPOINTS.mobile);
      setIsTablet(width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet);
      setIsDesktop(width >= BREAKPOINTS.tablet);
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openMobileMenu = () => setIsMobileMenuOpen(true);

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu,
    breakpoints: BREAKPOINTS
  };
};

// Mobile menu hook
export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Close menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.mobile-menu')) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close
  };
};

// Touch gesture hook
export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    return { isLeftSwipe, isRightSwipe, distance };
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    touchStart,
    touchEnd
  };
};

// Viewport hook for mobile optimization
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

// Mobile orientation hook
export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return orientation;
};

// Mobile scroll hook
export const useMobileScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
      }
      
      setScrollY(scrollY);
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection);
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [scrollDirection]);

  return { scrollY, scrollDirection };
};

// Mobile safe area hook (for devices with notches)
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
};

// Context for mobile state
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

// Utility functions
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

// Responsive view hook for data display
export const useResponsiveView = (defaultView = 'auto') => {
  const { isMobile, isTablet } = useMobileResponsive();
  const [viewMode, setViewMode] = useState(defaultView);

  // Auto-determine view mode based on screen size
  const getAutoView = () => {
    if (isMobile) return 'card';
    if (isTablet) return 'grid';
    return 'table';
  };

  const currentView = viewMode === 'auto' ? getAutoView() : viewMode;

  const toggleView = () => {
    const views = ['card', 'grid', 'table'];
    const currentIndex = views.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % views.length;
    setViewMode(views[nextIndex]);
  };

  return {
    viewMode: currentView,
    setViewMode,
    toggleView,
    isCardView: currentView === 'card',
    isGridView: currentView === 'grid',
    isTableView: currentView === 'table'
  };
};
