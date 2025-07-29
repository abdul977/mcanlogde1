/**
 * Profile Stack Navigator
 * 
 * Handles navigation within the Profile tab, including:
 * - Profile screen (main dashboard)
 * - Settings screens
 * - Account management
 * - Security settings
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { COLORS } from '../constants';
import { ProfileStackParamList } from './types';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileSettingsScreen from '../screens/profile/ProfileSettingsScreen';
import AccountSecurityScreen from '../screens/profile/AccountSecurityScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import MyBookingsScreen from '../screens/profile/MyBookingsScreen';
import OrderHistoryScreen from '../screens/profile/OrderHistoryScreen';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import BookmarksScreen from '../screens/profile/BookmarksScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontWeight: '600',
        },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false, // Profile screen has custom header
          gestureEnabled: false, // Prevent swipe back from profile screen
        }}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{
          title: 'Profile Settings',
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="AccountSecurity"
        component={AccountSecurityScreen}
        options={{
          title: 'Account Security',
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: 'Notifications',
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          title: 'Order History',
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'App Settings',
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          title: 'Help & Support',
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          title: 'My Bookmarks',
          headerShown: false, // Custom header
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
