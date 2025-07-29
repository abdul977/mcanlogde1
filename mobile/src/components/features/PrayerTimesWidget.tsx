/**
 * Prayer Times Widget Component
 * 
 * Mobile-optimized prayer times display with current prayer highlighting
 * and next prayer countdown functionality.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';

// Prayer times for Abuja, Nigeria (FCT)
// Coordinates: Latitude 9.0579, Longitude 7.4951
const PRAYER_TIMES = {
  fajr: { hour: 5, minute: 30, name: 'Fajr' },
  dhuhr: { hour: 13, minute: 0, name: 'Dhuhr' },
  asr: { hour: 16, minute: 15, name: 'Asr' },
  maghrib: { hour: 18, minute: 45, name: 'Maghrib' },
  isha: { hour: 20, minute: 0, name: 'Isha' },
};

interface PrayerTime {
  key: string;
  name: string;
  time: string;
  hour: number;
  minute: number;
  isCurrent: boolean;
  isPassed: boolean;
}

interface PrayerInfo {
  currentPrayer: string;
  nextPrayer: string;
  timeToNext: string;
  allTimes: PrayerTime[];
}

const PrayerTimesWidget: React.FC<{
  onViewAll?: () => void;
  compact?: boolean;
}> = ({ onViewAll, compact = false }) => {
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Format time to 12-hour format
  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Get current prayer information
  const getCurrentPrayerInfo = (): PrayerInfo => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Convert prayer times to minutes for comparison
    const prayerTimesArray = Object.entries(PRAYER_TIMES).map(([key, prayer]) => ({
      key,
      name: prayer.name,
      time: formatTime(prayer.hour, prayer.minute),
      hour: prayer.hour,
      minute: prayer.minute,
      timeInMinutes: prayer.hour * 60 + prayer.minute,
      isCurrent: false,
      isPassed: false,
    }));

    // Sort by time
    prayerTimesArray.sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    // Determine current and next prayer
    let currentPrayer = 'Isha'; // Default to last prayer
    let nextPrayer = 'Fajr'; // Default to first prayer of next day
    let timeToNext = '';

    for (let i = 0; i < prayerTimesArray.length; i++) {
      const prayer = prayerTimesArray[i];
      
      if (currentTimeInMinutes < prayer.timeInMinutes) {
        // Next prayer found
        nextPrayer = prayer.name;
        currentPrayer = i > 0 ? prayerTimesArray[i - 1].name : 'Isha';
        
        // Calculate time to next prayer
        const minutesToNext = prayer.timeInMinutes - currentTimeInMinutes;
        const hoursToNext = Math.floor(minutesToNext / 60);
        const minsToNext = minutesToNext % 60;
        
        if (hoursToNext > 0) {
          timeToNext = `${hoursToNext}h ${minsToNext}m`;
        } else {
          timeToNext = `${minsToNext}m`;
        }
        break;
      }
      
      // Mark as passed
      prayer.isPassed = true;
      
      // If this is the last prayer and current time is after it
      if (i === prayerTimesArray.length - 1) {
        currentPrayer = prayer.name;
        nextPrayer = 'Fajr';
        
        // Calculate time to Fajr tomorrow
        const minutesToMidnight = (24 * 60) - currentTimeInMinutes;
        const minutesToFajr = minutesToMidnight + prayerTimesArray[0].timeInMinutes;
        const hoursToNext = Math.floor(minutesToFajr / 60);
        const minsToNext = minutesToFajr % 60;
        
        timeToNext = `${hoursToNext}h ${minsToNext}m`;
      }
    }

    // Mark current prayer
    const currentPrayerObj = prayerTimesArray.find(p => p.name === currentPrayer);
    if (currentPrayerObj) {
      currentPrayerObj.isCurrent = true;
    }

    return {
      currentPrayer,
      nextPrayer,
      timeToNext,
      allTimes: prayerTimesArray,
    };
  };

  // Update prayer times
  useEffect(() => {
    const updatePrayerTimes = () => {
      const now = new Date();
      setCurrentTime(now);
      setPrayerInfo(getCurrentPrayerInfo());
    };

    // Update immediately
    updatePrayerTimes();

    // Update every minute
    const interval = setInterval(updatePrayerTimes, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!prayerInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Ionicons name="time-outline" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.compactTitle}>Prayer Times</Text>
        </View>
        <Text style={styles.compactInfo}>
          Current: {prayerInfo.currentPrayer} • Next: {prayerInfo.nextPrayer} in {prayerInfo.timeToNext}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.title}>Prayer Times</Text>
        </View>
        <Text style={styles.location}>Abuja, FCT</Text>
      </View>

      {/* Current Prayer Status */}
      <View style={styles.currentPrayerSection}>
        <Text style={styles.currentPrayerLabel}>Current Prayer</Text>
        <Text style={styles.currentPrayerName}>{prayerInfo.currentPrayer}</Text>
        <Text style={styles.nextPrayerInfo}>
          Next: {prayerInfo.nextPrayer} in {prayerInfo.timeToNext}
        </Text>
      </View>

      {/* Prayer Times Grid */}
      <View style={styles.prayerTimesGrid}>
        {prayerInfo.allTimes.map((prayer) => (
          <View
            key={prayer.key}
            style={[
              styles.prayerTimeItem,
              prayer.isCurrent && styles.currentPrayerItem,
              prayer.isPassed && styles.passedPrayerItem,
            ]}
          >
            <Ionicons
              name="radio-button-on"
              size={12}
              color={
                prayer.isCurrent
                  ? COLORS.WHITE
                  : prayer.isPassed
                  ? COLORS.GRAY_400
                  : COLORS.PRIMARY
              }
              style={styles.prayerIcon}
            />
            <Text
              style={[
                styles.prayerName,
                prayer.isCurrent && styles.currentPrayerText,
                prayer.isPassed && styles.passedPrayerText,
              ]}
            >
              {prayer.name}
            </Text>
            <Text
              style={[
                styles.prayerTime,
                prayer.isCurrent && styles.currentPrayerText,
                prayer.isPassed && styles.passedPrayerText,
              ]}
            >
              {prayer.time}
            </Text>
          </View>
        ))}
      </View>

      {/* View All Button */}
      {onViewAll && (
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
          <Text style={styles.viewAllText}>View Full Schedule</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  compactContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.MD,
    ...SHADOWS.SM,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.XS,
  },
  compactInfo: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    padding: SPACING.LG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  location: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  currentPrayerSection: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: 8,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    alignItems: 'center',
  },
  currentPrayerLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  currentPrayerName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XS,
  },
  nextPrayerInfo: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  prayerTimesGrid: {
    gap: SPACING.SM,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_50,
  },
  currentPrayerItem: {
    backgroundColor: COLORS.PRIMARY,
  },
  passedPrayerItem: {
    backgroundColor: COLORS.GRAY_100,
  },
  prayerIcon: {
    marginRight: SPACING.SM,
  },
  prayerName: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
  },
  prayerTime: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  currentPrayerText: {
    color: COLORS.WHITE,
  },
  passedPrayerText: {
    color: COLORS.GRAY_500,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    marginRight: SPACING.XS,
  },
});

export default PrayerTimesWidget;
