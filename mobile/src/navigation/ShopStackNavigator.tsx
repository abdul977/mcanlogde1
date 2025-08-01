/**
 * Shop Stack Navigator
 * 
 * Handles navigation within the Shop tab, including:
 * - Product listing screen
 * - Product details screen
 * - Shopping cart screen
 * - Checkout flow screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { COLORS } from '../constants';
import { ShopStackParamList } from './types';
import { ErrorBoundary } from '../components';
import ShopListingScreen from '../screens/shop/ShopListingScreen';
import ProductDetailsScreen from '../screens/shop/ProductDetailsScreen';
import ShoppingCartScreen from '../screens/shop/ShoppingCartScreen';
import CheckoutFlowScreen from '../screens/shop/CheckoutFlowScreen';
import PaymentUploadScreen from '../screens/shop/PaymentUploadScreen';

const Stack = createStackNavigator<ShopStackParamList>();

const ShopStackNavigator: React.FC = () => {
  return (
    <ErrorBoundary>
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
          name="ShopListing"
          component={ShopListingScreen}
          options={{
            headerShown: false, // Custom header in component
          }}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{
            headerShown: false, // Custom header in component
          }}
        />
        <Stack.Screen
          name="ShoppingCart"
          component={ShoppingCartScreen}
          options={{
            headerShown: false, // Custom header in component
          }}
        />
        <Stack.Screen
          name="CheckoutFlow"
          component={CheckoutFlowScreen}
          options={{
            headerShown: false, // Custom header in component
          }}
        />
        <Stack.Screen
          name="PaymentUpload"
          component={PaymentUploadScreen}
          options={{
            headerShown: false, // Custom header in component
          }}
        />
      </Stack.Navigator>
    </ErrorBoundary>
  );
};

export default ShopStackNavigator;
