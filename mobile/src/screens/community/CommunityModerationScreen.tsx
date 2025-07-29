import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
import type { ModerationLog } from '../../types';

interface RouteParams {
  communityId: string;
}

const ACTION_ICONS = {
  message_deleted: 'trash-outline',
  member_warned: 'warning-outline',
  member_muted: 'volume-mute-outline',
  member_kicked: 'exit-outline',
  member_banned: 'ban-outline',
  message_flagged: 'flag-outline',
  spam_detected: 'shield-outline',
};

const ACTION_COLORS = {
  message_deleted: COLORS.WARNING,
  member_warned: COLORS.WARNING,
  member_muted: COLORS.WARNING,
  member_kicked: COLORS.ERROR,
  member_banned: COLORS.ERROR,
  message_flagged: COLORS.PRIMARY,
  spam_detected: COLORS.ERROR,
};

const CommunityModerationScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { communityId } = route.params as RouteParams;
  const { user } = useAuth();
  
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'reports'>('recent');

  useEffect(() => {
    loadModerationData();
  }, [activeTab]);

  const loadModerationData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'recent') {
        const logs = await communityService.getModerationLogs(communityId);
        setModerationLogs(logs);
      } else {
        // Load pending reports
        const reports = await communityService.getPendingReports(communityId);
        setModerationLogs(reports);
      }
    } catch (error) {
      console.error('Error loading moderation data:', error);
      Alert.alert('Error', 'Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadModerationData();
    setRefreshing(false);
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss') => {
    try {
      await communityService.handleReport(reportId, action);
      Alert.alert('Success', `Report ${action}d successfully`);
      loadModerationData();
    } catch (error) {
      console.error('Error handling report:', error);
      Alert.alert('Error', `Failed to ${action} report`);
    }
  };

  const handleQuickAction = () => {
    Alert.alert(
      'Quick Actions',
      'Choose a moderation action:',
      [
        {
          text: 'Clear Chat History',
          onPress: () => handleClearChat(),
        },
        {
          text: 'Mute All Members (5 min)',
          onPress: () => handleMuteAll(),
        },
        {
          text: 'Lock Community',
          onPress: () => handleLockCommunity(),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearChat = async () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all messages in this community? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.clearChatHistory(communityId);
              Alert.alert('Success', 'Chat history cleared');
            } catch (error) {
              console.error('Error clearing chat:', error);
              Alert.alert('Error', 'Failed to clear chat history');
            }
          },
        },
      ]
    );
  };

  const handleMuteAll = async () => {
    try {
      await communityService.muteAllMembers(communityId, 5); // 5 minutes
      Alert.alert('Success', 'All members muted for 5 minutes');
    } catch (error) {
      console.error('Error muting members:', error);
      Alert.alert('Error', 'Failed to mute members');
    }
  };

  const handleLockCommunity = async () => {
    Alert.alert(
      'Lock Community',
      'This will prevent all members from sending messages. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.lockCommunity(communityId);
              Alert.alert('Success', 'Community locked');
            } catch (error) {
              console.error('Error locking community:', error);
              Alert.alert('Error', 'Failed to lock community');
            }
          },
        },
      ]
    );
  };

  const renderModerationItem = ({ item }: { item: ModerationLog }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={[
          styles.actionIcon,
          { backgroundColor: ACTION_COLORS[item.action] || COLORS.GRAY_400 }
        ]}>
          <Ionicons
            name={ACTION_ICONS[item.action] || 'alert-outline'}
            size={16}
            color={COLORS.WHITE}
          />
        </View>
        
        <View style={styles.logInfo}>
          <Text style={styles.logAction}>{item.action.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.logTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.logDetails}>
        <View style={styles.userInfo}>
          <Avatar
            source={item.moderator?.profileImage}
            name={item.moderator?.name || 'System'}
            size={30}
          />
          <Text style={styles.moderatorName}>
            {item.moderator?.name || 'System'}
          </Text>
        </View>

        {item.targetUser && (
          <View style={styles.targetInfo}>
            <Text style={styles.targetLabel}>Target:</Text>
            <Text style={styles.targetName}>{item.targetUser.name}</Text>
          </View>
        )}

        {item.reason && (
          <Text style={styles.logReason}>{item.reason}</Text>
        )}

        {activeTab === 'reports' && item.status === 'pending' && (
          <View style={styles.reportActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleReportAction(item._id, 'approve')}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.dismissButton]}
              onPress={() => handleReportAction(item._id, 'dismiss')}
            >
              <Text style={styles.actionButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={activeTab === 'recent' ? 'shield-checkmark-outline' : 'flag-outline'} 
        size={64} 
        color={COLORS.GRAY_400} 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'recent' ? 'No Recent Activity' : 'No Pending Reports'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'recent' 
          ? 'All moderation actions will appear here'
          : 'Reported content will appear here for review'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Moderation" 
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={handleQuickAction}>
            <Ionicons name="settings-outline" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        }
      />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'recent' && styles.activeTab
          ]}
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'recent' && styles.activeTabText
          ]}>
            Recent Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'reports' && styles.activeTab
          ]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'reports' && styles.activeTabText
          ]}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={moderationLogs}
          renderItem={renderModerationItem}
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
  listContainer: {
    padding: SPACING.MD,
    paddingBottom: 100,
  },
  logItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.SM,
    marginBottom: SPACING.SM,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.SM,
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.BLACK,
  },
  logTime: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    marginTop: 2,
  },
  logDetails: {
    paddingLeft: 44,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  moderatorName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_600,
    marginLeft: SPACING.XS,
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  targetLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_500,
    marginRight: SPACING.XS,
  },
  targetName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.BLACK,
  },
  logReason: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_600,
    fontStyle: 'italic',
    marginBottom: SPACING.SM,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.SM,
  },
  actionButton: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 6,
    marginLeft: SPACING.XS,
  },
  approveButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  dismissButton: {
    backgroundColor: COLORS.GRAY_400,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.WHITE,
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

export default CommunityModerationScreen;
