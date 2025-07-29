/**
 * Help & Support Screen - FAQ, contact, and support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, APP_CONFIG } from '../../constants';
import { SafeAreaScreen } from '../../components';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'How do I book accommodation?',
      answer: 'Go to the Stay tab, browse available accommodations, select your preferred option, and follow the booking process. You\'ll need to provide your NYSC details and make payment.',
      expanded: false,
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept bank transfers, card payments, and mobile money. All payments are processed securely through our payment partners.',
      expanded: false,
    },
    {
      id: '3',
      question: 'How do I enable biometric login?',
      answer: 'Go to Profile > Account Security > Biometric Authentication and toggle it on. You\'ll need to authenticate with your device\'s biometric system.',
      expanded: false,
    },
    {
      id: '4',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 48 hours before check-in. Cancellation fees may apply depending on the timing.',
      expanded: false,
    },
    {
      id: '5',
      question: 'How do prayer time notifications work?',
      answer: 'Prayer times are calculated based on your location. You can customize notification settings in Profile > Notifications.',
      expanded: false,
    },
  ]);

  const toggleFAQ = (id: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    ));
  };

  const contactOptions = [
    {
      id: 'email',
      title: 'Email Support',
      subtitle: APP_CONFIG.SUPPORT_EMAIL,
      icon: 'mail-outline',
      action: () => Linking.openURL(`mailto:${APP_CONFIG.SUPPORT_EMAIL}`),
    },
    {
      id: 'phone',
      title: 'Phone Support',
      subtitle: '+234 800 MCAN (6226)',
      icon: 'call-outline',
      action: () => Linking.openURL('tel:+2348006226'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat with us on WhatsApp',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/2348006226'),
    },
    {
      id: 'website',
      title: 'Visit Website',
      subtitle: 'www.mcan.org.ng',
      icon: 'globe-outline',
      action: () => Linking.openURL('https://mcan.org.ng'),
    },
  ];

  const quickActions = [
    {
      id: 'report-bug',
      title: 'Report a Bug',
      subtitle: 'Found an issue? Let us know',
      icon: 'bug-outline',
      color: COLORS.ERROR,
      action: () => Alert.alert('Report Bug', 'This will open the bug report form.'),
    },
    {
      id: 'feature-request',
      title: 'Request Feature',
      subtitle: 'Suggest new features',
      icon: 'bulb-outline',
      color: COLORS.WARNING,
      action: () => Alert.alert('Feature Request', 'This will open the feature request form.'),
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      subtitle: 'Learn how to use the app',
      icon: 'book-outline',
      color: COLORS.INFO,
      action: () => Alert.alert('User Guide', 'This will open the user guide.'),
    },
  ];

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.action}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            {contactOptions.map((option, index) => (
              <View key={option.id}>
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={option.action}
                >
                  <View style={styles.contactInfo}>
                    <Ionicons name={option.icon as any} size={20} color={COLORS.PRIMARY} />
                    <View style={styles.contactText}>
                      <Text style={styles.contactTitle}>{option.title}</Text>
                      <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                    </View>
                  </View>
                  <Ionicons name="open-outline" size={16} color={COLORS.GRAY_400} />
                </TouchableOpacity>
                {index < contactOptions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqCard}>
            {faqs.map((faq, index) => (
              <View key={faq.id}>
                <TouchableOpacity
                  style={styles.faqRow}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons 
                    name={faq.expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.GRAY_400} 
                  />
                </TouchableOpacity>
                {faq.expanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
                {index < faqs.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Islamic Quote */}
        <View style={styles.section}>
          <View style={styles.quoteCard}>
            <Ionicons name="book-outline" size={24} color={COLORS.PRIMARY} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "And whoever relies upon Allah - then He is sufficient for him"
            </Text>
            <Text style={styles.quoteSource}>- Quran 65:3</Text>
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    alignItems: 'center',
    ...SHADOWS.SM,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
  actionSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    marginLeft: SPACING.MD,
    flex: 1,
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  faqCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM,
  },
  faqQuestion: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  faqAnswer: {
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.MD,
  },
  faqAnswerText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.GRAY_200,
    marginVertical: SPACING.SM,
  },
  quoteCard: {
    backgroundColor: COLORS.PRIMARY + '10',
    padding: SPACING.LG,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: SPACING.SM,
  },
  quoteText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  quoteSource: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HelpSupportScreen;
