# MCAN Lodge Mobile App

A comprehensive React Native mobile application for the MCAN Lodge Islamic community platform, built with Expo and TypeScript.

## 🚀 Features

### Core Features
- 🏠 **Accommodation Booking** - Browse and book Islamic accommodations
- 🛍️ **E-commerce Shop** - Purchase Islamic products and books
- 📅 **Events & Programs** - Join lectures, Quran classes, and community events
- 💬 **Real-time Messaging** - Communicate with administrators
- 💳 **Payment Processing** - Multiple payment methods support
- 🕌 **Prayer Times** - Islamic prayer time integration
- 👤 **User Management** - Profile management and role-based access

### Enhanced Authentication & Security
- **Enhanced Login System** with comprehensive form validation
- **Biometric Authentication** (Fingerprint/Face ID) support
- **Remember Me & Auto-Login** functionality
- **Multi-step Password Reset** with OTP verification
- **Secure Storage** for sensitive data using Expo SecureStore

### User Experience Enhancements
- **Comprehensive Accessibility** support with screen reader compatibility
- **Smooth Animations & Transitions** with reduce motion support
- **Enhanced Navigation** with deep linking and programmatic navigation
- **Real-time Form Validation** with detailed error feedback
- **High Contrast Mode** support for visually impaired users

### Technical Improvements
- **TypeScript** for type safety and better development experience
- **Modular Architecture** with services, hooks, and components
- **Testing Infrastructure** with Jest and React Native Testing Library
- **Error Boundaries** for graceful error handling
- **Performance Optimizations** with native driver animations

## 🏗 Enhanced Architecture

### Project Structure
```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── forms/          # Form-specific components (ValidatedInput, ValidatedForm)
│   │   └── ui/             # General UI components (BiometricButton, AnimatedButton)
│   ├── constants/          # App constants and configuration
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   │   ├── useFormValidation.ts     # Form validation hook
│   │   ├── useBiometric.ts          # Biometric authentication hook
│   │   ├── useAccessibility.ts      # Accessibility hooks
│   │   ├── useAnimations.ts         # Animation hooks
│   │   └── useEnhancedNavigation.ts # Navigation hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   └── auth/           # Enhanced authentication screens
│   ├── services/           # Business logic and API services
│   │   ├── accessibility/  # Accessibility services
│   │   ├── animation/      # Animation services
│   │   ├── biometric/      # Biometric authentication
│   │   ├── navigation/     # Navigation services
│   │   └── storage/        # Secure storage services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions and validation
├── assets/                 # Static assets (images, fonts, etc.)
├── __tests__/              # Test files
├── docs/                   # Documentation
├── App.tsx                # Main app component with service integration
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on specific platforms:
   ```bash
   npm run ios     # iOS Simulator
   npm run android # Android Emulator
   npm run web     # Web browser
   ```

## Development Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Configuration

### Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_BASE_URL=https://mcanlogde1.onrender.com
EXPO_PUBLIC_API_TIMEOUT=10000
```

### App Configuration

The app configuration is managed in `app.json`:

- App name and description
- Bundle identifiers
- Icon and splash screen
- Platform-specific settings

## Design System

The app uses a consistent design system based on Islamic aesthetics:

### Colors
- **Primary**: #006400 (Deep Islamic Green)
- **Secondary**: #008000 (Medium Green)
- **Accent**: #004d00 (Dark Green)
- **Background**: #F9FAFB (Light Gray)

### Typography
- Font sizes from 12px to 48px
- Font weights from light (300) to extra bold (800)
- Consistent line heights for readability

### Spacing
- 4px base unit with consistent scale
- Touch targets minimum 44px for accessibility

## API Integration

The mobile app connects to the existing MCAN backend API:

- **Base URL**: https://mcanlogde1.onrender.com
- **Authentication**: JWT tokens
- **Real-time**: Socket.io for messaging
- **File Upload**: Supabase storage integration

## State Management

The app uses React Context for state management:

- **AuthContext** - User authentication and profile
- **CartContext** - Shopping cart state
- **SocketContext** - Real-time messaging
- **SearchContext** - Search functionality

## Testing

Testing setup includes:

- Jest for unit testing
- React Native Testing Library for component testing
- Mock services for API testing
- Test coverage reporting

## Deployment

The app is configured for deployment using Expo Application Services (EAS):

1. **Development Build**: For testing with custom native code
2. **Preview Build**: For internal testing and QA
3. **Production Build**: For app store submission

## Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Follow the design system guidelines
4. Write tests for new features
5. Update documentation as needed

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@mcan.org.ng
- GitHub Issues: Create an issue in the repository

---

**MCAN Mobile App** - Muslim Corpers' Association of Nigeria mobile application.
