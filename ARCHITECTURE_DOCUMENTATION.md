# MCAN Lodge - Architecture Documentation

## System Architecture Overview

MCAN Lodge follows a **modern multi-tier architecture** with clear separation of concerns across three main application layers and supporting infrastructure.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │
│   (React/Vite)  │    │ (React Native)  │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │ HTTPS/REST API
                     │ WebSocket
          ┌──────────▼───────────┐
          │    Backend Server    │
          │   (Node.js/Express)  │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │    Data Layer        │
          │ MongoDB + Supabase   │
          └──────────────────────┘
```

## Frontend Architecture (Web Application)

### Technology Stack
- **React 18.3.1** with functional components and hooks
- **Vite 5.4.10** for fast development and building
- **Tailwind CSS 3.4.14** for styling
- **React Router DOM 6.28.0** for client-side routing

### Directory Structure
```
client/src/
├── components/           # Reusable UI components
│   ├── AdminChatInterface.jsx
│   ├── BookingConfirmation.jsx
│   ├── ChatInterface.jsx
│   ├── MessagingSystem.jsx
│   ├── PaymentHistory.jsx
│   ├── Product/         # Product-related components
│   └── Routes/          # Route components
├── pages/               # Page-level components
│   ├── Admin/           # Admin dashboard pages
│   ├── User/            # User profile pages
│   ├── HomePage.jsx
│   ├── Shop.jsx
│   ├── Communities.jsx
│   └── [other pages]
├── context/             # React Context providers
│   ├── UserContext.jsx  # User authentication state
│   ├── Cart.jsx         # Shopping cart state
│   ├── SocketContext.jsx # Real-time messaging
│   └── Search.jsx       # Search functionality
├── hooks/               # Custom React hooks
├── services/            # API communication
└── utils/               # Utility functions
```

### Key Frontend Components

#### 1. **Authentication System**
- **UserContext**: Manages user login state, profile data, and permissions
- **Protected Routes**: Ensures only authenticated users access certain pages
- **Role-based Access**: Different interfaces for users vs administrators

#### 2. **Booking System**
- **Accommodation Browser**: Search and filter accommodations
- **Booking Form**: Multi-step booking process with validation
- **Payment Integration**: Upload payment proofs and track status
- **Booking Management**: View booking history and status

#### 3. **E-commerce System**
- **Product Catalog**: Browse Islamic products with categories
- **Shopping Cart**: Add/remove items with persistent state
- **Checkout Process**: Secure order placement and payment
- **Order Tracking**: Monitor order status and history

#### 4. **Community Features**
- **Community Browser**: Discover and join Islamic communities
- **Real-time Chat**: Messaging with Socket.io integration
- **Content Sharing**: Post stories, testimonials, and updates
- **Event Management**: Browse and register for Islamic programs

#### 5. **Real-time Messaging**
- **Socket.io Client**: Bidirectional communication with server
- **Chat Interface**: User-to-admin and community messaging
- **Typing Indicators**: Real-time typing status
- **Message History**: Persistent message storage and retrieval

## Backend Architecture (API Server)

### Technology Stack
- **Node.js** with **Express.js 4.21.1** framework
- **MongoDB 6.13.0** with **Mongoose 8.8.1** ODM
- **Socket.io 4.7.0** for real-time communication
- **JWT** for authentication and authorization

### Directory Structure
```
server/src/
├── models/              # Database schemas
│   ├── User.js          # User accounts and profiles
│   ├── Booking.js       # Accommodation bookings
│   ├── Product.js       # E-commerce products
│   ├── Community.js     # Community content
│   ├── Message.js       # Direct messaging
│   ├── CommunityMessage.js # Community chat
│   └── [other models]
├── controllers/         # Business logic handlers
│   ├── User.js          # Authentication and user management
│   ├── Booking.js       # Booking operations
│   ├── Product.js       # E-commerce operations
│   ├── Payment.js       # Payment processing
│   └── [other controllers]
├── routes/              # API endpoint definitions
│   ├── User.js          # /api/auth/* routes
│   ├── Booking.js       # /api/bookings/* routes
│   ├── Product.js       # /api/products/* routes
│   └── [other routes]
├── middlewares/         # Custom middleware
│   └── Auth.js          # JWT authentication middleware
├── config/              # Configuration files
│   ├── db.js            # MongoDB connection
│   ├── socket.js        # Socket.io configuration
│   └── supabase.js      # Supabase storage config
├── services/            # Business logic services
│   ├── emailService.js  # Email notifications
│   ├── paymentService.js # Payment processing
│   └── supabaseStorage.js # File upload handling
└── utils/               # Utility functions
```

### Core Backend Services

#### 1. **Authentication & Authorization**
- **JWT-based Authentication**: Secure token-based user sessions
- **Role-based Access Control**: User vs Admin permissions
- **Password Security**: Bcrypt hashing for password storage
- **Session Management**: Token refresh and expiration handling

#### 2. **Booking Management System**
- **Accommodation CRUD**: Create, read, update, delete accommodations
- **Booking Workflow**: Request → Review → Approval/Rejection
- **Payment Tracking**: Monthly payment schedules and verification
- **Availability Management**: Real-time booking limits and availability

#### 3. **Payment Processing System**
- **Payment Proof Upload**: File upload with validation
- **Payment Verification**: Admin review and approval workflow
- **Receipt Generation**: PDF receipt creation with PDFKit
- **Payment History**: Complete audit trail of all transactions

#### 4. **E-commerce Engine**
- **Product Management**: CRUD operations for Islamic products
- **Category System**: Hierarchical product categorization
- **Order Processing**: Cart to order conversion and tracking
- **Inventory Management**: Stock tracking and availability

#### 5. **Community Management**
- **Community CRUD**: Create and manage Islamic communities
- **Membership System**: Join/leave communities with role management
- **Content Moderation**: Admin tools for community oversight
- **Real-time Chat**: Socket.io powered community messaging

#### 6. **Real-time Communication**
- **Socket.io Server**: Handles WebSocket connections
- **Message Broadcasting**: Real-time message delivery
- **Presence Management**: Online/offline user status
- **Room Management**: Community-based chat rooms

## Mobile Application Architecture

### Technology Stack
- **React Native 0.79.5** for cross-platform development
- **Expo 53.0.20** for development and deployment
- **TypeScript 5.8.3** for type safety
- **React Navigation 7.x** for mobile navigation

### Directory Structure
```
mobile/src/
├── components/          # Reusable mobile components
│   ├── forms/          # Form components with validation
│   └── ui/             # UI components (buttons, inputs)
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   ├── booking/        # Booking-related screens
│   ├── shop/           # E-commerce screens
│   └── community/      # Community screens
├── navigation/          # Navigation configuration
├── services/            # Mobile-specific services
│   ├── api/            # API communication
│   ├── storage/        # Secure local storage
│   └── notifications/  # Push notifications
├── hooks/               # Custom mobile hooks
├── types/               # TypeScript definitions
└── utils/               # Mobile utility functions
```

### Mobile-Specific Features
- **Biometric Authentication**: Fingerprint/Face ID support
- **Push Notifications**: Real-time alerts for bookings and messages
- **Offline Support**: Basic functionality when internet is limited
- **Native Performance**: Optimized for mobile user experience

## Database Schema Architecture

### Core Data Models

#### 1. **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ["user", "admin"],
  // NYSC-specific fields
  gender: ["male", "female"],
  stateCode: String,
  batch: String,
  stream: ["A", "B", "C"],
  callUpNumber: String,
  // Profile fields
  phone: String,
  profileImage: String,
  profileCompleted: Boolean
}
```

#### 2. **Booking Model**
```javascript
{
  user: ObjectId (ref: User),
  accommodation: ObjectId (ref: Post),
  bookingType: ["accommodation", "program", "lecture"],
  status: ["pending", "approved", "rejected"],
  paymentSchedule: [{
    monthNumber: Number,
    dueDate: Date,
    amount: Number,
    status: ["pending", "paid", "overdue"]
  }],
  contactInfo: {
    phone: String,
    emergencyContact: Object
  }
}
```

#### 3. **Product Model**
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: ObjectId (ref: ProductCategory),
  images: [String],
  inventory: {
    quantity: Number,
    lowStockThreshold: Number
  },
  status: ["draft", "active", "inactive"]
}
```

#### 4. **Community Model**
```javascript
{
  title: String,
  description: String,
  type: ["initiative", "testimonial", "story"],
  category: ["education", "welfare", "spiritual"],
  participants: {
    featured: [Object],
    totalCount: Number
  },
  engagement: {
    likes: Number,
    shares: Number,
    comments: Number
  }
}
```

### Data Relationships
- **One-to-Many**: User → Bookings, User → Orders
- **Many-to-Many**: Users ↔ Communities (through membership)
- **Referenced Documents**: Bookings reference Users and Accommodations
- **Embedded Documents**: Payment schedules within Bookings

## Integration Points

### External Services
1. **Supabase Storage**: File and image storage
2. **Email Service**: SMTP for notifications
3. **SMS Service**: Optional SMS notifications
4. **Payment Gateways**: Bank transfer and mobile money integration

### API Endpoints Structure
```
/api/auth/*          # Authentication endpoints
/api/users/*         # User management
/api/bookings/*      # Booking operations
/api/products/*      # E-commerce operations
/api/communities/*   # Community management
/api/messages/*      # Messaging system
/api/payments/*      # Payment processing
/api/admin/*         # Admin-only endpoints
```

### Real-time Events
- **booking_update**: Booking status changes
- **new_message**: Direct messages
- **community_message**: Community chat messages
- **payment_verified**: Payment approval notifications
- **user_online/offline**: Presence updates

This architecture ensures scalability, maintainability, and clear separation of concerns while providing a robust foundation for the MCAN Lodge platform.
