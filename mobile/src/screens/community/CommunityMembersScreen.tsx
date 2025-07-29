import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { Header, LoadingSpinner, Avatar } from '../../components';
import { useAuth } from '../../context';
import { communityService } from '../../services';
import type { CommunityMember } from '../../types';

interface RouteParams {
  communityId: string;
}

const ROLE_COLORS = {
  admin: COLORS.ERROR,
  moderator: COLORS.WARNING,
  member: COLORS.GRAY_500,
};

const ROLE_LABELS = {
  admin: 'Admin',
  moderator: 'Moderator',
  member: 'Member',
};

const CommunityMembersScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { communityId } = route.params as RouteParams;
  const { user } = useAuth();
  
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'member'>('member');

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await communityService.getCommunityMembers(communityId);
      setMembers(membersData);
      
      // Find current user's role
      const currentUserMember = membersData.find(
        (member: CommunityMember) => member.user._id === user?._id
      );
      if (currentUserMember) {
        setUserRole(currentUserMember.role);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert('Error', 'Failed to load community members');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const filterMembers = () => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter((member) =>
      member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(filtered);
  };

  const canManageMember = (memberRole: string) => {
    if (userRole === 'admin') return true;
    if (userRole === 'moderator' && memberRole === 'member') return true;
    return false;
  };

  const handleMemberAction = (member: CommunityMember) => {
    if (!canManageMember(member.role)) return;

    const actions = [];

    if (userRole === 'admin') {
      if (member.role === 'member') {
        actions.push({
          title: 'Promote to Moderator',
          onPress: () => handleRoleChange(member.user._id, 'moderator'),
        });
      } else if (member.role === 'moderator') {
        actions.push({
          title: 'Demote to Member',
          onPress: () => handleRoleChange(member.user._id, 'member'),
        });
      }
    }

    if (member.role !== 'admin') {
      actions.push({
        title: 'Remove from Community',
        destructive: true,
        onPress: () => handleRemoveMember(member.user._id, member.user.name),
      });
    }

    if (actions.length === 0) return;

    Alert.alert(
      `Manage ${member.user.name}`,
      'Choose an action:',
      [
        ...actions.map(action => ({
          text: action.title,
          style: action.destructive ? 'destructive' : 'default',
          onPress: action.onPress,
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await communityService.updateMemberRole(communityId, userId, newRole);
      Alert.alert('Success', `Member role updated to ${newRole}`);
      loadMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      Alert.alert('Error', 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${userName} from this community?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.removeMember(communityId, userId);
              Alert.alert('Success', 'Member removed from community');
              loadMembers();
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const renderMemberItem = ({ item }: { item: CommunityMember }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => canManageMember(item.role) ? handleMemberAction(item) : undefined}
      disabled={!canManageMember(item.role)}
    >
      <Avatar
        source={item.user.profileImage}
        name={item.user.name}
        size={50}
      />
      
      <View style={styles.memberInfo}>
        <View style={styles.memberHeader}>
          <Text style={styles.memberName}>{item.user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] }]}>
            <Text style={styles.roleText}>{ROLE_LABELS[item.role]}</Text>
          </View>
        </View>
        
        <Text style={styles.memberEmail}>{item.user.email}</Text>
        
        <View style={styles.memberMeta}>
          <Text style={styles.metaText}>
            Joined {new Date(item.joinedAt).toLocaleDateString()}
          </Text>
          {item.lastActive && (
            <>
              <Text style={styles.metaText}> • </Text>
              <Text style={styles.metaText}>
                Active {new Date(item.lastActive).toLocaleDateString()}
              </Text>
            </>
          )}
        </View>
      </View>

      {canManageMember(item.role) && (
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={COLORS.GRAY_400}
        />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={COLORS.GRAY_400} />
      <Text style={styles.emptyTitle}>No Members Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search' : 'No members in this community yet'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Members" showBackButton />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={`Members (${members.length})`} 
        showBackButton 
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={COLORS.GRAY_400} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.GRAY_400}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.GRAY_400} />
          </TouchableOpacity>
        )}
      </View>

      {/* Members List */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.user._id}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
    paddingBottom: 100,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.SM,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginBottom: SPACING.SM,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.XS,
  },
  memberName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.BLACK,
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: SPACING.XS,
  },
  roleText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.WHITE,
  },
  memberEmail: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_600,
    marginBottom: SPACING.XS,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
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
  },
});

export default CommunityMembersScreen;
