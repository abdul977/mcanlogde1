import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaComments, FaTimes } from "react-icons/fa";
import WhatsAppChat from "./WhatsAppChat";
import { useAuth } from "../context/UserContext";
import axios from "axios";

const WhatsAppFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [auth] = useAuth();

  useEffect(() => {
    if (auth?.token) {
      fetchUnreadCount();
      // Set up interval to check for new messages
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [auth?.token]);

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
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset unread count when opening chat
      setUnreadCount(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    fetchUnreadCount(); // Refresh unread count when closing
  };

  // Don't show if user is not authenticated
  if (!auth?.token) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleToggle}
          className="relative bg-[#25D366] hover:bg-[#20b858] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          {isOpen ? (
            <FaTimes size={24} />
          ) : (
            <>
              <FaWhatsapp size={28} />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </>
          )}
        </button>
      </div>

      {/* WhatsApp Chat Interface */}
      <WhatsAppChat isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default WhatsAppFloatingButton;
