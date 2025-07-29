import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CommunityStackParamList } from './types';

// Import community screens
import CommunityListScreen from '../screens/community/CommunityListScreen';
import CommunityDetailScreen from '../screens/community/CommunityDetailScreen';
import CommunityCreateScreen from '../screens/community/CommunityCreateScreen';
import CommunitySettingsScreen from '../screens/community/CommunitySettingsScreen';
import CommunityMembersScreen from '../screens/community/CommunityMembersScreen';
import CommunityModerationScreen from '../screens/community/CommunityModerationScreen';

const CommunityStack = createStackNavigator<CommunityStackParamList>();

const CommunityStackNavigator: React.FC = () => {
  return (
    <CommunityStack.Navigator
      initialRouteName="CommunityList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <CommunityStack.Screen 
        name="CommunityList" 
        component={CommunityListScreen} 
      />
      <CommunityStack.Screen 
        name="CommunityDetail" 
        component={CommunityDetailScreen} 
      />
      <CommunityStack.Screen 
        name="CommunityCreate" 
        component={CommunityCreateScreen} 
      />
      <CommunityStack.Screen 
        name="CommunitySettings" 
        component={CommunitySettingsScreen} 
      />
      <CommunityStack.Screen 
        name="CommunityMembers" 
        component={CommunityMembersScreen} 
      />
      <CommunityStack.Screen 
        name="CommunityModeration" 
        component={CommunityModerationScreen} 
      />
    </CommunityStack.Navigator>
  );
};

export default CommunityStackNavigator;
