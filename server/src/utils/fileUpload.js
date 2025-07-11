import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const createUploadDirs = () => {
  const uploadDirs = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/payments'),
    path.join(__dirname, '../../uploads/payments/screenshots')
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create directories on module load
createUploadDirs();

// Storage configuration for payment screenshots
const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/payments/screenshots');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: payment_bookingId_monthNumber_timestamp.ext
    const bookingId = req.body.bookingId;
    const monthNumber = req.body.monthNumber;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `payment_${bookingId}_${monthNumber}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

// File filter for payment proofs (images and PDFs)
const paymentFileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

  // Check file type
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF) and PDF files are allowed for payment proofs'), false);
  }
};

// Multer configuration for payment proofs (images and PDFs)
export const uploadPaymentProof = multer({
  storage: paymentStorage,
  fileFilter: paymentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (increased for PDFs)
    files: 1 // Only one file at a time
  }
});

// Legacy export for backward compatibility
export const uploadPaymentScreenshot = uploadPaymentProof;

// Utility function to get file URL
export const getFileUrl = (filename, type = 'payment') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${type}s/screenshots/${filename}`;
};

// Utility function to delete file
export const deleteFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to validate payment proof file (images and PDFs)
export const validatePaymentProofFile = (file) => {
  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return errors;
  }

  // Allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

  // Check file type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push('File must be an image (JPEG, PNG, GIF) or PDF');
  }

  // Check file size (10MB limit for PDFs, 5MB for images)
  const maxSize = file.mimetype === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxSizeMB = file.mimetype === 'application/pdf' ? '10MB' : '5MB';
    errors.push(`File size must be less than ${maxSizeMB}`);
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('File must be a valid format (JPG, JPEG, PNG, GIF, PDF)');
  }

  return errors;
};

// Legacy function for backward compatibility
export const validateImageFile = validatePaymentProofFile;

// Middleware to handle file upload errors
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB for PDFs and 5MB for images.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed for payment screenshots') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  // Generic upload error
  return res.status(500).json({
    success: false,
    message: 'File upload failed',
    error: error.message
  });
};

// Express static middleware setup for serving uploaded files
export const setupStaticFiles = (app) => {
  const uploadsPath = path.join(__dirname, '../../uploads');
  app.use('/uploads', express.static(uploadsPath));
};

// Utility function to determine file type
export const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (mimetype === 'application/pdf') {
    return 'pdf';
  }
  return 'unknown';
};

export default {
  uploadPaymentScreenshot,
  uploadPaymentProof,
  getFileUrl,
  deleteFile,
  validateImageFile,
  validatePaymentProofFile,
  handleUploadError,
  setupStaticFiles,
  getFileType
};
