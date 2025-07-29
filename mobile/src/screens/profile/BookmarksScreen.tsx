/**
 * Bookmarks Screen - User's saved blog posts
 * 
 * Features:
 * - List of user's bookmarked blogs
 * - Filter by collection, reading status, priority
 * - Search functionality
 * - Reading progress tracking
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
import { blogService } from '../../services/api';

const FILTER_OPTIONS = {
  collections: ['all', 'default', 'to_read', 'favorites'],
  readingStatus: ['all', 'to_read', 'reading', 'completed'],
  priority: ['all', 'high', 'medium', 'low']
};

const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedReadingStatus, setSelectedReadingStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchBookmarks(true);
    fetchBookmarkStats();
  }, [selectedCollection, selectedReadingStatus, selectedPriority, searchQuery]);

  const fetchBookmarks = async (reset = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const filters = {
        page: currentPage,
        limit: 10,
        ...(selectedCollection !== 'all' && { collection: selectedCollection }),
        ...(selectedReadingStatus !== 'all' && { readingStatus: selectedReadingStatus }),
        ...(selectedPriority !== 'all' && { priority: selectedPriority }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await blogService.getBookmarkedBlogs(filters);
      const newBookmarks = response.bookmarks || [];

      if (reset) {
        setBookmarks(newBookmarks);
        setPage(2);
      } else {
        setBookmarks(prev => [...prev, ...newBookmarks]);
        setPage(prev => prev + 1);
      }

      setHasMore(newBookmarks.length === 10);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      Alert.alert('Error', 'Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBookmarkStats = async () => {
    try {
      const response = await blogService.getBookmarkStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching bookmark stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchBookmarks(true);
    fetchBookmarkStats();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchBookmarks(false);
    }
  };

  const handleBlogPress = (bookmark: any) => {
    if (bookmark.blog) {
      navigation.navigate('BlogDetails' as never, { slug: bookmark.blog.slug } as never);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const renderBookmarkItem = ({ item }: { item: any }) => {
    if (!item.blog) return null;

    return (
      <View style={styles.bookmarkItemContainer}>
        <BlogCard
          blog={item.blog}
          onPress={() => handleBlogPress(item)}
          width={undefined}
        />
        
        {/* Bookmark Metadata */}
        <View style={styles.bookmarkMetadata}>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Ionicons name="folder-outline" size={14} color={COLORS.GRAY_500} />
              <Text style={styles.metadataText}>{item.collection}</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Ionicons name="flag-outline" size={14} color={COLORS.GRAY_500} />
              <Text style={styles.metadataText}>{item.priority}</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.GRAY_500} />
              <Text style={styles.metadataText}>{item.readingStatus.replace('_', ' ')}</Text>
            </View>
          </View>
          
          {item.readingProgress?.percentage > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Progress: {item.readingProgress.percentage}%
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${item.readingProgress.percentage}%` }
                  ]} 
                />
              </View>
            </View>
          )}
          
          {item.notes && (
            <Text style={styles.notesText} numberOfLines={2}>
              Note: {item.notes}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {/* Collection Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Collection:</Text>
        {FILTER_OPTIONS.collections.map((collection) => (
          <TouchableOpacity
            key={collection}
            style={[
              styles.filterChip,
              selectedCollection === collection && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCollection(collection)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCollection === collection && styles.filterChipTextActive,
              ]}
            >
              {collection.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Reading Status Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Status:</Text>
        {FILTER_OPTIONS.readingStatus.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              selectedReadingStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setSelectedReadingStatus(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedReadingStatus === status && styles.filterChipTextActive,
              ]}
            >
              {status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Stats Summary */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.toRead}</Text>
            <Text style={styles.statLabel}>To Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.reading}</Text>
            <Text style={styles.statLabel}>Reading</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.GRAY_400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookmarks..."
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

      {/* Filters */}
      {renderFilterChips()}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <Text style={styles.footerLoaderText}>Loading more bookmarks...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={COLORS.GRAY_400} />
      <Text style={styles.emptyTitle}>No bookmarks found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedCollection !== 'all' || selectedReadingStatus !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Start bookmarking blogs to see them here'}
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
        <Text style={styles.headerTitle}>My Bookmarks</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <FlatList
        data={bookmarks}
        renderItem={renderBookmarkItem}
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
    width: 40,
  },
  headerContainer: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.GRAY_50,
    borderRadius: BORDER_RADIUS.MD,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
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
  filtersContainer: {
    paddingVertical: SPACING.SM,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.LG,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_SECONDARY,
    marginRight: SPACING.SM,
  },
  filterChip: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.GRAY_100,
    marginRight: SPACING.XS,
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: COLORS.WHITE,
  },
  listContainer: {
    flexGrow: 1,
  },
  bookmarkItemContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  bookmarkMetadata: {
    marginTop: SPACING.SM,
    padding: SPACING.MD,
    backgroundColor: COLORS.GRAY_50,
    borderRadius: BORDER_RADIUS.SM,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_600,
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginBottom: SPACING.SM,
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.GRAY_200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
  },
  notesText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
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

export default BookmarksScreen;
