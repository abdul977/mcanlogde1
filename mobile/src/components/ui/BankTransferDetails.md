# BankTransferDetails Component

## Overview

The `BankTransferDetails` component is a dynamic, responsive React Native component that fetches bank transfer information from API endpoints and displays it with proper styling, overflow protection, and error handling. It replaces static hardcoded bank details with real-time data from the payment configuration API.

## Features

### ✅ Dynamic API Integration
- Fetches bank details from `/api/payment-config/details` endpoint
- Automatic fallback to default configuration if API fails
- Real-time error handling and user feedback
- Proper loading states with activity indicators

### ✅ Responsive Design
- Adapts to different screen sizes (Mobile, Tablet, Desktop)
- Proper text overflow handling with ellipsis
- Flexible container sizing based on screen dimensions
- Touch-friendly interface with appropriate spacing

### ✅ User Experience
- Copy-to-clipboard functionality for bank details
- Clear visual feedback for user actions
- Customizable payment instructions
- Professional styling with consistent design system

### ✅ Error Handling
- Graceful degradation when API is unavailable
- Retry functionality for failed requests
- Clear error messages for users
- Comprehensive logging for debugging

## Usage

### Basic Implementation

```tsx
import { BankTransferDetails } from '../../components';

// Simple usage with default settings
<BankTransferDetails />
```

### Advanced Configuration

```tsx
<BankTransferDetails
  showCopyButtons={true}
  showInstructions={true}
  customInstructions={
    '1. Transfer the exact amount to the bank details above\n' +
    '2. Use your order reference as the transfer description\n' +
    '3. Upload your payment receipt for verification\n' +
    '4. Your payment will be processed within 24 hours'
  }
  containerStyle={{ marginVertical: 16 }}
  onDataLoaded={(bankDetails) => {
    console.log('Bank details loaded:', bankDetails);
  }}
  onError={(error) => {
    console.error('Failed to load bank details:', error);
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLoading` | `boolean` | `true` | Show loading indicator while fetching data |
| `containerStyle` | `ViewStyle` | `undefined` | Custom styling for the container |
| `showCopyButtons` | `boolean` | `true` | Enable copy-to-clipboard buttons |
| `showInstructions` | `boolean` | `true` | Display payment instructions |
| `customInstructions` | `string` | `undefined` | Custom instruction text |
| `onDataLoaded` | `(bankDetails: BankDetails) => void` | `undefined` | Callback when data loads successfully |
| `onError` | `(error: string) => void` | `undefined` | Callback when error occurs |

## API Integration

### Endpoint
- **URL**: `/api/payment-config/details`
- **Method**: `GET`
- **Authentication**: Not required (public endpoint)

### Response Structure
```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "paymentDetails": {
    "organizationName": "Muslim Corps Members Association of Nigeria (MCAN)",
    "bankDetails": {
      "accountName": "Muslim Corps Members Association of Nigeria",
      "accountNumber": "2034567890",
      "bankName": "First Bank of Nigeria",
      "sortCode": "011151003"
    },
    "mobilePayments": [...],
    "paymentInstructions": {...},
    "paymentSupport": {...},
    "currency": {...}
  }
}
```

## Responsive Behavior

### Screen Size Breakpoints
- **Mobile**: < 768px width
- **Tablet**: 768px - 1024px width
- **Desktop**: > 1024px width

### Adaptive Features
- Font sizes scale based on screen size
- Container padding adjusts for smaller screens
- Maximum width constraints on larger screens
- Touch targets meet accessibility guidelines (44px minimum)

## Error States

### 1. Loading State
```tsx
// Shows activity indicator and loading message
<ActivityIndicator size="large" color={COLORS.PRIMARY} />
<Text>Loading bank details...</Text>
```

### 2. API Error State
```tsx
// Shows error icon, message, and retry button
<Ionicons name="alert-circle-outline" size={32} color={COLORS.ERROR} />
<Text>Unable to Load Bank Details</Text>
<TouchableOpacity onPress={retry}>Retry</TouchableOpacity>
```

### 3. No Data State
```tsx
// Shows warning when bank details are not configured
<Ionicons name="information-circle-outline" size={32} color={COLORS.WARNING} />
<Text>Bank Details Unavailable</Text>
```

## Implementation Details

### File Structure
```
mobile/src/components/ui/
├── BankTransferDetails.tsx          # Main component
├── BankTransferDetailsTest.tsx      # Test component
└── BankTransferDetails.md          # This documentation
```

### Dependencies
- `react-native`: Core React Native components
- `@expo/vector-icons`: Icon library
- `../../constants`: Design system constants
- `../../services/api/paymentConfigService`: API service

### Updated Screens
1. **CheckoutFlowScreen.tsx**: Replaced static bank transfer info with dynamic component
2. **BookingFlowScreen.tsx**: Replaced hardcoded bank details with API-driven component

## Testing

### Test Component
Use `BankTransferDetailsTest.tsx` to verify:
- Different screen sizes and orientations
- API success and error scenarios
- Loading states and user interactions
- Copy functionality on different devices

### Test Scenarios
1. **Normal Operation**: Component fetches and displays real API data
2. **Error Handling**: Component shows error state when API fails
3. **Loading State**: Component shows loading indicator during API calls
4. **Responsive Design**: Layout adapts to different screen sizes

## Performance Considerations

### Optimizations
- Memoized responsive style calculations
- Efficient re-rendering with proper dependency arrays
- Lazy loading of bank details only when component mounts
- Proper cleanup of event listeners

### Memory Management
- Automatic cleanup of dimension change listeners
- Proper error boundary handling
- Efficient state management with minimal re-renders

## Accessibility

### Features
- Proper semantic labeling for screen readers
- Minimum touch target sizes (44px)
- High contrast colors for text readability
- Clear visual hierarchy with proper heading structure

### WCAG Compliance
- AA level color contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Focus management for interactive elements

## Migration Guide

### From Static Implementation
1. Remove hardcoded bank details from components
2. Import `BankTransferDetails` from components
3. Replace static JSX with `<BankTransferDetails />` component
4. Remove unused styling for bank details cards
5. Test API integration and error handling

### Breaking Changes
- Removed dependency on manually passed `paymentDetails` prop
- Changed styling approach from inline styles to responsive design
- Updated copy functionality to work without external clipboard library

## Troubleshooting

### Common Issues

1. **Component shows "Loading..." indefinitely**
   - Check API endpoint availability
   - Verify network connectivity
   - Check console for API errors

2. **Copy buttons don't work**
   - This is expected behavior in development
   - Copy functionality requires device-specific clipboard access
   - Manual copy dialog is shown as fallback

3. **Layout issues on different screen sizes**
   - Check if device orientation changes are handled
   - Verify responsive breakpoints in constants
   - Test on actual devices vs simulators

### Debug Mode
Enable detailed logging by checking browser/debugger console for:
- API request/response details
- Component lifecycle events
- Error stack traces
- Performance metrics

## Future Enhancements

### Planned Features
- Real clipboard integration with `@react-native-clipboard/clipboard`
- QR code generation for bank details
- Multiple currency support
- Offline caching of bank details
- Animation transitions for state changes

### API Improvements
- Real-time updates via WebSocket
- Caching strategies for better performance
- Fallback to multiple API endpoints
- Enhanced error reporting and analytics