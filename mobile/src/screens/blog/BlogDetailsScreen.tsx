/**
 * Blog Details Screen - Full blog post view
 * 
 * Features:
 * - Full blog content with rich formatting
 * - Author information and metadata
 * - Social interaction buttons (like, share, bookmark)
 * - Related posts section
 * - Comments section (placeholder)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants';
import { SafeAreaScreen } from '../../components';
import { BlogPost } from '../../types';
import { blogService } from '../../services/api';
import { HomeStackParamList } from '../../navigation/types';

type BlogDetailsRouteProp = RouteProp<HomeStackParamList, 'BlogDetails'>;

const { width: screenWidth } = Dimensions.get('window');

const BlogDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<BlogDetailsRouteProp>();
  const { slug } = route.params;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchBlogDetails();
    fetchRelatedBlogs();
  }, [slug]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const blogData = await blogService.getBlog(slug);
      setBlog(blogData);
    } catch (error) {
      console.error('Error fetching blog details:', error);
      Alert.alert('Error', 'Failed to load blog post. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const response = await blogService.getBlogs({ limit: 3 });
      setRelatedBlogs(response.data?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    
    try {
      await Share.share({
        message: `${blog.title}\n\n${blog.excerpt}\n\nRead more on MCAN App`,
        title: blog.title,
      });
    } catch (error) {
      console.error('Error sharing blog:', error);
    }
  };

  const handleLike = async () => {
    if (!blog) return;

    try {
      const result = await blogService.toggleLike(blog._id);
      setLiked(result.liked);
      // Could also update likes count if we had it in the UI
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!blog) return;

    try {
      const result = await blogService.toggleBookmark(blog._id);
      setBookmarked(result.bookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'islamic':
        return COLORS.PRIMARY;
      case 'education':
        return COLORS.INFO;
      case 'community':
        return COLORS.SUCCESS;
      case 'events':
        return COLORS.WARNING;
      case 'announcements':
        return COLORS.ERROR;
      default:
        return COLORS.GRAY_500;
    }
  };

  if (loading) {
    return (
      <SafeAreaScreen style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blog</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading blog post...</Text>
        </View>
      </SafeAreaScreen>
    );
  }

  if (!blog) {
    return (
      <SafeAreaScreen style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blog</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.GRAY_400} />
          <Text style={styles.errorText}>Blog post not found</Text>
        </View>
      </SafeAreaScreen>
    );
  }

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
        <Text style={styles.headerTitle}>Blog</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Image */}
        <Image
          source={{
            uri: blog.featuredImage || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop'
          }}
          style={styles.featuredImage}
        />

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(blog.category) }]}>
            <Text style={styles.categoryText}>{blog.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{blog.title}</Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.GRAY_500} />
              <Text style={styles.metaText}>{blog.author || 'Unknown Author'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.GRAY_500} />
              <Text style={styles.metaText}>{formatDate(blog.publishDate)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.GRAY_500} />
              <Text style={styles.metaText}>{blog.readTime || 5} min read</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              onPress={handleLike}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? COLORS.ERROR : COLORS.GRAY_500}
              />
              <Text style={[styles.actionText, liked && styles.actionTextActive]}>
                Like
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, bookmarked && styles.actionButtonActive]}
              onPress={handleBookmark}
            >
              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={bookmarked ? COLORS.PRIMARY : COLORS.GRAY_500}
              />
              <Text style={[styles.actionText, bookmarked && styles.actionTextActive]}>
                Save
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={COLORS.GRAY_500} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Blog Content */}
          <View style={styles.contentSection}>
            <Text style={styles.content}>{blog.content || blog.excerpt || 'Content not available'}</Text>
          </View>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsWrapper}>
                {blog.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <View style={styles.commentsPlaceholder}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.GRAY_400} />
              <Text style={styles.commentsPlaceholderText}>Comments feature coming soon!</Text>
              <Text style={styles.commentsPlaceholderSubtext}>
                Share your thoughts and engage with the community
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginHorizontal: SPACING.MD,
  },
  shareButton: {
    padding: SPACING.SM,
  },
  scrollView: {
    flex: 1,
  },
  featuredImage: {
    width: screenWidth,
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: SPACING.LG,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.MD,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.WHITE,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES['2XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: TYPOGRAPHY.FONT_SIZES['2XL'] * 1.3,
    marginBottom: SPACING.MD,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_500,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.GRAY_200,
    marginBottom: SPACING.LG,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
  },
  actionButtonActive: {
    backgroundColor: COLORS.GRAY_100,
  },
  actionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_500,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  actionTextActive: {
    color: COLORS.TEXT_PRIMARY,
  },
  contentSection: {
    marginBottom: SPACING.XL,
  },
  content: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY.FONT_SIZES.BASE * 1.6,
    color: COLORS.TEXT_PRIMARY,
  },
  tagsContainer: {
    marginTop: SPACING.LG,
  },
  tagsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  tag: {
    backgroundColor: COLORS.GRAY_100,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  tagText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  commentsSection: {
    marginTop: SPACING.XL,
    paddingTop: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
  },
  commentsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  commentsPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  commentsPlaceholderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  commentsPlaceholderSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_500,
    marginTop: SPACING.XS,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: SPACING.XL,
  },
});

export default BlogDetailsScreen;
