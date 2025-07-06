import React, { useState, useEffect } from "react";
import { FaComments, FaUser, FaSync, FaEnvelope, FaPlus, FaBars, FaTimes, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import ChatInterface from "../../components/ChatInterface";
import MobileLayout, { MobilePageHeader, MobileButton } from "../../components/Mobile/MobileLayout";

const UserMessages = () => {
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [auth] = useAuth();

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
    fetchUnreadCount();
  }, []);

  const handleStartChat = () => {
    setShowChatInterface(true);
  };

  const handleBackToMessages = () => {
    setShowChatInterface(false);
    // Refresh unread count
    fetchUnreadCount();
  };

  // If chat interface is shown, render it directly
  if (showChatInterface) {
    return (
      <MobileLayout
        title="Chat with Admin"
        subtitle="Messages"
        icon={FaComments}
        navbar={Navbar}
        headerActions={
          <MobileButton
            onClick={handleBackToMessages}
            variant="secondary"
            size="sm"
            icon={FaArrowLeft}
          >
            Back
          </MobileButton>
        }
      >
        <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] p-4 lg:p-8">
          <ChatInterface onBack={handleBackToMessages} />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Messages"
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : "Chat with admin"}
      icon={FaComments}
      navbar={Navbar}
      headerActions={
        <MobileButton
          onClick={fetchUnreadCount}
          variant="secondary"
          size="sm"
          icon={FaSync}
        >
          Refresh
        </MobileButton>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Messages"
          subtitle="Communicate with MCAN administrators"
          icon={FaComments}
          showOnMobile={false}
          actions={
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  {unreadCount} unread
                </div>
              )}
              <MobileButton
                onClick={fetchUnreadCount}
                variant="secondary"
                icon={FaSync}
              >
                Refresh
              </MobileButton>
            </div>
          }
        />

        {/* Main Chat Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-mcan-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <FaComments className="text-2xl lg:text-4xl text-white" />
              </div>

            <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-4">Chat with MCAN Admin</h2>
            <p className="text-gray-600 mb-6 lg:mb-8 text-base lg:text-lg">
              Get instant support for bookings, programs, and general inquiries through our secure chat system.
            </p>

            {/* Quick Access Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 lg:mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                <FaEnvelope className="text-xl lg:text-2xl text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800 text-xs lg:text-sm">General Support</h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
                <FaUser className="text-xl lg:text-2xl text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 text-xs lg:text-sm">Booking Help</h3>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 lg:p-4">
                <FaComments className="text-xl lg:text-2xl text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-800 text-xs lg:text-sm">Live Chat</h3>
              </div>
            </div>

            <MobileButton
              onClick={handleStartChat}
              variant="primary"
              size="lg"
              icon={FaComments}
              fullWidth
              className="mb-6"
            >
              Start Chat Now
            </MobileButton>

            <div className="text-xs lg:text-sm text-gray-500 space-y-1">
              <p>🔒 Your conversations are private and secure</p>
              <p>⚡ Get instant responses from our admin team</p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default UserMessages;
