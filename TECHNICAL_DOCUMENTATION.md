# MCAN Lodge - Technical Documentation

## Technology Stack Overview

### Frontend Technologies

#### Web Application (Client)
- **React 18.3.1** - Modern UI library with hooks and functional components
- **Vite 5.4.10** - Fast build tool and development server with hot module replacement
- **Tailwind CSS 3.4.14** - Utility-first CSS framework for responsive design
- **React Router DOM 6.28.0** - Client-side routing and navigation
- **Axios 1.7.7** - HTTP client for API communication
- **Socket.io Client 4.7.0** - Real-time bidirectional communication
- **React Hot Toast 2.5.1** - Toast notifications for user feedback
- **React Quill 2.0.0** - Rich text editor for content creation
- **React Datepicker 7.5.0** - Date selection components
- **React Icons 5.3.0** - Icon library for UI elements

#### Mobile Application
- **React Native 0.79.5** - Cross-platform mobile development framework
- **Expo 53.0.20** - Development platform and build service
- **TypeScript 5.8.3** - Type safety and enhanced development experience
- **React Navigation 7.x** - Navigation library for mobile screens
- **Expo Secure Store 14.2.3** - Secure storage for sensitive data
- **Expo Notifications 0.31.4** - Push notification handling
- **React Native Gesture Handler 2.27.2** - Touch gesture management
- **React Native Reanimated 4.0.0** - High-performance animations

### Backend Technologies

#### Server Framework
- **Node.js** - JavaScript runtime environment
- **Express.js 4.21.1** - Web application framework
- **Socket.io 4.7.0** - Real-time bidirectional event-based communication
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware
- **Morgan 1.10.0** - HTTP request logger middleware
- **Body Parser 1.20.3** - Request body parsing middleware

#### Database & ODM
- **MongoDB 6.13.0** - NoSQL document database
- **Mongoose 8.8.1** - MongoDB object modeling for Node.js
- **Redis 4.6.0** - In-memory data structure store for caching

#### Authentication & Security
- **JSON Web Token (JWT) 9.0.2** - Token-based authentication
- **Bcryptjs 2.4.3** - Password hashing library
- **Express File Upload 1.5.1** - File upload middleware
- **Multer 2.0.1** - Multipart/form-data handling

#### External Services Integration
- **Supabase JS 2.50.3** - Backend-as-a-Service for storage and authentication
- **Nodemailer 7.0.5** - Email sending library
- **PDFKit 0.17.1** - PDF generation library
- **ExcelJS 4.4.0** - Excel file generation and parsing

#### Utilities & Tools
- **Moment Hijri 3.0.0** - Islamic calendar date handling
- **Slugify 1.6.6** - URL-friendly string generation
- **Node Cron 4.2.1** - Task scheduling
- **Dotenv 16.4.5** - Environment variable management

## Directory Structure & Organization

### Root Project Structure
```
mcanlogde1-master/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js application  
├── mobile/                 # React Native mobile app
├── docs/                   # Project documentation
├── package.json           # Root package configuration
└── README files           # Project information
```

### Frontend Directory Structure (client/)
```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AdminChatInterface.jsx
│   │   ├── BookingConfirmation.jsx
│   │   ├── ChatInterface.jsx
│   │   ├── MessagingSystem.jsx
│   │   ├── PaymentHistory.jsx
│   │   ├── Product/        # Product-related components
│   │   ├── Routes/         # Route-specific components
│   │   └── Mobile/         # Mobile-optimized components
│   ├── pages/              # Page-level components
│   │   ├── Admin/          # Admin dashboard pages
│   │   ├── User/           # User profile pages
│   │   ├── HomePage.jsx
│   │   ├── Shop.jsx
│   │   ├── Communities.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── context/            # React Context providers
│   │   ├── UserContext.jsx # User authentication state
│   │   ├── Cart.jsx        # Shopping cart state
│   │   ├── SocketContext.jsx # Real-time messaging
│   │   └── Search.jsx      # Search functionality
│   ├── hooks/              # Custom React hooks
│   │   └── useMobileResponsive.jsx
│   ├── services/           # API communication services
│   │   └── userService.js
│   ├── utils/              # Utility functions
│   │   └── prayerTimes.js
│   └── assets/             # Static assets
├── public/                 # Public static files
├── package.json           # Frontend dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── eslint.config.js       # ESLint configuration
```

### Backend Directory Structure (server/)
```
server/
├── src/
│   ├── models/             # Database schemas (Mongoose models)
│   │   ├── User.js         # User accounts and profiles
│   │   ├── Booking.js      # Accommodation bookings
│   │   ├── Product.js      # E-commerce products
│   │   ├── Community.js    # Community content
│   │   ├── Message.js      # Direct messaging
│   │   ├── CommunityMessage.js # Community chat
│   │   ├── PaymentVerification.js # Payment tracking
│   │   └── [other models]
│   ├── controllers/        # Business logic handlers
│   │   ├── User.js         # Authentication and user management
│   │   ├── Booking.js      # Booking operations
│   │   ├── Product.js      # E-commerce operations
│   │   ├── Payment.js      # Payment processing
│   │   ├── Community.js    # Community management
│   │   └── [other controllers]
│   ├── routes/             # API endpoint definitions
│   │   ├── User.js         # /api/auth/* routes
│   │   ├── Booking.js      # /api/bookings/* routes
│   │   ├── Product.js      # /api/products/* routes
│   │   ├── paymentRoutes.js # /api/payments/* routes
│   │   └── [other routes]
│   ├── middlewares/        # Custom middleware functions
│   │   └── Auth.js         # JWT authentication middleware
│   ├── config/             # Configuration files
│   │   ├── db.js           # MongoDB connection setup
│   │   ├── socket.js       # Socket.io configuration
│   │   ├── redis.js        # Redis connection setup
│   │   └── supabase.js     # Supabase configuration
│   ├── services/           # Business logic services
│   │   ├── emailService.js # Email notification service
│   │   ├── paymentService.js # Payment processing logic
│   │   ├── supabaseStorage.js # File upload handling
│   │   └── [other services]
│   ├── utils/              # Utility functions
│   │   ├── fileUpload.js   # File upload utilities
│   │   └── smsService.js   # SMS notification utilities
│   ├── scripts/            # Database and maintenance scripts
│   │   ├── seedLodges.js   # Seed accommodation data
│   │   ├── seedUsers.js    # Seed user data
│   │   └── [other scripts]
│   └── uploads/            # File upload storage
│       ├── payments/       # Payment proof uploads
│       └── temp/           # Temporary file storage
├── package.json           # Backend dependencies
├── index.js               # Server entry point
└── render.yaml            # Render deployment configuration
```

### Mobile Directory Structure (mobile/)
```
mobile/
├── src/
│   ├── components/         # Reusable mobile components
│   │   ├── forms/          # Form components with validation
│   │   └── ui/             # UI components (buttons, inputs)
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── booking/        # Booking-related screens
│   │   ├── shop/           # E-commerce screens
│   │   └── community/      # Community screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # Mobile-specific services
│   │   ├── api/            # API communication
│   │   ├── storage/        # Secure local storage
│   │   └── notifications/  # Push notification handling
│   ├── hooks/              # Custom mobile hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Mobile utility functions
├── assets/                 # Mobile-specific assets
├── package.json           # Mobile dependencies
├── app.json               # Expo configuration
├── eas.json               # Expo Application Services config
├── tsconfig.json          # TypeScript configuration
└── App.tsx                # Mobile app entry point
```

## Key Configuration Files

### Frontend Configuration

#### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

#### tailwind.config.js
```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#006400',
        secondary: '#008000'
      }
    }
  },
  plugins: []
}
```

### Backend Configuration

#### Database Connection (src/config/db.js)
```javascript
import mongoose from 'mongoose';

export const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
```

#### Socket.io Configuration (src/config/socket.js)
```javascript
import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });
  
  return io;
};
```

### Mobile Configuration

#### app.json (Expo Configuration)
```json
{
  "expo": {
    "name": "MCAN Mobile",
    "slug": "mcan-mobile",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    }
  }
}
```

## Entry Points

### Frontend Entry Point
- **File**: `client/src/main.jsx`
- **Purpose**: Initializes React application with providers and routing
- **Key Features**: User context, socket context, router setup

### Backend Entry Point  
- **File**: `server/index.js`
- **Purpose**: Starts Express server with all middleware and routes
- **Key Features**: Database connection, Socket.io setup, route mounting

### Mobile Entry Point
- **File**: `mobile/App.tsx`
- **Purpose**: Initializes React Native app with navigation
- **Key Features**: Navigation setup, context providers, error boundaries

## Environment Variables

### Frontend (.env)
```bash
VITE_API_BASE_URL=https://mcanlogde1.onrender.com
VITE_SOCKET_URL=https://mcanlogde1.onrender.com
```

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mcan_lodge
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# External Services
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://mcanlogde1.vercel.app
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_BASE_URL=https://mcanlogde1.onrender.com
EXPO_PUBLIC_API_TIMEOUT=10000
```

## Build and Deployment

### Frontend Build
```bash
cd client
npm run build    # Creates production build in dist/
npm run preview  # Preview production build locally
```

### Backend Deployment
- **Platform**: Render.com
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node.js

### Mobile Build
```bash
cd mobile
expo build:android  # Android APK
expo build:ios      # iOS IPA
eas build --platform all  # EAS Build Service
```

This technical documentation provides the foundation for understanding the MCAN Lodge codebase structure, technologies, and configuration requirements.
