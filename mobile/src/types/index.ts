// Core Types for MCAN Lodge Mobile App

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  phone?: string;
  // NYSC-specific fields
  gender?: 'male' | 'female';
  stateCode?: string;
  batch?: string;
  stream?: 'A' | 'B' | 'C';
  callUpNumber?: string;
  dateOfBirth?: string;
  institution?: string;
  course?: string;
  profileCompleted?: boolean;
  nyscDetails?: {
    gender?: 'male' | 'female';
    stateCode?: string;
    batch?: string;
    stream?: 'A' | 'B' | 'C';
    callUpNumber?: string;
    isComplete: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Accommodation {
  _id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  gender: 'male' | 'female' | 'mixed';
  capacity: number;
  amenities: string[];
  location: string;
  isAvailable: boolean;
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  user: User;
  accommodation?: Accommodation;
  bookingType: 'accommodation' | 'program' | 'lecture' | 'quran_class' | 'event';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  contactInfo: {
    phone: string;
    emergencyContact: string;
  };
  notes?: string;
  adminNotes?: string;
  requestDate: string;
  approvedDate?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  comparePrice?: number;
  currency: string;
  sku: string;
  category: {
    _id: string;
    name: string;
  };
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: User;
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  isActive: boolean;
  category: 'lecture' | 'quran_class' | 'community_event';
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  featuredImage: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  category: 'general' | 'islamic' | 'education' | 'community' | 'events' | 'announcements';
  publishDate: string;
  views: number;
  featured: boolean;
  metaDescription?: string;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  formattedPublishDate?: string;
}

export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  location: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ProfileCompletion: { skipable?: boolean };
  BiometricSetup: { skipable?: boolean; onComplete?: () => void };
  Home: undefined;
  Accommodations: undefined;
  AccommodationDetails: { id: string };
  Booking: { accommodationId: string };
  Shop: undefined;
  ProductDetails: { id: string };
  Cart: undefined;
  Checkout: undefined;
  Events: undefined;
  EventDetails: { id: string };
  Blog: undefined;
  BlogDetails: { id: string };
  Messages: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Accommodations: undefined;
  Shop: undefined;
  Events: undefined;
  Profile: undefined;
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  // NYSC fields (optional during registration, can be completed later)
  gender?: 'male' | 'female';
  stateCode?: string;
  batch?: string;
  stream?: 'A' | 'B' | 'C';
  callUpNumber?: string;
  dateOfBirth?: string;
  institution?: string;
  course?: string;
}

export interface BookingForm {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  phone: string;
  emergencyContact: string;
  notes?: string;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: object;
    h2: object;
    h3: object;
    body: object;
    caption: object;
  };
}
