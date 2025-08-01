import { apiClient } from './apiClient';
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
      formData.append('profileImage', {
        uri: imageUri,
        name: filename,
        type: mimeType,
      } as any);

      console.log('📤 Uploading to endpoint:', `${ENDPOINTS.UPDATE_PROFILE}/picture`);

      const response = await apiClient.put<ProfilePictureUploadResponse>(
        `${ENDPOINTS.UPDATE_PROFILE}/picture`,
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

      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Upload failed');
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
      const response = await apiClient.get(ENDPOINTS.PROFILE);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

export default new ProfileService();
