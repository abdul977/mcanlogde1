import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { Header, LoadingSpinner, CommunityCard } from '../../components';
import { useAuth } from '../../context';
import { communityService } from '../../services';
import type { Community } from '../../types';

const CommunityListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'joined' | 'discover'>('joined');

  useEffect(() => {
    loadCommunities();
  }, [activeTab, searchQuery]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'joined') {
        // Load user's communities
        const userCommunitiesData = await communityService.getUserCommunities();
        setUserCommunities(userCommunitiesData);
      } else {
        // Load all available communities for discovery
        const allCommunities = await communityService.getAllCommunities({
          search: searchQuery,
          limit: 20
        });
        setCommunities(allCommunities);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      Alert.alert('Error', 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunities();
    setRefreshing(false);
  };

  const handleCommunityPress = (community: Community) => {
    // Check if user is a member
    const isMember = userCommunities.some(uc => uc._id === community._id);
    
    if (isMember) {
      // Navigate to community chat
      navigation.navigate('CommunityDetail', { 
        communityId: community._id,
        communityName: community.name 
      });
    } else {
      // Show join community option
      Alert.alert(
        'Join Community',
        `Would you like to join "${community.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join', 
            onPress: () => handleJoinCommunity(community._id) 
          }
        ]
      );
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await communityService.joinCommunity(communityId);
      Alert.alert('Success', 'Successfully joined the community!');
      // Refresh the lists
      loadCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'Failed to join community');
    }
  };

  const handleCreateCommunity = () => {
    navigation.navigate('CommunityCreate');
  };

  const renderCommunityItem = ({ item }: { item: Community }) => (
    <CommunityCard
      community={item}
      onPress={() => handleCommunityPress(item)}
      isMember={activeTab === 'joined'}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="people-outline" 
        size={64} 
        color={COLORS.GRAY_400} 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'joined' 
          ? 'No Communities Joined' 
          : 'No Communities Found'
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'joined'
          ? 'Discover and join communities to connect with fellow corps members'
          : 'Try adjusting your search or check back later'
        }
      </Text>
      {activeTab === 'joined' && (
        <TouchableOpacity 
          style={styles.discoverButton}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={styles.discoverButtonText}>Discover Communities</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const currentData = activeTab === 'joined' ? userCommunities : communities;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Communities"
        rightComponent={
          <TouchableOpacity onPress={handleCreateCommunity}>
            <Ionicons name="add" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        }
      />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'joined' && styles.activeTab
          ]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'joined' && styles.activeTabText
          ]}>
            My Communities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'discover' && styles.activeTab
          ]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'discover' && styles.activeTabText
          ]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar (only for discover tab) */}
      {activeTab === 'discover' && (
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={COLORS.GRAY_400} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.GRAY_400}
          />
        </View>
      )}

      {/* Communities List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderCommunityItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.GRAY_50,
    margin: SPACING.MD,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.GRAY_600,
  },
  activeTabText: {
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_50,
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: 8,
    paddingHorizontal: SPACING.SM,
  },
  searchIcon: {
    marginRight: SPACING.XS,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.BLACK,
  },
  listContainer: {
    padding: SPACING.MD,
    paddingBottom: 100, // Account for tab bar
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.XL * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.GRAY_700,
    marginTop: SPACING.MD,
    marginBottom: SPACING.XS,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.LG,
  },
  discoverButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
  },
  discoverButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
});

export default CommunityListScreen;
