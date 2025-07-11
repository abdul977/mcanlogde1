# MCAN Payment System - Technical Implementation Guide

## Architecture Overview

The MCAN Payment System is built using a modern MERN stack with additional services for enhanced functionality.

### Technology Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system with planned cloud migration
- **Notifications**: Email (SMTP) and SMS integration
- **Caching**: Redis (optional)
- **PDF Generation**: PDFKit
- **Excel Export**: ExcelJS

## Database Schema

### PaymentVerification Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  booking: ObjectId (ref: Booking),
  monthNumber: Number,
  amount: Number,
  paymentMethod: String,
  transactionReference: String,
  paymentDate: Date,
  paymentProof: {
    url: String,
    filename: String,
    originalName: String,
    size: Number,
    mimetype: String,
    fileType: String
  },
  verificationStatus: String, // pending, approved, rejected, requires_clarification
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  adminNotes: String,
  rejectionReason: String,
  receiptUrl: String,
  receiptNumber: String,
  submittedAt: Date,
  userNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### PaymentConfiguration Model
```javascript
{
  _id: ObjectId,
  organizationName: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    sortCode: String,
    branch: String
  },
  mobilePayment: {
    mtn: {
      number: String,
      accountName: String,
      isActive: Boolean
    },
    airtel: {
      number: String,
      accountName: String,
      isActive: Boolean
    }
  },
  paymentInstructions: {
    general: String,
    bankTransfer: String,
    mobilePayment: String,
    cashPayment: String
  },
  isActive: Boolean,
  lastUpdatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### PaymentAuditLog Model
```javascript
{
  _id: ObjectId,
  paymentVerification: ObjectId (ref: PaymentVerification),
  booking: ObjectId (ref: Booking),
  performedBy: ObjectId (ref: User),
  action: String, // payment_submitted, payment_approved, etc.
  description: String,
  previousState: Object,
  newState: Object,
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    fileDetails: Object,
    exportDetails: Object
  },
  severity: String, // low, medium, high, critical
  category: String, // submission, verification, administration, etc.
  timestamp: Date,
  tags: [String]
}
```

## API Endpoints

### Authentication Middleware
```javascript
// JWT Authentication
const requireSignIn = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Admin Authorization
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
```

### User Endpoints

#### Submit Payment Proof
```javascript
POST /api/payments/submit-proof
Middleware: requireSignIn, uploadPaymentProof.single('paymentScreenshot')

Request Body (multipart/form-data):
- paymentScreenshot: File
- bookingId: String
- monthNumber: Number
- amount: Number
- paymentMethod: String
- transactionReference: String (optional)
- paymentDate: Date
- userNotes: String (optional)

Response:
{
  success: Boolean,
  message: String,
  paymentVerification: Object
}
```

#### Get Payment History
```javascript
GET /api/payments/history?bookingId=<id>
Middleware: requireSignIn

Response:
{
  success: Boolean,
  payments: Array,
  pagination: Object
}
```

### Admin Endpoints

#### Get Payment Verifications
```javascript
GET /api/payments/admin/verifications
Middleware: requireSignIn, isAdmin

Query Parameters:
- status: String (pending, approved, rejected, all)
- page: Number
- limit: Number
- sortBy: String
- sortOrder: String (asc, desc)
- paymentMethod: String
- minAmount: Number
- maxAmount: Number
- dateFilter: String

Response:
{
  success: Boolean,
  payments: Array,
  pagination: Object,
  totalCount: Number
}
```

#### Verify Payment
```javascript
POST /api/payments/admin/verify
Middleware: requireSignIn, isAdmin

Request Body:
{
  paymentId: String,
  action: String, // approve, reject, requires_clarification
  adminNotes: String
}

Response:
{
  success: Boolean,
  message: String,
  payment: Object
}
```

## File Upload System

### Configuration
```javascript
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'payments');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `payment_${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
```

### File Validation
```javascript
const validatePaymentProofFile = (file) => {
  const errors = [];
  
  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Only JPEG, PNG, and PDF files are allowed');
  }
  
  // Check file name
  if (file.originalname.length > 255) {
    errors.push('File name is too long');
  }
  
  return errors;
};
```

## Notification System

### Email Service
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};
```

### SMS Service
```javascript
// SMS service integration (example with Twilio)
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};
```

## Receipt Generation

### PDF Receipt Service
```javascript
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class PaymentReceiptService {
  static async generateReceipt(paymentVerification) {
    const doc = new PDFDocument({ margin: 50 });
    const receiptNumber = `MCAN-${paymentVerification._id.toString().slice(-8).toUpperCase()}`;
    const filename = `receipt_${receiptNumber}.pdf`;
    const filepath = path.join(process.cwd(), 'uploads', 'receipts', filename);

    // Ensure receipts directory exists
    const receiptDir = path.dirname(filepath);
    if (!fs.existsSync(receiptDir)) {
      fs.mkdirSync(receiptDir, { recursive: true });
    }

    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(filepath));

    // Add content to PDF
    this.addHeader(doc, receiptNumber);
    this.addOrganizationDetails(doc);
    this.addReceiptDetails(doc, paymentVerification);
    this.addPaymentDetails(doc, paymentVerification);
    this.addFooter(doc);

    doc.end();

    return { filename, filepath, receiptNumber };
  }
}
```

## Export System

### Excel Export
```javascript
import ExcelJS from 'exceljs';

class PaymentExportService {
  static async exportToExcel(filters, options) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payment Records');

    // Define columns
    worksheet.columns = [
      { header: 'Payment ID', key: 'paymentId', width: 15 },
      { header: 'User Name', key: 'userName', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      // ... more columns
    ];

    // Add data rows
    payments.forEach(payment => {
      worksheet.addRow({
        paymentId: payment._id.toString().slice(-8).toUpperCase(),
        userName: payment.user.name,
        amount: payment.amount,
        status: payment.verificationStatus
      });
    });

    // Save file
    const filename = `payment_export_${Date.now()}.xlsx`;
    const filepath = path.join(process.cwd(), 'uploads', 'exports', filename);
    await workbook.xlsx.writeFile(filepath);

    return { filename, filepath };
  }
}
```

## Security Implementation

### Input Validation
```javascript
import Joi from 'joi';

const paymentSubmissionSchema = Joi.object({
  bookingId: Joi.string().required(),
  monthNumber: Joi.number().integer().min(1).max(12).required(),
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('bank_transfer', 'mobile_money', 'cash', 'card', 'other').required(),
  transactionReference: Joi.string().optional(),
  paymentDate: Joi.date().required(),
  userNotes: Joi.string().max(500).optional()
});
```

### Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const paymentUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many payment uploads, please try again later'
});
```

## Deployment Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mcan_payment_system

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@mcan.org

# SMS (Twilio)
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=production
```

### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## Monitoring and Logging

### Application Logging
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring
```javascript
// Response time middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

## Testing Strategy

### Unit Tests
```javascript
import { expect } from 'chai';
import PaymentVerification from '../models/PaymentVerification.js';

describe('PaymentVerification Model', () => {
  it('should create a payment verification', async () => {
    const paymentData = {
      user: userId,
      booking: bookingId,
      monthNumber: 1,
      amount: 100000,
      paymentMethod: 'bank_transfer'
    };
    
    const payment = new PaymentVerification(paymentData);
    const savedPayment = await payment.save();
    
    expect(savedPayment._id).to.exist;
    expect(savedPayment.verificationStatus).to.equal('pending');
  });
});
```

### Integration Tests
```javascript
describe('Payment API', () => {
  it('should submit payment proof', async () => {
    const response = await request(app)
      .post('/api/payments/submit-proof')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('paymentScreenshot', 'test/fixtures/payment.jpg')
      .field('bookingId', bookingId)
      .field('monthNumber', 1)
      .field('amount', 100000)
      .field('paymentMethod', 'bank_transfer')
      .expect(200);
    
    expect(response.body.success).to.be.true;
  });
});
```

---

*This technical guide provides the foundation for understanding and maintaining the MCAN Payment System.*
