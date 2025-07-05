import React, { useState, useEffect, useRef } from "react";
import { 
  FaSearch, 
  FaPaperPlane, 
  FaEllipsisV, 
  FaArrowLeft, 
  FaUser,
  FaCheck,
  FaCheckDouble,
  FaPhone,
  FaVideo,
  FaSmile,
  FaPaperclip,
  FaMicrophone
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/UserContext";

const WhatsAppChat = ({ isOpen, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChatView, setShowChatView] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [auth] = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/conversation/${userId}`,
        {
          headers: {
            Authorization: auth?.token
          }
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      setIsTyping(false);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/messages/send`,
        {
          recipientId: selectedConversation.otherUser._id,
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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator
    setIsTyping(true);

    // Clear typing indicator after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowChatView(true);
    fetchMessages(conversation.otherUser._id);
  };

  const handleBackToList = () => {
    setShowChatView(false);
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatLastSeen = (userId) => {
    if (onlineUsers.has(userId)) {
      return "online";
    }
    return "last seen recently";
  };

  const getUserAvatar = (user) => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return <FaUser className="text-gray-600" />;
  };

  const getMessageStatus = (message) => {
    if (message.sender._id === auth?.user?._id) {
      return message.isRead ? (
        <FaCheckDouble className="text-blue-400 text-xs" />
      ) : (
        <FaCheck className="text-gray-400 text-xs" />
      );
    }
    return null;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex whatsapp-chat whatsapp-chat-container">
      {/* Sidebar - Conversations List */}
      <div className={`${showChatView ? 'hidden lg:flex' : 'flex'} lg:w-1/3 w-full flex-col bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="bg-[#075E54] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="lg:hidden text-white hover:text-gray-200"
              >
                <FaArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
              <h1 className="text-lg font-semibold">Messages</h1>
            </div>
            <button className="text-white hover:text-gray-200">
              <FaEllipsisV />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 bg-gray-50 border-b">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.threadId}
                onClick={() => handleConversationSelect(conversation)}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors duration-200"
              >
                <div className="relative w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
                  {getUserAvatar(conversation.otherUser)}
                  {onlineUsers.has(conversation.otherUser._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.otherUser.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 max-w-xs">
                      {conversation.lastMessage.sender._id === auth?.user?._id && (
                        <div className="flex-shrink-0">
                          {conversation.lastMessage.isRead ? (
                            <FaCheckDouble className="text-blue-500 text-xs" />
                          ) : (
                            <FaCheck className="text-gray-400 text-xs" />
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-[#25D366] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className={`${showChatView ? 'flex' : 'hidden lg:flex'} lg:w-2/3 w-full flex-col`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="lg:hidden text-white hover:text-gray-200"
                >
                  <FaArrowLeft size={20} />
                </button>
                <div className="relative w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                  {getUserAvatar(selectedConversation.otherUser)}
                  {onlineUsers.has(selectedConversation.otherUser._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedConversation.otherUser.name}</h2>
                  <p className="text-sm text-green-100">
                    {formatLastSeen(selectedConversation.otherUser._id)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-gray-200">
                  <FaPhone />
                </button>
                <button className="text-white hover:text-gray-200">
                  <FaVideo />
                </button>
                <button className="text-white hover:text-gray-200">
                  <FaEllipsisV />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#E5DDD5] bg-opacity-30">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const isCurrentUser = message.sender._id === auth?.user?._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm whatsapp-message-bubble ${
                            isCurrentUser
                              ? 'bg-[#DCF8C6] text-gray-800 rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                            {getMessageStatus(message)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white px-3 py-2 rounded-lg rounded-bl-none shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t">
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <FaSmile size={20} />
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <FaPaperclip size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent whatsapp-message-input"
                  disabled={sending}
                />
                {newMessage.trim() ? (
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-[#075E54] text-white p-2 rounded-full hover:bg-[#064e44] disabled:opacity-50"
                  >
                    <FaPaperPlane size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <FaMicrophone size={20} />
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-gray-400 text-4xl" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">MCAN Messages</h2>
              <p className="text-gray-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
