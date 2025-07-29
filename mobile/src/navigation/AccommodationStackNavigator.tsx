/**
 * Accommodation Stack Navigator
 * 
 * Handles navigation within the Accommodation tab, including:
 * - Accommodation listing screen
 * - Accommodation details screen
 * - Booking flow screens
 * - Search and filter screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { COLORS } from '../constants';
import { AccommodationStackParamList } from './types';
import AccommodationListingScreen from '../screens/accommodation/AccommodationListingScreen';
import AccommodationDetailsScreen from '../screens/accommodation/AccommodationDetailsScreen';
import BookingFlowScreen from '../screens/accommodation/BookingFlowScreen';
import AccommodationSearchScreen from '../screens/accommodation/AccommodationSearchScreen';

const Stack = createStackNavigator<AccommodationStackParamList>();

const AccommodationStackNavigator: React.FC = () => {
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
        name="AccommodationListing"
        component={AccommodationListingScreen}
        options={{
          headerShown: false, // Custom header in component
        }}
      />
      <Stack.Screen
        name="AccommodationDetails"
        component={AccommodationDetailsScreen}
        options={{
          headerShown: false, // Custom header in component
        }}
      />
      <Stack.Screen
        name="BookingFlow"
        component={BookingFlowScreen}
        options={{
          headerShown: false, // Custom header in component
        }}
      />
      <Stack.Screen
        name="AccommodationSearch"
        component={AccommodationSearchScreen}
        options={{
          headerShown: false, // Custom header in component
        }}
      />
    </Stack.Navigator>
  );
};

export default AccommodationStackNavigator;
