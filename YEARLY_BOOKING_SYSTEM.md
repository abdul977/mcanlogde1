# Yearly Accommodation Booking System

## Overview

The Yearly Accommodation Booking System is a comprehensive solution for managing long-term accommodation bookings with monthly payment schedules, automated reminders, and payment verification workflows.

## Key Features

### 🏠 **Accommodation Booking**
- **12-month maximum booking duration** with monthly payment schedules
- **Automatic end date calculation** based on start date and duration
- **Payment schedule generation** for each month of the booking
- **Total amount calculation** (monthly rate × duration)

### 💳 **Payment Management**
- **Monthly payment tracking** with due dates and status
- **Payment proof upload** with image validation (5MB limit)
- **Admin verification workflow** (approve/reject/clarification)
- **Payment receipt generation** with PDF download
- **Payment history tracking** for users and admins

### 🔔 **Automated Reminders**
- **Scheduled reminder system** with cron jobs
- **Multi-level escalation** (7, 14, 21, 30 days overdue)
- **Email notifications** with professional templates
- **In-app notifications** with action buttons
- **Late payment handling** with account suspension

### 📊 **Analytics & Reporting**
- **Payment collection rates** and trends
- **Overdue payment tracking** by severity levels
- **Revenue analytics** and performance metrics
- **Admin dashboard** with real-time statistics

### 📱 **User Experience**
- **Mobile-responsive design** for all interfaces
- **Payment dashboard** with visual progress tracking
- **Alert system** for due and overdue payments
- **Payment history** with receipt downloads

## System Architecture

### Backend Components

#### Models
- **Booking.js** - Enhanced with yearly booking support
- **PaymentVerification.js** - Payment proof storage and verification
- **PaymentReminder.js** - Automated reminder management
- **Notification.js** - In-app notification system

#### Services
- **reminderService.js** - Automated payment reminders
- **emailService.js** - Email notifications and templates
- **receiptService.js** - PDF receipt generation
- **latePaymentService.js** - Overdue payment handling

#### Controllers
- **Booking.js** - Enhanced booking creation with payment schedules
- **Payment.js** - Payment verification and management

### Frontend Components

#### User Interface
- **BookingConfirmation.jsx** - Yearly booking form with duration selector
- **PaymentDashboard.jsx** - User payment management interface
- **PaymentUploadModal.jsx** - Payment proof submission
- **PaymentAlerts.jsx** - Due/overdue payment notifications
- **PaymentHistory.jsx** - Complete payment history modal

#### Admin Interface
- **PaymentVerification.jsx** - Admin payment review dashboard
- **PaymentOverview.jsx** - Admin payment statistics overview
- **PaymentAnalytics.jsx** - Comprehensive analytics dashboard

## Installation & Setup

### 1. Dependencies

Install required packages:

```bash
# Backend dependencies
npm install node-cron nodemailer pdfkit multer

# Frontend dependencies (if not already installed)
npm install react-icons react-toastify axios
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./src/uploads

# System Configuration
BASE_URL=http://localhost:3000
```

### 3. Database Setup

Run the initialization script:

```bash
node server/src/scripts/initializeYearlyBookingSystem.js
```

This will:
- Create required database indexes
- Set up upload directories
- Initialize services
- Perform health checks

### 4. Service Startup

The reminder service starts automatically when the server starts. To manually control:

```javascript
import reminderService from './src/services/reminderService.js';

// Start services
reminderService.start();

// Stop services
reminderService.stop();

// Get status
const status = reminderService.getStatus();
```

## Usage Guide

### For Users

#### 1. Creating a Yearly Booking
1. Navigate to accommodation details
2. Click "Book Now"
3. Select booking duration (1-12 months)
4. Review payment schedule and total amount
5. Submit booking request

#### 2. Managing Payments
1. Go to "Payment Dashboard"
2. View payment schedule with due dates
3. Upload payment proof for due payments
4. Track payment status and history

#### 3. Payment Submission
1. Click "Upload Payment" for due month
2. Select payment method and date
3. Upload payment screenshot (JPG/PNG, max 5MB)
4. Add transaction reference and notes
5. Submit for admin verification

### For Admins

#### 1. Payment Verification
1. Go to "Payment Verification" in admin panel
2. Review submitted payment proofs
3. View payment screenshots and details
4. Approve or reject with notes

#### 2. Monitoring & Analytics
1. Access "Payment Overview" for quick stats
2. Use "Payment Analytics" for detailed insights
3. Monitor overdue payments and collection rates
4. Download reports and receipts

## API Endpoints

### User Endpoints
```
POST /api/bookings/create          # Create yearly booking
POST /api/payments/submit-proof    # Submit payment proof
GET  /api/payments/history         # Get payment history
```

### Admin Endpoints
```
GET  /api/payments/admin/verifications  # Get pending verifications
POST /api/payments/admin/verify         # Approve/reject payment
GET  /api/payments/admin/statistics     # Get payment statistics
GET  /api/payments/admin/analytics      # Get detailed analytics
```

## Configuration

### Reminder Schedule
- **Daily reminders**: 9:00 AM (due payments)
- **Weekly overdue check**: Monday 10:00 AM
- **Monthly generation**: 1st of month, 8:00 AM

### Escalation Levels
1. **7 days overdue**: Gentle reminder
2. **14 days overdue**: Firm reminder
3. **21 days overdue**: Final notice
4. **30 days overdue**: Account suspension

### File Upload Limits
- **Maximum file size**: 5MB
- **Allowed formats**: JPG, JPEG, PNG, GIF, WEBP
- **Storage location**: `/uploads/payments/screenshots/`

## Testing

Run the comprehensive test suite:

```bash
npm test server/src/tests/yearlyBookingSystem.test.js
```

Tests cover:
- Yearly booking creation
- Payment verification workflow
- Reminder system
- Analytics and statistics
- Error handling

## Troubleshooting

### Common Issues

#### 1. Email Service Not Working
- Check SMTP credentials in `.env`
- Verify email service configuration
- Test with Gmail app passwords

#### 2. File Upload Errors
- Ensure upload directories exist
- Check file size limits
- Verify file permissions

#### 3. Reminder Service Not Running
- Check cron job configuration
- Verify timezone settings
- Monitor service logs

#### 4. Database Performance
- Ensure indexes are created
- Monitor query performance
- Check connection limits

### Health Check

Run system health check:

```javascript
import YearlyBookingSystemInitializer from './src/scripts/initializeYearlyBookingSystem.js';

const initializer = new YearlyBookingSystemInitializer();
const status = await initializer.getSystemStatus();
console.log(status);
```

## Security Considerations

- **File validation**: All uploads are validated for type and size
- **Authentication**: All endpoints require valid JWT tokens
- **Authorization**: Admin endpoints restricted to admin users
- **Data sanitization**: All inputs are sanitized and validated
- **Rate limiting**: Consider implementing for file uploads

## Performance Optimization

- **Database indexes**: Optimized for common queries
- **File storage**: Organized directory structure
- **Caching**: Consider Redis for frequently accessed data
- **Background jobs**: Reminders run asynchronously

## Future Enhancements

- **SMS notifications** for critical reminders
- **Bulk payment processing** for multiple months
- **Payment plan customization** (bi-weekly, quarterly)
- **Integration with payment gateways** for direct payments
- **Advanced analytics** with charts and graphs

## Support

For technical support or questions about the yearly booking system:

1. Check the troubleshooting section
2. Review system logs for errors
3. Run the health check script
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatibility**: Node.js 16+, MongoDB 4.4+
