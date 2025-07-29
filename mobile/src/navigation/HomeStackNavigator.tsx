/**
 * Home Stack Navigator
 * 
 * Handles navigation within the Home tab, including:
 * - Home screen (main dashboard)
 * - Search functionality
 * - Prayer times
 * - Other home-related features
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { COLORS } from '../constants';
import { HomeStackParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import PrayerTimesScreen from '../screens/home/PrayerTimesScreen';
import BlogListingScreen from '../screens/blog/BlogListingScreen';
import BlogDetailsScreen from '../screens/blog/BlogDetailsScreen';

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
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
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false, // Home screen has custom header
          gestureEnabled: false, // Prevent swipe back from home screen
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search',
          headerShown: false, // Search screen has custom header
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="PrayerTimes"
        component={PrayerTimesScreen}
        options={{
          title: 'Prayer Times',
          headerShown: false, // Prayer times screen has custom header
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="BlogListing"
        component={BlogListingScreen}
        options={{
          title: 'Blog Posts',
          headerShown: false, // Blog listing screen has custom header
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="BlogDetails"
        component={BlogDetailsScreen}
        options={{
          title: 'Blog Details',
          headerShown: false, // Blog details screen has custom header
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
