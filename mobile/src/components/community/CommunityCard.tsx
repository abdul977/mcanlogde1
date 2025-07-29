import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import type { Community } from '../../types';

interface CommunityCardProps {
  community: Community;
  onPress: () => void;
  isMember?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onPress,
  isMember = false,
}) => {
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      general: '💬',
      education: '📚',
      welfare: '🤝',
      spiritual: '🕌',
      social: '👥',
      charity: '❤️',
      youth: '🌟',
      women: '👩',
      technology: '💻',
      health: '🏥',
    };
    return icons[category] || '💬';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      general: 'General',
      education: 'Education',
      welfare: 'Welfare',
      spiritual: 'Spiritual',
      social: 'Social',
      charity: 'Charity',
      youth: 'Youth',
      women: 'Women',
      technology: 'Technology',
      health: 'Health',
    };
    return names[category] || 'General';
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Banner */}
      {community.banner && (
        <View style={styles.bannerContainer}>
          <Image source={{ uri: community.banner }} style={styles.banner} />
          <View style={styles.bannerOverlay} />
        </View>
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {community.avatar ? (
              <Image source={{ uri: community.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {community.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Community Info */}
          <View style={styles.communityInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.communityName} numberOfLines={1}>
                {community.name}
              </Text>
              {community.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color={COLORS.YELLOW_500} />
                </View>
              )}
              {isMember && (
                <View style={styles.memberBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.GREEN_500} />
                </View>
              )}
            </View>
            
            <View style={styles.categoryRow}>
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(community.category)}
              </Text>
              <Text style={styles.categoryName}>
                {getCategoryName(community.category)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {community.description}
        </Text>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {community.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {community.tags.length > 3 && (
              <Text style={styles.moreTagsText}>
                +{community.tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="people" size={14} color={COLORS.GRAY_500} />
              <Text style={styles.statText}>
                {formatMemberCount(community.memberCount)} members
              </Text>
            </View>
            
            {community.lastActivity && (
              <View style={styles.stat}>
                <Ionicons name="time" size={14} color={COLORS.GRAY_500} />
                <Text style={styles.statText}>
                  {formatDate(community.lastActivity)}
                </Text>
              </View>
            )}
          </View>

          {/* Privacy indicator */}
          {community.settings?.isPrivate && (
            <View style={styles.privacyIndicator}>
              <Ionicons name="lock-closed" size={12} color={COLORS.GRAY_500} />
              <Text style={styles.privacyText}>Private</Text>
            </View>
          )}
        </View>

        {/* Join indicator for non-members */}
        {!isMember && (
          <View style={styles.joinIndicator}>
            <Ionicons name="add-circle-outline" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.joinText}>Tap to join</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: SPACING.MD,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  bannerContainer: {
    height: 80,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.BLACK,
    opacity: 0.2,
  },
  content: {
    padding: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  avatarContainer: {
    marginRight: SPACING.SM,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  communityInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  communityName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.BLACK,
    flex: 1,
  },
  featuredBadge: {
    marginLeft: SPACING.XS,
  },
  memberBadge: {
    marginLeft: SPACING.XS,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_600,
  },
  description: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_700,
    lineHeight: 20,
    marginBottom: SPACING.SM,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  tag: {
    backgroundColor: COLORS.PRIMARY + '15',
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.XS,
    marginBottom: 4,
  },
  tagText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  moreTagsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  statText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    marginLeft: 4,
  },
  privacyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    marginLeft: 4,
  },
  joinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.SM,
    paddingTop: SPACING.SM,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
  },
  joinText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginLeft: 4,
  },
});

export default CommunityCard;
