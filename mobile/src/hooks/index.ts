// Export all custom hooks from this file for easier imports
// This file will be populated as we create custom hooks

// Authentication Hooks
// export { default as useAuth } from './useAuth';
// export { default as useLogin } from './useLogin';
// export { default as useRegister } from './useRegister';

// API Hooks
// export { default as useApi } from './useApi';
// export { default as useAccommodations } from './useAccommodations';
// export { default as useProducts } from './useProducts';
// export { default as useBookings } from './useBookings';
// export { default as useOrders } from './useOrders';
// export { default as useEvents } from './useEvents';
// export { default as useBlog } from './useBlog';
// export { default as useMessages } from './useMessages';

// UI Hooks
// export { default as useModal } from './useModal';
// export { default as useToast } from './useToast';
// export { default as useLoading } from './useLoading';
// export { default as useKeyboard } from './useKeyboard';
// export { default as useOrientation } from './useOrientation';

// Form Hooks
export { useFormValidation, useFieldValidation, getFieldAccessibilityProps } from './useFormValidation';

// Biometric Hooks
export { useBiometric, useBiometricQuickAuth } from './useBiometric';

// Remember Me Hooks
export { useRememberMe, useAutoLogin } from './useRememberMe';

// Accessibility Hooks
export { useAccessibility, useFocusManagement, useAnnouncements, useHighContrast } from './useAccessibility';

// Animation Hooks
export * from './useAnimations';

// Navigation Hooks
export * from './useEnhancedNavigation';

// Storage Hooks
// export { default as useAsyncStorage } from './useAsyncStorage';
// export { default as useSecureStorage } from './useSecureStorage';

// Utility Hooks
// export { default as useDebounce } from './useDebounce';
// export { default as useThrottle } from './useThrottle';
// export { default as usePrevious } from './usePrevious';

export {}; // Temporary export to avoid empty file error
