/**
 * My Bookings Screen - Display user's accommodation bookings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen } from '../../components';

interface Booking {
  id: string;
  accommodationName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
}

const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      accommodationName: 'MCAN Lodge - Male Block A',
      location: 'Abuja, FCT',
      checkIn: '2024-08-01',
      checkOut: '2024-08-31',
      status: 'approved',
      amount: 25000,
      paymentStatus: 'paid',
    },
    {
      id: '2',
      accommodationName: 'MCAN Lodge - Female Block B',
      location: 'Lagos, Nigeria',
      checkIn: '2024-09-01',
      checkOut: '2024-09-30',
      status: 'pending',
      amount: 30000,
      paymentStatus: 'pending',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch bookings from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.SUCCESS;
      case 'pending': return COLORS.WARNING;
      case 'rejected': return COLORS.ERROR;
      case 'completed': return COLORS.INFO;
      default: return COLORS.GRAY_500;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return COLORS.SUCCESS;
      case 'pending': return COLORS.WARNING;
      case 'overdue': return COLORS.ERROR;
      default: return COLORS.GRAY_500;
    }
  };

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={64} color={COLORS.GRAY_400} />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by browsing available accommodations
            </Text>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Accommodations</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.accommodationName}>{booking.accommodationName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.GRAY_600} />
                    <Text style={styles.detailText}>{booking.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.GRAY_600} />
                    <Text style={styles.detailText}>
                      {booking.checkIn} - {booking.checkOut}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={16} color={COLORS.GRAY_600} />
                    <Text style={styles.detailText}>₦{booking.amount.toLocaleString()}</Text>
                    <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(booking.paymentStatus) + '20' }]}>
                      <Text style={[styles.paymentText, { color: getPaymentStatusColor(booking.paymentStatus) }]}>
                        {booking.paymentStatus.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bookingActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  {booking.paymentStatus === 'pending' && (
                    <TouchableOpacity style={[styles.actionButton, styles.payButton]}>
                      <Text style={[styles.actionButtonText, styles.payButtonText]}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  browseButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  bookingsList: {
    padding: SPACING.LG,
  },
  bookingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    ...SHADOWS.SM,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  accommodationName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 6,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
  },
  bookingDetails: {
    marginBottom: SPACING.MD,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  detailText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SM,
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 4,
    marginLeft: SPACING.SM,
  },
  paymentText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.GRAY_100,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  payButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  payButtonText: {
    color: COLORS.WHITE,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MyBookingsScreen;
