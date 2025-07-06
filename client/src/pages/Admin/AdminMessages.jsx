import React, { useState, useEffect } from "react";
import { FaComments, FaUser, FaSearch, FaSync, FaEnvelope, FaEnvelopeOpen, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import AdminChatInterface from "../../components/AdminChatInterface";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";
import { useMobileResponsive } from "../../hooks/useMobileResponsive";

const AdminMessages = () => {
  const { isMobile } = useMobileResponsive();
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [auth] = useAuth();

  // Fetch users for messaging
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/admin/users?search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchConversations();
    fetchUnreadCount();
  }, [searchTerm]);

  const handleStartConversation = (user) => {
    setSelectedUser(user);
    setShowChatInterface(true);
  };

  const handleBackToMessages = () => {
    setShowChatInterface(false);
    setSelectedUser(null);
    // Refresh conversations and unread count
    fetchConversations();
    fetchUnreadCount();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If chat interface is shown, render it directly
  if (showChatInterface && selectedUser) {
    return (
      <MobileLayout
        title={`Chat with ${selectedUser.name}`}
        subtitle="Admin messaging"
        icon={FaComments}
        navbar={Navbar}
        headerActions={
          <MobileButton
            onClick={handleBackToMessages}
            variant="secondary"
            size="sm"
            icon={FaArrowLeft}
          >
            {isMobile ? 'Back' : 'Back to Messages'}
          </MobileButton>
        }
      >
        <div className="h-[calc(100vh-120px)]">
          <AdminChatInterface
            onBack={handleBackToMessages}
            recipientId={selectedUser._id}
            recipientName={selectedUser.name}
          />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Messages"
      subtitle={`Admin messaging ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      icon={FaComments}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          icon={FaSync}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Admin Messages</h1>
                <p className="text-gray-600 mt-2">Communicate with MCAN users</p>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    {unreadCount} unread
                  </div>
                )}

                <button
                  onClick={() => {
                    fetchUsers();
                    fetchConversations();
                    fetchUnreadCount();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:opacity-90"
                >
                  <FaSync />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Conversations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Conversations</h2>
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaComments className="mx-auto text-4xl mb-2" />
                  <p>No active conversations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.threadId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStartConversation(conversation.otherUser)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-mcan-primary rounded-full flex items-center justify-center mr-3">
                          <FaUser className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {conversation.otherUser.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaUser className="mx-auto text-4xl mb-2" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <FaUser className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {user.unreadCount}
                          </div>
                        )}
                        <button
                          onClick={() => handleStartConversation(user)}
                          className="px-3 py-1 bg-mcan-primary text-white text-sm rounded hover:opacity-90"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </MobileLayout>
  );
};

export default AdminMessages;
