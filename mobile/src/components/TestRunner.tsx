/**
 * Test Runner Component
 * 
 * A simple UI component to run test scripts from within the mobile app.
 * This can be added to development builds for easy testing.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants';
import { ComprehensiveTestScript } from '../scripts/comprehensiveTestScript';
import { UserRegistrationScript } from '../scripts/userRegistrationScript';

interface TestRunnerProps {
  visible?: boolean;
  onClose?: () => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ visible = true, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  if (!visible) return null;

  const runTest = async (testType: string, testFunction: () => Promise<void>) => {
    try {
      setIsRunning(true);
      setCurrentTest(testType);
      
      await testFunction();
      
      Alert.alert('Test Complete', `${testType} test completed successfully!`);
    } catch (error) {
      Alert.alert('Test Error', `${testType} test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const testOptions = [
    {
      id: 'all',
      title: 'Run All Tests',
      description: 'Execute complete test suite',
      icon: 'play-circle',
      color: COLORS.PRIMARY,
      action: () => runTest('All Tests', ComprehensiveTestScript.runAllTests),
    },
    {
      id: 'registration',
      title: 'User Registration',
      description: 'Test user registration functionality',
      icon: 'person-add',
      color: COLORS.SUCCESS,
      action: () => runTest('User Registration', () => ComprehensiveTestScript.runSpecificTest('registration')),
    },
    {
      id: 'payment',
      title: 'Payment Validation',
      description: 'Test payment method validation fixes',
      icon: 'card',
      color: COLORS.INFO,
      action: () => runTest('Payment Validation', () => ComprehensiveTestScript.runSpecificTest('payment')),
    },
    {
      id: 'profile',
      title: 'Profile Integration',
      description: 'Test profile data integration with forms',
      icon: 'person-circle',
      color: COLORS.WARNING,
      action: () => runTest('Profile Integration', () => ComprehensiveTestScript.runSpecificTest('profile')),
    },
    {
      id: 'sync',
      title: 'Cross-Platform Sync',
      description: 'Test data synchronization between platforms',
      icon: 'sync',
      color: COLORS.SECONDARY,
      action: () => runTest('Cross-Platform Sync', () => ComprehensiveTestScript.runSpecificTest('sync')),
    },
    {
      id: 'booking',
      title: 'Booking Flow',
      description: 'Test accommodation booking process',
      icon: 'bed',
      color: COLORS.SUCCESS,
      action: () => runTest('Booking Flow', () => ComprehensiveTestScript.runSpecificTest('booking')),
    },
    {
      id: 'order',
      title: 'Order Flow',
      description: 'Test product ordering process',
      icon: 'bag',
      color: COLORS.PRIMARY,
      action: () => runTest('Order Flow', () => ComprehensiveTestScript.runSpecificTest('order')),
    },
    {
      id: 'user-creation',
      title: 'Create Test Users',
      description: 'Generate test users for development',
      icon: 'people',
      color: COLORS.INFO,
      action: () => runTest('User Creation', UserRegistrationScript.interactiveRegistration),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Runner</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        )}
      </View>

      {isRunning && (
        <View style={styles.runningIndicator}>
          <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          <Text style={styles.runningText}>Running {currentTest}...</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.testGrid}>
          {testOptions.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={[styles.testCard, { borderLeftColor: test.color }]}
              onPress={test.action}
              disabled={isRunning}
              activeOpacity={0.7}
            >
              <View style={styles.testCardContent}>
                <View style={[styles.testIcon, { backgroundColor: test.color + '15' }]}>
                  <Ionicons name={test.icon as any} size={24} color={test.color} />
                </View>
                <View style={styles.testInfo}>
                  <Text style={styles.testTitle}>{test.title}</Text>
                  <Text style={styles.testDescription}>{test.description}</Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={isRunning ? COLORS.GRAY_400 : COLORS.TEXT_SECONDARY} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Test Information</Text>
          <Text style={styles.infoText}>
            These tests verify the fixes and improvements implemented in the mobile application:
          </Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Payment method validation fixes</Text>
            <Text style={styles.infoItem}>• Profile integration with checkout and booking</Text>
            <Text style={styles.infoItem}>• Cross-platform data synchronization</Text>
            <Text style={styles.infoItem}>• User registration functionality</Text>
            <Text style={styles.infoItem}>• Maximum update depth error fixes</Text>
          </View>
          <Text style={styles.infoNote}>
            Check the console output for detailed test results and error messages.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
    ...SHADOWS.SM,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: SPACING.SM,
  },
  runningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.PRIMARY + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.PRIMARY + '30',
  },
  runningText: {
    marginLeft: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  scrollView: {
    flex: 1,
  },
  testGrid: {
    padding: SPACING.LG,
  },
  testCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: SPACING.MD,
    borderLeftWidth: 4,
    ...SHADOWS.SM,
  },
  testCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.MD,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  testDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  infoSection: {
    backgroundColor: COLORS.WHITE,
    margin: SPACING.LG,
    marginTop: 0,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  infoText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
    marginBottom: SPACING.MD,
  },
  infoList: {
    marginBottom: SPACING.MD,
  },
  infoItem: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
    marginBottom: SPACING.XS,
  },
  infoNote: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.WARNING,
    fontStyle: 'italic',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
});

export default TestRunner;
