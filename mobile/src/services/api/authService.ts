import { apiHelpers } from './apiClient';
import { ENDPOINTS } from '../../constants';
import { User, LoginForm, RegisterForm, ApiResponse } from '../../types';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const authService = {
  // Login user
  login: async (credentials: LoginForm): Promise<LoginResponse> => {
    return apiHelpers.post<LoginResponse>(ENDPOINTS.LOGIN, credentials);
  },

  // Register user
  register: async (userData: RegisterForm): Promise<RegisterResponse> => {
    return apiHelpers.post<RegisterResponse>(ENDPOINTS.REGISTER, userData);
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    return apiHelpers.get<User>(ENDPOINTS.PROFILE);
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return apiHelpers.put<User>(ENDPOINTS.UPDATE_PROFILE, userData);
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    return apiHelpers.post<{ token: string }>(ENDPOINTS.REFRESH_TOKEN);
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    return apiHelpers.post<ApiResponse>(ENDPOINTS.LOGOUT);
  },
};
