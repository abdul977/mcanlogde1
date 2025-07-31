/**
 * Accommodation Listing Screen - Display available accommodations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, GENDER_OPTIONS, API_CONFIG, ENDPOINTS } from '../../constants';
import { SafeAreaScreen } from '../../components';
import { useAuth } from '../../context';

interface Accommodation {
  _id: string;
  title: string;
  location: string;
  price: number;
  genderRestriction: 'brothers' | 'sisters' | 'family';
  facilities: string[];
  images: string[];
  isAvailable: boolean;
  description: string;
  accommodationType: string;
  slug: string;
}

const AccommodationListingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch accommodations from server
  const fetchAccommodations = async () => {
    try {
      setError(null);

      if (!token) {
        setError('Please log in to view accommodations');
        return;
      }

      // Determine user gender for appropriate accommodations
      const userGender = user?.gender || 'mixed';
      let endpoint = `${API_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}`;

      // Use gender-specific endpoint like our working test script
      if (userGender === 'female') {
        endpoint = `${API_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/sisters`;
      } else if (userGender === 'male') {
        endpoint = `${API_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/brothers`;
      } else {
        // Fallback to all accommodations
        endpoint = `${API_CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS}`;
      }

      console.log('🏠 Fetching accommodations from:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch accommodations`);
      }

      const data = await response.json();
      console.log('🏠 Accommodations response:', data);

      if (data.success && data.posts) {
        setAccommodations(data.posts);
      } else {
        throw new Error(data.message || 'Failed to load accommodations');
      }
    } catch (error) {
      console.error('❌ Error fetching accommodations:', error);
      setError(error.message || 'Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  // Load accommodations on component mount
  React.useEffect(() => {
    fetchAccommodations();
  }, [token, user]);

  const filteredAccommodations = accommodations.filter(acc => {
    if (selectedGender === 'all') return true;

    // Map gender filter to server gender restriction format
    const genderMap = {
      'male': 'brothers',
      'female': 'sisters',
      'mixed': 'family'
    };

    return acc.genderRestriction === genderMap[selectedGender];
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccommodations();
    setRefreshing(false);
  };

  const renderAccommodationCard = ({ item }: { item: Accommodation }) => (
    <TouchableOpacity
      style={styles.accommodationCard}
      onPress={() => navigation.navigate('AccommodationDetails' as never, {
        id: item._id,
        accommodation: item
      } as never)}
    >
      <View style={styles.imageContainer}>
        <View style={styles.placeholderImage}>
          <Ionicons name="bed-outline" size={32} color={COLORS.GRAY_400} />
        </View>
        {!item.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
        <View style={styles.genderBadge}>
          <Text style={styles.genderText}>{item.genderRestriction.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.accommodationTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{item.accommodationType}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.GRAY_600} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.amenitiesContainer}>
          {Array.isArray(item.facilities) && item.facilities.slice(0, 3).map((facility, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{facility}</Text>
            </View>
          ))}
          {Array.isArray(item.facilities) && item.facilities.length > 3 && (
            <Text style={styles.moreAmenities}>+{item.facilities.length - 3} more</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₦{item.price.toLocaleString()}</Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, !item.isAvailable && styles.bookButtonDisabled]}
            disabled={!item.isAvailable}
            onPress={() => navigation.navigate('BookingFlow' as never, {
              accommodationId: item._id,
              accommodationPrice: item.price,
              accommodationTitle: item.title
            } as never)}
          >
            <Text style={[styles.bookButtonText, !item.isAvailable && styles.bookButtonTextDisabled]}>
              {item.isAvailable ? 'Book Now' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accommodations</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('AccommodationSearch' as never)}
        >
          <Ionicons name="search-outline" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterTab, selectedGender === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedGender('all')}
          >
            <Text style={[styles.filterTabText, selectedGender === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterTab, selectedGender === option.value && styles.filterTabActive]}
              onPress={() => setSelectedGender(option.value)}
            >
              <Text style={[styles.filterTabText, selectedGender === option.value && styles.filterTabTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading accommodations...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
          <Text style={styles.errorTitle}>Error Loading Accommodations</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAccommodations}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Accommodations List */}
      {!loading && !error && (
        <FlatList
          data={filteredAccommodations}
          renderItem={renderAccommodationCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bed-outline" size={64} color={COLORS.GRAY_400} />
              <Text style={styles.emptyTitle}>No Accommodations Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or check back later
              </Text>
            </View>
          }
        />
      )}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.WHITE,
  },
  searchButton: {
    padding: SPACING.SM,
  },
  filterContainer: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  filterScroll: {
    paddingHorizontal: SPACING.LG,
  },
  filterTab: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.MD,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_100,
  },
  filterTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_SECONDARY,
  },
  filterTabTextActive: {
    color: COLORS.WHITE,
  },
  listContainer: {
    padding: SPACING.LG,
    paddingBottom: 80, // Reduced space for tab bar
  },
  accommodationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: SPACING.LG,
    overflow: 'hidden',
    ...SHADOWS.MD,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: COLORS.GRAY_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableBadge: {
    position: 'absolute',
    top: SPACING.MD,
    left: SPACING.MD,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  genderBadge: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 6,
  },
  genderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  cardContent: {
    padding: SPACING.LG,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  accommodationTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  reviewsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    gap: 4,
  },
  locationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  description: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
    marginBottom: SPACING.MD,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: SPACING.MD,
    gap: SPACING.XS,
  },
  amenityTag: {
    backgroundColor: COLORS.PRIMARY + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  moreAmenities: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  priceUnit: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 2,
  },
  bookButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.GRAY_300,
  },
  bookButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  bookButtonTextDisabled: {
    color: COLORS.GRAY_500,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
    paddingHorizontal: SPACING.LG,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.ERROR,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: SPACING.SM,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  typeContainer: {
    backgroundColor: COLORS.GRAY_100,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
});

export default AccommodationListingScreen;
