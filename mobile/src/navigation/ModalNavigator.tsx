import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';

import { ModalStackParamList } from './types';

// Placeholder modal screens - will be replaced with actual screens
const ImageViewerScreen = () => <View><Text>Image Viewer</Text></View>;
const DatePickerScreen = () => <View><Text>Date Picker</Text></View>;
const LocationPickerScreen = () => <View><Text>Location Picker</Text></View>;
const FilterModalScreen = () => <View><Text>Filter Modal</Text></View>;

const ModalStack = createStackNavigator<ModalStackParamList>();

const ModalNavigator: React.FC = () => {
  return (
    <ModalStack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        gestureEnabled: true,
      }}
    >
      <ModalStack.Screen name="ImageViewer" component={ImageViewerScreen} />
      <ModalStack.Screen name="DatePicker" component={DatePickerScreen} />
      <ModalStack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <ModalStack.Screen name="FilterModal" component={FilterModalScreen} />
    </ModalStack.Navigator>
  );
};

export default ModalNavigator;
