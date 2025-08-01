/**
 * Home Screen - Main dashboard for MCAN Lodge Mobile App
 * 
 * Features:
 * - Welcome header with user info and logout
 * - Prayer times widget
 * - Quick action buttons
 * - Featured content sections
 * - Islamic elements
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
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { useAuth } from '../../context';
import { SafeAreaScreen, BlogCard } from '../../components';
import PrayerTimesWidget from '../../components/features/PrayerTimesWidget';
import { BlogPost } from '../../types';
import { blogService } from '../../services/api';
import { HomeStackParamList } from '../../navigation/types';
import { useEnhancedNavigation } from '../../hooks/useEnhancedNavigation';

const { width: screenWidth } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  console.log('🏠 HomeScreen rendering...');
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { navigateToTab } = useEnhancedNavigation();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // Fetch featured blogs
  const fetchFeaturedBlogs = async () => {
    try {
      setBlogsLoading(true);
      const blogs = await blogService.getFeaturedBlogs(5);
      setFeaturedBlogs(blogs);
      console.log('✅ Featured blogs fetched:', blogs.length);
    } catch (error) {
      console.error('❌ Error fetching featured blogs:', error);
      // Don't show error alert for blogs as it's not critical
    } finally {
      setBlogsLoading(false);
    }
  };

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

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFeaturedBlogs();
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  // Handle blog card press
  const handleBlogPress = (blog: BlogPost) => {
    console.log('📖 Blog pressed:', blog.title);
    navigation.navigate('BlogDetails', { slug: blog.slug });
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Quick action buttons data
  const quickActions = [
    {
      id: 'accommodation',
      title: 'Book Accommodation',
      subtitle: 'Find your stay',
      icon: 'bed-outline',
      color: COLORS.PRIMARY,
      onPress: () => navigateToTab('AccommodationsTab'),
    },
    {
      id: 'shop',
      title: 'Shop',
      subtitle: 'Islamic products',
      icon: 'storefront-outline',
      color: COLORS.SUCCESS,
      onPress: () => navigateToTab('ShopTab'),
    },
    {
      id: 'events',
      title: 'Events',
      subtitle: 'Join programs',
      icon: 'calendar-outline',
      color: COLORS.WARNING,
      onPress: () => navigateToTab('CommunityTab'),
    },
    {
      id: 'prayer',
      title: 'Prayer Time',
      subtitle: 'Daily schedule',
      icon: 'time-outline',
      color: COLORS.INFO,
      onPress: () => navigation.navigate('PrayerTimes'),
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
            <View style={styles.welcomeSection}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {user?.name && user.name.trim() ? user.name : 'Loading...'}
              </Text>
              <Text style={styles.subtitle}>
                Assalamu Alaikum wa Rahmatullahi wa Barakatuh
              </Text>
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

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { borderTopColor: action.color }]}
                onPress={action.onPress}
                accessibilityLabel={action.title}
                accessibilityHint={action.subtitle}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prayer Times Widget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          <PrayerTimesWidget
            onViewAll={() => navigation.navigate('PrayerTimes' as never)}
          />
        </View>

        {/* Blog Carousel Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest from MCAN Blog</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('BlogListing' as never)}
              accessibilityLabel="View all blog posts"
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {blogsLoading ? (
            <View style={styles.blogLoadingContainer}>
              <Text style={styles.blogLoadingText}>Loading blogs...</Text>
            </View>
          ) : featuredBlogs.length > 0 ? (
            <FlatList
              data={featuredBlogs}
              renderItem={({ item }) => (
                <BlogCard
                  blog={item}
                  onPress={handleBlogPress}
                  width={screenWidth * 0.8}
                />
              )}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.blogCarouselContainer}
              snapToInterval={screenWidth * 0.8 + SPACING.MD}
              decelerationRate="fast"
              pagingEnabled={false}
            />
          ) : (
            <View style={styles.noBlogsContainer}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.GRAY_400} />
              <Text style={styles.noBlogsText}>No blog posts available</Text>
              <Text style={styles.noBlogsSubtext}>Check back later for updates</Text>
            </View>
          )}
        </View>

        {/* Featured Content Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <View style={styles.featuredCard}>
            <Text style={styles.featuredTitle}>Welcome to MCAN FCT</Text>
            <Text style={styles.featuredDescription}>
              Join our thriving Muslim community during your NYSC year.
              Connect with fellow corps members and participate in Islamic programs.
            </Text>
          </View>
        </View>

        {/* Islamic Quote Section */}
        <View style={styles.quoteSection}>
          <View style={styles.quoteCard}>
            <Ionicons name="book-outline" size={24} color={COLORS.PRIMARY} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "And whoever relies upon Allah - then He is sufficient for him"
            </Text>
            <Text style={styles.quoteSource}>- Quran 65:3</Text>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: SPACING.XS,
  },
  userName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.WHITE,
    marginBottom: SPACING.XS,
  },
  subtitle: {
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.MD,
  },
  quickActionCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    borderTopWidth: 4,
    width: '47%', // Slightly less than 50% to account for gap
    minHeight: 120,
    justifyContent: 'center',
    ...SHADOWS.SM,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  quickActionText: {
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },

  featuredCard: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  featuredDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  quoteSection: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.LG,
  },
  quoteCard: {
    backgroundColor: COLORS.PRIMARY + '10',
    padding: SPACING.LG,
    borderRadius: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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

  // Blog Carousel Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  blogCarouselContainer: {
    paddingLeft: SPACING.LG,
    paddingRight: SPACING.SM,
    paddingBottom: SPACING.MD, // Added padding to show full card
  },
  blogLoadingContainer: {
    height: 250, // Increased height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_50,
    borderRadius: 12,
    marginBottom: SPACING.MD, // Added margin bottom
  },
  blogLoadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  noBlogsContainer: {
    height: 250, // Increased height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_50,
    borderRadius: 10,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    marginBottom: SPACING.MD, // Added margin bottom
  },
  noBlogsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  noBlogsSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_500,
    marginTop: SPACING.XS,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: SPACING.LG, // Reduced bottom spacing for better layout
  },
});

export default HomeScreen;
