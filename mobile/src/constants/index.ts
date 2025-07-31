// Constants for MCAN Mobile App

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://mcanlogde1.onrender.com', // Always use Render server
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// MCAN Brand Colors (Islamic Green Theme)
export const COLORS = {
  // Primary MCAN Colors
  PRIMARY: '#006400',        // Deep Islamic green
  SECONDARY: '#008000',      // Medium green
  LIGHT: '#90EE90',         // Light green
  ACCENT: '#004d00',        // Darker green for accents
  
  // Neutral Colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  
  // Status Colors
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  
  // Background Colors
  BACKGROUND: '#F9FAFB',
  SURFACE: '#FFFFFF',
  CARD: '#FFFFFF',
  
  // Text Colors
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6B7280',
  TEXT_MUTED: '#9CA3AF',
  TEXT_ON_PRIMARY: '#FFFFFF',
};

// Typography Scale
export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    '2XL': 24,
    '3XL': 30,
    '4XL': 36,
    '5XL': 48,
  },
  FONT_WEIGHTS: {
    LIGHT: '300',
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
  },
  LINE_HEIGHTS: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
};

// Spacing Scale
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
  '3XL': 64,
  '4XL': 96,
};

// Border Radius
export const BORDER_RADIUS = {
  NONE: 0,
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  '2XL': 24,
  FULL: 9999,
};

// Shadow Styles
export const SHADOWS = {
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
};

// Screen Dimensions
export const SCREEN = {
  // Mobile breakpoints
  MOBILE_MAX: 768,
  TABLET_MIN: 769,
  TABLET_MAX: 1024,
  DESKTOP_MIN: 1025,
  
  // Touch targets (accessibility)
  MIN_TOUCH_TARGET: 44,
  RECOMMENDED_TOUCH_TARGET: 48,
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'MCAN',
  VERSION: '1.0.0',
  DESCRIPTION: 'Muslim Corpers\' Association of Nigeria',
  SUPPORT_EMAIL: 'support@mcan.org.ng',
  PRIVACY_POLICY_URL: 'https://mcan.org.ng/privacy',
  TERMS_OF_SERVICE_URL: 'https://mcan.org.ng/terms',
};

// Storage Keys - SecureStore keys must only contain alphanumeric characters, ".", "-", and "_"
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'mcan_auth_token',
  USER_DATA: 'mcan_user_data',
  CART_ITEMS: 'mcan_cart_items',
  PRAYER_TIMES: 'mcan_prayer_times',
  APP_SETTINGS: 'mcan_app_settings',
  BIOMETRIC_ENABLED: 'mcan_biometric_enabled',
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/api/login',
  REGISTER: '/auth/api/register',
  REFRESH_TOKEN: '/auth/api/refresh',
  LOGOUT: '/auth/api/logout',

  // User
  PROFILE: '/auth/api/profile',
  UPDATE_PROFILE: '/auth/api/profile', // Server uses PUT /auth/api/profile
  
  // Accommodations
  ACCOMMODATIONS: '/api/post/get-all-post',
  ACCOMMODATION_DETAILS: '/api/post/get-post',
  ACCOMMODATIONS_BY_GENDER: '/api/post/accommodations',
  
  // Bookings
  BOOKINGS: '/api/bookings',
  CREATE_BOOKING: '/api/bookings/create',
  MY_BOOKINGS: '/api/bookings/my-bookings',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_DETAILS: '/api/products',
  PRODUCT_CATEGORIES: '/api/product-categories',
  
  // Orders
  ORDERS: '/api/orders',
  CREATE_ORDER: '/api/orders/create',
  MY_ORDERS: '/api/orders/my-orders',
  
  // Events
  EVENTS: '/api/events',
  EVENT_DETAILS: '/api/events',
  
  // Blog
  BLOG_POSTS: '/api/blog',
  BLOG_LIST: '/api/blog/get-all-blogs',
  FEATURED_BLOGS: '/api/blog/featured-blogs',
  BLOG_POST_DETAILS: '/api/blog/get-blog',
  
  // Messages
  MESSAGES: '/api/messages',
  SEND_MESSAGE: '/api/messages/send',
  CONVERSATIONS: '/api/messages/conversations',
  
  // Payments
  PAYMENTS: '/api/payments',
  PAYMENT_CONFIG: '/api/payment-config',
};

// Gender Options
export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Mixed', value: 'mixed' },
];

// NYSC-specific Options
export const NYSC_STREAMS = [
  { label: 'Stream A', value: 'A' },
  { label: 'Stream B', value: 'B' },
  { label: 'Stream C', value: 'C' },
];

// Nigerian States (for NYSC state codes)
export const NIGERIAN_STATES = [
  { label: 'Abia (AB)', value: 'AB' },
  { label: 'Adamawa (AD)', value: 'AD' },
  { label: 'Akwa Ibom (AK)', value: 'AK' },
  { label: 'Anambra (AN)', value: 'AN' },
  { label: 'Bauchi (BA)', value: 'BA' },
  { label: 'Bayelsa (BY)', value: 'BY' },
  { label: 'Benue (BN)', value: 'BN' },
  { label: 'Borno (BO)', value: 'BO' },
  { label: 'Cross River (CR)', value: 'CR' },
  { label: 'Delta (DT)', value: 'DT' },
  { label: 'Ebonyi (EB)', value: 'EB' },
  { label: 'Edo (ED)', value: 'ED' },
  { label: 'Ekiti (EK)', value: 'EK' },
  { label: 'Enugu (EN)', value: 'EN' },
  { label: 'FCT (FC)', value: 'FC' },
  { label: 'Gombe (GM)', value: 'GM' },
  { label: 'Imo (IM)', value: 'IM' },
  { label: 'Jigawa (JG)', value: 'JG' },
  { label: 'Kaduna (KD)', value: 'KD' },
  { label: 'Kano (KN)', value: 'KN' },
  { label: 'Katsina (KT)', value: 'KT' },
  { label: 'Kebbi (KB)', value: 'KB' },
  { label: 'Kogi (KG)', value: 'KG' },
  { label: 'Kwara (KW)', value: 'KW' },
  { label: 'Lagos (LA)', value: 'LA' },
  { label: 'Nasarawa (NA)', value: 'NA' },
  { label: 'Niger (NI)', value: 'NI' },
  { label: 'Ogun (OG)', value: 'OG' },
  { label: 'Ondo (ON)', value: 'ON' },
  { label: 'Osun (OS)', value: 'OS' },
  { label: 'Oyo (OY)', value: 'OY' },
  { label: 'Plateau (PL)', value: 'PL' },
  { label: 'Rivers (RI)', value: 'RI' },
  { label: 'Sokoto (SO)', value: 'SO' },
  { label: 'Taraba (TA)', value: 'TA' },
  { label: 'Yobe (YO)', value: 'YO' },
  { label: 'Zamfara (ZA)', value: 'ZA' },
];

// Booking Status Options
export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Order Status Options
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = [
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'Mobile Money', value: 'mobile' },
  { label: 'Online Payment', value: 'online' },
];

// Prayer Names
export const PRAYER_NAMES = {
  FAJR: 'Fajr',
  DHUHR: 'Dhuhr',
  ASR: 'Asr',
  MAGHRIB: 'Maghrib',
  ISHA: 'Isha',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  BOOKING_SUCCESS: 'Booking request submitted successfully!',
  ORDER_SUCCESS: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
};

// Icon Configuration for 3D Icons
export const ICON_CONFIG = {
  // Tab Navigation Icons (3D style)
  TAB_ICONS: {
    HOME: 'home',
    STAY: 'bed',
    SHOP: 'store',
    COMMUNITY: 'users-alt',
    PROFILE: 'user-circle',
  },

  // Common App Icons (3D style)
  APP_ICONS: {
    SEARCH: 'search',
    FILTER: 'filter',
    HEART: 'heart',
    HEART_FILLED: 'heart',
    STAR: 'star',
    STAR_FILLED: 'star',
    LOCATION: 'map-marker',
    CALENDAR: 'calendar-alt',
    CLOCK: 'clock',
    PHONE: 'phone',
    EMAIL: 'envelope',
    CAMERA: 'camera',
    GALLERY: 'image',
    SHARE: 'share-alt',
    BOOKMARK: 'bookmark',
    BOOKMARK_FILLED: 'bookmark',
    NOTIFICATION: 'bell',
    SETTINGS: 'cog',
    LOGOUT: 'sign-out-alt',
    EDIT: 'edit',
    DELETE: 'trash-alt',
    ADD: 'plus-circle',
    MINUS: 'minus-circle',
    CHECK: 'check-circle',
    CLOSE: 'times-circle',
    INFO: 'info-circle',
    WARNING: 'exclamation-triangle',
    ERROR: 'exclamation-circle',
    SUCCESS: 'check-circle',
  },

  // Islamic/Religious Icons
  ISLAMIC_ICONS: {
    MOSQUE: 'mosque',
    PRAYER: 'praying-hands',
    QURAN: 'book-open',
    COMPASS: 'compass',
    CRESCENT: 'moon',
  },

  // Accommodation Icons
  ACCOMMODATION_ICONS: {
    BED: 'bed',
    BATHROOM: 'bath',
    WIFI: 'wifi',
    AC: 'snowflake',
    PARKING: 'car',
    KITCHEN: 'utensils',
    LAUNDRY: 'tshirt',
    SECURITY: 'shield-alt',
  },

  // Payment Icons
  PAYMENT_ICONS: {
    CARD: 'credit-card',
    BANK: 'university',
    MOBILE: 'mobile-alt',
    CASH: 'money-bill-wave',
  },

  // Social Icons
  SOCIAL_ICONS: {
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    INSTAGRAM: 'instagram',
    WHATSAPP: 'whatsapp',
    TELEGRAM: 'telegram-alt',
  },
};

// Icon Sizes
export const ICON_SIZES = {
  XS: 12,
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 28,
  XXL: 32,
  XXXL: 40,
};
