import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  statusBarStyle?: 'light-content' | 'dark-content';
  transparent?: boolean;
  centerTitle?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  leftComponent,
  rightComponent,
  backgroundColor = COLORS.WHITE,
  titleColor = COLORS.BLACK,
  subtitleColor = COLORS.GRAY_600,
  style,
  titleStyle,
  subtitleStyle,
  statusBarStyle = 'dark-content',
  transparent = false,
  centerTitle = true,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const headerStyle: ViewStyle = {
    backgroundColor: transparent ? 'transparent' : backgroundColor,
    paddingTop: insets.top,
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.SM,
    borderBottomWidth: transparent ? 0 : 1,
    borderBottomColor: COLORS.GRAY_200,
    borderBottomLeftRadius: backgroundColor === COLORS.PRIMARY ? 20 : 0,
    borderBottomRightRadius: backgroundColor === COLORS.PRIMARY ? 20 : 0,
    ...style,
  };

  const titleStyles: TextStyle = {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: titleColor,
    ...titleStyle,
  };

  const subtitleStyles: TextStyle = {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: subtitleColor,
    marginTop: 2,
    ...subtitleStyle,
  };

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={transparent ? 'transparent' : backgroundColor}
        translucent={transparent}
      />
      <View style={headerStyle}>
        <View style={styles.headerContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={titleColor}
                />
              </TouchableOpacity>
            )}
            {leftComponent}
          </View>

          {/* Center Section */}
          <View style={[
            styles.centerSection,
            !centerTitle && styles.leftAlignedCenter
          ]}>
            <Text style={titleStyles} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={subtitleStyles} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightComponent}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44, // Standard header height
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftAlignedCenter: {
    alignItems: 'flex-start',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: SPACING.XS,
    marginRight: SPACING.SM,
    borderRadius: 8,
  },
});

export default Header;
