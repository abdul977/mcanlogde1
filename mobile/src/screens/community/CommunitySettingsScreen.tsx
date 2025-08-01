import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { Header, LoadingSpinner } from '../../components';
import { useAuth } from '../../context';
import { communityService } from '../../services';
import type { Community } from '../../types';

interface RouteParams {
  communityId: string;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

const CommunitySettingsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { communityId } = route.params as RouteParams;
  const { user } = useAuth();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const communityData = await communityService.getCommunityById(communityId);
      setCommunity(communityData);

      // Check if user is the creator
      const isCreator = communityData.creator?._id === user?._id;

      // Get user's role in the community from the memberRole field
      const userRole = communityData.memberRole;

      // Set permissions based on role and creator status
      setIsAdmin(isCreator || userRole === 'admin' || userRole === 'creator');
      setIsModerator(isCreator || userRole === 'admin' || userRole === 'moderator' || userRole === 'creator');
    } catch (error) {
      console.error('Error loading community:', error);
      Alert.alert('Error', 'Failed to load community settings');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (settingKey: string, value: boolean) => {
    try {
      // Check if user has permission to modify settings
      if (!isAdmin) {
        Alert.alert('Permission Denied', 'Only community administrators can modify these settings');
        return;
      }

      await communityService.updateCommunitySettings(communityId, {
        [settingKey]: value
      });

      setCommunity(prev => prev ? {
        ...prev,
        settings: {
          ...prev.settings,
          [settingKey]: value
        }
      } : null);

      Alert.alert('Success', 'Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleLeaveCommunity = () => {
    Alert.alert(
      'Leave Community',
      `Are you sure you want to leave "${community?.name}"? You will need to request to join again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.leaveCommunity(communityId);
              Alert.alert('Success', 'You have left the community');
              navigation.navigate('CommunityList');
            } catch (error) {
              console.error('Error leaving community:', error);
              Alert.alert('Error', 'Failed to leave community');
            }
          }
        }
      ]
    );
  };

  const handleDeleteCommunity = () => {
    Alert.alert(
      'Delete Community',
      `Are you sure you want to permanently delete "${community?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.deleteCommunity(communityId);
              Alert.alert('Success', 'Community has been deleted');
              navigation.navigate('CommunityList');
            } catch (error) {
              console.error('Error deleting community:', error);
              Alert.alert('Error', 'Failed to delete community');
            }
          }
        }
      ]
    );
  };

  const getSettingsItems = (): SettingItem[] => {
    const items: SettingItem[] = [
      {
        id: 'members',
        title: 'Members',
        subtitle: `${community?.memberCount || 0} members`,
        icon: 'people-outline',
        type: 'navigation',
        onPress: () => {
          try {
            navigation.navigate('CommunityMembers', { communityId });
          } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Unable to navigate to members screen');
          }
        },
      },
    ];

    if (isModerator) {
      items.push(
        {
          id: 'moderation',
          title: 'Moderation',
          subtitle: 'Manage reports and violations',
          icon: 'shield-outline',
          type: 'navigation',
          onPress: () => {
            try {
              navigation.navigate('CommunityModeration', { communityId });
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Error', 'Unable to navigate to moderation screen');
            }
          },
        }
      );
    }

    if (isAdmin) {
      items.push(
        {
          id: 'allowInvites',
          title: 'Allow Member Invites',
          subtitle: 'Let members invite others to join',
          icon: 'person-add-outline',
          type: 'toggle',
          value: community?.settings?.allowInvites ?? true,
          onToggle: (value) => handleToggleSetting('allowInvites', value),
        },
        {
          id: 'requireApproval',
          title: 'Require Join Approval',
          subtitle: 'New members need admin approval',
          icon: 'checkmark-circle-outline',
          type: 'toggle',
          value: community?.settings?.requireApproval ?? false,
          onToggle: (value) => handleToggleSetting('requireApproval', value),
        },
        {
          id: 'allowFileSharing',
          title: 'Allow File Sharing',
          subtitle: 'Members can share files and images',
          icon: 'attach-outline',
          type: 'toggle',
          value: community?.settings?.allowFileSharing ?? true,
          onToggle: (value) => handleToggleSetting('allowFileSharing', value),
        }
      );
    }

    // General settings for all members
    items.push(
      {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Get notified of new messages',
        icon: 'notifications-outline',
        type: 'toggle',
        value: true, // This would come from user preferences
        onToggle: (value) => {
          // Handle notification preference
          console.log('Toggle notifications:', value);
        },
      },
      {
        id: 'leave',
        title: 'Leave Community',
        subtitle: 'You can rejoin later if needed',
        icon: 'exit-outline',
        type: 'action',
        destructive: true,
        onPress: handleLeaveCommunity,
      }
    );

    // Admin-only destructive actions
    if (isAdmin) {
      items.push({
        id: 'delete',
        title: 'Delete Community',
        subtitle: 'Permanently delete this community',
        icon: 'trash-outline',
        type: 'action',
        destructive: true,
        onPress: handleDeleteCommunity,
      });
    }

    return items;
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, item.destructive && styles.destructiveItem]}
      onPress={item.type === 'action' || item.type === 'navigation' ? item.onPress : undefined}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingIcon}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={item.destructive ? COLORS.ERROR : COLORS.GRAY_600}
        />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle,
          item.destructive && styles.destructiveText
        ]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>

      {item.type === 'toggle' && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY }}
          thumbColor={COLORS.WHITE}
        />
      )}

      {item.type === 'navigation' && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.GRAY_400}
        />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Community Settings" showBackButton />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Community Settings"
        showBackButton
        backgroundColor={COLORS.PRIMARY}
        titleColor={COLORS.WHITE}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Community Info */}
        <View style={styles.communityInfo}>
          <Text style={styles.communityName}>{community?.name}</Text>
          <Text style={styles.communityDescription}>{community?.description}</Text>
          <View style={styles.communityMeta}>
            <Text style={styles.metaText}>
              Created {new Date(community?.createdAt || '').toLocaleDateString()}
            </Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{community?.category}</Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          {getSettingsItems().map(renderSettingItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    flex: 1,
  },
  communityInfo: {
    padding: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  communityName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.BLACK,
    marginBottom: SPACING.XS,
  },
  communityDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_600,
    lineHeight: 20,
    marginBottom: SPACING.SM,
  },
  communityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    marginRight: SPACING.XS,
  },
  settingsList: {
    paddingTop: SPACING.SM,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  destructiveItem: {
    backgroundColor: COLORS.ERROR_LIGHT,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: SPACING.SM,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.BLACK,
  },
  settingSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_500,
    marginTop: 2,
  },
  destructiveText: {
    color: COLORS.ERROR,
  },
});

export default CommunitySettingsScreen;
