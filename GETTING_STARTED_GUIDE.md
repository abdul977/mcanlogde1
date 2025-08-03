# MCAN Lodge - Getting Started Guide

## Quick Overview

**MCAN Lodge** is a comprehensive platform for the Muslim Corpers' Association of Nigeria that combines:
- 🏠 **Accommodation booking** (like Airbnb for Islamic lodging)
- 🛍️ **E-commerce** (Islamic products and books)
- 👥 **Community platform** (Islamic social networking)
- 📚 **Educational programs** (Quran classes and lectures)
- 💬 **Real-time messaging** (customer support and community chat)

## What You Need to Know

### For Non-Technical People

MCAN Lodge is essentially **5 platforms in one**:

1. **Booking Platform**: Users can find and book Islamic-friendly accommodation, especially for NYSC corps members
2. **Online Shop**: Sell Islamic books, clothing, and religious items
3. **Social Network**: Muslims can join communities, chat, and share posts
4. **Learning Platform**: Offer Quran classes, Islamic lectures, and events
5. **Payment System**: Handle bookings and product payments with admin verification

### For Technical People

- **Frontend**: React.js web app + React Native mobile app
- **Backend**: Node.js/Express API server
- **Database**: MongoDB for data + Redis for caching
- **Storage**: Supabase for file uploads
- **Deployment**: Vercel (frontend) + Render (backend)
- **Real-time**: Socket.io for messaging and live updates

## Project Structure (Simple Explanation)

```
mcanlogde1-master/
├── client/          # Website (React) - What users see in browsers
├── server/          # Backend (Node.js) - Handles data and business logic  
├── mobile/          # Mobile app (React Native) - iOS/Android app
└── docs/            # Documentation and guides
```

### What Each Folder Does

#### `client/` - The Website
- Built with React (a popular web framework)
- Users interact with this through their web browsers
- Handles user interface, forms, and displays data
- Connects to the backend to get/send data

#### `server/` - The Backend
- Built with Node.js and Express (server technologies)
- Handles all business logic and data processing
- Manages user authentication, bookings, payments
- Provides API endpoints for the frontend and mobile app
- Connects to MongoDB database

#### `mobile/` - The Mobile App
- Built with React Native (cross-platform mobile framework)
- Same functionality as website but optimized for phones
- Works on both iOS and Android
- Connects to the same backend as the website

## Key Features Explained

### 1. User Management
- **Registration**: Users sign up with NYSC details (state code, batch, stream)
- **Authentication**: Secure login with JWT tokens
- **Profiles**: Users can upload photos and complete their profiles
- **Roles**: Regular users vs. administrators

### 2. Accommodation Booking
- **Browse**: Users can search for Islamic-friendly accommodations
- **Book**: Submit booking requests with dates and contact info
- **Payment**: Monthly payment schedules with proof upload
- **Approval**: Admins review and approve/reject bookings

### 3. E-commerce
- **Products**: Islamic books, clothing, religious items
- **Shopping Cart**: Add/remove items, calculate totals
- **Orders**: Checkout process with shipping details
- **Inventory**: Admin manages product stock and categories

### 4. Community Features
- **Communities**: Users can join Islamic communities by interest
- **Messaging**: Real-time chat between users and admins
- **Posts**: Share content, images, and engage with community
- **Moderation**: Admins can moderate content and manage communities

### 5. Educational Programs
- **Quran Classes**: Online and offline Quran learning
- **Lectures**: Islamic educational content and events
- **Registration**: Users can register for programs
- **Resources**: Access to Islamic learning materials

## How Everything Connects

### Data Flow (Simplified)
1. **User visits website/app** → Frontend loads
2. **User performs action** (login, book, shop) → Frontend sends request to Backend
3. **Backend processes request** → Checks database, validates data
4. **Backend sends response** → Frontend updates display
5. **Real-time updates** → Socket.io pushes live updates to all connected users

### Example: Booking Process
1. User browses accommodations on frontend
2. Frontend requests accommodation list from backend API
3. Backend queries MongoDB database for accommodations
4. User selects accommodation and submits booking
5. Backend creates booking record in database
6. Admin gets notification via real-time messaging
7. Admin reviews and approves/rejects booking
8. User gets notification of approval status
9. User uploads payment proof
10. Admin verifies payment and updates status

## Technology Stack (Explained Simply)

### Frontend Technologies
- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool for development
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: Library for making API calls to backend
- **Socket.io Client**: Real-time communication with backend

### Backend Technologies
- **Node.js**: JavaScript runtime for server-side development
- **Express**: Web framework for building APIs
- **MongoDB**: NoSQL database for storing data
- **Mongoose**: Library for working with MongoDB
- **JWT**: JSON Web Tokens for user authentication
- **Socket.io**: Real-time bidirectional communication

### External Services
- **Supabase**: Cloud storage for images and files
- **MongoDB Atlas**: Cloud database hosting
- **Vercel**: Frontend hosting and deployment
- **Render**: Backend hosting and deployment
- **Gmail SMTP**: Email notifications

## Development Environment Setup

### Prerequisites
1. **Node.js** (v18 or higher) - JavaScript runtime
2. **Git** - Version control system
3. **Code Editor** - VS Code recommended
4. **MongoDB** - Database (local or cloud)

### Quick Start (5 minutes)

1. **Clone the repository**
```bash
git clone https://github.com/abdul977/mcanlogde1.git
cd mcanlogde1
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database and service credentials
npm run dev
```

3. **Setup Frontend** (in new terminal)
```bash
cd client
npm install
npm run dev
```

4. **Setup Mobile** (optional, in new terminal)
```bash
cd mobile
npm install
npm start
```

### Environment Variables Needed

#### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Common Development Tasks

### Adding a New Feature
1. Create new API endpoint in `server/src/routes/`
2. Add controller logic in `server/src/controllers/`
3. Create/update database model in `server/src/models/`
4. Add frontend component in `client/src/components/`
5. Create page component in `client/src/pages/`
6. Add routing in `client/src/App.jsx`

### Database Operations
- **View data**: Use MongoDB Compass or Atlas web interface
- **Seed data**: Run scripts in `server/src/scripts/`
- **Backup**: Use MongoDB Atlas automated backups

### Testing
- **Backend**: `npm test` in server directory
- **Frontend**: `npm test` in client directory
- **Manual testing**: Use Postman for API testing

## Deployment

### Production URLs
- **Website**: https://mcanlogde1.vercel.app/
- **API**: https://mcanlogde1.onrender.com
- **Database**: MongoDB Atlas cloud

### Deployment Process
1. **Frontend**: Automatically deploys to Vercel on git push
2. **Backend**: Automatically deploys to Render on git push
3. **Mobile**: Build with EAS and deploy to app stores

## Getting Help

### Documentation Files
- `COMPREHENSIVE_CODEBASE_DOCUMENTATION.md` - Complete technical documentation
- `TECHNICAL_DOCUMENTATION.md` - Technology stack details
- `PROJECT_OVERVIEW.md` - Business requirements and features
- `docs/` folder - Specific feature documentation

### Key Contacts
- **Development Team**: Check repository contributors
- **MCAN Organization**: Main stakeholders and users

### Common Issues
1. **Database connection**: Check MongoDB URI and network access
2. **API errors**: Verify environment variables and service credentials
3. **Build failures**: Check Node.js version and dependency conflicts
4. **Authentication issues**: Verify JWT secret and token expiration

## Next Steps

1. **Read the comprehensive documentation** for detailed technical information
2. **Explore the codebase** starting with main entry points
3. **Set up development environment** and run the application locally
4. **Review existing features** to understand the current functionality
5. **Check the issues/roadmap** for planned improvements and bug fixes

This platform serves a real community need and has significant potential for growth and impact in the Nigerian Muslim community.
