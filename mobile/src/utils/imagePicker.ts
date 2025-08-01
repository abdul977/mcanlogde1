import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxFileSize?: number; // in bytes
}

class ImagePickerService {
  private defaultOptions: ImagePickerOptions = {
    allowsEditing: true,
    aspect: [1, 1], // Square aspect ratio for profile pictures
    quality: 0.8,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  };

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permissions to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library permissions to select images.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Validate image file
   */
  private validateImage(asset: ImagePicker.ImagePickerAsset, options: ImagePickerOptions): boolean {
    // Check file size
    if (options.maxFileSize && asset.fileSize && asset.fileSize > options.maxFileSize) {
      const maxSizeMB = (options.maxFileSize / (1024 * 1024)).toFixed(1);
      Alert.alert(
        'File Too Large',
        `Image size must be less than ${maxSizeMB}MB. Please select a smaller image.`,
        [{ text: 'OK' }]
      );
      return false;
    }

    // Check if it's an image - be more lenient with type checking
    // Sometimes the type might not be set properly by the image picker
    const hasImageExtension = asset.uri && /\.(jpg|jpeg|png|gif|webp)$/i.test(asset.uri);
    const hasImageType = asset.type && asset.type.startsWith('image/');

    if (!hasImageType && !hasImageExtension) {
      Alert.alert(
        'Invalid File Type',
        'Please select an image file (JPG, PNG, GIF, or WebP).',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  }

  /**
   * Pick image from camera
   */
  async pickFromCamera(options: ImagePickerOptions = {}): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) return null;

      const mergedOptions = { ...this.defaultOptions, ...options };

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: mergedOptions.allowsEditing,
        aspect: mergedOptions.aspect,
        quality: mergedOptions.quality,
        base64: false,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];

      if (!this.validateImage(asset, mergedOptions)) {
        return null;
      }

      // Generate proper filename and type
      let filename = asset.uri.split('/').pop() || `photo_${Date.now()}.jpg`;

      // Ensure filename has proper extension
      if (!filename.includes('.')) {
        filename = `photo_${Date.now()}.jpg`;
      }

      // Determine MIME type - prefer asset.type if available, otherwise infer from extension
      let type = asset.type || 'image/jpeg';

      if (!type || !type.startsWith('image/')) {
        const extension = filename.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'png':
            type = 'image/png';
            break;
          case 'jpg':
          case 'jpeg':
            type = 'image/jpeg';
            break;
          case 'gif':
            type = 'image/gif';
            break;
          case 'webp':
            type = 'image/webp';
            break;
          default:
            type = 'image/jpeg';
        }
      }

      return {
        uri: asset.uri,
        type,
        name: filename,
        size: asset.fileSize,
      };
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  /**
   * Pick image from gallery
   */
  async pickFromGallery(options: ImagePickerOptions = {}): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) return null;

      const mergedOptions = { ...this.defaultOptions, ...options };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: mergedOptions.allowsEditing,
        aspect: mergedOptions.aspect,
        quality: mergedOptions.quality,
        base64: false,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];

      if (!this.validateImage(asset, mergedOptions)) {
        return null;
      }

      // Generate proper filename and type
      let filename = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;

      // Ensure filename has proper extension
      if (!filename.includes('.')) {
        filename = `image_${Date.now()}.jpg`;
      }

      // Determine MIME type - prefer asset.type if available, otherwise infer from extension
      let type = asset.type || 'image/jpeg';

      if (!type || !type.startsWith('image/')) {
        const extension = filename.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'png':
            type = 'image/png';
            break;
          case 'jpg':
          case 'jpeg':
            type = 'image/jpeg';
            break;
          case 'gif':
            type = 'image/gif';
            break;
          case 'webp':
            type = 'image/webp';
            break;
          default:
            type = 'image/jpeg';
        }
      }

      return {
        uri: asset.uri,
        type,
        name: filename,
        size: asset.fileSize,
      };
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  /**
   * Show image picker options (Camera or Gallery)
   */
  showImagePickerOptions(
    onImageSelected: (image: ImagePickerResult) => void,
    options: ImagePickerOptions = {}
  ): void {
    Alert.alert(
      'Select Profile Picture',
      'Choose an option to update your profile picture',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const image = await this.pickFromCamera(options);
            if (image) {
              onImageSelected(image);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const image = await this.pickFromGallery(options);
            if (image) {
              onImageSelected(image);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }
}

export default new ImagePickerService();
