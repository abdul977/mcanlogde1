# MCAN Lodge - Setup and Getting Started Guide

## Prerequisites

Before setting up the MCAN Lodge project, ensure you have the following installed on your development machine:

### Required Software
- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **MongoDB** - [Download from mongodb.com](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
- **Code Editor** - VS Code recommended with React/Node.js extensions

### Optional Software
- **Redis** - For caching (optional but recommended for production)
- **MongoDB Compass** - GUI for MongoDB database management
- **Postman** - For API testing

### For Mobile Development
- **Expo CLI** - `npm install -g @expo/cli`
- **Android Studio** - For Android development and emulator
- **Xcode** - For iOS development (Mac only)

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/abdul977/mcanlogde1.git
cd mcanlogde1/mcanlogde1-master
```

### 2. Install Dependencies

#### Install Root Dependencies
```bash
npm install
```

#### Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

#### Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

#### Install Mobile Dependencies (Optional)
```bash
cd mobile
npm install
cd ..
```

## Environment Configuration

### 1. Backend Environment Setup

Create a `.env` file in the `server/` directory:

```bash
cd server
touch .env
```

Add the following environment variables to `server/.env`:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mcan_lodge
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/mcan_lodge

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration (for file storage)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@mcan.org

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 2. Frontend Environment Setup

Create a `.env` file in the `client/` directory:

```bash
cd client
touch .env
```

Add the following to `client/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Mobile Environment Setup (Optional)

Create a `.env` file in the `mobile/` directory:

```bash
cd mobile
touch .env
```

Add the following to `mobile/.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
EXPO_PUBLIC_API_TIMEOUT=10000
```

## Database Setup

### Option 1: Local MongoDB

1. **Install MongoDB** locally following the official installation guide
2. **Start MongoDB** service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Windows
   net start MongoDB
   
   # On Linux
   sudo systemctl start mongod
   ```

3. **Verify MongoDB** is running:
   ```bash
   mongo --eval "db.adminCommand('ismaster')"
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account** at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster** (free tier available)
3. **Get Connection String** and update `MONGODB_URI` in your `.env` file
4. **Whitelist IP Address** in Atlas security settings

### Database Seeding (Optional)

The project includes scripts to populate the database with sample data:

```bash
cd server

# Seed accommodations/lodges
npm run seed

# Seed community data
npm run seed:community

# Check data integrity
npm run check
```

## Running the Application

### 1. Start the Backend Server

```bash
cd server
npm start
# or for development with auto-restart
npm run dev
```

The backend server will start on `http://localhost:5000`

### 2. Start the Frontend Application

In a new terminal window:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Start the Mobile Application (Optional)

In a new terminal window:

```bash
cd mobile
npm start
```

This will start the Expo development server. You can then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Verification Steps

### 1. Check Backend Health

Visit `http://localhost:5000` in your browser. You should see a basic API response.

### 2. Check Frontend

Visit `http://localhost:3000` in your browser. You should see the MCAN Lodge homepage.

### 3. Test Database Connection

Check the server console for database connection messages:
```
Connected to MongoDB
Server running on port 5000
```

### 4. Test API Endpoints

Use Postman or curl to test basic endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Common Issues and Solutions

### 1. Port Already in Use

If you get "Port already in use" errors:

```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>

# Or use different ports in your .env files
```

### 2. MongoDB Connection Issues

- **Check MongoDB is running**: `mongo --eval "db.adminCommand('ismaster')"`
- **Verify connection string**: Ensure `MONGODB_URI` is correct
- **Check firewall**: Ensure MongoDB port (27017) is accessible

### 3. Module Not Found Errors

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. CORS Issues

If you encounter CORS errors:
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `server/index.js`

### 5. File Upload Issues

- Ensure `uploads/` directory exists in server folder
- Check file permissions
- Verify `MAX_FILE_SIZE` and `UPLOAD_PATH` in `.env`

## Development Workflow

### 1. Making Changes

1. **Frontend Changes**: Edit files in `client/src/`, changes will hot-reload
2. **Backend Changes**: Edit files in `server/src/`, restart server or use `npm run dev`
3. **Database Changes**: Update models in `server/src/models/`

### 2. Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test

# Run mobile tests
cd mobile
npm test
```

### 3. Building for Production

```bash
# Build frontend
cd client
npm run build

# The built files will be in client/dist/
```

## Next Steps

### For New Developers

1. **Explore the Codebase**: Start with the documentation files in the `docs/` folder
2. **Understand the Models**: Review database schemas in `server/src/models/`
3. **Study the API**: Check route definitions in `server/src/routes/`
4. **Review Components**: Examine React components in `client/src/components/`

### For Administrators

1. **Set up Production Environment**: Configure production databases and services
2. **Deploy Applications**: Use the deployment guides in the `docs/` folder
3. **Configure Monitoring**: Set up logging and error tracking
4. **Set up Backups**: Configure database backup strategies

### Useful Commands Reference

```bash
# Backend
npm start              # Start production server
npm run dev           # Start development server with auto-restart
npm run seed          # Seed database with sample data
npm run check         # Check data integrity

# Frontend
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Mobile
npm start             # Start Expo development server
npm run android       # Run on Android
npm run ios           # Run on iOS
npm run web           # Run in web browser
```

## Getting Help

### Documentation
- Check the `docs/` folder for detailed documentation
- Review existing README files in each directory
- Consult the API documentation for endpoint details

### Community Resources
- **GitHub Issues**: Report bugs or request features
- **Stack Overflow**: Search for React, Node.js, and MongoDB solutions
- **Official Documentation**: React, Express, MongoDB, Expo documentation

### Contact Information
- **Project Repository**: https://github.com/abdul977/mcanlogde1
- **Live Frontend**: https://mcanlogde1.vercel.app/
- **Live Backend**: https://mcanlogde1.onrender.com

This setup guide should get you up and running with the MCAN Lodge project. Take your time to understand each component and don't hesitate to explore the codebase to better understand the system architecture.
