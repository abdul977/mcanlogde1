/**
 * Notification Settings Screen - Manage notification preferences
 * 
 * Features:
 * - Prayer time notifications
 * - Booking notifications
 * - Order notifications
 * - Community updates
 * - Push notification settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen } from '../../components';

interface NotificationSetting {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  enabled: boolean;
  category: string;
}

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [settings, setSettings] = useState<NotificationSetting[]>([
    // Prayer Times
    {
      id: 'prayer-fajr',
      title: 'Fajr Prayer',
      subtitle: 'Dawn prayer notification',
      icon: 'sunny-outline',
      enabled: true,
      category: 'prayer',
    },
    {
      id: 'prayer-dhuhr',
      title: 'Dhuhr Prayer',
      subtitle: 'Noon prayer notification',
      icon: 'sunny',
      enabled: true,
      category: 'prayer',
    },
    {
      id: 'prayer-asr',
      title: 'Asr Prayer',
      subtitle: 'Afternoon prayer notification',
      icon: 'partly-sunny-outline',
      enabled: true,
      category: 'prayer',
    },
    {
      id: 'prayer-maghrib',
      title: 'Maghrib Prayer',
      subtitle: 'Sunset prayer notification',
      icon: 'moon-outline',
      enabled: true,
      category: 'prayer',
    },
    {
      id: 'prayer-isha',
      title: 'Isha Prayer',
      subtitle: 'Night prayer notification',
      icon: 'moon',
      enabled: true,
      category: 'prayer',
    },
    
    // Bookings
    {
      id: 'booking-confirmation',
      title: 'Booking Confirmations',
      subtitle: 'When your booking is approved',
      icon: 'checkmark-circle-outline',
      enabled: true,
      category: 'booking',
    },
    {
      id: 'booking-reminders',
      title: 'Booking Reminders',
      subtitle: 'Check-in and payment reminders',
      icon: 'time-outline',
      enabled: true,
      category: 'booking',
    },
    {
      id: 'booking-updates',
      title: 'Booking Updates',
      subtitle: 'Status changes and modifications',
      icon: 'refresh-outline',
      enabled: true,
      category: 'booking',
    },
    
    // Orders
    {
      id: 'order-confirmation',
      title: 'Order Confirmations',
      subtitle: 'When your order is placed',
      icon: 'bag-check-outline',
      enabled: true,
      category: 'order',
    },
    {
      id: 'order-shipping',
      title: 'Shipping Updates',
      subtitle: 'Order processing and delivery',
      icon: 'car-outline',
      enabled: true,
      category: 'order',
    },
    
    // Community
    {
      id: 'community-events',
      title: 'New Events',
      subtitle: 'Community events and programs',
      icon: 'calendar-outline',
      enabled: false,
      category: 'community',
    },
    {
      id: 'community-articles',
      title: 'New Articles',
      subtitle: 'Islamic articles and blog posts',
      icon: 'book-outline',
      enabled: false,
      category: 'community',
    },
    {
      id: 'community-messages',
      title: 'Messages',
      subtitle: 'Direct messages and replies',
      icon: 'chatbubble-outline',
      enabled: true,
      category: 'community',
    },
  ]);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    
    if (status !== 'granted') {
      Alert.alert(
        'Notifications Disabled',
        'To receive notifications, please enable them in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Notifications.openSettingsAsync() },
        ]
      );
    }
  };

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
  };

  const toggleCategory = (category: string, enabled: boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.category === category 
        ? { ...setting, enabled }
        : setting
    ));
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted': return COLORS.SUCCESS;
      case 'denied': return COLORS.ERROR;
      default: return COLORS.WARNING;
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted': return 'Notifications Enabled';
      case 'denied': return 'Notifications Disabled';
      default: return 'Permission Required';
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  const categoryTitles = {
    prayer: 'Prayer Times',
    booking: 'Accommodation Bookings',
    order: 'Shop Orders',
    community: 'Community Updates',
  };

  const categoryIcons = {
    prayer: 'moon-outline',
    booking: 'bed-outline',
    order: 'storefront-outline',
    community: 'people-outline',
  };

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <View style={styles.section}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={getPermissionStatusColor()} 
              />
              <Text style={styles.permissionTitle}>Notification Permissions</Text>
            </View>
            <Text style={[styles.permissionStatus, { color: getPermissionStatusColor() }]}>
              {getPermissionStatusText()}
            </Text>
            <Text style={styles.permissionDescription}>
              {permissionStatus === 'granted' 
                ? 'You will receive notifications based on your preferences below.'
                : 'Enable notifications to stay updated with prayer times and important updates.'
              }
            </Text>
            {permissionStatus !== 'granted' && (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={requestNotificationPermissions}
              >
                <Text style={styles.enableButtonText}>Enable Notifications</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification Categories */}
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <View key={category} style={styles.section}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleRow}>
                <Ionicons 
                  name={categoryIcons[category as keyof typeof categoryIcons] as any} 
                  size={20} 
                  color={COLORS.PRIMARY} 
                />
                <Text style={styles.categoryTitle}>
                  {categoryTitles[category as keyof typeof categoryTitles]}
                </Text>
              </View>
              <Switch
                value={categorySettings.every(s => s.enabled)}
                onValueChange={(enabled) => toggleCategory(category, enabled)}
                trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY + '40' }}
                thumbColor={categorySettings.every(s => s.enabled) ? COLORS.PRIMARY : COLORS.GRAY_500}
              />
            </View>

            <View style={styles.settingsCard}>
              {categorySettings.map((setting, index) => (
                <View key={setting.id}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Ionicons name={setting.icon as any} size={20} color={COLORS.GRAY_600} />
                      <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>{setting.title}</Text>
                        <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
                      </View>
                    </View>
                    <Switch
                      value={setting.enabled}
                      onValueChange={() => toggleSetting(setting.id)}
                      trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY + '40' }}
                      thumbColor={setting.enabled ? COLORS.PRIMARY : COLORS.GRAY_500}
                      disabled={permissionStatus !== 'granted'}
                    />
                  </View>
                  {index < categorySettings.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Notification Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Schedule</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
              <View style={styles.scheduleText}>
                <Text style={styles.scheduleTitle}>Quiet Hours</Text>
                <Text style={styles.scheduleSubtitle}>10:00 PM - 6:00 AM</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Islamic Reminder */}
        <View style={styles.section}>
          <View style={styles.reminderCard}>
            <Ionicons name="book-outline" size={24} color={COLORS.PRIMARY} style={styles.reminderIcon} />
            <Text style={styles.reminderText}>
              "And establish prayer and give zakah and bow with those who bow"
            </Text>
            <Text style={styles.reminderSource}>- Quran 2:43</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
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
  header: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  permissionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  permissionStatus: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  permissionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  enableButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: 8,
    marginTop: SPACING.MD,
  },
  enableButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
    textAlign: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  settingsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.MD,
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.GRAY_200,
    marginVertical: SPACING.SM,
  },
  scheduleCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    marginLeft: SPACING.MD,
    flex: 1,
  },
  scheduleTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  scheduleSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  editButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  reminderCard: {
    backgroundColor: COLORS.PRIMARY + '10',
    padding: SPACING.LG,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  reminderIcon: {
    marginBottom: SPACING.SM,
  },
  reminderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  reminderSource: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default NotificationSettingsScreen;
