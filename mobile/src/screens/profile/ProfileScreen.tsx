/**
 * Profile Screen - Main profile dashboard
 * 
 * Features:
 * - User profile information
 * - Quick stats (bookings, orders)
 * - Settings navigation
 * - Account management options
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants';
import { useAuth, useMessaging } from '../../context';
import { useProfileStats } from '../../context/ProfileStatsContext';
import { SafeAreaScreen, EnhancedAvatar, ModernCard, StatsCard, QuickActions } from '../../components';
import type { ProfileStackParamList } from '../../navigation/types';
import imagePickerService from '../../utils/imagePicker';
import profileService from '../../services/api/profileService';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  console.log('👤 ProfileScreen rendering...');
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, token, logout } = useAuth();
  const { unreadCount } = useMessaging();
  const { stats, refreshStats } = useProfileStats();
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);

  // Debug user data
  console.log('👤 ProfileScreen user data:', {
    user: user ? {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      avatar: user.avatar,
      displayAvatar: user.displayAvatar
    } : null,
    hasToken: !!token
  });

  // Handle refresh - now uses ProfileStatsContext
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshStats();
    setRefreshing(false);
  }, [refreshStats]);

  useEffect(() => {
    if (token) {
      refreshStats();
      // Also refresh user profile data to ensure we have the latest information
      refreshUserProfile();
    }
  }, [token, refreshStats]); // Include refreshStats in dependencies

  // Function to refresh user profile data
  const refreshUserProfile = useCallback(async () => {
    try {
      const response = await profileService.getProfile();
      console.log('🔄 Profile service response:', response);

      if (response.success && response.user) {
        console.log('✅ Refreshed user profile:', response.user);
        // For now, just log the data. We might need to add a refresh method to AuthContext
      } else if (response.user) {
        // Sometimes the response might not have success flag but still have user data
        console.log('✅ Got user profile data:', response.user);
      }
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
    }
  }, []);

  // Handle profile picture upload
  const handleProfilePictureUpload = useCallback(async () => {
    try {
      imagePickerService.showImagePickerOptions(
        async (image) => {
          setUploadingProfilePicture(true);
          try {
            const response = await profileService.uploadProfilePicture(image.uri);

            if (response.success) {
              Alert.alert(
                'Success',
                'Profile picture updated successfully!',
                [{ text: 'OK' }]
              );

              // Refresh the screen to show the new profile picture
              await onRefresh();
            } else {
              throw new Error(response.message || 'Upload failed');
            }
          } catch (error: any) {
            console.error('Profile picture upload error:', error);
            Alert.alert(
              'Upload Failed',
              error.message || 'Failed to update profile picture. Please try again.',
              [{ text: 'OK' }]
            );
          } finally {
            setUploadingProfilePicture(false);
          }
        },
        {
          allowsEditing: true,
          aspect: [1, 1], // Square aspect ratio
          quality: 0.8,
          maxFileSize: 5 * 1024 * 1024, // 5MB limit
        }
      );
    } catch (error) {
      console.error('Error showing image picker:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  }, [onRefresh]);

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Profile menu items
  const menuItems = [
    {
      id: 'profile-settings',
      title: 'Profile Settings',
      subtitle: 'Edit personal information',
      icon: 'person-outline',
      color: COLORS.PRIMARY,
      onPress: () => navigation.navigate('ProfileSettings' as never),
    },
    {
      id: 'my-bookings',
      title: 'My Bookings',
      subtitle: 'View accommodation bookings',
      icon: 'bed-outline',
      color: COLORS.INFO,
      onPress: () => navigation.navigate('MyBookings' as never),
    },
    {
      id: 'order-history',
      title: 'Order History',
      subtitle: 'View shop orders',
      icon: 'receipt-outline',
      color: COLORS.SUCCESS,
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      id: 'messages',
      title: 'Messages',
      subtitle: unreadCount > 0 ? `${unreadCount} unread messages` : 'Chat with admin & support',
      icon: 'chatbubbles-outline',
      color: COLORS.PRIMARY,
      onPress: () => navigation.navigate('Messages' as never),
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'account-security',
      title: 'Account Security',
      subtitle: 'Password & biometric settings',
      icon: 'shield-checkmark-outline',
      color: COLORS.WARNING,
      onPress: () => navigation.navigate('AccountSecurity' as never),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Prayer times & app notifications',
      icon: 'notifications-outline',
      color: COLORS.INFO,
      onPress: () => navigation.navigate('NotificationSettings' as never),
    },
    {
      id: 'app-settings',
      title: 'App Settings',
      subtitle: 'Theme, language & preferences',
      icon: 'settings-outline',
      color: COLORS.GRAY_600,
      onPress: () => navigation.navigate('AppSettings' as never),
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'FAQ, contact & support',
      icon: 'help-circle-outline',
      color: COLORS.PRIMARY,
      onPress: () => navigation.navigate('HelpSupport' as never),
    },
  ];

  return (
    <SafeAreaScreen style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <EnhancedAvatar
                  source={user?.displayAvatar || user?.profileImage || user?.avatar}
                  name={user?.name || 'User Name'}
                  size="xlarge"
                  showGradientBorder={true}
                  showEditIcon={true}
                  showOnlineStatus={true}
                  isOnline={true}
                  isLoading={uploadingProfilePicture}
                  onPress={() => navigation.navigate('ProfileSettings' as never)}
                  onEditPress={handleProfilePictureUpload}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.name && user.name.trim() ? user.name : 'Loading...'}
                </Text>
                <Text style={styles.userEmail}>
                  {user?.email && user.email.trim() ? user.email : 'Loading user data...'}
                </Text>
                <View style={styles.roleContainer}>
                  <View style={[styles.roleBadge, user?.role === 'admin' && styles.adminBadge]}>
                    <Text style={[styles.roleText, user?.role === 'admin' && styles.adminText]}>
                      {user?.role === 'admin' ? 'Administrator' : 'Corps Member'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Sign out"
              accessibilityHint="Sign out of your account"
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <StatsCard
              icon="bed-outline"
              value={stats.bookings}
              label="Bookings"
              color={COLORS.PRIMARY}
              variant="default"
              showTrend={true}
              trendValue={12}
              trendDirection="up"
              onPress={() => navigation.navigate('MyBookings' as never)}
              style={styles.statCard}
            />
            <StatsCard
              icon="storefront-outline"
              value={stats.orders}
              label="Orders"
              color={COLORS.SUCCESS}
              variant="default"
              showTrend={true}
              trendValue={8}
              trendDirection="up"
              onPress={() => navigation.navigate('OrderHistory' as never)}
              style={styles.statCard}
            />
            <StatsCard
              icon="chatbubble-outline"
              value={unreadCount}
              label="Messages"
              color={COLORS.INFO}
              variant="default"
              showTrend={true}
              trendValue={unreadCount > 0 ? unreadCount : 0}
              trendDirection={unreadCount > 0 ? "up" : "neutral"}
              onPress={() => navigation.navigate('Messages' as never)}
              style={styles.statCard}
            />
          </View>
        </View>

        {/* Quick Actions Section */}
        <QuickActions
          title="Quick Actions"
          layout="grid"
          columns={2}
          actions={[
            {
              id: 'edit-profile',
              title: 'Edit Profile',
              icon: 'person-outline',
              color: COLORS.PRIMARY,
              onPress: () => navigation.navigate('ProfileSettings' as never),
            },
            {
              id: 'my-bookings',
              title: 'My Bookings',
              icon: 'bed-outline',
              color: COLORS.SUCCESS,
              onPress: () => navigation.navigate('MyBookings' as never),
              badge: stats.bookings > 0 ? stats.bookings : undefined,
            },
            {
              id: 'messages',
              title: 'Messages',
              icon: 'chatbubble-outline',
              color: COLORS.INFO,
              onPress: () => navigation.navigate('Messages' as never),
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
            {
              id: 'settings',
              title: 'Settings',
              icon: 'settings-outline',
              color: COLORS.GRAY_600,
              onPress: () => navigation.navigate('AppSettings' as never),
            },
          ]}
        />

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <ModernCard
                key={item.id}
                variant="default"
                onPress={item.onPress}
                style={styles.menuCard}
                padding="large"
                shadowIntensity="light"
              >
                <View style={styles.menuContent}>
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY_400} />
                </View>
              </ModernCard>
            ))}
          </View>
        </View>

        {/* Islamic Quote Section */}
        <View style={styles.quoteSection}>
          <ModernCard
            variant="gradient"
            gradientColors={[COLORS.PRIMARY + '20', COLORS.SECONDARY + '10']}
            style={styles.quoteCard}
            padding="large"
            shadowIntensity="medium"
          >
            <View style={styles.quoteContent}>
              <Ionicons name="book-outline" size={24} color={COLORS.PRIMARY} style={styles.quoteIcon} />
              <Text style={styles.quoteText}>
                "And whoever fears Allah - He will make for him a way out"
              </Text>
              <Text style={styles.quoteSource}>- Quran 65:2</Text>
            </View>
          </ModernCard>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.XL,
    paddingHorizontal: SPACING.LG,
    borderBottomLeftRadius: BORDER_RADIUS.XL,
    borderBottomRightRadius: BORDER_RADIUS.XL,
    ...SHADOWS.MD,
    elevation: 8, // For Android shadow
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: SPACING.MD,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.WHITE,
    marginBottom: SPACING.XS,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: SPACING.XS,
  },
  userRole: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.WHITE,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  roleContainer: {
    marginTop: SPACING.XS,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    alignSelf: 'flex-start',
  },
  adminBadge: {
    backgroundColor: COLORS.WARNING + '30',
  },
  roleText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.WHITE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  adminText: {
    color: COLORS.WARNING,
  },
  logoutButton: {
    padding: SPACING.SM,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD, // Reduce vertical padding for better spacing
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch', // Ensure all cards have the same height
    gap: SPACING.SM, // Consistent gap between cards
  },
  statCard: {
    flex: 1,
    maxWidth: '32%', // Ensure cards don't exceed 1/3 of container width
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120, // Increased minimum height for better proportions
    ...SHADOWS.SM,
    // Ensure content stays within bounds
    overflow: 'hidden',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  menuGrid: {
    gap: SPACING.MD,
  },
  menuCard: {
    marginBottom: SPACING.MD,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  quoteSection: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.LG,
  },
  quoteCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  quoteContent: {
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: SPACING.SM,
  },
  quoteText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  quoteSource: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  bottomSpacing: {
    height: SPACING.XL,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    textAlign: 'center',
  },
});

export default ProfileScreen;
