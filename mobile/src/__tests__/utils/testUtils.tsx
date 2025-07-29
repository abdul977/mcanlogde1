/**
 * Test Utilities for MCAN Lodge Mobile App
 * 
 * This file provides common utilities and helpers for testing React Native components
 * with proper context providers and mock data.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, CartProvider, SearchProvider, ThemeProvider } from '../../context';
import { User, AuthState, LoginForm, RegisterForm } from '../../types';

// Mock user data for testing
export const mockUser: User = {
  id: 'test-user-id',
  _id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  avatar: 'https://example.com/avatar.jpg',
  phone: '+1234567890',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-user-id',
  _id: 'admin-user-id',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

// Mock auth states
export const mockAuthenticatedState: AuthState = {
  user: mockUser,
  token: 'mock-jwt-token',
  isLoading: false,
  isAuthenticated: true,
};

export const mockUnauthenticatedState: AuthState = {
  user: null,
  token: '',
  isLoading: false,
  isAuthenticated: false,
};

export const mockLoadingState: AuthState = {
  user: null,
  token: '',
  isLoading: true,
  isAuthenticated: false,
};

// Mock login credentials
export const mockLoginCredentials: LoginForm = {
  email: 'test@example.com',
  password: 'password123',
};

export const mockRegisterData: RegisterForm = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

// Mock auth context value
export const createMockAuthContext = (overrides: Partial<any> = {}) => ({
  ...mockUnauthenticatedState,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  clearError: jest.fn(),
  error: null,
  ...overrides,
});

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContextValue?: any;
  navigationOptions?: any;
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  authContextValue?: any;
}> = ({ children, authContextValue }) => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ThemeProvider>
          <AuthProvider value={authContextValue}>
            <CartProvider>
              <SearchProvider>
                {children}
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { authContextValue, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders authContextValue={authContextValue}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to render component with authenticated user
export const renderWithAuthenticatedUser = (
  ui: ReactElement,
  user: User = mockUser,
  options: Omit<CustomRenderOptions, 'authContextValue'> = {}
) => {
  const authContextValue = createMockAuthContext({
    ...mockAuthenticatedState,
    user,
  });

  return renderWithProviders(ui, { ...options, authContextValue });
};

// Helper to render component with unauthenticated state
export const renderWithUnauthenticatedUser = (
  ui: ReactElement,
  options: Omit<CustomRenderOptions, 'authContextValue'> = {}
) => {
  const authContextValue = createMockAuthContext(mockUnauthenticatedState);
  return renderWithProviders(ui, { ...options, authContextValue });
};

// Helper to render component with loading state
export const renderWithLoadingState = (
  ui: ReactElement,
  options: Omit<CustomRenderOptions, 'authContextValue'> = {}
) => {
  const authContextValue = createMockAuthContext(mockLoadingState);
  return renderWithProviders(ui, { ...options, authContextValue });
};

// Mock API responses
export const mockApiResponses = {
  loginSuccess: {
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token',
    user: mockUser,
  },
  loginError: {
    success: false,
    message: 'Invalid credentials',
  },
  registerSuccess: {
    success: true,
    message: 'Registration successful',
    user: mockUser,
  },
  registerError: {
    success: false,
    message: 'Email already exists',
  },
};

// Test helpers for form validation
export const fillLoginForm = async (getByPlaceholderText: any, credentials = mockLoginCredentials) => {
  const emailInput = getByPlaceholderText('Enter your email');
  const passwordInput = getByPlaceholderText('Enter your password');
  
  // Note: In actual tests, you would use fireEvent.changeText
  // This is just a helper structure
  return { emailInput, passwordInput };
};

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock navigation helpers
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Accessibility testing helpers
export const checkAccessibility = (component: any) => {
  // Helper to verify accessibility properties
  return {
    hasAccessibilityLabel: (label: string) => 
      expect(component).toHaveAccessibilityLabel(label),
    hasAccessibilityRole: (role: string) => 
      expect(component).toHaveAccessibilityRole(role),
    hasAccessibilityHint: (hint: string) => 
      expect(component).toHaveAccessibilityHint(hint),
  };
};

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';
