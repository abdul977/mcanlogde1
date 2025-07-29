// Navigation types for MCAN Lodge Mobile App
import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modal: NavigatorScreenParams<ModalStackParamList>;
};

// Authentication Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ProfileCompletion: { skipable?: boolean };
  BiometricSetup: { skipable?: boolean; onComplete?: () => void };
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  AccommodationsTab: NavigatorScreenParams<AccommodationStackParamList>;
  ShopTab: NavigatorScreenParams<ShopStackParamList>;
  CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack
export type HomeStackParamList = {
  Home: undefined;
  Search: { query?: string };
  PrayerTimes: undefined;
  BlogListing: undefined;
  BlogDetails: { slug: string };
};

// Accommodation Stack
export type AccommodationStackParamList = {
  Accommodations: { gender?: 'male' | 'female' | 'mixed' };
  AccommodationDetails: { id: string };
  Booking: { accommodationId: string };
  BookingConfirmation: { bookingId: string };
};

// Shop Stack
export type ShopStackParamList = {
  Shop: { categoryId?: string };
  ProductDetails: { id: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
};

// Community Stack
export type CommunityStackParamList = {
  CommunityList: undefined;
  CommunityDetail: { communityId: string; communityName: string };
  CommunityCreate: undefined;
  CommunitySettings: { communityId: string };
  CommunityMembers: { communityId: string };
  CommunityModeration: { communityId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  MyBookings: undefined;
  BookingDetails: { id: string };
  OrderHistory: undefined;
  OrderDetails: { id: string };
  Messages: undefined;
  Chat: { userId: string; userName: string };
  PaymentHistory: undefined;
  PaymentDetails: { id: string };
  Bookmarks: undefined;
  // Admin screens (conditional based on user role)
  AdminDashboard: undefined;
  ManageBookings: undefined;
  ManageUsers: undefined;
  ManageContent: undefined;
};

// Modal Stack (for overlays and modals)
export type ModalStackParamList = {
  ImageViewer: { images: string[]; initialIndex?: number };
  DatePicker: { 
    selectedDate?: Date; 
    minimumDate?: Date; 
    maximumDate?: Date;
    onDateSelect: (date: Date) => void;
  };
  LocationPicker: {
    initialLocation?: { latitude: number; longitude: number };
    onLocationSelect: (location: { latitude: number; longitude: number }) => void;
  };
  FilterModal: {
    filters: Record<string, any>;
    onApplyFilters: (filters: Record<string, any>) => void;
  };
};

// Screen props helper types
export type ScreenProps<
  T extends keyof RootStackParamList,
  K extends keyof RootStackParamList[T]
> = {
  navigation: any; // Will be properly typed with navigation prop
  route: {
    params: RootStackParamList[T][K];
  };
};

// Tab bar icon props
export type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

// Navigation theme
export type NavigationTheme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
};

// Common navigation options
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerStyle?: object;
  headerTitleStyle?: object;
  headerTintColor?: string;
  headerBackTitle?: string;
  gestureEnabled?: boolean;
  animationEnabled?: boolean;
}

// Tab bar options
export interface TabBarOptions {
  tabBarLabel?: string;
  tabBarIcon?: (props: TabBarIconProps) => React.ReactNode;
  tabBarBadge?: string | number;
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
  tabBarShowLabel?: boolean;
}

export default RootStackParamList;
