import React, { useState, useEffect } from "react";
import { FaComments, FaUser, FaSync, FaEnvelope, FaPlus, FaBars, FaTimes, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import Navbar from "./Navbar";
import ChatInterface from "../../components/ChatInterface";

const UserMessages = () => {
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // If chat interface is shown, render it directly
  if (showChatInterface) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header for Chat */}
        <div className="lg:hidden bg-white shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToMessages}
              className="text-mcan-primary hover:text-mcan-secondary"
            >
              <FaArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-mcan-primary">Chat with Admin</h2>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="text-mcan-primary hover:text-mcan-secondary transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div className="flex h-screen">
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

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col pt-16 lg:pt-0">
            <ChatInterface onBack={handleBackToMessages} />
          </div>
        </div>
      </div>
    );
  }

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
                  onClick={fetchUnreadCount}
                  className="flex items-center gap-2 px-4 py-2 bg-mcan-primary text-white rounded-lg hover:opacity-90"
                >
                  <FaSync />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Main Chat Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-mcan-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <FaComments className="text-4xl text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-4">Chat with MCAN Admin</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Get instant support for bookings, programs, and general inquiries through our secure chat system.
              </p>

              {/* Quick Access Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <FaEnvelope className="text-2xl text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-800 text-sm">General Support</h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <FaUser className="text-2xl text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800 text-sm">Booking Help</h3>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <FaComments className="text-2xl text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-800 text-sm">Live Chat</h3>
                </div>
              </div>

              <button
                onClick={handleStartChat}
                className="bg-mcan-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-mcan-secondary transition-colors shadow-lg"
              >
                <FaComments className="inline mr-3" />
                Start Chat Now
              </button>

              <div className="mt-6 text-sm text-gray-500">
                <p>🔒 Your conversations are private and secure</p>
                <p>⚡ Get instant responses from our admin team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserMessages;
