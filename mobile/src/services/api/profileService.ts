import apiClient from './apiClient';
import { ENDPOINTS } from '../../constants';

export interface ProfilePictureUploadResponse {
  success: boolean;
  message: string;
  data?: {
    profileImage: string;
    avatar: string;
    displayAvatar: string;
  };
  error?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: any;
  error?: string;
}

class ProfileService {
  /**
   * Upload profile picture
   */
  async uploadProfilePicture(imageUri: string): Promise<ProfilePictureUploadResponse> {
    try {
      console.log('📤 Starting profile picture upload:', { imageUri });

      // Create FormData for file upload
      const formData = new FormData();

      // Extract filename and ensure proper extension
      let filename = imageUri.split('/').pop() || 'profile.jpg';

      // Ensure filename has proper extension
      if (!filename.includes('.')) {
        filename = `profile_${Date.now()}.jpg`;
      }

      // Determine MIME type based on file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg'; // default

      switch (extension) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        default:
          mimeType = 'image/jpeg';
      }

      console.log('📁 File details:', { filename, mimeType, extension });

      // React Native FormData format for file uploads
      // Use the correct MIME type and ensure proper file structure
      const fileObject = {
        uri: imageUri,
        name: filename,
        type: mimeType,
      };

      console.log('📁 File object:', fileObject);
      formData.append('profileImage', fileObject as any);

      console.log('📤 Uploading to endpoint:', `/auth/api/profile/picture`);
      console.log('📤 FormData parts:', (formData as any)._parts);

      const response = await apiClient.put<ProfilePictureUploadResponse>(
        `/auth/api/profile/picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for uploads
        }
      );

      console.log('✅ Profile picture upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile picture upload error:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response headers:', error.response.headers);
      }

      // Handle specific error cases
      if (error.response?.status === 500) {
        // Server error - likely FormData parsing issue
        throw new Error('Server error during upload. Please try again or contact support.');
      } else if (error.response?.status === 413) {
        // File too large
        throw new Error('Image file is too large. Please choose a smaller image.');
      } else if (error.response?.status === 415) {
        // Unsupported media type
        throw new Error('Image format not supported. Please use JPG, PNG, or WebP.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Network error occurred during upload');
      }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: any): Promise<UpdateProfileResponse> {
    try {
      const response = await apiClient.put<UpdateProfileResponse>(
        ENDPOINTS.UPDATE_PROFILE,
        profileData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Update failed');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Network error occurred during update');
      }
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<any> {
    try {
      console.log('🔍 [DEBUG] ProfileService.getProfile() called');
      console.log('🔍 [DEBUG] apiClient available:', !!apiClient);
      console.log('🔍 [DEBUG] ENDPOINTS.PROFILE:', ENDPOINTS.PROFILE);

      if (!apiClient) {
        throw new Error('apiClient is not initialized');
      }

      console.log('🔍 [DEBUG] Making API call to:', ENDPOINTS.PROFILE);
      const response = await apiClient.get(ENDPOINTS.PROFILE);
      console.log('✅ [DEBUG] Profile API response:', response.data);

      // The profile endpoint returns data in response.data.user, not response.data.data
      if (response.data && response.data.success && response.data.user) {
        console.log('✅ [DEBUG] Returning user data:', response.data.user);
        return {
          success: true,
          user: response.data.user,
          message: response.data.message
        };
      } else {
        console.log('⚠️ [DEBUG] Unexpected response format:', response.data);
        // Return the raw response if it doesn't match expected format
        return response.data;
      }
    } catch (error: any) {
      console.error('❌ [DEBUG] Error fetching profile:', error);
      console.error('❌ [DEBUG] Error message:', error.message);
      console.error('❌ [DEBUG] Error response:', error.response?.data);

      // Re-throw with more context
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch profile data');
      }
    }
  }
}

export default new ProfileService();
