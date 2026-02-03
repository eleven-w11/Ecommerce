import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ArrowLeft, Send, MessageCircle, AlertTriangle } from "lucide-react";
import "@/pages/Chat.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Format date for display
  const formatMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const dateKey = new Date(msg.timestamp).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(msg);
    });
    return grouped;
  };

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      path: "/api/socket.io",
      withCredentials: true,
    });

    // Socket event listeners
    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      if (userId) {
        socketRef.current.emit("register", { userId, role: "user" });
        socketRef.current.emit("getAdminStatus");
      }
    });

    socketRef.current.on("messageSentAck", (msgId) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg._id === msgId || msg.tempId === msgId
            ? { ...msg, _id: msgId, status: "sent" }
            : msg
        )
      );
    });

    socketRef.current.on("messageDelivered", (msgId) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg._id === msgId ? { ...msg, status: "delivered" } : msg
        )
      );
    });

    socketRef.current.on("messageSeen", (msgId) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg._id === msgId ? { ...msg, status: "seen" } : msg
        )
      );
    });

    socketRef.current.on("adminStatus", (data) => {
      setAdminOnline(data.isOnline);
    });

    socketRef.current.on("userOnline", (data) => {
      if (data.role === "admin") {
        setAdminOnline(true);
      }
    });

    socketRef.current.on("userOffline", (data) => {
      // Check if admin went offline
      socketRef.current.emit("getAdminStatus");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  // Fetch user data and verify auth
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.data._id) {
          setUserId(response.data._id);
          setUserProfile(response.data);
          setAuthError(null);

          // Register with socket
          if (socketRef.current?.connected) {
            socketRef.current.emit("register", {
              userId: response.data._id,
              role: "user",
            });
            socketRef.current.emit("getAdminStatus");
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setAuthError("Please sign in to access the chat");
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle incoming messages
  const handleReceiveMessage = useCallback(
    (data) => {
      setChat((prev) => {
        const exists = prev.some(
          (msg) =>
            msg._id === data._id ||
            (msg.timestamp === data.timestamp && msg.message === data.message)
        );
        if (exists) return prev;

        // Send delivery acknowledgment
        if (socketRef.current?.connected) {
          socketRef.current.emit("deliveredAck", data._id);
        }
        return [...prev, data];
      });
    },
    []
  );

  // Fetch chat history
  useEffect(() => {
    if (!userId) return;

    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get("token");
        const res = await axios.get(
          `${BACKEND_URL}/api/messages/chat/history/${userId}`,
          {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (res.data.success) {
          setChat(res.data.messages || []);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();

    // Listen for incoming messages
    socketRef.current?.on("receiveMessage", handleReceiveMessage);

    return () => {
      socketRef.current?.off("receiveMessage", handleReceiveMessage);
    };
  }, [userId, handleReceiveMessage]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !isLoading) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, isLoading]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!message.trim() || !socketRef.current?.connected || !userId) return;

    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const currentMessage = message.trim();

    const optimisticMsg = {
      _id: tempId,
      tempId,
      message: currentMessage,
      fromAdmin: false,
      fromUserId: userId,
      senderRole: "user",
      timestamp,
      status: "pending",
    };

    setChat((prev) => [...prev, optimisticMsg]);

    socketRef.current.emit("userMessage", {
      fromUserId: userId,
      message: currentMessage,
      timestamp,
    });

    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [message, userId]);

  // Sort and group messages
  const sortedMessages = [...chat].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const groupedMessages = groupMessagesByDate(sortedMessages);

  // Loading state
  if (isLoading && !userProfile) {
    return (
      <div className="chat-page" data-testid="chat-loading">
        <div className="chat-loader-container">
          <div className="chat-loader">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page" data-testid="user-chat-page">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header" data-testid="chat-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            data-testid="back-button"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="admin-profile">
            <div className="profile-avatar">
              <div className="avatar-placeholder">A</div>
              <span
                className={`status-indicator ${adminOnline ? "online" : "offline"}`}
                data-testid="admin-status-indicator"
              ></span>
            </div>
            <div className="profile-info">
              <h3 className="profile-name">Support</h3>
              <span
                className={`profile-status ${adminOnline ? "online" : ""}`}
                data-testid="admin-status-text"
              >
                {adminOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="chat-body" data-testid="chat-body">
          {authError ? (
            <div className="auth-error" data-testid="auth-error">
              <AlertTriangle size={48} />
              <h3>Authentication Required</h3>
              <p>{authError}</p>
              <Link to="/signin" className="signin-btn" data-testid="signin-link">
                Sign In
              </Link>
            </div>
          ) : isLoading ? (
            <div className="messages-loading">
              <div className="loading-skeleton"></div>
              <div className="loading-skeleton short"></div>
              <div className="loading-skeleton"></div>
            </div>
          ) : (
            <div className="messages-wrapper">
              {sortedMessages.length === 0 ? (
                <div className="empty-chat" data-testid="empty-chat">
                  <MessageCircle size={48} />
                  <h3>Start the conversation</h3>
                  <p>Send your first message to get support</p>
                </div>
              ) : (
                Object.keys(groupedMessages).map((dateKey) => (
                  <React.Fragment key={dateKey}>
                    <div className="date-divider">
                      <span>{formatMessageDate(groupedMessages[dateKey][0].timestamp)}</span>
                    </div>
                    {groupedMessages[dateKey].map((msg) => (
                      <div
                        key={msg._id || msg.tempId}
                        className={`message-bubble ${
                          msg.senderRole === "admin" || msg.fromAdmin
                            ? "incoming"
                            : "outgoing"
                        }`}
                        data-testid={`message-${msg._id || msg.tempId}`}
                      >
                        <p className="message-text">{msg.message}</p>
                        <div className="message-meta">
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {(msg.senderRole === "user" || !msg.fromAdmin) && msg.fromUserId === userId && (
                            <span className="message-status" data-testid={`status-${msg._id}`}>
                              {msg.status === "pending" && <span className="status-pending">...</span>}
                              {msg.status === "sent" && <span className="status-sent">✓</span>}
                              {msg.status === "delivered" && <span className="status-delivered">✓✓</span>}
                              {msg.status === "seen" && <span className="status-seen">✓✓</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))
              )}
              <div ref={messagesEndRef}></div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {!authError && (
          <div className="message-input-area" data-testid="message-input-area">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="message-input"
              data-testid="message-input"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="send-btn"
              data-testid="send-button"
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
