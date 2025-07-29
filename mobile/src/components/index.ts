// Export all components from this file for easier imports
// This file will be populated as we create components

// UI Components
// export { default as Button } from './ui/Button';
// export { default as Input } from './ui/Input';
// export { default as Card } from './ui/Card';
// export { default as Modal } from './ui/Modal';
export { default as LoadingScreen } from './ui/LoadingScreen';
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { default as EmptyState } from './ui/EmptyState';
export { default as TabBarBadge } from './ui/TabBarBadge';
export { BiometricButton } from './ui/BiometricButton';
export { AccessibleButton } from './ui/AccessibleButton';
export { AnimatedButton } from './ui/AnimatedButton';
export { default as SafeAreaWrapper, SafeAreaScreen, SafeAreaHeader, SafeAreaContent } from './ui/SafeAreaWrapper';
export { default as Icon } from './ui/Icon';
export * from './ui/Icon';
export { default as Header } from './ui/Header';
export { default as Avatar } from './ui/Avatar';
export { default as ErrorBoundary } from './ui/ErrorBoundary';

// Layout Components
// export { default as Screen } from './layout/Screen';
// export { default as Container } from './layout/Container';
// export { default as Header } from './layout/Header';
// export { default as SafeArea } from './layout/SafeArea';

// Form Components
export * from './forms';

// List Components
// export { default as AccommodationList } from './lists/AccommodationList';
// export { default as ProductList } from './lists/ProductList';
// export { default as EventList } from './lists/EventList';

// Feature Components
export { default as PrayerTimesWidget } from './features/PrayerTimesWidget';
export { default as BlogCard } from './features/BlogCard';
// export { default as BookingForm } from './features/BookingForm';
// export { default as CartItem } from './features/CartItem';

// Community Components
export { default as CommunityCard } from './community/CommunityCard';

// Messaging Components
export * from './messaging';

export {}; // Temporary export to avoid empty file error
