import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// File filter for payment screenshots
const paymentFileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for payment screenshots'), false);
  }
};

// Multer configuration for payment screenshots
export const uploadPaymentScreenshot = multer({
  storage: paymentStorage,
  fileFilter: paymentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

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

// Utility function to validate image file
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return errors;
  }
  
  // Check file type
  if (!file.mimetype.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB');
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('File must be a valid image format (JPG, JPEG, PNG, GIF, WEBP)');
  }
  
  return errors;
};

// Middleware to handle file upload errors
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
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

export default {
  uploadPaymentScreenshot,
  getFileUrl,
  deleteFile,
  validateImageFile,
  handleUploadError,
  setupStaticFiles
};
