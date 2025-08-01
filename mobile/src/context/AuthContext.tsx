import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

import { User, AuthState, LoginForm, RegisterForm } from '../types';
import { STORAGE_KEYS } from '../constants';
import { authService } from '../services/api';

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string | null };

// Auth context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: '',
  isLoading: true,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    case 'SET_ERROR':
      return { ...state, isLoading: false };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Migration function to handle old storage keys
  const migrateStorageKeys = async () => {
    try {
      // Old keys with colons (invalid for SecureStore)
      const oldKeys = {
        AUTH_TOKEN: '@mcan_lodge:auth_token',
        USER_DATA: '@mcan_lodge:user_data',
      };

      // Check if old keys exist and migrate them
      const oldToken = await SecureStore.getItemAsync(oldKeys.AUTH_TOKEN);
      const oldUserData = await SecureStore.getItemAsync(oldKeys.USER_DATA);

      if (oldToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, oldToken);
        await SecureStore.deleteItemAsync(oldKeys.AUTH_TOKEN);
      }

      if (oldUserData) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, oldUserData);
        await SecureStore.deleteItemAsync(oldKeys.USER_DATA);
      }
    } catch (error) {
      // Ignore migration errors - old keys might not exist or be invalid
      console.log('Storage migration completed or not needed');
    }
  };

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing auth...');
      dispatch({ type: 'SET_LOADING', payload: true });

      // First, attempt to migrate old storage keys
      await migrateStorageKeys();

      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      console.log('🔑 Token exists:', !!token);
      console.log('👤 User data exists:', !!userData);

      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('✅ Auto-login successful for user:', {
          email: user.email,
          name: user.name,
          id: user.id || user._id,
          role: user.role
        });
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } else {
        console.log('❌ No stored auth data, showing auth screens');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginForm) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setError(null);

      const response = await authService.login(credentials);
      
      // Store auth data securely
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.user, token: response.token } });
    } catch (error: any) {
      setError(error.message || 'Login failed');
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData: RegisterForm) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setError(null);

      const response = await authService.register(userData);

      // After successful registration, log the user in
      await login({ email: userData.email, password: userData.password });
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // For JWT-based authentication, logout is primarily client-side
      // We'll attempt to call the server logout endpoint but continue even if it fails
      try {
        await authService.logout();
        console.log('✅ Server logout successful');
      } catch (apiError) {
        console.log('⚠️ Server logout failed, continuing with client-side logout:', apiError);
        // Continue with client-side logout even if server call fails
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear stored data for security
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
        console.log('✅ Client-side logout completed');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }

      dispatch({ type: 'LOGOUT' });
      setError(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setError(null);
      
      const updatedUser = await authService.updateProfile(userData);
      
      // Update stored user data
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error: any) {
      setError(error.message || 'Profile update failed');
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
