# MCAN Lodge Deployment Guide

## Production URLs Integration

This guide covers the integration of production URLs for the MCAN Lodge application.

### Production URLs
- **Frontend (Vercel)**: https://mcanlogde1.vercel.app
- **Backend (Render)**: https://mcanlogde1.onrender.com

## Environment Configuration

### Backend (Server) Configuration

The backend environment has been configured with the following production URLs:

```env
# CORS Configuration - Production URLs
FRONTEND_URL=https://mcanlogde1.vercel.app
BACKEND_URL=https://mcanlogde1.onrender.com
```

### Frontend (Client) Configuration

The frontend environment has been configured with:

```env
# API Configuration - Production Backend URL
VITE_BASE_URL=https://mcanlogde1.onrender.com
```

## Files Updated

### 1. Server Environment Files
- `server/.env` - Updated with production URLs
- `server/.env.example` - Updated with production URL examples
- `server/.env.production` - New production-specific environment file

### 2. Client Environment Files
- `client/.env` - Updated with production backend URL
- `client/.env.example` - Updated with production URL examples
- `client/.env.production` - New production-specific environment file

### 3. Server Configuration
- `server/index.js` - Updated CORS configuration to include production URLs

### 4. Client Configuration
- `client/vite.config.js` - Updated proxy configuration for production
- All API calls already use `import.meta.env.VITE_BASE_URL` (no changes needed)

### 5. Documentation
- `ENVIRONMENT_SETUP.md` - Updated with production URL information
- `DEPLOYMENT_GUIDE.md` - This new deployment guide

## CORS Configuration

The server now accepts requests from:
- `http://localhost:5173` (development)
- `http://localhost:5174` (development)
- `http://127.0.0.1:5173` (development)
- `http://127.0.0.1:5174` (development)
- `https://mcanlogde1.vercel.app` (production frontend)
- Environment variable `FRONTEND_URL` (configurable)

## Deployment Steps

### For Render (Backend)
1. Set environment variables in Render dashboard
2. Use the values from `server/.env.production`
3. Ensure `NODE_ENV=production`

### For Vercel (Frontend)
1. Set environment variables in Vercel dashboard
2. Use the values from `client/.env.production`
3. Ensure `VITE_NODE_ENV=production`

## Testing the Integration

1. **Local Testing**: Both environments still work with localhost URLs
2. **Production Testing**: 
   - Frontend can communicate with production backend
   - Backend accepts requests from production frontend
   - CORS is properly configured

## Security Notes

- All sensitive keys should be updated for production
- Use live Stripe keys instead of test keys for production
- Ensure MongoDB Atlas is configured for production access
- Monitor API usage and set up alerts

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure frontend URL is in the CORS configuration
2. **API Connection**: Verify `VITE_BASE_URL` points to correct backend
3. **Environment Variables**: Check all required variables are set in deployment platforms

### Verification:
- Check browser network tab for API calls
- Verify CORS headers in response
- Test API endpoints directly
- Monitor server logs for connection attempts
