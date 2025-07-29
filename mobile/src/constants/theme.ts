// MCAN Lodge Theme Configuration
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from './index';
import { Theme } from '../types';

export const theme: Theme = {
  colors: {
    primary: COLORS.PRIMARY,
    secondary: COLORS.SECONDARY,
    accent: COLORS.ACCENT,
    background: COLORS.BACKGROUND,
    surface: COLORS.SURFACE,
    text: COLORS.TEXT_PRIMARY,
    textSecondary: COLORS.TEXT_SECONDARY,
    border: COLORS.GRAY_200,
    error: COLORS.ERROR,
    success: COLORS.SUCCESS,
    warning: COLORS.WARNING,
    info: COLORS.INFO,
  },
  spacing: {
    xs: SPACING.XS,
    sm: SPACING.SM,
    md: SPACING.MD,
    lg: SPACING.LG,
    xl: SPACING.XL,
  },
  typography: {
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
    caption: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: '400', // Normal
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL,
      color: COLORS.TEXT_SECONDARY,
    },
  },
};

// Component-specific styles
export const componentStyles = {
  button: {
    primary: {
      backgroundColor: COLORS.PRIMARY,
      borderRadius: BORDER_RADIUS.MD,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      minHeight: 48, // Accessibility touch target
      ...SHADOWS.SM,
    },
    secondary: {
      backgroundColor: COLORS.WHITE,
      borderColor: COLORS.PRIMARY,
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.MD,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      minHeight: 48,
      ...SHADOWS.SM,
    },
    text: {
      primary: {
        color: COLORS.WHITE,
        fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
        fontWeight: '600', // Semibold
        textAlign: 'center' as const,
      },
      secondary: {
        color: COLORS.PRIMARY,
        fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
        fontWeight: '600', // Semibold
        textAlign: 'center' as const,
      },
    },
  },
  input: {
    container: {
      marginBottom: SPACING.MD,
    },
    field: {
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
    label: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: '500', // Medium
      color: COLORS.TEXT_PRIMARY,
      marginBottom: SPACING.XS,
    },
    error: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      color: COLORS.ERROR,
      marginTop: SPACING.XS,
    },
  },
  card: {
    container: {
      backgroundColor: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.LG,
      padding: SPACING.MD,
      marginBottom: SPACING.MD,
      ...SHADOWS.MD,
    },
    header: {
      marginBottom: SPACING.SM,
    },
    title: {
      fontSize: TYPOGRAPHY.FONT_SIZES.LG,
      fontWeight: '600', // Semibold
      color: COLORS.TEXT_PRIMARY,
      marginBottom: SPACING.XS,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      color: COLORS.TEXT_SECONDARY,
    },
  },
  header: {
    container: {
      backgroundColor: COLORS.PRIMARY,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.MD,
      ...SHADOWS.SM,
    },
    title: {
      fontSize: TYPOGRAPHY.FONT_SIZES.LG,
      fontWeight: '600', // Semibold
      color: COLORS.WHITE,
      textAlign: 'center' as const,
    },
  },
  tabBar: {
    container: {
      backgroundColor: COLORS.WHITE,
      borderTopColor: COLORS.GRAY_200,
      borderTopWidth: 1,
      paddingVertical: SPACING.SM,
      ...SHADOWS.SM,
    },
    tab: {
      paddingVertical: SPACING.SM,
      alignItems: 'center' as const,
    },
    label: {
      fontSize: TYPOGRAPHY.FONT_SIZES.XS,
      fontWeight: '500', // Medium
      marginTop: SPACING.XS,
    },
    active: {
      color: COLORS.PRIMARY,
    },
    inactive: {
      color: COLORS.GRAY_500,
    },
  },
};

export default theme;
