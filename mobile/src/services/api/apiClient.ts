import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../../constants';
import { ApiResponse } from '../../types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL, // Always use the configured base URL (Render server)
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      // Get auth token from secure storage
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        console.log('🔗 Base URL:', config.baseURL);
        if (config.data) {
          console.log('📤 Request Data:', config.data);
        }
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log response in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('📥 Response Data:', response.data);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (__DEV__) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`);
      console.error('Error Details:', error.response?.data || error.message);
      console.error('Error Code:', error.code);
      console.error('Network Error:', !error.response);
      console.error('Full Error:', error);
    }

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear stored auth data
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

        // Redirect to login (this would be handled by auth context)
        // For now, just reject the promise
        return Promise.reject({
          ...error,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
    }

    // Handle different HTTP status codes
    const { status, data } = error.response;
    let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;

    switch (status) {
      case 400:
        errorMessage = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        errorMessage = ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        errorMessage = data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }

    return Promise.reject({
      ...error,
      message: errorMessage,
      statusCode: status,
    });
  }
);

// API helper functions
export const apiHelpers = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data || response.data;
  },

  // POST request
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data || response.data;
  },

  // PUT request
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data || response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data || response.data;
  },

  // PATCH request
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data || response.data;
  },

  // Upload file
  upload: async <T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data.data || response.data;
  },
};

export default apiClient;
