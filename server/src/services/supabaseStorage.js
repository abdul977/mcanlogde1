import supabase from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

class SupabaseStorageService {
  constructor() {
    this.buckets = {
      donations: 'mcan-donations',
      posts: 'mcan-posts', 
      community: 'mcan-community',
      resources: 'mcan-resources',
      services: 'mcan-services',
      quranClasses: 'mcan-quran-classes',
      authors: 'mcan-authors',
      participants: 'mcan-participants',
      thumbnails: 'mcan-thumbnails'
    };
  }

  /**
   * Upload a file to Supabase Storage
   * @param {string} bucketName - The bucket to upload to
   * @param {string} filePath - The path where the file should be stored
   * @param {Buffer|File} fileData - The file data to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result with URL
   */
  async uploadFile(bucketName, filePath, fileData, options = {}) {
    try {
      let fileBuffer;
      
      // Handle different file input types
      if (typeof fileData === 'string') {
        // If it's a file path, read the file
        fileBuffer = fs.readFileSync(fileData);
      } else if (Buffer.isBuffer(fileData)) {
        fileBuffer = fileData;
      } else if (fileData.data) {
        // Handle express-fileupload format
        fileBuffer = fileData.data;
      } else {
        throw new Error('Invalid file data format');
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: options.contentType || 'auto',
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
          ...options
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          id: data.id,
          secure_url: urlData.publicUrl,
          public_url: urlData.publicUrl,
          bytes: fileBuffer.length
        }
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload multiple files
   * @param {string} bucketName - The bucket to upload to
   * @param {Array} files - Array of file objects with path and data
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleFiles(bucketName, files, options = {}) {
    const uploadPromises = files.map(file => 
      this.uploadFile(bucketName, file.path, file.data, options)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from storage
   * @param {string} bucketName - The bucket name
   * @param {string} filePath - The file path to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(bucketName, filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get public URL for a file
   * @param {string} bucketName - The bucket name
   * @param {string} filePath - The file path
   * @returns {string} Public URL
   */
  getPublicUrl(bucketName, filePath) {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Generate a unique file path
   * @param {string} folder - The folder name
   * @param {string} originalName - Original file name
   * @returns {string} Unique file path
   */
  generateFilePath(folder, originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    return `${folder}/${timestamp}_${randomString}_${baseName}${extension}`;
  }

  /**
   * Upload file from express-fileupload temp file
   * @param {Object} file - Express-fileupload file object
   * @param {string} bucketName - Target bucket
   * @param {string} folder - Target folder
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFromTempFile(file, bucketName, folder, options = {}) {
    try {
      const filePath = this.generateFilePath(folder, file.name);
      
      // Read file from temp path
      const fileBuffer = fs.readFileSync(file.tempFilePath);
      
      const result = await this.uploadFile(bucketName, filePath, fileBuffer, {
        contentType: file.mimetype,
        ...options
      });

      // Clean up temp file
      try {
        fs.unlinkSync(file.tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }

      return result;
    } catch (error) {
      console.error('Upload from temp file error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SupabaseStorageService();
