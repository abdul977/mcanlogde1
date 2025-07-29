/**
 * Prayer Times Screen - Detailed prayer times view
 * 
 * Features:
 * - Full prayer schedule
 * - Islamic calendar integration
 * - Qibla direction
 * - Prayer notifications settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen } from '../../components';
import PrayerTimesWidget from '../../components/features/PrayerTimesWidget';

const PrayerTimesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(10);

  // Get current Islamic date (simplified)
  const getIslamicDate = () => {
    // This is a simplified implementation
    // In a real app, you'd use a proper Islamic calendar library
    const gregorianDate = new Date();
    const islamicYear = 1445; // Current approximate Hijri year
    const islamicMonth = 'Jumada al-Awwal';
    const islamicDay = 15;
    
    return {
      day: islamicDay,
      month: islamicMonth,
      year: islamicYear,
      gregorian: gregorianDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  };

  const islamicDate = getIslamicDate();

  const reminderOptions = [5, 10, 15, 30];

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
        <Text style={styles.headerTitle}>Prayer Times</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Section */}
        <View style={styles.section}>
          <View style={styles.dateCard}>
            <View style={styles.dateHeader}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.dateTitle}>Today's Date</Text>
            </View>
            <Text style={styles.gregorianDate}>{islamicDate.gregorian}</Text>
            <Text style={styles.islamicDate}>
              {islamicDate.day} {islamicDate.month} {islamicDate.year} AH
            </Text>
          </View>
        </View>

        {/* Prayer Times Widget */}
        <View style={styles.section}>
          <PrayerTimesWidget />
        </View>

        {/* Qibla Direction */}
        <View style={styles.section}>
          <View style={styles.qiblaCard}>
            <View style={styles.qiblaHeader}>
              <Ionicons name="compass-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.qiblaTitle}>Qibla Direction</Text>
            </View>
            <Text style={styles.qiblaDescription}>
              From Abuja, FCT to Makkah
            </Text>
            <View style={styles.qiblaDirection}>
              <Text style={styles.qiblaAngle}>57° Northeast</Text>
              <Ionicons name="navigate-outline" size={32} color={COLORS.PRIMARY} />
            </View>
            <TouchableOpacity style={styles.qiblaButton}>
              <Text style={styles.qiblaButtonText}>Open Compass</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prayer Notifications</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get notified before each prayer time
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY + '40' }}
                thumbColor={notificationsEnabled ? COLORS.PRIMARY : COLORS.GRAY_400}
              />
            </View>

            {notificationsEnabled && (
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Reminder Time</Text>
                  <Text style={styles.settingDescription}>
                    Minutes before prayer time
                  </Text>
                </View>
                <View style={styles.reminderOptions}>
                  {reminderOptions.map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.reminderOption,
                        reminderMinutes === minutes && styles.reminderOptionActive,
                      ]}
                      onPress={() => setReminderMinutes(minutes)}
                    >
                      <Text
                        style={[
                          styles.reminderOptionText,
                          reminderMinutes === minutes && styles.reminderOptionTextActive,
                        ]}
                      >
                        {minutes}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Islamic Information */}
        <View style={styles.section}>
          <View style={styles.islamicInfoCard}>
            <View style={styles.islamicInfoHeader}>
              <Ionicons name="book-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.islamicInfoTitle}>Prayer Importance</Text>
            </View>
            <Text style={styles.islamicInfoText}>
              "Verily, in the remembrance of Allah do hearts find rest." - Quran 13:28
            </Text>
            <Text style={styles.islamicInfoDescription}>
              The five daily prayers are one of the Five Pillars of Islam and serve as a direct 
              link between the worshipper and Allah.
            </Text>
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
    width: 40, // Balance the back button
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
  dateCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  dateTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  gregorianDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  islamicDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  qiblaCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  qiblaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  qiblaTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  qiblaDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  qiblaDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  qiblaAngle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  qiblaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SM,
  },
  qiblaButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    marginRight: SPACING.XS,
  },
  settingsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  reminderOptions: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  reminderOption: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_100,
  },
  reminderOptionActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  reminderOptionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  reminderOptionTextActive: {
    color: COLORS.WHITE,
  },
  islamicInfoCard: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: 12,
    padding: SPACING.LG,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  islamicInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  islamicInfoTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  islamicInfoText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    fontStyle: 'italic',
    marginBottom: SPACING.MD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  islamicInfoDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  bottomSpacing: {
    height: 100, // Space for tab bar
  },
});

export default PrayerTimesScreen;
