# API Documentation

This document provides comprehensive information about the MCAN Lodge mobile app's API integration and services.

## Base Configuration

- **Base URL**: `https://mcanlogde1.onrender.com`
- **API Version**: v1
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **Timeout**: 10 seconds

## Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "userpassword",
  "confirmPassword": "userpassword"
}
```

### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset code sent to email",
  "data": {
    "resetToken": "temp_token_for_verification"
  }
}
```

### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "resetToken": "temp_token_from_forgot_password"
}
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "newPassword": "newpassword",
  "confirmPassword": "newpassword",
  "resetToken": "verified_token_from_otp"
}
```

## User Management

### Get Profile
```http
GET /api/user/profile
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890",
  "address": "User Address"
}
```

## Accommodations

### Get Accommodations
```http
GET /api/accommodations
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string
- location: string
- priceMin: number
- priceMax: number
- amenities: string[] (comma-separated)
```

### Get Accommodation Details
```http
GET /api/accommodations/{id}
Authorization: Bearer {token}
```

### Book Accommodation
```http
POST /api/accommodations/{id}/book
Authorization: Bearer {token}
Content-Type: application/json

{
  "checkIn": "2024-01-15",
  "checkOut": "2024-01-20",
  "guests": 2,
  "specialRequests": "Late check-in"
}
```

## E-commerce

### Get Products
```http
GET /api/products
Authorization: Bearer {token}

Query Parameters:
- page: number
- limit: number
- category: string
- search: string
- priceMin: number
- priceMax: number
- sortBy: string (price, name, rating)
- sortOrder: string (asc, desc)
```

### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2,
  "variant": "size_or_color"
}
```

### Get Cart
```http
GET /api/cart
Authorization: Bearer {token}
```

### Checkout
```http
POST /api/cart/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "paymentMethod": "card",
  "paymentDetails": {
    "cardToken": "stripe_token"
  }
}
```

## Events

### Get Events
```http
GET /api/events
Authorization: Bearer {token}

Query Parameters:
- page: number
- limit: number
- category: string
- startDate: string (ISO date)
- endDate: string (ISO date)
- location: string
```

### Register for Event
```http
POST /api/events/{id}/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "attendees": 1,
  "specialRequests": "Dietary restrictions"
}
```

## Real-time Messaging

### WebSocket Connection
```javascript
// Connect to WebSocket
const socket = io('https://mcanlogde1.onrender.com', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Listen for messages
socket.on('message', (data) => {
  console.log('New message:', data);
});

// Send message
socket.emit('sendMessage', {
  recipientId: 'admin_id',
  message: 'Hello, I need help with my booking'
});
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Invalid or expired token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API**: 100 requests per minute
- **File uploads**: 10 requests per minute

## File Upload

### Upload Profile Picture
```http
POST /api/user/upload-avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- avatar: File (max 5MB, jpg/png)
```

## Prayer Times Integration

### Get Prayer Times
```http
GET /api/prayer-times
Authorization: Bearer {token}

Query Parameters:
- latitude: number
- longitude: number
- date: string (YYYY-MM-DD)
- method: string (calculation method)
```

## Push Notifications

### Register Device Token
```http
POST /api/notifications/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceToken": "expo_push_token",
  "platform": "ios" | "android"
}
```

### Notification Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingUpdates": true,
  "eventReminders": true,
  "promotions": false,
  "prayerTimes": true
}
```

## Data Synchronization

The mobile app maintains data synchronization with the web application through:

1. **Real-time Updates**: WebSocket connections for instant updates
2. **Offline Support**: Local caching with sync on reconnection
3. **Conflict Resolution**: Last-write-wins with user notification
4. **Background Sync**: Periodic data refresh when app is backgrounded

## Security Considerations

1. **Token Management**: JWT tokens with refresh mechanism
2. **Secure Storage**: Sensitive data stored using Expo SecureStore
3. **Biometric Authentication**: Local biometric verification for app access
4. **API Security**: HTTPS only, request signing for sensitive operations
5. **Data Encryption**: End-to-end encryption for sensitive user data

## Testing Endpoints

For development and testing, use the following test credentials:

```json
{
  "email": "test@mcan.org.ng",
  "password": "testpassword123"
}
```

**Note**: Test endpoints are available on the staging environment only.
