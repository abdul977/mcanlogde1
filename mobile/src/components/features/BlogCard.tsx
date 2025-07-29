/**
 * BlogCard Component - Displays individual blog post in carousel
 * 
 * Features:
 * - Featured image with fallback
 * - Title and excerpt
 * - Author, date, and read time
 * - Category badge
 * - Tap to navigate to full blog
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants';
import { BlogPost } from '../../types';

interface BlogCardProps {
  blog: BlogPost;
  onPress?: (blog: BlogPost) => void;
  width?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const defaultCardWidth = screenWidth * 0.8; // 80% of screen width

const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onPress,
  width
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const handlePress = () => {
    if (onPress) {
      onPress(blog);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, width ? { width } : styles.fullWidth]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel={`Blog post: ${blog.title}`}
      accessibilityHint="Tap to read full article"
    >
      {/* Featured Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: blog.featuredImage || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop'
          }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(blog.category) }]}>
          <Text style={styles.categoryText}>{blog.category}</Text>
        </View>

        {/* Featured Badge */}
        {blog.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color={COLORS.WHITE} />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {blog.title || 'Untitled'}
        </Text>

        {/* Excerpt */}
        <Text style={styles.excerpt} numberOfLines={3}>
          {blog.excerpt || 'No excerpt available'}
        </Text>

        {/* Meta Information */}
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={COLORS.GRAY_500} />
            <Text style={styles.metaText}>{blog.author || 'Unknown'}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.GRAY_500} />
            <Text style={styles.metaText}>{formatDate(blog.publishDate)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.GRAY_500} />
            <Text style={styles.metaText}>{blog.readTime || 5} min read</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    marginHorizontal: SPACING.SM,
    ...SHADOWS.MD,
  },
  fullWidth: {
    width: '100%',
    marginHorizontal: 0,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    borderTopLeftRadius: BORDER_RADIUS.LG,
    borderTopRightRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.SM,
    left: SPACING.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.WHITE,
    textTransform: 'capitalize',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.SM,
    right: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WARNING,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  featuredText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.WHITE,
    marginLeft: 2,
  },
  content: {
    padding: SPACING.LG,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
    lineHeight: TYPOGRAPHY.FONT_SIZES.LG * 1.3,
  },
  excerpt: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.FONT_SIZES.SM * 1.4,
    marginBottom: SPACING.MD,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
});

export default BlogCard;
