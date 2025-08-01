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

      // Add the image file
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('📁 File details:', { filename, type });

      // React Native FormData format for file uploads
      formData.append('profileImage', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

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
