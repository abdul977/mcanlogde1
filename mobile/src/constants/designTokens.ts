// Design tokens for MCAN Lodge Mobile App
// These tokens provide a consistent design language across the app

import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from './index';

// Component tokens
export const DESIGN_TOKENS = {
  // Button tokens
  button: {
    primary: {
      backgroundColor: COLORS.PRIMARY,
      color: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.MD,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
      fontWeight: '600', // Semibold
      minHeight: 48,
      ...SHADOWS.SM,
    },
    secondary: {
      backgroundColor: COLORS.WHITE,
      color: COLORS.PRIMARY,
      borderColor: COLORS.PRIMARY,
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.MD,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
      fontWeight: '600', // Semibold
      minHeight: 48,
      ...SHADOWS.SM,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.PRIMARY,
      borderRadius: BORDER_RADIUS.MD,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
      minHeight: 48,
    },
  },

  // Input tokens
  input: {
    default: {
      backgroundColor: COLORS.WHITE,
      borderColor: COLORS.GRAY_300,
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.MD,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.MD,
      fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
      color: COLORS.TEXT_PRIMARY,
      minHeight: 48,
    },
    focused: {
      borderColor: COLORS.PRIMARY,
      borderWidth: 2,
    },
    error: {
      borderColor: COLORS.ERROR,
      borderWidth: 1,
    },
    disabled: {
      backgroundColor: COLORS.GRAY_100,
      color: COLORS.GRAY_500,
    },
  },

  // Card tokens
  card: {
    default: {
      backgroundColor: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.LG,
      padding: SPACING.MD,
      ...SHADOWS.MD,
    },
    elevated: {
      backgroundColor: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.LG,
      padding: SPACING.LG,
      ...SHADOWS.LG,
    },
    flat: {
      backgroundColor: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.LG,
      padding: SPACING.MD,
      borderWidth: 1,
      borderColor: COLORS.GRAY_200,
    },
  },

  // Typography tokens
  text: {
    h1: {
      fontSize: TYPOGRAPHY.FONT_SIZES['3XL'],
      fontWeight: '700', // Bold
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT,
      color: COLORS.TEXT_PRIMARY,
    },
    h2: {
      fontSize: TYPOGRAPHY.FONT_SIZES['2XL'],
      fontWeight: '600', // Semibold
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT,
      color: COLORS.TEXT_PRIMARY,
    },
    h3: {
      fontSize: TYPOGRAPHY.FONT_SIZES.XL,
      fontWeight: '600', // Semibold
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL,
      color: COLORS.TEXT_PRIMARY,
    },
    body: {
      fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
      fontWeight: '400', // Normal
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL,
      color: COLORS.TEXT_PRIMARY,
    },
    bodySmall: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: '400', // Normal
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL,
      color: COLORS.TEXT_SECONDARY,
    },
    caption: {
      fontSize: TYPOGRAPHY.FONT_SIZES.XS,
      fontWeight: '400', // Normal
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL,
      color: COLORS.TEXT_MUTED,
    },
    link: {
      fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
      fontWeight: '500', // Medium
      color: COLORS.PRIMARY,
      textDecorationLine: 'underline',
    },
  },

  // Status tokens
  status: {
    success: {
      backgroundColor: COLORS.SUCCESS,
      color: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.SM,
      paddingVertical: SPACING.XS,
      paddingHorizontal: SPACING.SM,
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    },
    error: {
      backgroundColor: COLORS.ERROR,
      color: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.SM,
      paddingVertical: SPACING.XS,
      paddingHorizontal: SPACING.SM,
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    },
    warning: {
      backgroundColor: COLORS.WARNING,
      color: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.SM,
      paddingVertical: SPACING.XS,
      paddingHorizontal: SPACING.SM,
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    },
    info: {
      backgroundColor: COLORS.INFO,
      color: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.SM,
      paddingVertical: SPACING.XS,
      paddingHorizontal: SPACING.SM,
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    },
  },

  // Layout tokens
  layout: {
    container: {
      flex: 1,
      backgroundColor: COLORS.BACKGROUND,
      paddingHorizontal: SPACING.MD,
    },
    section: {
      marginBottom: SPACING.LG,
    },
    divider: {
      height: 1,
      backgroundColor: COLORS.GRAY_200,
      marginVertical: SPACING.MD,
    },
  },

  // Islamic design elements
  islamic: {
    primary: COLORS.PRIMARY, // Deep Islamic green
    secondary: COLORS.SECONDARY, // Medium green
    accent: COLORS.ACCENT, // Dark green
    light: COLORS.LIGHT, // Light green
    gold: '#FFD700', // Islamic gold accent
    calligraphy: {
      fontSize: TYPOGRAPHY.FONT_SIZES['2XL'],
      fontWeight: '400', // Normal
      color: COLORS.PRIMARY,
      textAlign: 'center' as const,
    },
  },
};

export default DESIGN_TOKENS;
