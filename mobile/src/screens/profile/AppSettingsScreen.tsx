/**
 * App Settings Screen - Global app settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, APP_CONFIG } from '../../constants';
import { SafeAreaScreen } from '../../components';

const AppSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSync: true,
    offlineMode: false,
    language: 'English',
    prayerReminders: true,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          // TODO: Implement cache clearing
          Alert.alert('Success', 'Cache cleared successfully');
        }},
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          icon: 'moon-outline',
          type: 'switch',
          value: settings.darkMode,
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'App language',
          icon: 'language-outline',
          type: 'select',
          value: settings.language,
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          id: 'autoSync',
          title: 'Auto Sync',
          subtitle: 'Sync data automatically',
          icon: 'sync-outline',
          type: 'switch',
          value: settings.autoSync,
        },
        {
          id: 'offlineMode',
          title: 'Offline Mode',
          subtitle: 'Enable offline functionality',
          icon: 'cloud-offline-outline',
          type: 'switch',
          value: settings.offlineMode,
        },
        {
          id: 'clearCache',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          icon: 'trash-outline',
          type: 'action',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          title: 'App Version',
          subtitle: APP_CONFIG.VERSION,
          icon: 'information-circle-outline',
          type: 'info',
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'View privacy policy',
          icon: 'shield-outline',
          type: 'link',
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'View terms of service',
          icon: 'document-text-outline',
          type: 'link',
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={item.id} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name={item.icon} size={20} color={COLORS.PRIMARY} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Switch
              value={item.value}
              onValueChange={() => toggleSetting(item.id)}
              trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY + '40' }}
              thumbColor={item.value ? COLORS.PRIMARY : COLORS.GRAY_500}
            />
          </View>
        );
      
      case 'select':
        return (
          <TouchableOpacity key={item.id} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name={item.icon} size={20} color={COLORS.PRIMARY} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.valueText}>{item.value}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.GRAY_400} />
            </View>
          </TouchableOpacity>
        );
      
      case 'action':
        return (
          <TouchableOpacity 
            key={item.id} 
            style={styles.settingRow}
            onPress={item.id === 'clearCache' ? clearCache : undefined}
          >
            <View style={styles.settingInfo}>
              <Ionicons name={item.icon} size={20} color={COLORS.ERROR} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: COLORS.ERROR }]}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.GRAY_400} />
          </TouchableOpacity>
        );
      
      case 'info':
        return (
          <View key={item.id} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name={item.icon} size={20} color={COLORS.PRIMARY} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </View>
        );
      
      case 'link':
        return (
          <TouchableOpacity key={item.id} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name={item.icon} size={20} color={COLORS.PRIMARY} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.GRAY_400} />
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.settingsCard}>
              {group.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < group.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoCard}>
            <View style={styles.appIcon}>
              <Ionicons name="moon" size={32} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.appName}>{APP_CONFIG.NAME}</Text>
            <Text style={styles.appDescription}>{APP_CONFIG.DESCRIPTION}</Text>
            <Text style={styles.appVersion}>Version {APP_CONFIG.VERSION}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  settingsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.MD,
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  valueText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.GRAY_200,
    marginVertical: SPACING.SM,
  },
  appInfoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.XL,
    alignItems: 'center',
    ...SHADOWS.SM,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  appName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  appDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  appVersion: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default AppSettingsScreen;
