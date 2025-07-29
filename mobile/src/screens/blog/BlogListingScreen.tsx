/**
 * Blog Listing Screen - Browse all blog posts
 * 
 * Features:
 * - List/grid view of all published blogs
 * - Search functionality
 * - Category filtering
 * - Pagination with pull-to-refresh
 * - Navigation to blog details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants';
import { SafeAreaScreen, BlogCard } from '../../components';
import { BlogPost } from '../../types';
import { blogService } from '../../services/api';
import { HomeStackParamList } from '../../navigation/types';

type NavigationProp = {
  navigate: (screen: keyof HomeStackParamList, params?: any) => void;
  goBack: () => void;
};

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Islamic', value: 'islamic' },
  { label: 'Education', value: 'education' },
  { label: 'Community', value: 'community' },
  { label: 'Events', value: 'events' },
  { label: 'Announcements', value: 'announcements' },
];

const BlogListingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchBlogs(true);
  }, [selectedCategory, searchQuery]);

  const fetchBlogs = async (reset = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const filters = {
        page: currentPage,
        limit: 10,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await blogService.getBlogs(filters);
      const newBlogs = response.data || [];

      if (reset) {
        setBlogs(newBlogs);
        setPage(2);
      } else {
        setBlogs(prev => [...prev, ...newBlogs]);
        setPage(prev => prev + 1);
      }

      setHasMore(newBlogs.length === 10);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      Alert.alert('Error', 'Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchBlogs(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchBlogs(false);
    }
  };

  const handleBlogPress = (blog: BlogPost) => {
    navigation.navigate('BlogDetails', { slug: blog.slug });
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const renderBlogItem = ({ item }: { item: BlogPost }) => (
    <View style={styles.blogItemContainer}>
      <BlogCard
        blog={item}
        onPress={handleBlogPress}
        width={undefined} // Let it take full width
      />
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.categoryButton,
            selectedCategory === category.value && styles.categoryButtonActive,
          ]}
          onPress={() => handleCategoryPress(category.value)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category.value && styles.categoryButtonTextActive,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.GRAY_400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search blog posts..."
          placeholderTextColor={COLORS.GRAY_400}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.GRAY_400} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      {renderCategoryFilter()}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <Text style={styles.footerLoaderText}>Loading more posts...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={COLORS.GRAY_400} />
      <Text style={styles.emptyTitle}>No blog posts found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedCategory !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Check back later for new content'}
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Blog Posts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <FlatList
        data={blogs}
        renderItem={renderBlogItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
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
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  headerContainer: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_100,
    borderRadius: BORDER_RADIUS.LG,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  categoriesContainer: {
    paddingVertical: SPACING.SM,
  },
  categoryButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.LG,
    backgroundColor: COLORS.GRAY_100,
    marginRight: SPACING.SM,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_SECONDARY,
  },
  categoryButtonTextActive: {
    color: COLORS.WHITE,
  },
  listContainer: {
    flexGrow: 1,
  },
  blogItemContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  footerLoader: {
    paddingVertical: SPACING.LG,
    alignItems: 'center',
  },
  footerLoaderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING['3XL'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.FONT_SIZES.BASE * 1.4,
  },
});

export default BlogListingScreen;
