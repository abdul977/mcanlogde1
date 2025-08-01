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

    // Check if it's an image
    if (!asset.type || !asset.type.startsWith('image/')) {
      Alert.alert(
        'Invalid File Type',
        'Please select an image file.',
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

      const filename = asset.uri.split('/').pop() || `photo_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

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

      const filename = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

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
