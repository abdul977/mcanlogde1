import React from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ICON_SIZES } from '../../constants';

export type IconSize = keyof typeof ICON_SIZES | number;

interface IconProps {
  name: string;
  size?: IconSize;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

// Icon name mapping for better compatibility
const iconNameMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  // Navigation icons
  'home': 'home',
  'bed': 'bed',
  'store': 'storefront',
  'users-alt': 'people',
  'user-circle': 'person-circle',

  // Common app icons
  'search': 'search',
  'filter': 'filter',
  'heart': 'heart',
  'heart-outline': 'heart-outline',
  'star': 'star',
  'star-outline': 'star-outline',
  'map-marker': 'location',
  'calendar-alt': 'calendar',
  'clock': 'time',
  'phone': 'call',
  'envelope': 'mail',
  'camera': 'camera',
  'share-alt': 'share',
  'bell': 'notifications',
  'cog': 'settings',
  'sign-out-alt': 'log-out',
  'edit': 'create',
  'trash-alt': 'trash',
  'plus-circle': 'add-circle',
  'check-circle': 'checkmark-circle',
  'times-circle': 'close-circle',

  // Religious/Islamic icons (using closest alternatives)
  'mosque': 'business', // closest alternative
  'praying-hands': 'hand-left', // closest alternative
  'book-open': 'book',
  'compass': 'compass',

  // Accommodation icons
  'bath': 'water',
  'wifi': 'wifi',
  'snowflake': 'snow',
  'car': 'car',
  'utensils': 'restaurant',
  'shield-alt': 'shield',
};

/**
 * Universal Icon Component
 *
 * Uses Expo Vector Icons (Ionicons) with automatic name mapping
 * Provides consistent sizing and theming across the app
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'MD',
  color = COLORS.TEXT_PRIMARY,
  style,
  testID,
}) => {
  // Convert size to number if it's a key from ICON_SIZES
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];

  // Map the icon name to Ionicons equivalent
  const ionIconName = iconNameMap[name] || name as keyof typeof Ionicons.glyphMap;

  return (
    <Ionicons
      name={ionIconName}
      size={iconSize}
      color={color}
      style={style}
      testID={testID}
    />
  );
};

/**
 * Predefined Icon Components for common use cases
 */

// Tab Navigation Icons
export const HomeIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="home" {...props} />
);

export const StayIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="bed" {...props} />
);

export const ShopIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="store" {...props} />
);

export const CommunityIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="users-alt" {...props} />
);

export const ProfileIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="user-circle" {...props} />
);

// Common App Icons
export const SearchIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="search" {...props} />
);

export const FilterIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="filter" {...props} />
);

export const HeartIcon: React.FC<Omit<IconProps, 'name'> & { filled?: boolean }> = ({
  filled = false,
  ...props
}) => (
  <Icon name={filled ? "heart" : "heart-outline"} {...props} />
);

export const StarIcon: React.FC<Omit<IconProps, 'name'> & { filled?: boolean }> = ({
  filled = false,
  ...props
}) => (
  <Icon name={filled ? "star" : "star-outline"} {...props} />
);

export const LocationIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="map-marker" {...props} />
);

export const CalendarIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="calendar-alt" {...props} />
);

export const ClockIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="clock" {...props} />
);

export const PhoneIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="phone" {...props} />
);

export const EmailIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="envelope" {...props} />
);

export const CameraIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="camera" {...props} />
);

export const ShareIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="share-alt" {...props} />
);

export const NotificationIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="bell" {...props} />
);

export const SettingsIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="cog" {...props} />
);

export const LogoutIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="sign-out-alt" {...props} />
);

export const EditIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="edit" {...props} />
);

export const DeleteIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="trash-alt" {...props} />
);

export const AddIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="plus-circle" {...props} />
);

export const CheckIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="check-circle" {...props} />
);

export const CloseIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="times-circle" {...props} />
);

// Islamic/Religious Icons
export const MosqueIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="mosque" {...props} />
);

export const PrayerIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="praying-hands" {...props} />
);

export const QuranIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="book-open" {...props} />
);

export const CompassIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="compass" {...props} />
);

// Accommodation Icons
export const BedIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="bed" {...props} />
);

export const BathroomIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="bath" {...props} />
);

export const WifiIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="wifi" {...props} />
);

export const AcIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="snowflake" {...props} />
);

export const ParkingIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="car" {...props} />
);

export const KitchenIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="utensils" {...props} />
);

export const SecurityIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="shield-alt" {...props} />
);

export default Icon;
