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

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, GENDER_OPTIONS } from '../../constants';
import { SafeAreaScreen } from '../../components';

interface Accommodation {
  id: string;
  title: string;
  location: string;
  price: number;
  gender: 'male' | 'female' | 'mixed';
  amenities: string[];
  rating: number;
  reviews: number;
  images: string[];
  isAvailable: boolean;
  description: string;
}

const AccommodationListingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [accommodations, setAccommodations] = useState<Accommodation[]>([
    {
      id: '1',
      title: 'MCAN Lodge - Male Block A',
      location: 'Abuja, FCT',
      price: 25000,
      gender: 'male',
      amenities: ['WiFi', 'AC', 'Kitchen', 'Security'],
      rating: 4.5,
      reviews: 23,
      images: [],
      isAvailable: true,
      description: 'Comfortable accommodation for male corps members',
    },
    {
      id: '2',
      title: 'MCAN Lodge - Female Block B',
      location: 'Lagos, Nigeria',
      price: 30000,
      gender: 'female',
      amenities: ['WiFi', 'AC', 'Kitchen', 'Security', 'Laundry'],
      rating: 4.8,
      reviews: 31,
      images: [],
      isAvailable: true,
      description: 'Premium accommodation for female corps members',
    },
    {
      id: '3',
      title: 'MCAN Shared Apartment',
      location: 'Kano, Nigeria',
      price: 20000,
      gender: 'mixed',
      amenities: ['WiFi', 'Kitchen', 'Security'],
      rating: 4.2,
      reviews: 15,
      images: [],
      isAvailable: false,
      description: 'Affordable shared accommodation',
    },
  ]);

  const filteredAccommodations = accommodations.filter(acc => 
    selectedGender === 'all' || acc.gender === selectedGender
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch accommodations from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderAccommodationCard = ({ item }: { item: Accommodation }) => (
    <TouchableOpacity
      style={styles.accommodationCard}
      onPress={() => navigation.navigate('AccommodationDetails' as never, { id: item.id } as never)}
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
          <Text style={styles.genderText}>{item.gender.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.accommodationTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.WARNING} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.GRAY_600} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.amenitiesContainer}>
          {item.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {item.amenities.length > 3 && (
            <Text style={styles.moreAmenities}>+{item.amenities.length - 3} more</Text>
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

      {/* Accommodations List */}
      <FlatList
        data={filteredAccommodations}
        renderItem={renderAccommodationCard}
        keyExtractor={(item) => item.id}
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
    paddingBottom: 100, // Space for tab bar
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
});

export default AccommodationListingScreen;
