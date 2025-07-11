# Render Deployment Guide for MCAN Lodge Backend

## Current Issue
The backend at https://mcanlogde1.onrender.com is not responding, causing the frontend to fail when making API calls.

## Fixed Configuration

### 1. Environment Variables
- Updated `server/.env` to use production settings:
  - `PORT=3000` (Render's expected port)
  - `NODE_ENV=production`
  - `BACKEND_URL=https://mcanlogde1.onrender.com`
  - `FRONTEND_URL=https://mcanlogde1.vercel.app`

### 2. Client Configuration
- Updated `client/.env` to point to production backend:
  - `VITE_BASE_URL=https://mcanlogde1.onrender.com`

### 3. Health Check Endpoints
Added health check endpoints to the server:
- `GET /health` - Basic health check
- `GET /api/status` - API status check

## Deployment Steps

### For Render (Backend):
1. Go to your Render dashboard
2. Select your `mcanlogde1` service
3. Go to Environment tab and ensure these variables are set:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://abdul977:salis977@cluster0.s6mmj.mongodb.net/mcanlogde?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   SUPABASE_URL=https://vdqbjdfhcxdkpsdrojtd.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   REDIS_HOST=redis-15049.c274.us-east-1-3.ec2.redns.redis-cloud.com
   REDIS_PORT=15049
   REDIS_PASSWORD=kJovVpgJkDeeZVvL5A6vhCznvWQ06kHU
   FRONTEND_URL=https://mcanlogde1.vercel.app
   BACKEND_URL=https://mcanlogde1.onrender.com
   ```
4. Trigger a manual deploy or push changes to trigger auto-deploy

### For Vercel (Frontend):
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Ensure `VITE_BASE_URL=https://mcanlogde1.onrender.com`
5. Redeploy the frontend

## Testing
After deployment, test these endpoints:
- https://mcanlogde1.onrender.com/health
- https://mcanlogde1.onrender.com/api/status
- https://mcanlogde1.onrender.com/api/post/get-all-post

## Common Issues
1. **Cold Start**: Render free tier has cold starts - first request may take 30+ seconds
2. **Environment Variables**: Ensure all required env vars are set in Render dashboard
3. **CORS**: Frontend URL must be in CORS whitelist (already configured)
4. **Database Connection**: Ensure MongoDB URI is correct and accessible

## Next Steps
1. Deploy the updated backend to Render
2. Deploy the updated frontend to Vercel
3. Test the connection between frontend and backend
4. Monitor logs for any errors
