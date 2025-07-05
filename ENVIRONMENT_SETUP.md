# Environment Setup Guide

This guide will help you set up the environment variables for both the frontend and backend of the MCAN Lodge application.

## Prerequisites

Before setting up the environment variables, make sure you have accounts and API keys for:

1. **MongoDB Atlas** - Database hosting
2. **Cloudinary** - Image upload and management
3. **Email Service** (Optional) - For notifications

## Backend Environment Setup (server/.env)

1. Copy the example file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:

### Database Configuration
- **MONGODB_URI**: Your MongoDB connection string
  - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
  - Create a cluster and get your connection string
  - Replace `username`, `password`, and `cluster` with your actual values

### JWT Configuration
- **JWT_SECRET**: A strong random secret key for JWT tokens
  - Generate a random string (at least 32 characters)
  - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Cloudinary Configuration
- **CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name
- **CLOUDINARY_API_KEY**: Your Cloudinary API key
- **CLOUDINARY_API_SECRET**: Your Cloudinary API secret
  - Get these from [Cloudinary Console](https://cloudinary.com/console)

## Frontend Environment Setup (client/.env)

1. Copy the example file:
   ```bash
   cd client
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:

### API Configuration
- **VITE_BASE_URL**: Backend server URL
  - Development: `http://localhost:3000`
  - Production: `https://mcanlogde1.onrender.com`

## Important Notes

1. **Never commit .env files to version control** - They contain sensitive information
2. **The .env files are already in .gitignore** - This prevents accidental commits
3. **Use test keys during development** - Switch to live keys only in production
4. **Keep your secret keys secure** - Don't share them or expose them in client-side code

## Verification

After setting up the environment variables:

1. **Test Backend**:
   ```bash
   cd server
   npm start
   ```
   - Check if the server connects to MongoDB successfully
   - Look for "Connected to MongoDB Atlas" in the console

2. **Test Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   - Check if the frontend can communicate with the backend

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**:
   - Check your MONGODB_URI format
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify username/password are correct

2. **Cloudinary Upload Issues**:
   - Verify all three Cloudinary credentials are correct
   - Check Cloudinary console for usage limits

4. **CORS Issues**:
   - Ensure FRONTEND_URL in backend .env matches your frontend URL
     - Development: `http://localhost:5173`
     - Production: `https://mcanlogde1.vercel.app`
   - Check if the frontend VITE_BASE_URL points to the correct backend
     - Development: `http://localhost:3000`
     - Production: `https://mcanlogde1.onrender.com`

## Security Best Practices

1. Use strong, unique passwords for all services
2. Enable 2FA on all accounts (MongoDB, Cloudinary)
3. Regularly rotate API keys
4. Use environment-specific keys (test for development, live for production)
5. Monitor API usage and set up alerts for unusual activity

## Production Deployment

When deploying to production:

1. Create new .env files with production values
2. Update VITE_BASE_URL to your production backend URL (`https://mcanlogde1.onrender.com`)
3. Update FRONTEND_URL to your production frontend URL (`https://mcanlogde1.vercel.app`)
4. Ensure all services are configured for production use
5. Set NODE_ENV=production in your backend environment

## Production URLs

- **Frontend (Vercel)**: https://mcanlogde1.vercel.app
- **Backend (Render)**: https://mcanlogde1.onrender.com
