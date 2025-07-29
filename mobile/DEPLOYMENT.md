# MCAN Lodge Mobile App - Deployment Guide

## Pre-Deployment Checklist

### 1. Code Quality
- [x] All TypeScript errors resolved
- [x] ESLint warnings addressed
- [x] Code formatted with Prettier
- [x] No console.log statements in production code
- [x] Error boundaries implemented
- [x] Loading states for all async operations

### 2. Testing
- [x] Unit tests written for core components
- [x] Integration tests for critical user flows
- [x] Manual testing on iOS and Android
- [x] Performance testing completed
- [x] Accessibility testing completed

### 3. Security
- [x] API endpoints secured
- [x] Sensitive data encrypted
- [x] Authentication tokens properly managed
- [x] Input validation implemented
- [x] Security audit completed

### 4. Performance
- [x] Bundle size optimized
- [x] Images optimized
- [x] Lazy loading implemented
- [x] Memory leaks addressed
- [x] Network requests optimized

### 5. App Store Requirements
- [x] App icons created (1024x1024, 512x512, etc.)
- [x] Splash screens designed
- [x] Screenshots prepared
- [x] App description written
- [x] Privacy policy updated
- [x] Terms of service updated

## Build Configuration

### Environment Variables
```bash
# Production
EXPO_PUBLIC_API_BASE_URL=https://mcanlogde1.onrender.com
EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_DEBUG_MODE=false
```

### Build Commands
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## App Store Submission

### iOS App Store
1. Create app in App Store Connect
2. Upload build using EAS Submit
3. Fill out app information
4. Submit for review

### Google Play Store
1. Create app in Google Play Console
2. Upload AAB file
3. Complete store listing
4. Submit for review

## Post-Deployment

### Monitoring
- Set up crash reporting
- Monitor app performance
- Track user analytics
- Monitor API usage

### Updates
- Use Expo Updates for OTA updates
- Plan regular app store updates
- Monitor user feedback
- Address critical issues promptly

## Rollback Plan
- Keep previous builds available
- Have rollback procedure documented
- Monitor app stability after deployment
- Be prepared to revert if issues arise
