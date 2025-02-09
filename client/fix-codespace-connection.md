# Fix Connection Issues in GitHub Codespace

## Current Issues
1. Connection refused error when trying to connect to http://localhost:3000
2. CORS configuration only allows localhost:5173
3. Environment variables not configured for Codespace environment

## Solution Steps

1. Server Updates (server/index.js)
   - Update CORS configuration to accept requests from Codespace URLs
   - Add environment check to determine correct CORS origin
   - Keep localhost:5173 for local development

2. Environment Configuration
   - Update client/.env to use dynamic backend URL
   - Use VITE_BASE_URL that works in both local and Codespace environments

3. Port Forwarding Setup
   - Ensure both client (5173) and server (3000) ports are forwarded in Codespace
   - Configure ports to be public if needed

4. Implementation Details:

   a. Server CORS Update:
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? [/\.github\.dev$/, 'http://localhost:5173'] // Allow Codespace URLs and local development
       : 'http://localhost:5173',
     credentials: true
   }));
   ```

   b. Client Environment:
   ```env
   VITE_BASE_URL=${CODESPACE_URL || 'http://localhost:3000'}
   ```

5. Running the Application
   - Start the server: `cd server && npm run dev`
   - Start the client: `cd client && npm run dev`
   - Ensure both ports are properly forwarded in Codespace

## Implementation Plan
1. First, update the server CORS configuration
2. Next, update the client environment setup
3. Test the connection in Codespace environment
4. Verify the changes work in both Codespace and local development