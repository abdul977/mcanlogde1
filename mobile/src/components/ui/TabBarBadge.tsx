import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';

interface TabBarBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium';
  color?: string;
  textColor?: string;
}

const TabBarBadge: React.FC<TabBarBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'small',
  color = COLORS.ERROR,
  textColor = COLORS.WHITE,
}) => {
  if (count <= 0) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      isSmall ? styles.smallBadge : styles.mediumBadge,
      { backgroundColor: color }
    ]}>
      <Text style={[
        styles.badgeText,
        isSmall ? styles.smallText : styles.mediumText,
        { color: textColor }
      ]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 4,
  },
  smallBadge: {
    top: -8,
    right: -8,
    height: 16,
    minWidth: 16,
    borderRadius: 8,
  },
  mediumBadge: {
    top: -10,
    right: -10,
    height: 20,
    minWidth: 20,
    borderRadius: 10,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY.MEDIUM,
    textAlign: 'center',
  },
  smallText: {
    fontSize: 10,
    lineHeight: 12,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    lineHeight: 14,
  },
});

export default TabBarBadge;
