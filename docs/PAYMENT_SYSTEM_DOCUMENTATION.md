# MCAN Payment System Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Guide](#user-guide)
3. [Admin Guide](#admin-guide)
4. [API Documentation](#api-documentation)
5. [Technical Implementation](#technical-implementation)
6. [Troubleshooting](#troubleshooting)

## Overview

The MCAN Payment System is a comprehensive solution for managing accommodation payments with features including:

- **Payment Proof Submission**: Users can upload payment screenshots/receipts
- **Admin Verification**: Admins can approve/reject payment proofs
- **Payment Scheduling**: Automatic monthly payment schedules
- **Receipt Generation**: Automatic PDF receipt generation for approved payments
- **Audit Trail**: Complete tracking of all payment-related actions
- **Notifications**: Real-time notifications for payment events
- **Analytics**: Comprehensive payment analytics and reporting
- **Export Functionality**: Export payment data in Excel/CSV formats

## User Guide

### Submitting Payment Proof

1. **Navigate to My Bookings**
   - Go to the "My Bookings" page from the user dashboard
   - Find your accommodation booking

2. **Upload Payment Proof**
   - Click "Upload Payment Proof" for the relevant month
   - Fill in the payment details:
     - Payment Method (Bank Transfer, Mobile Money, etc.)
     - Transaction Reference (optional but recommended)
     - Payment Date
     - Additional Notes (optional)
   - Upload payment screenshot or PDF receipt
   - Click "Submit Payment Proof"

3. **Track Payment Status**
   - View payment status in your booking details
   - Receive notifications when payment is approved/rejected
   - Download receipt for approved payments

### Payment Methods Supported

- **Bank Transfer**: Direct bank transfers to MCAN account
- **Mobile Money**: MTN, Airtel, Glo mobile payments
- **Cash Payment**: In-person cash payments
- **Card Payment**: Debit/Credit card payments
- **Other**: Alternative payment methods

### Payment Schedule

- Payments are scheduled monthly based on your booking duration
- Each month has a specific due date
- Late payments may incur additional fees
- Payment reminders are sent before due dates

## Admin Guide

### Payment Verification Process

1. **Access Payment Verification**
   - Navigate to Admin Dashboard → Payment Verification
   - View pending payment proofs requiring review

2. **Review Payment Proof**
   - Click "View" to see payment details
   - Examine uploaded payment proof
   - Verify payment amount and method
   - Check transaction reference if provided

3. **Approve/Reject Payment**
   - Click "Approve" if payment is valid
   - Click "Reject" if payment is invalid or incomplete
   - Add admin notes explaining the decision
   - System automatically generates receipt for approved payments

### Advanced Filtering and Search

#### Basic Filters
- **Status Filter**: Pending, Approved, Rejected, All
- **Search**: Search by user name, accommodation, or transaction reference

#### Advanced Filters
- **Payment Method**: Filter by specific payment methods
- **Amount Range**: Set minimum and maximum amounts
- **Date Range**: Filter by submission or payment dates
- **Month Number**: Filter by specific payment months
- **Accommodation**: Filter by specific accommodations

#### Quick Filters
- **Today**: Payments submitted today
- **This Week**: Payments from current week
- **This Month**: Payments from current month
- **High Amount**: Payments above ₦100,000

### Payment Analytics

#### Dashboard Metrics
- Total payments processed
- Pending verifications count
- Approval/rejection rates
- Revenue analytics
- Payment method distribution

#### Export Options
- **Excel Export**: Comprehensive data with charts and summaries
- **CSV Export**: Raw data for external analysis
- **Custom Filters**: Export specific data sets

### Payment Configuration

1. **Access Payment Settings**
   - Navigate to Admin Dashboard → Payment Settings
   - Configure payment account details

2. **Bank Account Details**
   - Account Name
   - Account Number
   - Bank Name
   - Sort Code (if applicable)

3. **Mobile Money Details**
   - MTN Mobile Money number
   - Airtel Money number
   - Other mobile payment options

4. **Payment Instructions**
   - General payment instructions
   - Method-specific instructions
   - Important notes for users

## API Documentation

### Authentication
All API endpoints require authentication using Bearer tokens:
```
Authorization: Bearer <token>
```

### User Endpoints

#### Submit Payment Proof
```
POST /api/payments/submit-proof
Content-Type: multipart/form-data

Body:
- paymentScreenshot: File (image/PDF)
- bookingId: String
- monthNumber: Number
- amount: Number
- paymentMethod: String
- transactionReference: String (optional)
- paymentDate: Date
- userNotes: String (optional)
```

#### Get Payment History
```
GET /api/payments/history?bookingId=<bookingId>
```

#### Download Receipt
```
GET /api/payments/receipt/<paymentId>
```

### Admin Endpoints

#### Get Payment Verifications
```
GET /api/payments/admin/verifications?status=<status>&page=<page>&limit=<limit>
```

#### Verify Payment
```
POST /api/payments/admin/verify
Body:
{
  "paymentId": "string",
  "action": "approve|reject",
  "adminNotes": "string"
}
```

#### Export Payments
```
GET /api/payments/admin/export/excel?startDate=<date>&endDate=<date>&status=<status>
GET /api/payments/admin/export/csv?startDate=<date>&endDate=<date>&status=<status>
```

#### Get Payment Statistics
```
GET /api/payments/admin/statistics?days=<number>
```

#### Get Audit Trail
```
GET /api/payments/admin/audit/<paymentId>?page=<page>&limit=<limit>
```

### Payment Configuration Endpoints

#### Get Payment Details (Public)
```
GET /api/payment-config/details
```

#### Get Admin Configuration
```
GET /api/payment-config/admin/config
```

#### Update Configuration
```
PUT /api/payment-config/admin/update
Body:
{
  "bankDetails": {
    "accountName": "string",
    "accountNumber": "string",
    "bankName": "string"
  },
  "mobilePayment": {
    "mtn": { "number": "string", "accountName": "string" }
  }
}
```

## Technical Implementation

### Database Models

#### PaymentVerification
- User reference
- Booking reference
- Payment amount and method
- Verification status
- Payment proof file details
- Admin verification data
- Timestamps

#### PaymentConfiguration
- Bank account details
- Mobile payment details
- Payment instructions
- Admin settings

#### PaymentAuditLog
- Action tracking
- User activity logs
- System events
- Security monitoring

### File Upload System
- Supports images (JPG, PNG) and PDFs
- File size limit: 10MB
- Secure file storage
- Automatic file validation

### Notification System
- Real-time notifications
- Email notifications
- SMS notifications (for critical events)
- Admin alerts

### Security Features
- JWT authentication
- Role-based access control
- File upload validation
- Audit trail logging
- Rate limiting

## Troubleshooting

### Common Issues

#### Payment Proof Upload Fails
**Symptoms**: Upload button doesn't work or shows error
**Solutions**:
1. Check file size (must be under 10MB)
2. Ensure file format is supported (JPG, PNG, PDF)
3. Check internet connection
4. Try refreshing the page

#### Payment Not Showing as Approved
**Symptoms**: Payment approved by admin but still shows pending
**Solutions**:
1. Refresh the page
2. Check if payment was actually approved in admin panel
3. Contact admin if issue persists

#### Receipt Download Not Working
**Symptoms**: Receipt download link doesn't work
**Solutions**:
1. Ensure payment is approved
2. Check browser popup blocker
3. Try different browser
4. Contact admin if receipt wasn't generated

### Admin Troubleshooting

#### Payment Verification Page Loading Slowly
**Solutions**:
1. Use filters to reduce data load
2. Check server performance
3. Clear browser cache

#### Export Function Not Working
**Solutions**:
1. Check file permissions on server
2. Verify export directory exists
3. Check server disk space

#### Notifications Not Sending
**Solutions**:
1. Check email service configuration
2. Verify notification service is running
3. Check user email addresses

### Error Codes

- **400**: Bad Request - Invalid data submitted
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Internal Server Error - Server-side issue

### Support Contacts

For technical issues:
- Email: tech-support@mcan.org
- Phone: +234-XXX-XXX-XXXX

For payment-related queries:
- Email: payments@mcan.org
- Phone: +234-XXX-XXX-XXXX

### System Requirements

#### Client-side
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Stable internet connection

#### Server-side
- Node.js 18+
- MongoDB 5+
- Redis (for caching)
- File storage system
- Email service (SMTP)

### Backup and Recovery

- Daily database backups
- File storage backups
- Audit log retention (1 year)
- Disaster recovery procedures

---

*Last updated: [Current Date]*
*Version: 2.0*
