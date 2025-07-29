/**
 * Accommodation Details Screen - Show detailed accommodation information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen, AnimatedButton } from '../../components';

const AccommodationDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock data - would come from API based on route params
  const accommodation = {
    id: '1',
    title: 'MCAN Lodge - Male Block A',
    location: 'Abuja, FCT',
    price: 25000,
    gender: 'male',
    amenities: ['WiFi', 'AC', 'Kitchen', 'Security', 'Laundry', 'Parking'],
    rating: 4.5,
    reviews: 23,
    images: [],
    isAvailable: true,
    description: 'Comfortable and secure accommodation designed specifically for male corps members. Located in a safe neighborhood with easy access to transportation and essential services.',
    features: [
      'Fully furnished rooms',
      '24/7 security',
      'High-speed internet',
      'Shared kitchen facilities',
      'Laundry services',
      'Parking space',
      'Prayer room',
      'Study area',
    ],
    rules: [
      'No smoking inside the building',
      'Quiet hours: 10 PM - 6 AM',
      'Visitors must register at reception',
      'Keep common areas clean',
      'No pets allowed',
    ],
    contact: {
      phone: '+234 800 MCAN (6226)',
      email: 'accommodation@mcan.org.ng',
      address: 'Plot 123, Maitama District, Abuja, FCT',
    },
  };

  const handleBookNow = () => {
    navigation.navigate('BookingFlow' as never, { accommodationId: accommodation.id } as never);
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
        <Text style={styles.headerTitle}>Accommodation Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <View style={styles.placeholderImage}>
            <Ionicons name="bed-outline" size={64} color={COLORS.GRAY_400} />
            <Text style={styles.placeholderText}>Accommodation Photos</Text>
          </View>
          <View style={styles.genderBadge}>
            <Text style={styles.genderText}>{accommodation.gender.toUpperCase()}</Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{accommodation.title}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={COLORS.WARNING} />
              <Text style={styles.ratingText}>{accommodation.rating}</Text>
              <Text style={styles.reviewsText}>({accommodation.reviews} reviews)</Text>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.GRAY_600} />
            <Text style={styles.locationText}>{accommodation.location}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₦{accommodation.price.toLocaleString()}</Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{accommodation.description}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {accommodation.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            {accommodation.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark" size={16} color={COLORS.PRIMARY} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>House Rules</Text>
          <View style={styles.rulesList}>
            {accommodation.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.INFO} />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.contactText}>{accommodation.contact.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.contactText}>{accommodation.contact.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.contactText}>{accommodation.contact.address}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing for Fixed Button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Book Button */}
      <View style={styles.fixedButtonContainer}>
        <AnimatedButton
          title="Book This Accommodation"
          onPress={handleBookNow}
          variant="primary"
          size="large"
          leftIcon="calendar-outline"
          disabled={!accommodation.isAvailable}
        />
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
  shareButton: {
    padding: SPACING.SM,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: COLORS.GRAY_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.GRAY_500,
    marginTop: SPACING.SM,
  },
  genderBadge: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
  },
  genderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  section: {
    padding: SPACING.LG,
    backgroundColor: COLORS.WHITE,
    marginBottom: SPACING.SM,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  reviewsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
    gap: 4,
  },
  locationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  priceUnit: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  description: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SUCCESS + '10',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
    gap: SPACING.SM,
  },
  amenityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.SUCCESS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  featuresList: {
    gap: SPACING.SM,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  featureText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
  },
  rulesList: {
    gap: SPACING.SM,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.SM,
  },
  ruleText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  contactCard: {
    backgroundColor: COLORS.GRAY_50,
    borderRadius: 12,
    padding: SPACING.LG,
    gap: SPACING.MD,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  contactText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  bottomSpacing: {
    height: 100, // Space for fixed button
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    paddingBottom: SPACING.LG + 20, // Extra space for safe area
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    ...SHADOWS.LG,
  },
});

export default AccommodationDetailsScreen;
