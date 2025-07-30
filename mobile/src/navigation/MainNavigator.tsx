import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, TYPOGRAPHY } from '../constants';
import { MainTabParamList } from './types';
import { HomeIcon, StayIcon, ShopIcon, CommunityIcon, ProfileIcon } from '../components';
import { useMessaging } from '../context';
import { safeNumber } from '../utils';
import HomeStackNavigator from './HomeStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import AccommodationStackNavigator from './AccommodationStackNavigator';
import ShopStackNavigator from './ShopStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';

const MainTab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useMessaging();

  // Ensure safe area insets are numbers
  const safeBottom = safeNumber(insets.bottom, 0);

  return (
    <MainTab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopColor: COLORS.GRAY_200,
          borderTopWidth: 1,
          paddingVertical: 8,
          paddingBottom: Math.max(safeBottom, 8), // Ensure minimum padding but respect safe area
          height: 60 + Math.max(safeBottom - 8, 0), // Adjust height for safe area
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_500,
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.FONT_SIZES.XS,
          fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
          marginTop: 4,
          marginBottom: Platform.OS === 'ios' ? 2 : 0, // Extra spacing for iOS
        },
      }}
    >
      <MainTab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="AccommodationsTab"
        component={AccommodationStackNavigator}
        options={{
          tabBarLabel: 'Accommodation',
          tabBarIcon: ({ color, size }) => (
            <StayIcon size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="ShopTab"
        component={ShopStackNavigator}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <ShopIcon size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="CommunityTab"
        component={CommunityStackNavigator}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, size }) => (
            <CommunityIcon size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon size={size} color={color} badgeCount={unreadCount} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
};

export default MainNavigator;
