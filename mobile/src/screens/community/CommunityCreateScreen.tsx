import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { Header, LoadingSpinner } from '../../components';
import { useAuth } from '../../context';
import { communityService } from '../../services';

const CATEGORIES = [
  { id: 'general', name: 'General', icon: 'chatbubbles-outline' },
  { id: 'education', name: 'Education', icon: 'school-outline' },
  { id: 'spiritual', name: 'Spiritual', icon: 'heart-outline' },
  { id: 'social', name: 'Social', icon: 'people-outline' },
  { id: 'youth', name: 'Youth', icon: 'happy-outline' },
  { id: 'women', name: 'Women', icon: 'woman-outline' },
  { id: 'charity', name: 'Charity', icon: 'gift-outline' },
  { id: 'welfare', name: 'Welfare', icon: 'hand-left-outline' },
  { id: 'technology', name: 'Technology', icon: 'laptop-outline' },
  { id: 'health', name: 'Health', icon: 'fitness-outline' },
];

const CommunityCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Community name cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: tagsArray,
        isPrivate: formData.isPrivate,
      };

      const newCommunity = await communityService.createCommunity(communityData);
      
      Alert.alert(
        'Success!',
        'Your community has been created and is pending approval.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating community:', error);
      Alert.alert(
        'Error',
        'Failed to create community. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.label}>Category</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              formData.category === category.id && styles.selectedCategory
            ]}
            onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
          >
            <Ionicons
              name={category.icon as any}
              size={20}
              color={formData.category === category.id ? COLORS.WHITE : COLORS.GRAY_600}
            />
            <Text style={[
              styles.categoryText,
              formData.category === category.id && styles.selectedCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Create Community" showBackButton />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Create Community" 
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}>Create</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Community Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Community Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, name: text }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Enter community name"
              placeholderTextColor={COLORS.GRAY_400}
              maxLength={100}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            <Text style={styles.characterCount}>{formData.name.length}/100</Text>
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, description: text }));
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              placeholder="Describe your community's purpose and goals"
              placeholderTextColor={COLORS.GRAY_400}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            <Text style={styles.characterCount}>{formData.description.length}/500</Text>
          </View>

          {/* Category Selector */}
          {renderCategorySelector()}

          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
              placeholder="Enter tags separated by commas"
              placeholderTextColor={COLORS.GRAY_400}
            />
            <Text style={styles.helperText}>
              Add relevant tags to help others discover your community
            </Text>
          </View>

          {/* Privacy Toggle */}
          <View style={styles.privacyContainer}>
            <View style={styles.privacyInfo}>
              <Text style={styles.label}>Privacy</Text>
              <Text style={styles.helperText}>
                {formData.isPrivate 
                  ? 'Private communities require approval to join'
                  : 'Public communities can be joined by anyone'
                }
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, formData.isPrivate && styles.toggleActive]}
              onPress={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
            >
              <View style={[styles.toggleThumb, formData.isPrivate && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Communities must comply with MCAN values and principles{'\n'}
              • Respectful and constructive discussions only{'\n'}
              • No spam, harassment, or inappropriate content{'\n'}
              • Communities are subject to admin approval{'\n'}
              • Moderators reserve the right to remove content or members
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    flex: 1,
  },
  form: {
    flex: 1,
    padding: SPACING.MD,
  },
  inputContainer: {
    marginBottom: SPACING.LG,
  },
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.GRAY_700,
    marginBottom: SPACING.XS,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: 8,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: 8,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.ERROR,
    marginTop: SPACING.XS,
  },
  characterCount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    textAlign: 'right',
    marginTop: SPACING.XS,
  },
  helperText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    marginTop: SPACING.XS,
  },
  categoryContainer: {
    marginBottom: SPACING.LG,
  },
  categoryScroll: {
    marginTop: SPACING.XS,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    marginRight: SPACING.XS,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_100,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  selectedCategory: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_600,
    marginLeft: SPACING.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  selectedCategoryText: {
    color: COLORS.WHITE,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.LG,
  },
  privacyInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.GRAY_300,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  guidelinesContainer: {
    backgroundColor: COLORS.GRAY_50,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.XL,
  },
  guidelinesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.GRAY_700,
    marginBottom: SPACING.XS,
  },
  guidelinesText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_600,
    lineHeight: 18,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.PRIMARY,
  },
});

export default CommunityCreateScreen;
