# MCAN Lodge - Comprehensive Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Database Design](#database-design)
6. [API Documentation](#api-documentation)
7. [Frontend Architecture](#frontend-architecture)
8. [Mobile Application](#mobile-application)
9. [Deployment & Infrastructure](#deployment--infrastructure)
10. [Development Workflow](#development-workflow)

---

## Project Overview

### What is MCAN Lodge?

**MCAN Lodge** is a comprehensive digital platform designed for the **Muslim Corpers' Association of Nigeria (MCAN)**. It serves as an all-in-one solution for managing Islamic accommodation bookings, community engagement, e-commerce, and educational programs.

### What Does MCAN Lodge Do?

In simple terms, MCAN Lodge is like a combination of:
- **Airbnb for Islamic accommodations** - Users can browse and book Islamic-friendly lodging
- **Facebook for Muslim communities** - Members can join communities, share posts, and communicate
- **Amazon for Islamic products** - An e-commerce platform selling Islamic books, clothing, and religious items
- **Eventbrite for Islamic programs** - Users can register for Quran classes, lectures, and community events
- **WhatsApp for customer support** - Real-time messaging between users and administrators

### Target Users
- **NYSC Corps Members** - Young Nigerians serving their country who need Islamic-friendly accommodation
- **Muslim Travelers** - Anyone seeking halal accommodation and Islamic community connections
- **Islamic Community Members** - People wanting to join Islamic educational programs and purchase religious items
- **Administrators** - MCAN staff managing bookings, payments, and community activities

### Core Purpose
The platform solves the challenge of finding Islamic-compliant accommodation and community support for Muslims, particularly NYSC corps members, while providing a complete ecosystem for Islamic lifestyle needs including education, shopping, and community engagement.

---

## System Architecture

MCAN Lodge follows a modern **multi-platform architecture** with three main components:

### 1. Frontend (Web Application)
- **Technology**: React.js with Vite
- **Purpose**: Main web interface for users to access all platform features
- **Location**: `mcanlogde1-master/client/`
- **Deployment**: Vercel (https://mcanlogde1.vercel.app/)

### 2. Backend (API Server)
- **Technology**: Node.js with Express.js
- **Purpose**: Handles all business logic, database operations, and API endpoints
- **Location**: `mcanlogde1-master/server/`
- **Deployment**: Render (https://mcanlogde1.onrender.com)

### 3. Mobile Application
- **Technology**: React Native with Expo
- **Purpose**: Native mobile experience for iOS and Android users
- **Location**: `mcanlogde1-master/mobile/`
- **Deployment**: EAS Build Service

### 4. Database & Storage
- **Primary Database**: MongoDB (hosted on MongoDB Atlas)
- **File Storage**: Supabase Storage (for images and documents)
- **Caching**: Redis (for session management and performance)

---

## Technology Stack

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

---

## Directory Structure

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

---

## Database Design

MCAN Lodge uses MongoDB as its primary database with the following key collections:

### Core Data Models

#### 1. User Model
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
  profileCompleted: Boolean,
  dateOfBirth: Date,
  institution: String,
  course: String
}
```

#### 2. Booking Model
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
  },
  checkIn: Date,
  checkOut: Date,
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Product Model (E-commerce)
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: ObjectId (ref: ProductCategory),
  images: [String],
  stock: Number,
  status: ["active", "inactive"],
  tags: [String],
  slug: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Community Model
```javascript
{
  name: String,
  description: String,
  category: String,
  isPrivate: Boolean,
  members: [ObjectId] (ref: User),
  admins: [ObjectId] (ref: User),
  rules: String,
  image: String,
  slug: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. Message Model (Direct Messaging)
```javascript
{
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  content: String,
  messageType: ["text", "image", "file"],
  isRead: Boolean,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. PaymentVerification Model
```javascript
{
  user: ObjectId (ref: User),
  booking: ObjectId (ref: Booking),
  amount: Number,
  paymentMethod: String,
  proofOfPayment: String,
  status: ["pending", "verified", "rejected"],
  verifiedBy: ObjectId (ref: User),
  verificationDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Database Relationships

```
User (1) -----> (Many) Booking
User (1) -----> (Many) PaymentVerification
User (Many) <---> (Many) Community (through membership)
User (1) -----> (Many) Message (as sender)
User (1) -----> (Many) Message (as receiver)
Product (Many) -----> (1) ProductCategory
Booking (1) -----> (Many) PaymentVerification
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account
```javascript
Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "gender": "male",
  "stateCode": "LA",
  "batch": "2024A",
  "stream": "A",
  "callUpNumber": "LA/24A/1234"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST /api/auth/login
Authenticate user and get access token
```javascript
Request Body:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Booking Endpoints

#### GET /api/bookings
Get all bookings (admin) or user's bookings
```javascript
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "bookings": [
    {
      "id": "booking_id",
      "user": "user_id",
      "accommodation": "post_id",
      "status": "pending",
      "totalAmount": 50000,
      "checkIn": "2024-01-15",
      "checkOut": "2024-12-15"
    }
  ]
}
```

#### POST /api/bookings
Create a new booking
```javascript
Headers: Authorization: Bearer <token>

Request Body:
{
  "accommodation": "post_id",
  "checkIn": "2024-01-15",
  "checkOut": "2024-12-15",
  "contactInfo": {
    "phone": "+2348123456789",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+2348987654321"
    }
  }
}

Response:
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "booking_id",
    "status": "pending",
    "totalAmount": 50000
  }
}
```

### Product Endpoints

#### GET /api/products
Get all products with pagination and filtering
```javascript
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- category: string
- search: string

Response:
{
  "success": true,
  "products": [
    {
      "id": "product_id",
      "name": "Islamic Book",
      "price": 2500,
      "category": "Books",
      "images": ["image_url"],
      "stock": 10
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50
  }
}
```

#### POST /api/products
Create a new product (admin only)
```javascript
Headers: Authorization: Bearer <admin_token>

Request Body:
{
  "name": "Islamic Book",
  "description": "A comprehensive guide to Islamic practices",
  "price": 2500,
  "category": "category_id",
  "stock": 10,
  "tags": ["islamic", "book", "education"]
}

Response:
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "product_id",
    "name": "Islamic Book",
    "slug": "islamic-book"
  }
}
```

### Payment Endpoints

#### POST /api/payments/upload
Upload payment proof for verification
```javascript
Headers: Authorization: Bearer <token>

Request Body (multipart/form-data):
{
  "booking": "booking_id",
  "amount": 25000,
  "paymentMethod": "Bank Transfer",
  "proofOfPayment": file
}

Response:
{
  "success": true,
  "message": "Payment proof uploaded successfully",
  "payment": {
    "id": "payment_id",
    "status": "pending"
  }
}
```

#### PUT /api/payments/:id/verify
Verify payment (admin only)
```javascript
Headers: Authorization: Bearer <admin_token>

Request Body:
{
  "status": "verified",
  "notes": "Payment verified successfully"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### Community Endpoints

#### GET /api/communities
Get all communities
```javascript
Response:
{
  "success": true,
  "communities": [
    {
      "id": "community_id",
      "name": "Lagos NYSC Muslims",
      "description": "Community for NYSC corps members in Lagos",
      "memberCount": 150,
      "isPrivate": false
    }
  ]
}
```

#### POST /api/communities/:id/join
Join a community
```javascript
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Successfully joined community"
}
```

---

## Frontend Architecture

### React Application Structure

The frontend is built with React 18 and follows modern React patterns:

#### Key Components

1. **App.jsx** - Main application component with routing
2. **Navbar.jsx** - Navigation component with authentication state
3. **Footer.jsx** - Site footer with links and information
4. **HomePage.jsx** - Landing page with featured content
5. **UserDashboard.jsx** - User profile and booking management
6. **AdminDashboard.jsx** - Admin panel for managing platform

#### Context Providers

1. **UserContext** - Manages user authentication state
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

  // Authentication logic here

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
```

2. **CartContext** - Manages shopping cart state
```javascript
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const addToCart = (product) => {
    // Add product to cart logic
  };

  const removeFromCart = (productId) => {
    // Remove product from cart logic
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      addToCart,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
```

3. **SocketContext** - Manages real-time communication
```javascript
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL);
      setSocket(newSocket);

      newSocket.emit('join', user.id);

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
```

#### Routing Structure

```javascript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/shop" element={<Shop />} />
  <Route path="/communities" element={<Communities />} />

  {/* Protected User Routes */}
  <Route path="/dashboard" element={
    <UserRoutes>
      <UserDashboard />
    </UserRoutes>
  } />

  {/* Admin Routes */}
  <Route path="/admin/*" element={
    <PrivateRoute>
      <AdminRoutes />
    </PrivateRoute>
  } />
</Routes>
```

#### State Management

The application uses a combination of:
- **React Context** for global state (auth, cart, socket)
- **useState** for local component state
- **useEffect** for side effects and API calls
- **Custom hooks** for reusable logic

#### Styling

- **Tailwind CSS** for utility-first styling
- **Responsive design** with mobile-first approach
- **Custom components** with consistent design system
- **Dark/light mode** support (planned)

---

## Mobile Application

### React Native Architecture

The mobile app is built with React Native and Expo, providing native iOS and Android experiences.

#### Key Features

1. **Cross-platform compatibility** - Single codebase for iOS and Android
2. **TypeScript integration** - Type safety and better development experience
3. **Expo managed workflow** - Simplified development and deployment
4. **Native navigation** - React Navigation for smooth transitions
5. **Offline support** - Local storage for critical data
6. **Push notifications** - Real-time alerts and updates

#### Navigation Structure

```typescript
// Main Navigator
const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Accommodation" component={AccommodationStack} />
      <Tab.Screen name="Shop" component={ShopStack} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};
```

#### Mobile App Screens

1. **Authentication Screens**
   - Login screen with biometric authentication
   - Registration with NYSC details
   - Password reset functionality

2. **Home Screen**
   - Dashboard with quick actions
   - Prayer times display
   - Recent bookings and orders

3. **Accommodation Screens**
   - Browse accommodations with filters
   - Detailed accommodation view
   - Booking form and confirmation

4. **Shop Screens**
   - Product catalog with categories
   - Product details with images
   - Shopping cart and checkout

5. **Community Screens**
   - Community list and search
   - Community chat interface
   - Post creation and sharing

6. **Profile Screens**
   - User profile management
   - Booking history
   - Payment history
   - Settings and preferences

#### Mobile-Specific Features

1. **Biometric Authentication**
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const authenticateWithBiometrics = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access MCAN Lodge',
      fallbackLabel: 'Use password instead'
    });

    return result.success;
  }

  return false;
};
```

2. **Push Notifications**
```typescript
import * as Notifications from 'expo-notifications';

const registerForPushNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status === 'granted') {
    const token = await Notifications.getExpoPushTokenAsync();
    // Send token to backend for storage
    return token;
  }

  return null;
};
```

3. **Offline Storage**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};
```

---

## Deployment & Infrastructure

### Production Environment

#### Frontend Deployment (Vercel)
- **Platform**: Vercel
- **URL**: https://mcanlogde1.vercel.app/
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Environment Variables**:
  ```
  VITE_API_BASE_URL=https://mcanlogde1.onrender.com
  VITE_SOCKET_URL=https://mcanlogde1.onrender.com
  ```

#### Backend Deployment (Render)
- **Platform**: Render.com
- **URL**: https://mcanlogde1.onrender.com
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=your_jwt_secret
  SUPABASE_URL=your_supabase_url
  SUPABASE_ANON_KEY=your_supabase_key
  SMTP_HOST=smtp.gmail.com
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  PORT=5000
  NODE_ENV=production
  FRONTEND_URL=https://mcanlogde1.vercel.app
  ```

#### Database (MongoDB Atlas)
- **Provider**: MongoDB Atlas
- **Cluster**: Shared cluster (M0)
- **Region**: AWS / US East (N. Virginia)
- **Backup**: Automated daily backups
- **Security**: IP whitelist and database user authentication

#### File Storage (Supabase)
- **Provider**: Supabase Storage
- **Buckets**:
  - `user-profiles` - User profile images
  - `accommodation-images` - Property photos
  - `product-images` - E-commerce product photos
  - `payment-proofs` - Payment verification documents
- **Security**: Row Level Security (RLS) enabled

#### Mobile App Deployment
- **Platform**: Expo Application Services (EAS)
- **Build Service**: EAS Build
- **Distribution**:
  - iOS: App Store Connect
  - Android: Google Play Console
- **Over-the-Air Updates**: Expo Updates for non-native changes

### Development Environment Setup

#### Prerequisites
```bash
# Node.js (v18 or higher)
node --version

# npm or yarn
npm --version

# Git
git --version

# For mobile development
npm install -g @expo/cli
```

#### Backend Setup
```bash
# Clone repository
git clone https://github.com/abdul977/mcanlogde1.git
cd mcanlogde1/server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

#### Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Mobile Setup
```bash
# Navigate to mobile directory
cd ../mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run android  # For Android
npm run ios      # For iOS
```

---

## Development Workflow

### Git Workflow

1. **Main Branch**: `main` - Production-ready code
2. **Development Branch**: `develop` - Integration branch
3. **Feature Branches**: `feature/feature-name` - New features
4. **Hotfix Branches**: `hotfix/issue-description` - Critical fixes

### Code Standards

#### JavaScript/TypeScript
- Use ES6+ features
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful variable and function names
- Add JSDoc comments for complex functions

#### React Components
- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Keep components small and focused
- Use TypeScript for mobile components

#### API Development
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement error handling
- Add input validation
- Document API endpoints

### Testing Strategy

#### Frontend Testing
```bash
# Unit tests with Jest
npm test

# E2E tests with Cypress
npm run cypress:open
```

#### Backend Testing
```bash
# API tests with Jest and Supertest
npm test

# Integration tests
npm run test:integration
```

#### Mobile Testing
```bash
# Unit tests with Jest
npm test

# Device testing with Expo Go
expo start
```

### Monitoring and Analytics

#### Error Tracking
- **Frontend**: Sentry for error monitoring
- **Backend**: Winston for logging
- **Mobile**: Expo crash reporting

#### Performance Monitoring
- **Frontend**: Web Vitals tracking
- **Backend**: Response time monitoring
- **Mobile**: Expo performance monitoring

#### Analytics
- **User Analytics**: Google Analytics
- **Business Metrics**: Custom dashboard
- **API Usage**: Request logging and analysis

---

## Security Considerations

### Authentication & Authorization
- JWT tokens with expiration
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Secure session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention (using Mongoose)
- XSS protection
- CORS configuration
- Rate limiting for API endpoints

### File Upload Security
- File type validation
- File size limits
- Virus scanning (planned)
- Secure file storage with Supabase

### Mobile Security
- Secure storage for sensitive data
- Certificate pinning (planned)
- Biometric authentication
- App transport security

---

## Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization with Vite
- Caching strategies
- Service worker implementation (planned)

### Backend Optimization
- Database indexing
- Query optimization
- Redis caching
- API response compression
- Connection pooling

### Mobile Optimization
- Image compression
- Offline data caching
- Lazy loading of screens
- Bundle size optimization
- Native module usage where needed

---

## Future Enhancements

### Planned Features
1. **Advanced Search** - Elasticsearch integration
2. **Video Content** - Video lectures and tutorials
3. **Multi-language Support** - Arabic and Hausa translations
4. **Advanced Analytics** - Detailed user behavior tracking
5. **AI Chatbot** - Automated customer support
6. **Social Features** - Enhanced community interactions
7. **Mobile Payments** - Integration with local payment providers
8. **Offline Mode** - Enhanced offline functionality

### Technical Improvements
1. **Microservices Architecture** - Service decomposition
2. **GraphQL API** - More efficient data fetching
3. **Progressive Web App** - Enhanced web app capabilities
4. **Advanced Caching** - Redis cluster setup
5. **Load Balancing** - Multiple server instances
6. **CI/CD Pipeline** - Automated testing and deployment
7. **Monitoring Dashboard** - Real-time system monitoring
8. **Backup Strategy** - Automated backup and recovery

---

## Conclusion

MCAN Lodge is a comprehensive platform that successfully combines accommodation booking, e-commerce, community engagement, and educational programs into a single, cohesive solution for the Muslim community in Nigeria. The modern technology stack ensures scalability, maintainability, and excellent user experience across web and mobile platforms.

The codebase is well-structured with clear separation of concerns, making it easy for new developers to understand and contribute to the project. The documentation, testing strategies, and deployment processes are designed to support the platform's growth and evolution.

For any questions or clarifications about the codebase, please refer to the individual documentation files in the `docs/` directory or contact the development team.
