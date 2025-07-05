import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaUser, FaPhone, FaVideo, FaEllipsisV, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/UserContext";

const ChatInterface = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [auth] = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchAdminAndMessages();

    // Set up polling for new messages every 5 seconds
    const interval = setInterval(() => {
      if (adminUser) {
        fetchMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [adminUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAdminAndMessages = async () => {
    try {
      setLoading(true);

      // First, get admin users
      const adminResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/admins`,
        {
          headers: {
            Authorization: auth?.token
          }
        }
      );

      if (adminResponse.data.success && adminResponse.data.users.length > 0) {
        const admin = adminResponse.data.users[0]; // Get first admin
        setAdminUser(admin);

        // Then fetch conversation with this admin
        await fetchMessages(admin._id);
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (adminId = null) => {
    try {
      const targetAdminId = adminId || adminUser?._id;
      if (!targetAdminId) return;

      const messagesResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/conversation/${targetAdminId}`,
        {
          headers: {
            Authorization: auth?.token
          }
        }
      );

      if (messagesResponse.data.success) {
        setMessages(messagesResponse.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminUser) return;

    try {
      setSending(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/messages/send`,
        {
          recipientId: adminUser._id,
          content: newMessage.trim()
        },
        {
          headers: {
            Authorization: auth?.token
          }
        }
      );

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
        <span className="ml-3 text-gray-600">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden text-mcan-primary hover:text-mcan-secondary"
          >
            <FaArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 bg-mcan-primary rounded-full flex items-center justify-center">
            <FaUser className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {adminUser?.name || 'MCAN Admin'}
            </h3>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-mcan-primary">
            <FaPhone size={18} />
          </button>
          <button className="text-gray-500 hover:text-mcan-primary">
            <FaVideo size={18} />
          </button>
          <button className="text-gray-500 hover:text-mcan-primary">
            <FaEllipsisV size={18} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <FaUser className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-center text-sm">
              Send a message to get help with bookings, programs, or general inquiries
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.sender._id === auth?.user?._id;
            const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);
            
            return (
              <div key={message._id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                      {formatDateSeparator(message.createdAt)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                      isCurrentUser
                        ? 'bg-mcan-primary text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-end mt-1">
                      <p
                        className={`text-xs ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                      {isCurrentUser && (
                        <div className="ml-1">
                          <svg width="12" height="8" viewBox="0 0 12 8" className="fill-current text-blue-100">
                            <path d="M4.5 6L1.5 3L0 4.5L4.5 9L12 1.5L10.5 0L4.5 6Z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-mcan-primary focus:bg-white transition-colors"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              newMessage.trim() && !sending
                ? 'bg-mcan-primary text-white hover:bg-mcan-secondary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane className={`${sending ? 'animate-pulse' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
