# MCAN Lodge - Exhaustive Technical Documentation

## Table of Contents
1. [Complete API Documentation](#complete-api-documentation)
2. [Database Schema Deep Dive](#database-schema-deep-dive)
3. [Frontend Architecture Analysis](#frontend-architecture-analysis)
4. [Mobile Application Deep Dive](#mobile-application-deep-dive)
5. [Business Logic & Validation Rules](#business-logic--validation-rules)
6. [Error Handling & Edge Cases](#error-handling--edge-cases)
7. [Security Implementation](#security-implementation)
8. [Performance Optimization](#performance-optimization)

---

## Complete API Documentation

### Authentication System (`/auth/api`)

#### POST /auth/api/register
**Purpose**: Register new user with NYSC details and Islamic community features
**Authentication**: None required
**Content-Type**: application/json

**Validation Rules**:
- `name`: Required, string, 2-50 characters, no special characters except spaces, hyphens, apostrophes
- `email`: Required, valid email format, unique in database, max 100 characters
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number
- `gender`: Optional, enum ["male", "female"], required for accommodation booking
- `stateCode`: Optional, string, uppercase, 2-3 characters (e.g., "LA", "AB", "FCT")
- `batch`: Optional, string, format "YYYY[A|B]" (e.g., "2024A", "2023B")
- `stream`: Optional, enum ["A", "B", "C"], NYSC stream designation
- `callUpNumber`: Optional, string, format "XX/YY[A|B]/NNNN" (e.g., "LA/24A/1234")
- `phone`: Optional, string, Nigerian phone format (+234XXXXXXXXXX)
- `institution`: Optional, string, 5-100 characters
- `course`: Optional, string, 3-100 characters

**Business Logic**:
1. Hash password using bcrypt with salt rounds 10
2. Generate unique user ID
3. Set default role as "user"
4. Initialize profileCompleted as false
5. Create user record in MongoDB
6. Do not auto-login (user must login separately)

**Request Example**:
```javascript
{
  "name": "Ahmed Ibrahim Musa",
  "email": "ahmed.musa@example.com",
  "password": "SecurePass123!",
  "gender": "male",
  "stateCode": "LA",
  "batch": "2024A",
  "stream": "A", 
  "callUpNumber": "LA/24A/1234",
  "phone": "+2348123456789",
  "institution": "University of Lagos",
  "course": "Computer Science"
}
```

**Success Response (201)**:
```javascript
{
  "success": true,
  "message": "User registered successfully. Please login to continue.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ahmed Ibrahim Musa",
    "email": "ahmed.musa@example.com",
    "role": "user",
    "profileCompleted": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
```javascript
// 400 - Validation Error
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email already exists",
    "password": "Password must contain at least one uppercase letter"
  }
}

// 400 - Missing Fields
{
  "success": false,
  "error": "All required fields must be provided",
  "missing": ["name", "email", "password"]
}

// 500 - Server Error
{
  "success": false,
  "error": "Server error during registration",
  "message": "Please try again later"
}
```

#### POST /auth/api/login
**Purpose**: Authenticate user and return JWT token with user data
**Authentication**: None required
**Rate Limiting**: 5 attempts per minute per IP

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required, min 6 characters

**Business Logic**:
1. Find user by email (case-insensitive)
2. Compare password using bcrypt
3. Generate JWT token with 7-day expiration
4. Include user ID, role in token payload
5. Return user data (excluding password)
6. Log successful login attempt

**Request Example**:
```javascript
{
  "email": "ahmed.musa@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200)**:
```javascript
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA1MzE0NjAwLCJleHAiOjE3MDU5MTk0MDB9.signature",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ahmed Ibrahim Musa",
    "email": "ahmed.musa@example.com",
    "role": "user",
    "gender": "male",
    "stateCode": "LA",
    "batch": "2024A",
    "stream": "A",
    "callUpNumber": "LA/24A/1234",
    "phone": "+2348123456789",
    "institution": "University of Lagos",
    "course": "Computer Science",
    "profileImage": null,
    "profileCompleted": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
```javascript
// 400 - Missing Fields
{
  "success": false,
  "error": "Email and password are required"
}

// 401 - Invalid Credentials
{
  "success": false,
  "error": "Invalid email or password"
}

// 429 - Rate Limit Exceeded
{
  "success": false,
  "error": "Too many login attempts. Please try again later."
}

// 500 - Server Error
{
  "success": false,
  "error": "Server error during authentication"
}
```

#### GET /auth/api/user
**Purpose**: Get current user information from JWT token
**Authentication**: Bearer token required
**Headers**: `Authorization: Bearer <jwt_token>`

**Business Logic**:
1. Extract and verify JWT token
2. Find user by ID from token payload
3. Return user data excluding password
4. Include computed fields (displayAvatar, nyscDetails)

**Success Response (200)**:
```javascript
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ahmed Ibrahim Musa",
    "email": "ahmed.musa@example.com",
    "role": "user",
    "gender": "male",
    "stateCode": "LA",
    "batch": "2024A",
    "stream": "A",
    "callUpNumber": "LA/24A/1234",
    "phone": "+2348123456789",
    "dateOfBirth": "1998-05-15T00:00:00.000Z",
    "institution": "University of Lagos",
    "course": "Computer Science",
    "profileImage": "https://supabase.url/user-profiles/image.jpg",
    "avatar": null,
    "displayAvatar": "https://supabase.url/user-profiles/image.jpg",
    "initials": "AIM",
    "profileCompleted": true,
    "nyscDetails": {
      "gender": "male",
      "stateCode": "LA",
      "batch": "2024A",
      "stream": "A",
      "callUpNumber": "LA/24A/1234",
      "isComplete": true
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:22:00.000Z"
  }
}
```

#### PUT /auth/api/profile
**Purpose**: Update user profile information
**Authentication**: Bearer token required
**Content-Type**: application/json

**Updatable Fields**:
- `name`: String, 2-50 characters
- `phone`: String, valid phone format
- `gender`: Enum ["male", "female"]
- `stateCode`: String, uppercase, 2-3 characters
- `batch`: String, format "YYYY[A|B]"
- `stream`: Enum ["A", "B", "C"]
- `callUpNumber`: String, format "XX/YY[A|B]/NNNN"
- `dateOfBirth`: Date, must be 18+ years old
- `institution`: String, 5-100 characters
- `course`: String, 3-100 characters

**Business Logic**:
1. Validate all provided fields
2. Check if email change is allowed (admin only)
3. Update only provided fields
4. Recalculate profileCompleted status
5. Update updatedAt timestamp
6. Return updated user data

**Request Example**:
```javascript
{
  "name": "Ahmed Ibrahim Musa Al-Rashid",
  "phone": "+2348123456789",
  "dateOfBirth": "1998-05-15",
  "institution": "University of Lagos",
  "course": "Computer Science and Engineering"
}
```

#### PUT /auth/api/profile/picture
**Purpose**: Upload and update user profile picture
**Authentication**: Bearer token required
**Content-Type**: multipart/form-data
**File Upload**: Uses express-fileupload middleware

**Validation Rules**:
- File type: image/jpeg, image/png, image/webp
- File size: Max 5MB
- Image dimensions: Min 100x100px, Max 2000x2000px
- File name: Sanitized and UUID-prefixed

**Business Logic**:
1. Validate uploaded file
2. Generate unique filename with UUID
3. Upload to Supabase Storage bucket 'user-profiles'
4. Update user profileImage field with public URL
5. Delete old profile image if exists
6. Return updated user data

**Request**: Form data with 'profileImage' file field

**Success Response (200)**:
```javascript
{
  "success": true,
  "message": "Profile picture updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "profileImage": "https://supabase.url/user-profiles/uuid-image.jpg",
    "displayAvatar": "https://supabase.url/user-profiles/uuid-image.jpg",
    "updatedAt": "2024-01-16T14:22:00.000Z"
  }
}
```

#### POST /api/post/create-post
**Purpose**: Create new accommodation listing (Admin only)
**Authentication**: Bearer token + admin role required
**Content-Type**: multipart/form-data (for image uploads)

**Validation Rules**:
- `title`: Required, string, 10-200 characters, unique
- `description`: Required, string, 50-2000 characters
- `location`: Required, string, 5-100 characters
- `price`: Required, number, min 5000, max 200000 (monthly rent in Naira)
- `accommodationType`: Required, enum ["private_room", "shared_room", "studio", "apartment", "hostel"]
- `genderRestriction`: Required, enum ["male", "female", "mixed"]
- `guest`: Required, number, min 1, max 50 (maximum occupancy)
- `facilities`: Array of strings, max 30 items
- `nearArea`: Array of strings, max 20 items
- `mosqueProximity`: Number, min 0, max 10000 (meters)
- `prayerFacilities`: Boolean, default true
- `maxBookings`: Required, number, min 1, max 200
- `category`: Required, valid category ObjectId
- `images`: Array of image files, min 3, max 10, each max 5MB

**Business Logic**:
1. Validate admin permissions
2. Check title uniqueness
3. Generate URL-friendly slug from title
4. Upload images to Supabase Storage 'accommodation-images' bucket
5. Create accommodation record with image URLs
6. Initialize booking statistics
7. Send notification to other admins
8. Index for search functionality

**Request Example** (multipart/form-data):
```javascript
{
  "title": "Baitul Hikmah Lodge - Female Section",
  "description": "Premium Islamic accommodation for female NYSC corps members featuring spacious rooms, dedicated prayer area, halal kitchen facilities, and 24/7 female security. Located in a safe neighborhood with easy access to Islamic centers and markets.",
  "location": "Victoria Island, Lagos State",
  "price": 35000,
  "accommodationType": "private_room",
  "genderRestriction": "female",
  "guest": 2,
  "facilities": [
    "Private Bathroom",
    "Air Conditioning",
    "WiFi Internet",
    "Prayer Room (Musallah)",
    "Halal Kitchen",
    "Female Security",
    "Laundry Service",
    "Study Area",
    "Parking",
    "CCTV Surveillance"
  ],
  "nearArea": [
    "Central Mosque (150m)",
    "Islamic Center (300m)",
    "Halal Restaurant (200m)",
    "Shopping Mall (500m)",
    "Hospital (800m)",
    "NYSC Secretariat (3km)"
  ],
  "mosqueProximity": 150,
  "prayerFacilities": true,
  "maxBookings": 15,
  "category": "507f1f77bcf86cd799439013",
  "images": [File1, File2, File3, File4, File5] // Image files
}
```

**Success Response (201)**:
```javascript
{
  "success": true,
  "message": "Accommodation created successfully",
  "accommodation": {
    "id": "507f1f77bcf86cd799439014",
    "title": "Baitul Hikmah Lodge - Female Section",
    "slug": "baitul-hikmah-lodge-female-section",
    "location": "Victoria Island, Lagos State",
    "price": 35000,
    "accommodationType": "private_room",
    "genderRestriction": "female",
    "isAvailable": true,
    "maxBookings": 15,
    "currentBookings": 0,
    "images": [
      "https://supabase.url/accommodation-images/uuid1-image1.jpg",
      "https://supabase.url/accommodation-images/uuid2-image2.jpg",
      "https://supabase.url/accommodation-images/uuid3-image3.jpg"
    ],
    "createdAt": "2024-01-16T15:30:00.000Z"
  }
}
```

### Booking Routes (`/api/bookings`)

#### POST /api/bookings/create
**Purpose**: Create comprehensive booking request with payment scheduling
**Authentication**: Bearer token required
**Content-Type**: application/json

**Validation Rules**:
- `bookingType`: Required, enum ["accommodation", "program", "lecture", "event"]
- `accommodationId`: Required if bookingType="accommodation", valid ObjectId
- `programId`: Required if bookingType in ["program", "lecture", "event"], valid ObjectId
- `programModel`: Required if programId provided, enum ["QuranClass", "Lecture", "Event"]
- `checkInDate`: Required for accommodation, date, min 7 days from now
- `checkOutDate`: Required for accommodation, date, min 30 days after checkInDate
- `numberOfGuests`: Required, number, min 1, max accommodation.guest
- `contactInfo`: Required object with phone and emergencyContact
- `userNotes`: Optional, string, max 500 characters
- `enrollmentDetails`: Optional for programs, object with experience/expectations

**Business Logic Flow**:
1. **Authentication Check**: Verify user token and extract user ID
2. **Duplicate Booking Check**: Ensure user doesn't have pending/approved booking for same accommodation
3. **Availability Check**: Verify accommodation has available slots (currentBookings < maxBookings)
4. **Date Validation**: Ensure check-in is future date, checkout is after check-in, minimum 30-day stay
5. **Guest Capacity Check**: Verify numberOfGuests doesn't exceed accommodation capacity
6. **Payment Schedule Generation**: Create monthly payment installments based on duration
7. **Booking Creation**: Create booking record with "pending" status
8. **Admin Notification**: Send real-time notification to all admins via Socket.io
9. **Payment Reminder Setup**: Schedule first payment reminder
10. **Accommodation Stats Update**: Increment pending booking count

**Request Example**:
```javascript
{
  "bookingType": "accommodation",
  "accommodationId": "507f1f77bcf86cd799439012",
  "checkInDate": "2024-02-15",
  "checkOutDate": "2024-12-15",
  "numberOfGuests": 1,
  "contactInfo": {
    "phone": "+2348123456789",
    "emergencyContact": {
      "name": "Fatima Ibrahim Musa",
      "phone": "+2348987654321",
      "relationship": "Sister"
    }
  },
  "userNotes": "I would prefer a room close to the prayer area. I am a quiet person and prefer a peaceful environment for my studies."
}
```

**Success Response (201)**:
```javascript
{
  "success": true,
  "message": "Booking request submitted successfully. You will receive a notification once reviewed by our admin team.",
  "booking": {
    "id": "507f1f77bcf86cd799439015",
    "bookingType": "accommodation",
    "status": "pending",
    "requestDate": "2024-01-16T15:45:00.000Z",
    "checkInDate": "2024-02-15T00:00:00.000Z",
    "checkOutDate": "2024-12-15T00:00:00.000Z",
    "bookingDuration": 304, // days
    "totalAmount": 250000, // 10 months * 25000
    "numberOfGuests": 1,
    "paymentSchedule": [
      {
        "monthNumber": 1,
        "dueDate": "2024-02-01T00:00:00.000Z",
        "amount": 25000,
        "status": "pending",
        "description": "First month payment (February 2024)"
      },
      {
        "monthNumber": 2,
        "dueDate": "2024-03-01T00:00:00.000Z",
        "amount": 25000,
        "status": "pending",
        "description": "Second month payment (March 2024)"
      },
      {
        "monthNumber": 3,
        "dueDate": "2024-04-01T00:00:00.000Z",
        "amount": 25000,
        "status": "pending",
        "description": "Third month payment (April 2024)"
      }
      // ... continues for all 10 months
    ],
    "contactInfo": {
      "phone": "+2348123456789",
      "emergencyContact": {
        "name": "Fatima Ibrahim Musa",
        "phone": "+2348987654321",
        "relationship": "Sister"
      }
    },
    "userNotes": "I would prefer a room close to the prayer area. I am a quiet person and prefer a peaceful environment for my studies.",
    "accommodation": {
      "id": "507f1f77bcf86cd799439012",
      "title": "Al-Noor Islamic Lodge - Male Section",
      "location": "Ikeja, Lagos State",
      "price": 25000,
      "accommodationType": "shared_room",
      "genderRestriction": "male",
      "images": ["https://supabase.url/accommodation-images/image1.jpg"]
    },
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Ahmed Ibrahim Musa",
      "email": "ahmed.musa@example.com",
      "phone": "+2348123456789",
      "nyscDetails": {
        "stateCode": "LA",
        "batch": "2024A",
        "stream": "A",
        "callUpNumber": "LA/24A/1234"
      }
    },
    "nextAction": {
      "step": "admin_review",
      "description": "Your booking is pending admin review. You will be notified within 24-48 hours.",
      "estimatedTime": "24-48 hours"
    }
  }
}
```

**Error Responses**:
```javascript
// 400 - Validation Error
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "checkInDate": "Check-in date must be at least 7 days from now",
    "numberOfGuests": "Number of guests exceeds accommodation capacity"
  }
}

// 403 - Booking Limit Exceeded
{
  "success": false,
  "error": "Booking limit exceeded",
  "message": "This accommodation has reached its maximum booking capacity. Please choose another accommodation.",
  "availableAlternatives": [
    {
      "id": "alternative_id_1",
      "title": "Similar accommodation nearby",
      "location": "Ikeja, Lagos State",
      "price": 27000,
      "availableSlots": 3
    }
  ]
}

// 409 - Duplicate Booking
{
  "success": false,
  "error": "Duplicate booking detected",
  "message": "You already have a pending or approved booking for this accommodation.",
  "existingBooking": {
    "id": "existing_booking_id",
    "status": "pending",
    "requestDate": "2024-01-10T10:00:00.000Z"
  }
}
```

#### GET /api/bookings/my-bookings
**Purpose**: Get user's booking history with detailed information
**Authentication**: Bearer token required

**Query Parameters**:
- `status`: Filter by status ["pending", "approved", "rejected", "cancelled"]
- `bookingType`: Filter by type ["accommodation", "program", "lecture", "event"]
- `page`: Page number, default 1
- `limit`: Items per page, default 10, max 50
- `sort`: Sort field ["requestDate", "checkInDate", "status"], default "requestDate"
- `order`: Sort order ["asc", "desc"], default "desc"

**Business Logic**:
1. Extract user ID from JWT token
2. Build filter query based on parameters
3. Populate accommodation and program details
4. Include payment schedule and verification status
5. Calculate booking statistics
6. Paginate results

**Success Response (200)**:
```javascript
{
  "success": true,
  "message": "User bookings retrieved successfully",
  "bookings": [
    {
      "id": "507f1f77bcf86cd799439015",
      "bookingType": "accommodation",
      "status": "approved",
      "requestDate": "2024-01-16T15:45:00.000Z",
      "approvedDate": "2024-01-17T09:30:00.000Z",
      "checkInDate": "2024-02-15T00:00:00.000Z",
      "checkOutDate": "2024-12-15T00:00:00.000Z",
      "totalAmount": 250000,
      "paidAmount": 50000,
      "pendingAmount": 200000,
      "paymentStatus": "partial",
      "accommodation": {
        "id": "507f1f77bcf86cd799439012",
        "title": "Al-Noor Islamic Lodge - Male Section",
        "location": "Ikeja, Lagos State",
        "price": 25000,
        "images": ["https://supabase.url/accommodation-images/image1.jpg"]
      },
      "paymentSchedule": [
        {
          "monthNumber": 1,
          "dueDate": "2024-02-01T00:00:00.000Z",
          "amount": 25000,
          "status": "paid",
          "paidDate": "2024-01-28T14:20:00.000Z",
          "paymentProof": {
            "id": "payment_proof_id",
            "status": "verified",
            "verifiedDate": "2024-01-29T10:15:00.000Z"
          }
        },
        {
          "monthNumber": 2,
          "dueDate": "2024-03-01T00:00:00.000Z",
          "amount": 25000,
          "status": "paid",
          "paidDate": "2024-02-25T16:45:00.000Z",
          "paymentProof": {
            "id": "payment_proof_id_2",
            "status": "verified",
            "verifiedDate": "2024-02-26T11:30:00.000Z"
          }
        },
        {
          "monthNumber": 3,
          "dueDate": "2024-04-01T00:00:00.000Z",
          "amount": 25000,
          "status": "pending",
          "daysUntilDue": 15
        }
      ],
      "nextPayment": {
        "amount": 25000,
        "dueDate": "2024-04-01T00:00:00.000Z",
        "daysUntilDue": 15,
        "isOverdue": false
      },
      "adminNotes": "Booking approved. Welcome to MCAN Lodge!",
      "canCancel": true,
      "canModify": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 5,
    "itemsPerPage": 10
  },
  "summary": {
    "totalBookings": 5,
    "pendingBookings": 1,
    "approvedBookings": 3,
    "rejectedBookings": 1,
    "totalAmountPaid": 125000,
    "totalAmountPending": 375000
  }
}
```

### Payment Routes (`/api/payments`)

#### POST /api/payments/upload
**Purpose**: Upload payment proof for booking verification
**Authentication**: Bearer token required
**Content-Type**: multipart/form-data

**Validation Rules**:
- `booking`: Required, valid booking ObjectId that belongs to user
- `amount`: Required, number, must match payment schedule amount
- `paymentMethod`: Required, enum ["bank_transfer", "pos", "mobile_money", "cash"]
- `monthNumber`: Required, number, must match payment schedule
- `proofOfPayment`: Required, image file (jpg, png, pdf), max 10MB
- `paymentReference`: Optional, string, bank reference number
- `paymentDate`: Optional, date, defaults to current date
- `notes`: Optional, string, max 200 characters

**Business Logic**:
1. Verify booking belongs to authenticated user
2. Check if payment for this month already exists
3. Validate amount matches payment schedule
4. Upload proof file to Supabase Storage 'payment-proofs' bucket
5. Create PaymentVerification record with "pending" status
6. Update booking payment schedule status to "submitted"
7. Send notification to admins for verification
8. Return payment tracking information

**Request Example** (multipart/form-data):
```javascript
{
  "booking": "507f1f77bcf86cd799439015",
  "amount": 25000,
  "paymentMethod": "bank_transfer",
  "monthNumber": 3,
  "paymentReference": "TXN123456789",
  "paymentDate": "2024-03-28",
  "notes": "Payment for March 2024 - Bank transfer via GTBank",
  "proofOfPayment": File // Image/PDF file
}
```

**Success Response (201)**:
```javascript
{
  "success": true,
  "message": "Payment proof uploaded successfully. Your payment will be verified within 24 hours.",
  "payment": {
    "id": "507f1f77bcf86cd799439016",
    "booking": "507f1f77bcf86cd799439015",
    "amount": 25000,
    "paymentMethod": "bank_transfer",
    "monthNumber": 3,
    "status": "pending",
    "paymentReference": "TXN123456789",
    "paymentDate": "2024-03-28T00:00:00.000Z",
    "proofOfPayment": "https://supabase.url/payment-proofs/uuid-proof.jpg",
    "notes": "Payment for March 2024 - Bank transfer via GTBank",
    "submittedAt": "2024-03-28T14:30:00.000Z",
    "estimatedVerificationTime": "24 hours",
    "trackingNumber": "PAY-2024-0328-001"
  }
}
```

#### PUT /api/payments/:id/verify
**Purpose**: Verify payment proof (Admin only)
**Authentication**: Bearer token + admin role required
**Content-Type**: application/json

**Validation Rules**:
- `status`: Required, enum ["verified", "rejected"]
- `notes`: Optional, string, max 500 characters (required if rejected)
- `verificationDate`: Optional, date, defaults to current date

**Business Logic**:
1. Verify admin permissions
2. Find payment verification record
3. Update payment status and verification details
4. If verified: Update booking payment schedule to "paid"
5. If rejected: Update booking payment schedule back to "pending"
6. Send notification to user about verification result
7. Update booking payment statistics
8. Log admin action for audit trail

**Request Example**:
```javascript
{
  "status": "verified",
  "notes": "Payment verified successfully. Bank transfer confirmed.",
  "verificationDate": "2024-03-29T10:15:00.000Z"
}
```

**Success Response (200)**:
```javascript
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "id": "507f1f77bcf86cd799439016",
    "status": "verified",
    "verifiedBy": {
      "id": "admin_id",
      "name": "Admin Name",
      "email": "admin@mcan.com"
    },
    "verificationDate": "2024-03-29T10:15:00.000Z",
    "notes": "Payment verified successfully. Bank transfer confirmed.",
    "verificationTime": "19 hours 45 minutes"
  },
  "booking": {
    "id": "507f1f77bcf86cd799439015",
    "paidAmount": 75000,
    "pendingAmount": 175000,
    "paymentStatus": "partial",
    "nextPayment": {
      "amount": 25000,
      "dueDate": "2024-05-01T00:00:00.000Z",
      "monthNumber": 4
    }
  }
}
```

### Product Routes (`/api/products`)

#### GET /api/products
**Purpose**: Get products with advanced filtering and search
**Authentication**: None required

**Query Parameters**:
- `page`: Number, default 1
- `limit`: Number, default 12, max 50
- `category`: String, category slug or ID
- `search`: String, text search in name and description
- `minPrice`: Number, minimum price filter
- `maxPrice`: Number, maximum price filter
- `tags`: Comma-separated string of tags
- `sort`: Enum ["price", "rating", "newest", "popular"], default "newest"
- `order`: Enum ["asc", "desc"], default "desc"
- `inStock`: Boolean, only show products in stock

**Business Logic**:
1. Build MongoDB aggregation pipeline
2. Apply category, price, and tag filters
3. Implement text search across name and description
4. Filter by stock availability if requested
5. Sort by specified criteria
6. Paginate results
7. Include category information and stock status

**Success Response (200)**:
```javascript
{
  "success": true,
  "message": "Products retrieved successfully",
  "products": [
    {
      "id": "507f1f77bcf86cd799439017",
      "name": "Sahih Al-Bukhari - Complete Collection",
      "description": "Complete collection of Sahih Al-Bukhari hadith in English and Arabic. High-quality hardcover edition with detailed commentary and references.",
      "price": 15000,
      "originalPrice": 18000,
      "discount": 16.67,
      "category": {
        "id": "category_id",
        "name": "Islamic Books",
        "slug": "islamic-books"
      },
      "images": [
        "https://supabase.url/product-images/bukhari-1.jpg",
        "https://supabase.url/product-images/bukhari-2.jpg"
      ],
      "stock": 25,
      "inStock": true,
      "status": "active",
      "tags": ["hadith", "bukhari", "islamic", "books", "english", "arabic"],
      "rating": 4.8,
      "reviewCount": 34,
      "salesCount": 127,
      "slug": "sahih-al-bukhari-complete-collection",
      "specifications": {
        "pages": 2847,
        "language": "English/Arabic",
        "publisher": "Darussalam",
        "binding": "Hardcover",
        "dimensions": "24cm x 17cm x 15cm",
        "weight": "3.2kg"
      },
      "shipping": {
        "weight": 3200, // grams
        "dimensions": {
          "length": 24,
          "width": 17,
          "height": 15
        },
        "freeShipping": true,
        "estimatedDelivery": "3-5 business days"
      },
      "createdAt": "2024-01-10T12:00:00.000Z",
      "updatedAt": "2024-01-15T16:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 12,
    "totalItems": 143,
    "itemsPerPage": 12
  },
  "filters": {
    "applied": {
      "category": "islamic-books",
      "minPrice": 10000,
      "maxPrice": 20000,
      "inStock": true
    },
    "available": {
      "categories": [
        { "name": "Islamic Books", "slug": "islamic-books", "count": 89 },
        { "name": "Prayer Items", "slug": "prayer-items", "count": 34 },
        { "name": "Islamic Clothing", "slug": "islamic-clothing", "count": 67 }
      ],
      "priceRange": {
        "min": 500,
        "max": 50000,
        "average": 8500
      },
      "tags": [
        { "name": "books", "count": 89 },
        { "name": "prayer", "count": 45 },
        { "name": "clothing", "count": 67 }
      ]
    }
  }
}
```

#### POST /api/products/create
**Purpose**: Create new product (Admin only)
**Authentication**: Bearer token + admin role required
**Content-Type**: multipart/form-data

**Validation Rules**:
- `name`: Required, string, 5-200 characters, unique
- `description`: Required, string, 50-2000 characters
- `price`: Required, number, min 100, max 1000000
- `category`: Required, valid category ObjectId
- `stock`: Required, number, min 0, max 10000
- `tags`: Array of strings, max 20 items
- `specifications`: Optional object with product details
- `images`: Array of image files, min 1, max 8, each max 5MB

**Business Logic**:
1. Validate admin permissions
2. Check product name uniqueness
3. Generate URL-friendly slug
4. Upload images to Supabase Storage 'product-images' bucket
5. Create product record with image URLs
6. Initialize stock and sales counters
7. Index for search functionality
8. Send notification about new product

**Request Example** (multipart/form-data):
```javascript
{
  "name": "Premium Prayer Mat - Turkish Design",
  "description": "Beautiful handwoven prayer mat with traditional Turkish patterns. Made from high-quality materials with soft texture and durable construction. Perfect for daily prayers and special occasions.",
  "price": 8500,
  "category": "prayer_items_category_id",
  "stock": 50,
  "tags": ["prayer", "mat", "turkish", "handwoven", "premium"],
  "specifications": {
    "material": "100% Cotton",
    "dimensions": "120cm x 80cm",
    "thickness": "8mm",
    "weight": "800g",
    "origin": "Turkey",
    "washable": true
  },
  "shipping": {
    "weight": 800,
    "freeShipping": false,
    "shippingCost": 1500
  },
  "images": [File1, File2, File3] // Image files
}
```

**Success Response (201)**:
```javascript
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "507f1f77bcf86cd799439018",
    "name": "Premium Prayer Mat - Turkish Design",
    "slug": "premium-prayer-mat-turkish-design",
    "price": 8500,
    "stock": 50,
    "status": "active",
    "images": [
      "https://supabase.url/product-images/uuid1-mat1.jpg",
      "https://supabase.url/product-images/uuid2-mat2.jpg",
      "https://supabase.url/product-images/uuid3-mat3.jpg"
    ],
    "createdAt": "2024-01-16T16:45:00.000Z"
  }
}
```

### Community Routes (`/api/communities`)

#### GET /api/communities
**Purpose**: Get all communities with member counts and activity stats
**Authentication**: None required

**Query Parameters**:
- `page`: Number, default 1
- `limit`: Number, default 10, max 50
- `category`: String, filter by community category
- `search`: String, search in name and description
- `isPrivate`: Boolean, filter by privacy setting
- `sort`: Enum ["members", "activity", "newest"], default "members"

**Success Response (200)**:
```javascript
{
  "success": true,
  "communities": [
    {
      "id": "507f1f77bcf86cd799439019",
      "name": "Lagos NYSC Muslims",
      "description": "Community for NYSC corps members serving in Lagos State. Share experiences, find accommodation, and connect with fellow Muslim corps members.",
      "category": "NYSC",
      "isPrivate": false,
      "memberCount": 234,
      "activeMembers": 89,
      "image": "https://supabase.url/community-images/lagos-nysc.jpg",
      "rules": "1. Be respectful to all members\n2. No spam or promotional content\n3. Keep discussions relevant to NYSC and Islamic topics",
      "slug": "lagos-nysc-muslims",
      "stats": {
        "totalPosts": 156,
        "totalMessages": 1247,
        "weeklyActivity": 45,
        "lastActivity": "2024-01-16T14:30:00.000Z"
      },
      "admins": [
        {
          "id": "admin_id_1",
          "name": "Amina Hassan",
          "role": "Community Admin"
        }
      ],
      "createdAt": "2023-08-15T10:00:00.000Z",
      "canJoin": true,
      "requiresApproval": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 28
  }
}
```

#### POST /api/communities/:id/join
**Purpose**: Join a community
**Authentication**: Bearer token required

**Business Logic**:
1. Check if user is already a member
2. If private community, create join request
3. If public community, add user immediately
4. Send notification to community admins
5. Update member count

**Success Response (200)**:
```javascript
{
  "success": true,
  "message": "Successfully joined community",
  "membership": {
    "communityId": "507f1f77bcf86cd799439019",
    "userId": "507f1f77bcf86cd799439011",
    "joinedAt": "2024-01-16T16:50:00.000Z",
    "role": "member",
    "status": "active"
  }
}
```

---

## Database Schema Deep Dive

### User Model (`server/src/models/User.js`)

**Complete Schema Definition**:
```javascript
const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s\-']+$/.test(v);
      },
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    },
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never return password in queries
  },

  // Role and Permissions
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'super_admin'],
      message: 'Role must be either user, admin, or super_admin'
    },
    default: 'user',
    index: true
  },

  // Profile Information
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\+234[789][01]\d{8}$/.test(v);
      },
      message: 'Please enter a valid Nigerian phone number (+234XXXXXXXXXX)'
    }
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        const age = (Date.now() - v.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 16 && age <= 100;
      },
      message: 'Age must be between 16 and 100 years'
    }
  },

  // NYSC-Specific Fields
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be either male or female'
    },
    required: function() {
      return this.role === 'user'; // Required for regular users
    },
    index: true
  },
  stateCode: {
    type: String,
    uppercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        const validStates = ['AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BE', 'BO', 'CR', 'DE', 'EB', 'ED', 'EK', 'EN', 'FC', 'GO', 'IM', 'JI', 'KD', 'KN', 'KT', 'KE', 'KO', 'KW', 'LA', 'NA', 'NI', 'OG', 'ON', 'OS', 'OY', 'PL', 'RI', 'SO', 'TA', 'YO', 'ZA'];
        return validStates.includes(v);
      },
      message: 'Please enter a valid Nigerian state code'
    },
    index: true
  },
  batch: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^20\d{2}[AB]$/.test(v);
      },
      message: 'Batch must be in format YYYYA or YYYYB (e.g., 2024A)'
    },
    index: true
  },
  stream: {
    type: String,
    enum: {
      values: ['A', 'B', 'C'],
      message: 'Stream must be A, B, or C'
    }
  },
  callUpNumber: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[A-Z]{2,3}\/\d{2}[AB]\/\d{4}$/.test(v);
      },
      message: 'Call-up number must be in format XX/YYA/NNNN or XXX/YYB/NNNN'
    },
    unique: true,
    sparse: true, // Allow multiple null values
    index: true
  },

  // Educational Information
  institution: {
    type: String,
    trim: true,
    minlength: [5, 'Institution name must be at least 5 characters'],
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  course: {
    type: String,
    trim: true,
    minlength: [3, 'Course name must be at least 3 characters'],
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },

  // Profile Media
  profileImage: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Profile image must be a valid image URL'
    }
  },
  avatar: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Avatar must be a valid image URL'
    }
  },

  // Profile Completion Status
  profileCompleted: {
    type: Boolean,
    default: false,
    index: true
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },

  // Password Reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },

  // Login Tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },

  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showContact: { type: Boolean, default: false }
    },
    language: {
      type: String,
      enum: ['en', 'ar', 'ha'],
      default: 'en'
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual Fields
userSchema.virtual('displayAvatar').get(function() {
  return this.profileImage || this.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random`;
});

userSchema.virtual('initials').get(function() {
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3);
});

userSchema.virtual('nyscDetails').get(function() {
  return {
    gender: this.gender,
    stateCode: this.stateCode,
    batch: this.batch,
    stream: this.stream,
    callUpNumber: this.callUpNumber,
    isComplete: !!(this.gender && this.stateCode && this.batch && this.stream && this.callUpNumber)
  };
});

userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
});

// Indexes for Performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ gender: 1, stateCode: 1, batch: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ 'preferences.notifications.email': 1 });

// Pre-save Middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Update profile completion status
  this.profileCompleted = !!(
    this.name && this.email && this.gender &&
    this.stateCode && this.batch && this.stream &&
    this.callUpNumber && this.phone && this.institution && this.course
  );

  next();
});

// Instance Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.updateLoginStats = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save({ validateBeforeSave: false });
};
```

### Booking Model (`server/src/models/Booking.js`)

**Complete Schema Definition**:
```javascript
const bookingSchema = new mongoose.Schema({
  // Basic Booking Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },

  // Booking Type and Target
  bookingType: {
    type: String,
    enum: {
      values: ['accommodation', 'program', 'lecture', 'event'],
      message: 'Booking type must be accommodation, program, lecture, or event'
    },
    required: [true, 'Booking type is required'],
    index: true
  },

  // Accommodation Booking Fields
  accommodation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: function() {
      return this.bookingType === 'accommodation';
    },
    index: true
  },

  // Program Booking Fields (for Quran classes, lectures, events)
  program: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'programModel',
    required: function() {
      return ['program', 'lecture', 'event'].includes(this.bookingType);
    }
  },
  programModel: {
    type: String,
    enum: ['QuranClass', 'Lecture', 'Event'],
    required: function() {
      return ['program', 'lecture', 'event'].includes(this.bookingType);
    }
  },

  // Booking Status
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      message: 'Status must be pending, approved, rejected, cancelled, or completed'
    },
    default: 'pending',
    index: true
  },

  // Dates
  requestDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  checkInDate: {
    type: Date,
    required: function() {
      return this.bookingType === 'accommodation';
    },
    validate: {
      validator: function(v) {
        if (this.bookingType !== 'accommodation') return true;
        return v && v > new Date();
      },
      message: 'Check-in date must be in the future'
    },
    index: true
  },
  checkOutDate: {
    type: Date,
    required: function() {
      return this.bookingType === 'accommodation';
    },
    validate: {
      validator: function(v) {
        if (this.bookingType !== 'accommodation') return true;
        return v && this.checkInDate && v > this.checkInDate;
      },
      message: 'Check-out date must be after check-in date'
    }
  },

  // Program Dates (for non-accommodation bookings)
  programStartDate: {
    type: Date,
    required: function() {
      return ['program', 'lecture', 'event'].includes(this.bookingType);
    }
  },
  programEndDate: {
    type: Date,
    required: function() {
      return ['program', 'lecture', 'event'].includes(this.bookingType);
    }
  },

  // Booking Details
  numberOfGuests: {
    type: Number,
    required: function() {
      return this.bookingType === 'accommodation';
    },
    min: [1, 'Number of guests must be at least 1'],
    max: [20, 'Number of guests cannot exceed 20']
  },

  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(v) {
          return /^\+234[789][01]\d{8}$/.test(v);
        },
        message: 'Please enter a valid Nigerian phone number'
      }
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
        trim: true,
        minlength: [2, 'Emergency contact name must be at least 2 characters']
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required'],
        validate: {
          validator: function(v) {
            return /^\+234[789][01]\d{8}$/.test(v);
          },
          message: 'Please enter a valid emergency contact phone number'
        }
      },
      relationship: {
        type: String,
        required: [true, 'Relationship to emergency contact is required'],
        enum: {
          values: ['parent', 'sibling', 'spouse', 'friend', 'relative', 'guardian'],
          message: 'Relationship must be parent, sibling, spouse, friend, relative, or guardian'
        }
      }
    }
  },

  // Payment Information
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  pendingAmount: {
    type: Number,
    default: function() {
      return this.totalAmount - this.paidAmount;
    }
  },

  // Payment Schedule (for accommodation bookings)
  paymentSchedule: [{
    monthNumber: {
      type: Number,
      required: true,
      min: 1
    },
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'paid', 'overdue'],
      default: 'pending'
    },
    paidDate: Date,
    description: String
  }],

  // Admin Actions
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedDate: Date,
  rejectionReason: String,
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },

  // User Notes and Preferences
  userNotes: {
    type: String,
    maxlength: [500, 'User notes cannot exceed 500 characters']
  },
  specialRequests: [{
    type: String,
    maxlength: [200, 'Special request cannot exceed 200 characters']
  }],

  // Program-specific fields
  enrollmentDetails: {
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: function() {
        return this.bookingType === 'program';
      }
    },
    expectations: {
      type: String,
      maxlength: [500, 'Expectations cannot exceed 500 characters']
    },
    previousKnowledge: {
      type: String,
      maxlength: [500, 'Previous knowledge cannot exceed 500 characters']
    }
  },

  // Booking Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String,

  // Cancellation Information
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledDate: Date,
  cancellationReason: String,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed', 'failed'],
    default: 'none'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual Fields
bookingSchema.virtual('bookingDuration').get(function() {
  if (this.bookingType === 'accommodation' && this.checkInDate && this.checkOutDate) {
    return Math.ceil((this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24));
  }
  if (this.programStartDate && this.programEndDate) {
    return Math.ceil((this.programEndDate - this.programStartDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

bookingSchema.virtual('paymentStatus').get(function() {
  if (this.paidAmount === 0) return 'unpaid';
  if (this.paidAmount >= this.totalAmount) return 'paid';
  return 'partial';
});

bookingSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'approved') return false;
  const now = new Date();
  return this.paymentSchedule.some(payment =>
    payment.status === 'pending' && payment.dueDate < now
  );
});

bookingSchema.virtual('nextPayment').get(function() {
  const pendingPayments = this.paymentSchedule.filter(p => p.status === 'pending');
  if (pendingPayments.length === 0) return null;

  const nextPayment = pendingPayments.sort((a, b) => a.dueDate - b.dueDate)[0];
  const daysUntilDue = Math.ceil((nextPayment.dueDate - new Date()) / (1000 * 60 * 60 * 24));

  return {
    ...nextPayment.toObject(),
    daysUntilDue,
    isOverdue: daysUntilDue < 0
  };
});

// Indexes for Performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ accommodation: 1, status: 1 });
bookingSchema.index({ bookingType: 1, status: 1 });
bookingSchema.index({ requestDate: -1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ 'paymentSchedule.dueDate': 1, 'paymentSchedule.status': 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Pre-save Middleware
bookingSchema.pre('save', function(next) {
  // Update pending amount
  this.pendingAmount = this.totalAmount - this.paidAmount;

  // Generate payment schedule for accommodation bookings
  if (this.isNew && this.bookingType === 'accommodation' && this.checkInDate && this.checkOutDate) {
    this.generatePaymentSchedule();
  }

  next();
});

// Instance Methods
bookingSchema.methods.generatePaymentSchedule = function() {
  if (this.bookingType !== 'accommodation') return;

  const monthlyAmount = this.totalAmount / this.bookingDuration * 30; // Approximate monthly amount
  const numberOfMonths = Math.ceil(this.bookingDuration / 30);

  this.paymentSchedule = [];

  for (let i = 1; i <= numberOfMonths; i++) {
    const dueDate = new Date(this.checkInDate);
    dueDate.setMonth(dueDate.getMonth() + i - 1);
    dueDate.setDate(1); // First of the month

    this.paymentSchedule.push({
      monthNumber: i,
      dueDate,
      amount: i === numberOfMonths ?
        this.totalAmount - (monthlyAmount * (numberOfMonths - 1)) : // Last payment adjusts for rounding
        Math.round(monthlyAmount),
      status: 'pending',
      description: `Month ${i} payment (${dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`
    });
  }
};

bookingSchema.methods.updatePaymentStatus = function(monthNumber, status, paidDate = null) {
  const payment = this.paymentSchedule.find(p => p.monthNumber === monthNumber);
  if (payment) {
    payment.status = status;
    if (paidDate) payment.paidDate = paidDate;

    // Update paid amount
    if (status === 'paid') {
      this.paidAmount += payment.amount;
    }

    this.pendingAmount = this.totalAmount - this.paidAmount;
  }
  return this.save();
};

bookingSchema.methods.approve = function(adminId, notes = '') {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedDate = new Date();
  this.adminNotes = notes;
  return this.save();
};

bookingSchema.methods.reject = function(adminId, reason, notes = '') {
  this.status = 'rejected';
  this.rejectedBy = adminId;
  this.rejectedDate = new Date();
  this.rejectionReason = reason;
  this.adminNotes = notes;
  return this.save();
};
```

---

## Frontend Architecture Analysis

### React Application Structure

#### Component Hierarchy and State Management

**App.jsx - Root Component**:
```javascript
// Main application structure with routing and global providers
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <SearchProvider>
              <div className="App">
                <Navbar />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/communities" element={<Communities />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                </Routes>
                <Footer />
                <Toaster /> {/* React Hot Toast notifications */}
              </div>
            </SearchProvider>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

#### Context Providers Deep Dive

**UserContext.jsx - Authentication State Management**:
```javascript
const UserContext = createContext();

export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verify token with backend
          const response = await axios.get('/auth/api/user', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          if (response.data.success) {
            setUser(response.data.user);
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            // Invalid token, clear storage
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/api/login', { email, password });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Store token and user data
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        toast.success('Login successful!');
        return { success: true, user: userData };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAdmin,
    isAuthenticated: !!user && !!token
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
```

**CartContext.jsx - E-commerce State Management**:
```javascript
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mcan_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mcan_cart', JSON.stringify(cartItems));

    // Calculate totals
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    setCartTotal(total);
    setCartCount(count);
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { ...product, quantity }];
      }
    });

    toast.success(`${product.name} added to cart`);
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      toast.success('Item removed from cart');
      return updatedItems;
    });
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const value = {
    cartItems,
    cartTotal,
    cartCount,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
```

#### Component Architecture Patterns

**Higher-Order Components (HOCs)**:
```javascript
// ProtectedRoute.jsx - Route protection HOC
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// AdminRoute.jsx - Admin-only route protection
export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

**Custom Hooks for Business Logic**:
```javascript
// useBooking.js - Booking management hook
export const useBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch user bookings
  const fetchBookings = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/bookings/my-bookings?${queryParams}`);

      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new booking
  const createBooking = async (bookingData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/bookings/create', bookingData);

      if (response.data.success) {
        toast.success('Booking request submitted successfully!');
        await fetchBookings(); // Refresh bookings list
        return { success: true, booking: response.data.booking };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create booking';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId, reason) => {
    setLoading(true);

    try {
      const response = await axios.put(`/api/bookings/${bookingId}/cancel`, { reason });

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        await fetchBookings(); // Refresh bookings list
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel booking';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload payment proof
  const uploadPaymentProof = async (paymentData) => {
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(paymentData).forEach(key => {
        formData.append(key, paymentData[key]);
      });

      const response = await axios.post('/api/payments/submit-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Payment proof uploaded successfully!');
        await fetchBookings(); // Refresh to show updated payment status
        return { success: true, payment: response.data.payment };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to upload payment proof';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    cancelBooking,
    uploadPaymentProof
  };
};

// useAccommodations.js - Accommodation search and filtering
export const useAccommodations = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchAccommodations = useCallback(async (gender, searchFilters = {}) => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams(searchFilters).toString();
      const response = await axios.get(`/api/post/accommodations/${gender}?${queryParams}`);

      if (response.data.success) {
        setAccommodations(response.data.accommodations);
        setPagination(response.data.pagination);
        setFilters(response.data.filters);
      }
    } catch (error) {
      toast.error('Failed to load accommodations');
      console.error('Error fetching accommodations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAccommodations = useCallback(async (searchQuery, gender) => {
    setLoading(true);

    try {
      const response = await axios.get(`/api/post/search-accommodations`, {
        params: { search: searchQuery, gender }
      });

      if (response.data.success) {
        setAccommodations(response.data.accommodations);
      }
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    accommodations,
    loading,
    pagination,
    filters,
    fetchAccommodations,
    searchAccommodations
  };
};
```

---

## Mobile Application Deep Dive

### React Native Architecture

#### Navigation Structure
```typescript
// AppNavigator.tsx - Main navigation setup
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<TabParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// MainNavigator.tsx - Tab navigation for authenticated users
const MainNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Accommodations':
              iconName = focused ? 'bed' : 'bed-outline';
              break;
            case 'Shop':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        }
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <MainTab.Screen
        name="Accommodations"
        component={AccommodationStackNavigator}
        options={{ title: 'Stay' }}
      />
      <MainTab.Screen
        name="Shop"
        component={ShopStackNavigator}
        options={{ title: 'Shop' }}
      />
      <MainTab.Screen
        name="Community"
        component={CommunityStackNavigator}
        options={{ title: 'Community' }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};
```

#### TypeScript Type Definitions
```typescript
// types/index.ts - Complete type definitions
export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  profileImage?: string;
  displayAvatar?: string;
  initials?: string;
  phone?: string;

  // NYSC-specific fields
  gender?: 'male' | 'female';
  stateCode?: string;
  batch?: string;
  stream?: 'A' | 'B' | 'C';
  callUpNumber?: string;
  dateOfBirth?: string;
  institution?: string;
  course?: string;
  profileCompleted?: boolean;

  nyscDetails?: {
    gender?: 'male' | 'female';
    stateCode?: string;
    batch?: string;
    stream?: 'A' | 'B' | 'C';
    callUpNumber?: string;
    isComplete: boolean;
  };

  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showProfile: boolean;
      showContact: boolean;
    };
    language: 'en' | 'ar' | 'ha';
  };

  createdAt: string;
  updatedAt: string;
}

export interface Accommodation {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  accommodationType: 'private_room' | 'shared_room' | 'studio' | 'apartment' | 'hostel';
  genderRestriction: 'male' | 'female' | 'mixed';
  guest: number;
  images: string[];
  facilities: string[];
  nearArea: string[];
  mosqueProximity: number;
  prayerFacilities: boolean;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  availableSlots: number;
  occupancyRate: number;
  rating: number;
  reviewCount: number;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  bookingStats: {
    totalBookings: number;
    approvedBookings: number;
    pendingBookings: number;
    rejectedBookings: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingType: 'accommodation' | 'program' | 'lecture' | 'event';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  requestDate: string;
  checkInDate?: string;
  checkOutDate?: string;
  programStartDate?: string;
  programEndDate?: string;
  numberOfGuests?: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';

  contactInfo: {
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };

  paymentSchedule: PaymentScheduleItem[];
  accommodation?: Accommodation;
  program?: Program;

  userNotes?: string;
  adminNotes?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;

  nextPayment?: {
    amount: number;
    dueDate: string;
    monthNumber: number;
    daysUntilDue: number;
    isOverdue: boolean;
  };

  bookingDuration: number;
  isOverdue: boolean;
  canCancel: boolean;
  canModify: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface PaymentScheduleItem {
  monthNumber: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'submitted' | 'paid' | 'overdue';
  paidDate?: string;
  description: string;
  paymentProof?: {
    id: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedDate?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: string[];
  stock: number;
  inStock: boolean;
  status: 'active' | 'inactive';
  tags: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  slug: string;

  specifications?: {
    [key: string]: any;
  };

  shipping: {
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    freeShipping: boolean;
    shippingCost?: number;
    estimatedDelivery: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  memberCount: number;
  activeMembers: number;
  image?: string;
  rules: string;
  slug: string;

  stats: {
    totalPosts: number;
    totalMessages: number;
    weeklyActivity: number;
    lastActivity: string;
  };

  admins: Array<{
    id: string;
    name: string;
    role: string;
  }>;

  createdAt: string;
  canJoin: boolean;
  requiresApproval: boolean;
  userMembership?: {
    status: 'member' | 'pending' | 'banned';
    joinedAt: string;
    role: 'member' | 'moderator' | 'admin';
  };
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ProfileCompletion: { skipable?: boolean };
  BiometricSetup: { skipable?: boolean; onComplete?: () => void };
  Home: undefined;
  Accommodations: undefined;
  AccommodationDetails: { id: string };
  Booking: { accommodationId: string };
  Shop: undefined;
  ProductDetails: { id: string };
  Cart: undefined;
  Checkout: undefined;
  Events: undefined;
  EventDetails: { id: string };
  Blog: undefined;
  BlogDetails: { id: string };
  Messages: undefined;
  Profile: undefined;
  Settings: undefined;
  MyBookings: undefined;
  OrderHistory: undefined;
  PaymentHistory: undefined;
  PaymentUpload: { bookingId: string; monthNumber: number };
};

export type TabParamList = {
  Home: undefined;
  Accommodations: undefined;
  Shop: undefined;
  Community: undefined;
  Profile: undefined;
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  gender?: 'male' | 'female';
  stateCode?: string;
  batch?: string;
  stream?: 'A' | 'B' | 'C';
  callUpNumber?: string;
  dateOfBirth?: string;
  institution?: string;
  course?: string;
}

export interface BookingForm {
  accommodationId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  contactPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  userNotes?: string;
}

export interface PaymentUploadForm {
  bookingId: string;
  monthNumber: number;
  amount: number;
  paymentMethod: 'bank_transfer' | 'pos' | 'mobile_money' | 'cash';
  paymentReference?: string;
  paymentDate: string;
  notes?: string;
  proofOfPayment: any; // File object
}
```

---

## Business Logic & Validation Rules

### Authentication & Authorization Logic

#### JWT Token Management
```javascript
// JWT Token Structure
{
  "_id": "user_object_id",
  "id": "user_object_id", // Duplicate for compatibility
  "role": "user|admin",
  "iat": 1705314600, // Issued at timestamp
  "exp": 1705919400  // Expiration timestamp (7 days)
}

// Token Validation Middleware (Auth.js)
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing"
      });
    }

    // Extract token (support both "Bearer <token>" and direct token)
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify JWT token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Ensure user ID exists in token
    const userId = decoded._id || decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token does not contain user ID"
      });
    }

    // Normalize user object for consistency
    req.user = {
      ...decoded,
      _id: userId,
      id: userId
    };

    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        code: "TOKEN_EXPIRED"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        code: "INVALID_TOKEN"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token verification failed"
    });
  }
};

// Admin Authorization Middleware
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Fetch user from database to verify current role
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in database"
      });
    }

    // Check admin role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
        code: "INSUFFICIENT_PERMISSIONS"
      });
    }

    // Add user data to request for use in controllers
    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying admin permissions"
    });
  }
};
```

#### Password Security Implementation
```javascript
// Password Hashing (User Model pre-save middleware)
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();

  try {
    // Generate salt and hash password
    const saltRounds = 12; // High security level
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Password Comparison Method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Password Strength Validation
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }

  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? 'strong' :
              errors.length <= 2 ? 'medium' : 'weak'
  };
};
```

### Booking Business Logic

#### Accommodation Availability Validation
```javascript
// Booking Creation Validation Logic
const validateBookingAvailability = async (accommodationId, checkInDate, checkOutDate, numberOfGuests) => {
  try {
    // 1. Fetch accommodation details
    const accommodation = await Post.findById(accommodationId);
    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    // 2. Check if accommodation is available
    if (!accommodation.isAvailable) {
      throw new Error('Accommodation is currently unavailable');
    }

    // 3. Validate guest capacity
    if (numberOfGuests > accommodation.guest) {
      throw new Error(`Maximum ${accommodation.guest} guests allowed`);
    }

    // 4. Check booking limits
    const currentBookings = await Booking.countDocuments({
      accommodation: accommodationId,
      status: { $in: ['pending', 'approved'] }
    });

    if (currentBookings >= accommodation.maxBookings) {
      throw new Error('Accommodation has reached maximum booking capacity');
    }

    // 5. Validate date range
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn <= now) {
      throw new Error('Check-in date must be in the future');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // 6. Minimum stay requirement (30 days for NYSC accommodation)
    const stayDuration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (stayDuration < 30) {
      throw new Error('Minimum stay duration is 30 days');
    }

    // 7. Maximum stay limit (1 year)
    if (stayDuration > 365) {
      throw new Error('Maximum stay duration is 365 days');
    }

    // 8. Check for overlapping bookings (if accommodation doesn't allow multiple bookings)
    const overlappingBookings = await Booking.find({
      accommodation: accommodationId,
      status: { $in: ['approved'] },
      $or: [
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkIn }
        }
      ]
    });

    if (overlappingBookings.length > 0 && accommodation.accommodationType === 'private_room') {
      throw new Error('Accommodation is not available for the selected dates');
    }

    return {
      isValid: true,
      accommodation,
      stayDuration,
      totalAmount: accommodation.price * Math.ceil(stayDuration / 30) // Monthly pricing
    };

  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Duplicate Booking Prevention
const checkDuplicateBooking = async (userId, accommodationId) => {
  const existingBooking = await Booking.findOne({
    user: userId,
    accommodation: accommodationId,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingBooking) {
    throw new Error('You already have a pending or approved booking for this accommodation');
  }

  return true;
};
```

#### Payment Schedule Generation
```javascript
// Payment Schedule Generation Logic
const generatePaymentSchedule = (checkInDate, checkOutDate, totalAmount) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  // Calculate number of months
  const stayDuration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const numberOfMonths = Math.ceil(stayDuration / 30);

  // Calculate monthly amount
  const monthlyAmount = Math.round(totalAmount / numberOfMonths);

  const paymentSchedule = [];

  for (let i = 1; i <= numberOfMonths; i++) {
    const dueDate = new Date(checkIn);
    dueDate.setMonth(dueDate.getMonth() + i - 1);
    dueDate.setDate(1); // First of the month

    // Adjust last payment for rounding differences
    const amount = i === numberOfMonths ?
      totalAmount - (monthlyAmount * (numberOfMonths - 1)) :
      monthlyAmount;

    paymentSchedule.push({
      monthNumber: i,
      dueDate,
      amount,
      status: 'pending',
      description: `Month ${i} payment (${dueDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })})`
    });
  }

  return paymentSchedule;
};

// Payment Reminder Logic
const schedulePaymentReminders = async (booking) => {
  const reminderDays = [7, 3, 1]; // Days before due date

  for (const payment of booking.paymentSchedule) {
    if (payment.status === 'pending') {
      for (const days of reminderDays) {
        const reminderDate = new Date(payment.dueDate);
        reminderDate.setDate(reminderDate.getDate() - days);

        // Schedule reminder job (using node-cron or similar)
        scheduleJob(reminderDate, async () => {
          await sendPaymentReminder(booking.user, booking, payment, days);
        });
      }
    }
  }
};
```

### Input Validation & Sanitization

#### Request Validation Middleware
```javascript
// Generic validation middleware factory
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types when possible
    });

    if (error) {
      const errors = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Joi validation schemas
const userRegistrationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required(),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
    }),

  gender: Joi.string()
    .valid('male', 'female')
    .when('role', {
      is: 'user',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),

  stateCode: Joi.string()
    .uppercase()
    .length(2)
    .pattern(/^[A-Z]{2}$/)
    .optional(),

  batch: Joi.string()
    .pattern(/^20\d{2}[AB]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Batch must be in format YYYYA or YYYYB'
    }),

  stream: Joi.string()
    .valid('A', 'B', 'C')
    .optional(),

  callUpNumber: Joi.string()
    .pattern(/^[A-Z]{2,3}\/\d{2}[AB]\/\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Call-up number must be in format XX/YYA/NNNN'
    }),

  phone: Joi.string()
    .pattern(/^\+234[789][01]\d{8}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid Nigerian phone number'
    }),

  institution: Joi.string()
    .trim()
    .min(5)
    .max(100)
    .optional(),

  course: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional()
});

const bookingCreationSchema = Joi.object({
  bookingType: Joi.string()
    .valid('accommodation', 'program', 'lecture', 'event')
    .required(),

  accommodationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .when('bookingType', {
      is: 'accommodation',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),

  checkInDate: Joi.date()
    .min('now')
    .when('bookingType', {
      is: 'accommodation',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),

  checkOutDate: Joi.date()
    .greater(Joi.ref('checkInDate'))
    .when('bookingType', {
      is: 'accommodation',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),

  numberOfGuests: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .when('bookingType', {
      is: 'accommodation',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),

  contactInfo: Joi.object({
    phone: Joi.string()
      .pattern(/^\+234[789][01]\d{8}$/)
      .required(),

    emergencyContact: Joi.object({
      name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

      phone: Joi.string()
        .pattern(/^\+234[789][01]\d{8}$/)
        .required(),

      relationship: Joi.string()
        .valid('parent', 'sibling', 'spouse', 'friend', 'relative', 'guardian')
        .required()
    }).required()
  }).required(),

  userNotes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
});
```

### File Upload Security

#### File Validation Logic
```javascript
// File upload validation middleware
const validateFileUpload = (allowedTypes, maxSize, maxFiles = 1) => {
  return (req, res, next) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];

      // Check number of files
      if (files.length > maxFiles) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxFiles} files allowed`
        });
      }

      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          return res.status(413).json({
            success: false,
            message: `File size must be less than ${maxSize / (1024 * 1024)}MB`
          });
        }

        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`
          });
        }

        // Check file extension
        const allowedExtensions = allowedTypes.map(type => {
          switch (type) {
            case 'image/jpeg': return '.jpg';
            case 'image/png': return '.png';
            case 'image/webp': return '.webp';
            case 'application/pdf': return '.pdf';
            default: return '';
          }
        });

        const fileExtension = path.extname(file.name).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          return res.status(400).json({
            success: false,
            message: `File extension ${fileExtension} not allowed`
          });
        }

        // Sanitize filename
        file.name = sanitizeFilename(file.name);
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'File validation error'
      });
    }
  };
};

// Filename sanitization
const sanitizeFilename = (filename) => {
  // Remove dangerous characters
  const sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');

  // Add UUID prefix to prevent conflicts
  const uuid = require('uuid').v4();
  const extension = path.extname(sanitized);
  const nameWithoutExt = path.basename(sanitized, extension);

  return `${uuid}-${nameWithoutExt}${extension}`;
};

// Supabase upload with security
const uploadToSupabase = async (file, bucket, folder = '') => {
  try {
    const sanitizedName = sanitizeFilename(file.name);
    const filePath = folder ? `${folder}/${sanitizedName}` : sanitizedName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.data, {
        contentType: file.mimetype,
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};
```

---

## Error Handling & Edge Cases

### Global Error Handler
```javascript
// Global error handling middleware (index.js)
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', error);

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    // Mongoose validation errors
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (error.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: 'DUPLICATE_ENTRY'
    });
  }

  if (error.name === 'CastError') {
    // Invalid ObjectId
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      code: 'INVALID_ID'
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    // File upload size limit
    return res.status(413).json({
      success: false,
      message: 'File too large',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (error.message && error.message.includes('Unexpected end of form')) {
    // Multipart form parsing error
    return res.status(400).json({
      success: false,
      message: 'Form data parsing error',
      code: 'FORM_PARSE_ERROR'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    code: 'INTERNAL_ERROR'
  });
});

// Async error wrapper for controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in controllers
export const createBookingController = asyncHandler(async (req, res) => {
  // Controller logic here
  // Any thrown errors will be caught and passed to global error handler
});
```

### API Response Standardization
```javascript
// Response utility functions
class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Error', statusCode = 500, code = null, details = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (code) response.code = code;
    if (details) response.details = details;
    if (process.env.NODE_ENV === 'development' && details) {
      response.stack = details.stack;
    }

    return res.status(statusCode).json(response);
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }
}

// Usage in controllers
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });
  return ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
});
```

### Rate Limiting & Security
```javascript
// Rate limiting configuration
import rateLimit from 'express-rate-limit';

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT'
  },
  skipSuccessfulRequests: true
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    message: 'Upload limit exceeded, please try again later.',
    code: 'UPLOAD_RATE_LIMIT'
  }
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/auth/api/login', authLimiter);
app.use('/api/payments/submit-proof', uploadLimiter);
```

### Input Sanitization & XSS Prevention
```javascript
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';

// MongoDB injection prevention
app.use(mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key: ${key} in request from ${req.ip}`);
  }
}));

// XSS sanitization utility
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

// Sanitization middleware
const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);
  next();
};

app.use(sanitizeRequest);
```

---

## Security Implementation

### CORS Configuration
```javascript
// Comprehensive CORS setup
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      // Development origins
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',

      // Production web frontend
      'https://mcanlogde1.vercel.app',
      process.env.FRONTEND_URL,

      // Mobile development
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'http://192.168.1.100:8081',
      'http://10.0.0.1:8081',
      'http://10.0.2.2:8081', // Android emulator
      process.env.MOBILE_DEV_URL,
      process.env.EXPO_DEV_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
}));
```

### Security Headers
```javascript
import helmet from 'helmet';

// Security headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.supabase.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for file uploads
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

### Environment Variable Security
```javascript
// Environment validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SMTP_USER',
  'SMTP_PASS'
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

validateEnvironment();
```

---

## Performance Optimization

### Database Optimization
```javascript
// MongoDB connection optimization
const connectToDb = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ Connected to MongoDB');

    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Database indexes for performance
const createIndexes = async () => {
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1, isActive: 1 });
    await User.collection.createIndex({ gender: 1, stateCode: 1, batch: 1 });

    // Booking indexes
    await Booking.collection.createIndex({ user: 1, status: 1 });
    await Booking.collection.createIndex({ accommodation: 1, status: 1 });
    await Booking.collection.createIndex({ requestDate: -1 });
    await Booking.collection.createIndex({ checkInDate: 1, checkOutDate: 1 });

    // Product indexes
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    await Product.collection.createIndex({ category: 1, status: 1 });
    await Product.collection.createIndex({ price: 1 });

    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};
```

### Caching Strategy
```javascript
import Redis from 'redis';

// Redis connection
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Cache middleware
const cache = (duration = 300) => { // Default 5 minutes
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json to cache response
      res.json = function(data) {
        redis.setex(key, duration, JSON.stringify(data));
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

// Usage
app.get('/api/accommodations/:gender', cache(600), getAccommodationsByGender);
```

### API Response Compression
```javascript
import compression from 'compression';

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
  chunkSize: 16 * 1024, // 16KB chunks
  windowBits: 15,
  memLevel: 8
}));
```

### Query Optimization
```javascript
// Optimized accommodation query with aggregation
const getOptimizedAccommodations = async (gender, filters = {}) => {
  const pipeline = [
    // Match stage
    {
      $match: {
        genderRestriction: { $in: [gender, 'mixed'] },
        isAvailable: true,
        status: 'active'
      }
    },

    // Lookup booking statistics
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'accommodation',
        as: 'bookings'
      }
    },

    // Add computed fields
    {
      $addFields: {
        currentBookings: {
          $size: {
            $filter: {
              input: '$bookings',
              cond: { $in: ['$$this.status', ['pending', 'approved']] }
            }
          }
        },
        availableSlots: {
          $subtract: ['$maxBookings', '$currentBookings']
        }
      }
    },

    // Filter by availability
    {
      $match: {
        availableSlots: { $gt: 0 }
      }
    },

    // Apply additional filters
    ...(filters.location ? [{ $match: { location: new RegExp(filters.location, 'i') } }] : []),
    ...(filters.minPrice ? [{ $match: { price: { $gte: filters.minPrice } } }] : []),
    ...(filters.maxPrice ? [{ $match: { price: { $lte: filters.maxPrice } } }] : []),

    // Sort
    {
      $sort: {
        [filters.sort || 'createdAt']: filters.order === 'asc' ? 1 : -1
      }
    },

    // Pagination
    { $skip: (filters.page - 1) * filters.limit },
    { $limit: filters.limit },

    // Project final fields
    {
      $project: {
        bookings: 0, // Remove bookings array from output
        __v: 0
      }
    }
  ];

  const [accommodations, totalCount] = await Promise.all([
    Post.aggregate(pipeline),
    Post.countDocuments({
      genderRestriction: { $in: [gender, 'mixed'] },
      isAvailable: true,
      status: 'active'
    })
  ]);

  return {
    accommodations,
    pagination: {
      currentPage: filters.page,
      totalPages: Math.ceil(totalCount / filters.limit),
      totalItems: totalCount,
      itemsPerPage: filters.limit
    }
  };
};
```

This exhaustive technical documentation covers every aspect of the MCAN Lodge codebase, from API endpoints and database schemas to security implementations and performance optimizations. The documentation provides complete understanding of the system architecture, business logic, validation rules, and technical implementation details that any developer or stakeholder would need to understand and work with the platform.

### Accommodation Routes (`/api/post`)

#### GET /api/post/accommodations/:gender
**Purpose**: Get accommodations filtered by gender with advanced filtering
**Authentication**: None required
**Parameters**: 
- `gender`: Path parameter, enum ["male", "female", "mixed"]

**Query Parameters**:
- `page`: Number, default 1, min 1
- `limit`: Number, default 12, min 1, max 50
- `location`: String, filter by city/area
- `minPrice`: Number, minimum monthly price
- `maxPrice`: Number, maximum monthly price
- `amenities`: Comma-separated string of amenities
- `mosqueDistance`: Number, max distance to mosque in meters
- `sort`: Enum ["price", "rating", "distance", "newest"], default "newest"
- `order`: Enum ["asc", "desc"], default "desc"
- `available`: Boolean, only show available accommodations
- `search`: String, text search in title and description

**Business Logic**:
1. Build MongoDB aggregation pipeline
2. Apply gender restriction filter
3. Apply location, price, amenities filters
4. Calculate distance to mosques if location provided
5. Apply availability filter (check current bookings vs maxBookings)
6. Sort results by specified criteria
7. Paginate results
8. Include booking statistics for each accommodation

**Success Response (200)**:
```javascript
{
  "success": true,
  "message": "Accommodations retrieved successfully",
  "accommodations": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Al-Noor Islamic Lodge - Male Section",
      "description": "Comfortable and affordable accommodation for male NYSC corps members with full Islamic facilities including prayer room, halal kitchen, and 24/7 security.",
      "location": "Ikeja, Lagos State",
      "price": 25000,
      "accommodationType": "shared_room",
      "genderRestriction": "male",
      "guest": 4,
      "images": [
        "https://supabase.url/accommodation-images/image1.jpg",
        "https://supabase.url/accommodation-images/image2.jpg",
        "https://supabase.url/accommodation-images/image3.jpg"
      ],
      "facilities": [
        "WiFi Internet",
        "Prayer Room (Musallah)",
        "Halal Kitchen",
        "Laundry Service",
        "24/7 Security",
        "Parking Space",
        "Study Area",
        "Air Conditioning"
      ],
      "nearArea": [
        "Central Mosque (200m)",
        "Ikeja Market (500m)",
        "General Hospital (1km)",
        "NYSC Secretariat (2km)"
      ],
      "mosqueProximity": 200,
      "prayerFacilities": true,
      "isAvailable": true,
      "maxBookings": 12,
      "currentBookings": 8,
      "availableSlots": 4,
      "occupancyRate": 66.67,
      "rating": 4.6,
      "reviewCount": 23,
      "bookingStats": {
        "totalBookings": 45,
        "approvedBookings": 8,
        "pendingBookings": 2,
        "rejectedBookings": 1
      },
      "slug": "al-noor-islamic-lodge-male-section",
      "category": {
        "id": "category_id",
        "name": "Male Accommodation",
        "slug": "male-accommodation"
      },
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-16T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalItems": 94,
    "itemsPerPage": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "applied": {
      "gender": "male",
      "location": "Lagos",
      "minPrice": 20000,
      "maxPrice": 30000,
      "amenities": ["WiFi", "Prayer Room"]
    },
    "available": {
      "locations": [
        { "name": "Lagos", "count": 45 },
        { "name": "Abuja", "count": 23 },
        { "name": "Kano", "count": 18 },
        { "name": "Port Harcourt", "count": 8 }
      ],
      "priceRange": {
        "min": 15000,
        "max": 60000,
        "average": 28500
      },
      "amenities": [
        { "name": "WiFi Internet", "count": 78 },
        { "name": "Prayer Room", "count": 94 },
        { "name": "Kitchen", "count": 67 },
        { "name": "Security", "count": 89 }
      ]
    }
  },
  "summary": {
    "totalAccommodations": 94,
    "averagePrice": 28500,
    "averageRating": 4.3,
    "totalAvailableSlots": 234
  }
}
```
