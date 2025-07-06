import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes, FaUser, FaComments, FaImage } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/UserContext";
import { useSocket } from "../context/SocketContext";
import TypingIndicator from "./TypingIndicator";
import ImageUploadModal from "./ImageUploadModal";

const MessagingSystem = ({ isOpen, onClose, recipientId, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [auth] = useAuth();
  const { joinThread, leaveThread, onNewMessage, onUserTyping, onUserStoppedTyping, startTyping, stopTyping, isConnected } = useSocket();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = () => {
    if (threadId && isConnected) {
      startTyping(threadId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(threadId);
      }, 3000);
    }
  };

  const handleStopTyping = () => {
    if (threadId && isConnected) {
      stopTyping(threadId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  useEffect(() => {
    if (isOpen && recipientId) {
      fetchConversation();
      // Generate thread ID
      const currentUserId = auth?.user?._id;
      const generatedThreadId = [currentUserId, recipientId].sort().join('_');
      setThreadId(generatedThreadId);
    }
  }, [isOpen, recipientId]);

  // Socket.IO real-time message handling
  useEffect(() => {
    if (threadId && isConnected && isOpen) {
      // Join the thread for real-time updates
      joinThread(threadId);

      // Listen for new messages
      const unsubscribeNewMessage = onNewMessage((data) => {
        if (data.threadId === threadId) {
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => msg._id === data.message._id);
            if (messageExists) {
              return prev;
            }
            return [...prev, data.message];
          });
        }
      });

      // Listen for typing indicators
      const unsubscribeTyping = onUserTyping((data) => {
        if (data.threadId === threadId && data.userId !== auth?.user?._id) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
        }
      });

      const unsubscribeStoppedTyping = onUserStoppedTyping((data) => {
        if (data.threadId === threadId) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      });

      // Cleanup when component unmounts or threadId changes
      return () => {
        if (unsubscribeNewMessage) unsubscribeNewMessage();
        if (unsubscribeTyping) unsubscribeTyping();
        if (unsubscribeStoppedTyping) unsubscribeStoppedTyping();
        leaveThread(threadId);
      };
    }
  }, [threadId, isConnected, isOpen, joinThread, leaveThread, onNewMessage, onUserTyping, onUserStoppedTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/conversation/${recipientId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    handleStopTyping(); // Stop typing when sending message

    try {
      setSending(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/messages/send`,
        {
          recipientId,
          content: newMessage.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      if (response.data.success) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg._id === response.data.data._id);
          if (messageExists) {
            return prev;
          }
          return [...prev, response.data.data];
        });
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const sendImageMessage = async (imageFile, caption) => {
    if (!recipientId) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append('recipientId', recipientId);
      formData.append('messageType', 'image');
      formData.append('image', imageFile);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/messages/send`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg._id === response.data.data._id);
          if (messageExists) {
            return prev;
          }
          return [...prev, response.data.data];
        });
        toast.success("Image sent successfully");
      }
    } catch (error) {
      console.error("Error sending image:", error);
      toast.error("Failed to send image");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-full max-h-[600px] lg:h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-mcan-primary rounded-full flex items-center justify-center mr-3">
              <FaUser className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 truncate">{recipientName}</h3>
              <p className="text-sm text-gray-500">
                {auth?.user?.role === 'admin' ? 'User' : 'Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl flex-shrink-0 ml-2"
          >
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcan-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaComments className="text-4xl mb-2" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender._id === auth?.user?._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-mcan-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.messageType === 'image' && message.attachments?.[0] ? (
                      <div className="space-y-2">
                        <img
                          src={message.attachments[0].url}
                          alt="Shared image"
                          className="max-w-full h-auto rounded-lg cursor-pointer"
                          onClick={() => window.open(message.attachments[0].url, '_blank')}
                        />
                        {message.content && message.content !== 'Image' && (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          <TypingIndicator
            userName={recipientName}
            isVisible={typingUsers.size > 0}
          />

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg flex items-center transition-colors"
              disabled={sending}
            >
              <FaImage className="text-sm lg:text-base" />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 lg:px-4 py-2 text-sm lg:text-base focus:ring-2 focus:ring-mcan-primary focus:border-transparent"
              disabled={sending}
            />

            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-mcan-primary text-white px-3 lg:px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center flex-shrink-0"
            >
              <FaPaperPlane className="text-sm lg:text-base" />
            </button>
          </div>
        </form>

        {/* Image Upload Modal */}
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSend={sendImageMessage}
          sending={sending}
        />
      </div>
    </div>
  );
};

export default MessagingSystem;
