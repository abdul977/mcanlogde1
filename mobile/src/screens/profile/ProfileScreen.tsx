/**
 * Profile Screen - Main profile dashboard
 * 
 * Features:
 * - User profile information
 * - Quick stats (bookings, orders)
 * - Settings navigation
 * - Account management options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG, ENDPOINTS } from '../../constants';
import { useAuth, useMessaging } from '../../context';
import { SafeAreaScreen } from '../../components';

const ProfileScreen: React.FC = () => {
  console.log('👤 ProfileScreen rendering...');
  const navigation = useNavigation();
  const { user, token, logout } = useAuth();
  const { unreadCount } = useMessaging();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    bookings: 0,
    orders: 0,
    messages: 0,
  });

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      // Only fetch stats if user is authenticated
      if (!token) {
        return;
      }

      // Fetch bookings count
      const bookingsResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MY_BOOKINGS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const bookingsCount = bookingsData.bookings ? bookingsData.bookings.length : (Array.isArray(bookingsData) ? bookingsData.length : 0);

        setStats(prevStats => ({
          ...prevStats,
          bookings: bookingsCount,
        }));
      }

      // TODO: Fetch orders and messages count when those APIs are available

    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error to user for stats, just keep default values
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
      onPress: () => navigation.navigate('OrderHistory' as never),
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
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color={COLORS.WHITE} />
                </View>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>
                <Text style={styles.userRole}>
                  {user?.role === 'admin' ? 'Administrator' : 'Corps Member'}
                </Text>
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
            <View style={styles.statCard}>
              <Ionicons name="bed-outline" size={24} color={COLORS.PRIMARY} />
              <Text style={styles.statNumber}>{stats.bookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="storefront-outline" size={24} color={COLORS.SUCCESS} />
              <Text style={styles.statNumber}>{stats.orders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="chatbubble-outline" size={24} color={COLORS.INFO} />
              <Text style={styles.statNumber}>{stats.messages}</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                onPress={item.onPress}
                accessibilityLabel={item.title}
                accessibilityHint={item.subtitle}
              >
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
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Islamic Quote Section */}
        <View style={styles.quoteSection}>
          <View style={styles.quoteCard}>
            <Ionicons name="book-outline" size={24} color={COLORS.PRIMARY} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "And whoever fears Allah - He will make for him a way out"
            </Text>
            <Text style={styles.quoteSource}>- Quran 65:2</Text>
          </View>
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
  logoutButton: {
    padding: SPACING.SM,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
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
    gap: SPACING.MD,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.SM,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
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
    backgroundColor: COLORS.PRIMARY + '10',
    padding: SPACING.LG,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
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
