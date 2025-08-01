import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface StatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  color?: string;
  gradientColors?: string[];
  variant?: 'default' | 'gradient' | 'minimal';
  onPress?: () => void;
  style?: ViewStyle;
  showTrend?: boolean;
  trendValue?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  color = COLORS.PRIMARY,
  gradientColors,
  variant = 'default',
  onPress,
  style,
  showTrend = false,
  trendValue,
  trendDirection = 'neutral',
}) => {
  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return COLORS.SUCCESS;
      case 'down':
        return COLORS.ERROR;
      default:
        return COLORS.GRAY_500;
    }
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {showTrend && trendValue !== undefined && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={getTrendIcon()}
              size={12}
              color={getTrendColor()}
            />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trendValue > 0 ? '+' : ''}{trendValue}%
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.body}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );

  const cardStyle = [
    styles.card,
    variant === 'minimal' && styles.minimalCard,
    style,
  ];

  if (variant === 'gradient' && gradientColors) {
    const CardComponent = onPress ? TouchableOpacity : View;
    const cardProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

    return (
      <CardComponent {...cardProps}>
        <LinearGradient
          colors={gradientColors}
          style={cardStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.gradientContent}>
            {renderContent()}
          </View>
        </LinearGradient>
      </CardComponent>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    ...SHADOWS.MD,
    minHeight: 100,
  },
  minimalCard: {
    backgroundColor: COLORS.GRAY_50,
    ...SHADOWS.SM,
    padding: SPACING.MD,
  },
  content: {
    flex: 1,
  },
  gradientContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SM,
    ...SHADOWS.SM,
  },
  trendText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    marginLeft: 2,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: TYPOGRAPHY.FONT_SIZES['2XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
});

export default StatsCard;
