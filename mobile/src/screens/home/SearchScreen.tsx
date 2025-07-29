/**
 * Search Screen - Global search functionality
 * 
 * Features:
 * - Unified search across accommodations, products, events
 * - Filter options by type, location, price
 * - Recent searches
 * - Search suggestions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { SafeAreaScreen } from '../../components';

interface SearchResult {
  id: string;
  title: string;
  type: 'accommodation' | 'product' | 'event' | 'blog';
  description: string;
  price?: string;
  location?: string;
  date?: string;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Male accommodation',
    'Islamic books',
    'Quran classes',
    'Female hostel',
  ]);

  // Get initial query from route params
  useEffect(() => {
    const params = route.params as { query?: string } | undefined;
    if (params?.query) {
      setSearchQuery(params.query);
      performSearch(params.query);
    }
  }, [route.params]);

  // Mock search function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Male Accommodation - Gwarinpa',
          type: 'accommodation',
          description: 'Comfortable accommodation for male corps members',
          price: '₦25,000/month',
          location: 'Gwarinpa, Abuja',
        },
        {
          id: '2',
          title: 'Islamic Prayer Mat',
          type: 'product',
          description: 'High-quality prayer mat with compass',
          price: '₦5,500',
        },
        {
          id: '3',
          title: 'Friday Lecture Series',
          type: 'event',
          description: 'Weekly Islamic lectures and discussions',
          date: 'Every Friday, 2:00 PM',
          location: 'MCAN Center',
        },
        {
          id: '4',
          title: 'Understanding Ramadan',
          type: 'blog',
          description: 'A comprehensive guide to the holy month',
        },
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
      setIsLoading(false);
    }, 500);
  };

  // Handle search submission
  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item !== query);
        return [query, ...filtered].slice(0, 5);
      });
      
      performSearch(query);
    }
  };

  // Handle recent search tap
  const handleRecentSearchTap = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Get icon for search result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'accommodation':
        return 'bed-outline';
      case 'product':
        return 'storefront-outline';
      case 'event':
        return 'calendar-outline';
      case 'blog':
        return 'document-text-outline';
      default:
        return 'search-outline';
    }
  };

  // Get color for search result type
  const getResultColor = (type: string) => {
    switch (type) {
      case 'accommodation':
        return COLORS.PRIMARY;
      case 'product':
        return COLORS.SUCCESS;
      case 'event':
        return COLORS.WARNING;
      case 'blog':
        return COLORS.INFO;
      default:
        return COLORS.GRAY_500;
    }
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={[styles.resultIcon, { backgroundColor: getResultColor(item.type) + '15' }]}>
        <Ionicons
          name={getResultIcon(item.type) as any}
          size={20}
          color={getResultColor(item.type)}
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultDescription}>{item.description}</Text>
        <View style={styles.resultMeta}>
          {item.price && (
            <Text style={styles.resultPrice}>{item.price}</Text>
          )}
          {item.location && (
            <Text style={styles.resultLocation}>📍 {item.location}</Text>
          )}
          {item.date && (
            <Text style={styles.resultDate}>📅 {item.date}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY_400} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.GRAY_400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search accommodations, products, events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.GRAY_400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Searches */}
        {searchQuery.length === 0 && recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentSearches}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => handleRecentSearchTap(search)}
                >
                  <Ionicons name="time-outline" size={16} color={COLORS.GRAY_400} />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Suggestions */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.suggestions}>
              {['Male accommodation', 'Female hostel', 'Islamic books', 'Prayer times', 'Quran classes'].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleRecentSearchTap(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isLoading ? 'Searching...' : `Results for "${searchQuery}"`}
            </Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color={COLORS.GRAY_300} />
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsText}>
                  Try adjusting your search terms or browse our categories
                </Text>
              </View>
            )}
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  backButton: {
    padding: SPACING.SM,
    marginRight: SPACING.SM,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_100,
    borderRadius: 25,
    paddingHorizontal: SPACING.MD,
  },
  searchIcon: {
    marginRight: SPACING.SM,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: SPACING.MD,
  },
  clearButton: {
    padding: SPACING.XS,
  },
  content: {
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
  recentSearches: {
    gap: SPACING.SM,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  recentSearchText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SM,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  suggestionItem: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    ...SHADOWS.SM,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  resultDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  resultMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  resultPrice: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.SUCCESS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  resultLocation: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  resultDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  separator: {
    height: SPACING.MD,
  },
  loadingContainer: {
    padding: SPACING.XL,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  noResultsContainer: {
    padding: SPACING.XL,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  noResultsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
});

export default SearchScreen;
