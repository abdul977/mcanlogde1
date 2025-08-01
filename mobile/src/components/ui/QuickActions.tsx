import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  layout?: 'grid' | 'horizontal';
  columns?: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = 'Quick Actions',
  layout = 'grid',
  columns = 2,
}) => {
  const renderAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionButton,
        layout === 'grid' && { flex: 1 / columns },
        layout === 'horizontal' && styles.horizontalAction,
        action.disabled && styles.disabledAction,
      ]}
      onPress={action.onPress}
      disabled={action.disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
        {action.badge && action.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {action.badge > 99 ? '99+' : action.badge}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.actionTitle, action.disabled && styles.disabledText]}>
        {action.title}
      </Text>
    </TouchableOpacity>
  );

  if (layout === 'horizontal') {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.sectionTitle}>{title}</Text>}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContainer}
        >
          {actions.map(renderAction)}
        </ScrollView>
      </View>
    );
  }

  // Grid layout
  const rows = [];
  for (let i = 0; i < actions.length; i += columns) {
    const rowActions = actions.slice(i, i + columns);
    rows.push(
      <View key={i} style={styles.row}>
        {rowActions.map(renderAction)}
        {/* Fill empty spaces in the last row */}
        {rowActions.length < columns &&
          Array.from({ length: columns - rowActions.length }).map((_, index) => (
            <View key={`empty-${index}`} style={{ flex: 1 / columns }} />
          ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.gridContainer}>
        {rows}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
    paddingHorizontal: SPACING.LG,
  },
  gridContainer: {
    paddingHorizontal: SPACING.LG,
  },
  horizontalContainer: {
    paddingHorizontal: SPACING.LG,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.MD,
    gap: SPACING.MD,
  },
  actionButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...SHADOWS.SM,
  },
  horizontalAction: {
    minWidth: 100,
    marginRight: SPACING.MD,
    flex: 0,
  },
  disabledAction: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    textAlign: 'center',
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  disabledText: {
    color: COLORS.TEXT_MUTED,
  },
});

export default QuickActions;
