import React, { useState, useEffect } from "react";
import { FaComments, FaUser, FaSync, FaEnvelope, FaPlus, FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import MessagingSystem from "../../components/MessagingSystem";

const UserMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auth] = useAuth();

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/conversations`,
        {
          headers: {
            Authorization: auth?.token
          }
        }
      );

      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin users
  const fetchAdmins = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/admin/users?role=admin`,
        {
          headers: {
            Authorization: auth?.token
          }
        }
      );

      if (response.data.success) {
        setAdmins(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/unread-count`,
        {
          headers: {
            Authorization: auth?.token
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
    fetchConversations();
    fetchAdmins();
    fetchUnreadCount();
  }, []);

  const handleStartConversation = (admin) => {
    setSelectedAdmin(admin);
    setShowMessaging(true);
  };

  const handleCloseMessaging = () => {
    setShowMessaging(false);
    setSelectedAdmin(null);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-mcan-primary">Messages</h2>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              {unreadCount}
            </div>
          )}
        </div>
        <button
          onClick={toggleMobileMenu}
          className="text-mcan-primary hover:text-mcan-secondary transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Navbar onItemClick={closeMobileMenu} />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block ml-[4rem]">
          <Navbar />
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={closeMobileMenu}
          ></div>
        )}

        <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Messages</h1>
                <p className="text-gray-600 mt-2">Communicate with MCAN administrators</p>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    {unreadCount} unread
                  </div>
                )}
                <button
                  onClick={() => {
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Conversations</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaComments className="mx-auto text-4xl mb-2" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start a conversation with an admin</p>
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
                          <p className="text-sm text-gray-500">Admin</p>
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

            {/* Contact Admin */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Admin</h2>
              
              {/* Quick Contact Options */}
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Contact our administrators for assistance with bookings, programs, or general inquiries.
                  </p>
                  {admins.length > 0 && (
                    <button
                      onClick={() => handleStartConversation(admins[0])}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90"
                    >
                      <FaPlus />
                      Start New Conversation
                    </button>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Booking Support</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Questions about your accommodation or program bookings? Get direct support from our team.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Accommodations</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Programs</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Events</span>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">General Inquiries</h3>
                  <p className="text-sm text-purple-700">
                    Have questions about MCAN services, membership, or community programs? We're here to help.
                  </p>
                </div>
              </div>

              {/* Available Admins */}
              {admins.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Available Administrators</h3>
                  <div className="space-y-2">
                    {admins.slice(0, 3).map((admin) => (
                      <div
                        key={admin._id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-mcan-primary rounded-full flex items-center justify-center mr-2">
                            <FaUser className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{admin.name}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartConversation(admin)}
                          className="px-2 py-1 bg-mcan-primary text-white text-xs rounded hover:opacity-90"
                        >
                          Message
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      <MessagingSystem
        isOpen={showMessaging}
        onClose={handleCloseMessaging}
        recipientId={selectedAdmin?._id}
        recipientName={selectedAdmin?.name}
      />
    </div>
  );
};

export default UserMessages;
