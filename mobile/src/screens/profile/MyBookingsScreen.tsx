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
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, API_CONFIG, ENDPOINTS } from '../../constants';
import { SafeAreaScreen } from '../../components';
import { useAuth } from '../../context';

interface Booking {
  _id: string;
  accommodationId?: {
    title: string;
    location: string;
    price: number;
  };
  bookingType: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  bookingDuration?: {
    months: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  userNotes?: string;
  contactInfo?: {
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in to view your bookings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MY_BOOKINGS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert(
        'Error',
        'Failed to load bookings. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.SUCCESS;
      case 'pending': return COLORS.WARNING;
      case 'rejected': return COLORS.ERROR;
      case 'completed': return COLORS.INFO;
      case 'cancelled': return COLORS.GRAY_500;
      default: return COLORS.GRAY_500;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateAmount = (booking: Booking) => {
    if (booking.accommodationId?.price && booking.bookingDuration?.months) {
      return booking.accommodationId.price * booking.bookingDuration.months;
    }
    return booking.accommodationId?.price || 0;
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={64} color={COLORS.GRAY_400} />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by browsing available accommodations
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('AccommodationTab' as never)}
            >
              <Text style={styles.browseButtonText}>Browse Accommodations</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => (
              <View key={booking._id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.accommodationName}>
                    {booking.accommodationId?.title || `${booking.bookingType} Booking`}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  {booking.accommodationId?.location && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>{booking.accommodationId.location}</Text>
                    </View>
                  )}
                  {booking.checkInDate && booking.checkOutDate && (
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={16} color={COLORS.GRAY_600} />
                    <Text style={styles.detailText}>₦{calculateAmount(booking).toLocaleString()}</Text>
                  </View>

                  {booking.numberOfGuests && (
                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>
                        {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}

                  {booking.bookingDuration?.months && (
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>
                        {booking.bookingDuration.months} month{booking.bookingDuration.months > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.bookingActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewDetails(booking)}
                  >
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  {booking.status === 'pending' && (
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                      <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <View style={styles.modalHeaderRight} />
          </View>

          {selectedBooking && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Booking Status */}
              <View style={styles.modalSection}>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedBooking.status) }]}>
                      {selectedBooking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Accommodation Details */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Accommodation</Text>
                <View style={styles.detailCard}>
                  <Text style={styles.accommodationTitle}>
                    {selectedBooking.accommodationId?.title || `${selectedBooking.bookingType} Booking`}
                  </Text>
                  {selectedBooking.accommodationId?.location && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>{selectedBooking.accommodationId.location}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Booking Information */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Booking Information</Text>
                <View style={styles.detailCard}>
                  {selectedBooking.checkInDate && selectedBooking.checkOutDate && (
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>
                        {formatDate(selectedBooking.checkInDate)} - {formatDate(selectedBooking.checkOutDate)}
                      </Text>
                    </View>
                  )}

                  {selectedBooking.numberOfGuests && (
                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>
                        {selectedBooking.numberOfGuests} guest{selectedBooking.numberOfGuests > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}

                  {selectedBooking.bookingDuration?.months && (
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={COLORS.GRAY_600} />
                      <Text style={styles.detailText}>
                        {selectedBooking.bookingDuration.months} month{selectedBooking.bookingDuration.months > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={16} color={COLORS.GRAY_600} />
                    <Text style={styles.detailText}>₦{calculateAmount(selectedBooking).toLocaleString()}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.GRAY_600} />
                    <Text style={styles.detailText}>
                      Booked on {formatDate(selectedBooking.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contact Information */}
              {selectedBooking.contactInfo && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <View style={styles.detailCard}>
                    {selectedBooking.contactInfo.phone && (
                      <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={16} color={COLORS.GRAY_600} />
                        <Text style={styles.detailText}>{selectedBooking.contactInfo.phone}</Text>
                      </View>
                    )}

                    {selectedBooking.contactInfo.emergencyContact && (
                      <>
                        <Text style={styles.subSectionTitle}>Emergency Contact</Text>
                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={16} color={COLORS.GRAY_600} />
                          <Text style={styles.detailText}>
                            {selectedBooking.contactInfo.emergencyContact.name} ({selectedBooking.contactInfo.emergencyContact.relationship})
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="call-outline" size={16} color={COLORS.GRAY_600} />
                          <Text style={styles.detailText}>{selectedBooking.contactInfo.emergencyContact.phone}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              )}

              {/* Special Requests */}
              {selectedBooking.userNotes && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Special Requests</Text>
                  <View style={styles.detailCard}>
                    <Text style={styles.notesText}>{selectedBooking.userNotes}</Text>
                  </View>
                </View>
              )}

              <View style={styles.modalBottomSpacing} />
            </ScrollView>
          )}
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['3XL'],
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
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
  cancelButton: {
    backgroundColor: COLORS.ERROR,
  },
  cancelButtonText: {
    color: COLORS.WHITE,
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  modalHeader: {
    backgroundColor: COLORS.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  modalCloseButton: {
    padding: SPACING.SM,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  modalSection: {
    marginTop: SPACING.LG,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  subSectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  detailCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  statusContainer: {
    alignItems: 'center',
  },
  accommodationTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  notesText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  modalBottomSpacing: {
    height: SPACING.XL * 2,
  },
});

export default MyBookingsScreen;
