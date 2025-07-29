/**
 * Accommodation Search Screen - Search and filter accommodations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen } from '../../components';

const AccommodationSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    gender: '',
    priceRange: '',
    amenities: [] as string[],
  });

  const locations = ['Abuja', 'Lagos', 'Kano', 'Port Harcourt', 'Ibadan'];
  const genderOptions = ['Male', 'Female', 'Mixed'];
  const priceRanges = ['Under ₦20,000', '₦20,000 - ₦30,000', 'Above ₦30,000'];
  const amenityOptions = ['WiFi', 'AC', 'Kitchen', 'Security', 'Laundry', 'Parking'];

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      gender: '',
      priceRange: '',
      amenities: [],
    });
    setSearchQuery('');
  };

  const applyFilters = () => {
    // TODO: Apply filters and navigate back with results
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Search & Filter</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.GRAY_400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search accommodations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.GRAY_400}
            />
          </View>
        </View>

        {/* Location Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.optionsGrid}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.optionButton,
                  filters.location === location && styles.optionButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, location }))}
              >
                <Text style={[
                  styles.optionText,
                  filters.location === location && styles.optionTextActive
                ]}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.optionsGrid}>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  filters.gender === gender && styles.optionButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, gender }))}
              >
                <Text style={[
                  styles.optionText,
                  filters.gender === gender && styles.optionTextActive
                ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.optionsGrid}>
            {priceRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.optionButton,
                  filters.priceRange === range && styles.optionButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, priceRange: range }))}
              >
                <Text style={[
                  styles.optionText,
                  filters.priceRange === range && styles.optionTextActive
                ]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amenities Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.optionsGrid}>
            {amenityOptions.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[
                  styles.optionButton,
                  filters.amenities.includes(amenity) && styles.optionButtonActive
                ]}
                onPress={() => toggleAmenity(amenity)}
              >
                <Text style={[
                  styles.optionText,
                  filters.amenities.includes(amenity) && styles.optionTextActive
                ]}>
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Filters Summary */}
        {(filters.location || filters.gender || filters.priceRange || filters.amenities.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Filters</Text>
            <View style={styles.activeFilters}>
              {filters.location && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Location: {filters.location}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, location: '' }))}>
                    <Ionicons name="close" size={16} color={COLORS.WHITE} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.gender && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Gender: {filters.gender}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, gender: '' }))}>
                    <Ionicons name="close" size={16} color={COLORS.WHITE} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.priceRange && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Price: {filters.priceRange}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, priceRange: '' }))}>
                    <Ionicons name="close" size={16} color={COLORS.WHITE} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.amenities.map((amenity) => (
                <View key={amenity} style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>{amenity}</Text>
                  <TouchableOpacity onPress={() => toggleAmenity(amenity)}>
                    <Ionicons name="close" size={16} color={COLORS.WHITE} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.applyContainer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
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
  clearButton: {
    padding: SPACING.SM,
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    ...SHADOWS.SM,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  optionButton: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  optionButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  optionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
  },
  optionTextActive: {
    color: COLORS.WHITE,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 20,
    gap: SPACING.SM,
  },
  activeFilterText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.WHITE,
  },
  bottomSpacing: {
    height: 100,
  },
  applyContainer: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
  },
  applyButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
});

export default AccommodationSearchScreen;
