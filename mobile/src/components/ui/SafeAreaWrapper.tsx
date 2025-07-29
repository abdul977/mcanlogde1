import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';
import { safeInsets } from '../../utils';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  forceInsets?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

/**
 * SafeAreaWrapper Component
 * 
 * A reusable wrapper component that provides consistent safe area handling
 * across the app. It uses react-native-safe-area-context for proper
 * safe area insets on devices with notches, home indicators, etc.
 */
const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = COLORS.BACKGROUND,
  edges = ['top', 'bottom', 'left', 'right'],
  forceInsets,
}) => {
  const insets = useSafeAreaInsets();

  // Calculate effective insets - ensure all values are numbers
  const safeInsetsValues = safeInsets(insets);
  const effectiveInsets = {
    top: forceInsets?.top ?? safeInsetsValues.top,
    bottom: forceInsets?.bottom ?? safeInsetsValues.bottom,
    left: forceInsets?.left ?? safeInsetsValues.left,
    right: forceInsets?.right ?? safeInsetsValues.right,
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: edges.includes('top') ? effectiveInsets.top : 0,
    paddingBottom: edges.includes('bottom') ? effectiveInsets.bottom : 0,
    paddingLeft: edges.includes('left') ? effectiveInsets.left : 0,
    paddingRight: edges.includes('right') ? effectiveInsets.right : 0,
    ...style,
  };

  return <View style={containerStyle}>{children}</View>;
};

/**
 * SafeAreaScreen Component
 * 
 * A specialized wrapper for full-screen components that need safe area handling.
 * This is ideal for main screens and modals.
 */
export const SafeAreaScreen: React.FC<SafeAreaWrapperProps> = (props) => {
  return (
    <SafeAreaView style={[styles.screen, props.style]} edges={props.edges}>
      {props.children}
    </SafeAreaView>
  );
};

/**
 * SafeAreaHeader Component
 * 
 * A specialized wrapper for header components that only need top safe area.
 */
export const SafeAreaHeader: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = COLORS.WHITE,
  ...props
}) => {
  return (
    <SafeAreaWrapper
      {...props}
      edges={['top', 'left', 'right']}
      backgroundColor={backgroundColor}
      style={[styles.header, style]}
    >
      {children}
    </SafeAreaWrapper>
  );
};

/**
 * SafeAreaContent Component
 * 
 * A wrapper for main content that excludes bottom safe area
 * (useful when you have a bottom tab navigator)
 */
export const SafeAreaContent: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <SafeAreaWrapper
      {...props}
      edges={['top', 'left', 'right']}
      style={[styles.content, style]}
    >
      {children}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
