import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Users } from "lucide-react";
import "@/pages/AdminChat.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
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

  // Format time for user list
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  // Initialize socket and verify admin
  useEffect(() => {
    const initAdmin = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.data.role !== "admin") {
          setAuthError("Admin access required");
          setIsLoading(false);
          return;
        }

        setAdminProfile(response.data);

        // Initialize socket
        socketRef.current = io(BACKEND_URL, {
          path: "/api/socket.io",
          withCredentials: true,
        });

        socketRef.current.on("connect", () => {
          console.log("Admin socket connected");
          socketRef.current.emit("register", {
            userId: response.data._id,
            role: "admin",
          });
          socketRef.current.emit("getUsers");
        });

        socketRef.current.on("usersList", (data) => {
          setUsers(data);
          setIsLoading(false);
        });

        socketRef.current.on("receiveMessage", handleReceiveMessage);

        socketRef.current.on("userOnline", (data) => {
          setUsers((prev) =>
            prev.map((u) =>
              u._id === data.userId ? { ...u, isOnline: true } : u
            )
          );
        });

        socketRef.current.on("userOffline", (data) => {
          setUsers((prev) =>
            prev.map((u) =>
              u._id === data.userId ? { ...u, isOnline: false } : u
            )
          );
        });

        socketRef.current.on("messageSentAck", (msgId) => {
          setSelectedChat((prev) =>
            prev.map((msg) =>
              msg._id === msgId || msg.tempId === msgId
                ? { ...msg, _id: msgId, status: "sent" }
                : msg
            )
          );
        });

        socketRef.current.on("messageDelivered", (msgId) => {
          setSelectedChat((prev) =>
            prev.map((msg) =>
              msg._id === msgId ? { ...msg, status: "delivered" } : msg
            )
          );
        });

      } catch (error) {
        console.error("Error initializing admin:", error);
        setAuthError("Authentication required");
        setIsLoading(false);
      }
    };

    initAdmin();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle incoming messages
  const handleReceiveMessage = useCallback((message) => {
    const userId = message.senderRole === "admin" ? message.toUserId : message.fromUserId;

    if (!userId) return;

    // Update chat if this user is selected
    setSelectedChat((prev) => {
      if (userId !== selectedUserId) return prev;
      const isDuplicate = prev.some(
        (msg) =>
          msg._id === message._id ||
          (msg.message === message.message &&
            new Date(msg.timestamp).getTime() === new Date(message.timestamp).getTime())
      );
      if (isDuplicate) return prev;
      return [...prev, message];
    });

    // Update users list
    setUsers((prev) => {
      const userExists = prev.find((u) => u._id === userId);
      const name = message.user?.name || "New User";
      const image = message.user?.image || null;

      let updatedUsers;
      if (userExists) {
        updatedUsers = prev.map((u) =>
          u._id === userId
            ? {
                ...u,
                name: name || u.name,
                image: image || u.image,
                lastMessage: message.message,
                lastMessageTime: message.timestamp,
                isOnline: true,
              }
            : u
        );
      } else {
        updatedUsers = [
          {
            _id: userId,
            name,
            image,
            lastMessage: message.message,
            lastMessageTime: message.timestamp,
            isOnline: true,
          },
          ...prev,
        ];
      }

      return updatedUsers.sort(
        (a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
      );
    });
  }, [selectedUserId]);

  // Fetch user chat
  const fetchUserChat = async (userId) => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      const res = await axios.get(`${BACKEND_URL}/api/admin/chat/${userId}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data.success) {
        setSelectedChat(res.data.messages || []);
        setSelectedUserId(userId);
        setShowMobileChat(true);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send admin message
  const sendMessage = () => {
    if (!adminMessage.trim() || !selectedUserId || !socketRef.current?.connected) return;

    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newMessage = {
      _id: tempId,
      tempId,
      message: adminMessage,
      senderRole: "admin",
      fromAdmin: true,
      timestamp,
      toUserId: selectedUserId,
      status: "pending",
    };

    setSelectedChat((prev) => [...prev, newMessage]);

    // Update user list
    setUsers((prev) =>
      prev.map((u) =>
        u._id === selectedUserId
          ? { ...u, lastMessage: adminMessage, lastMessageTime: timestamp }
          : u
      )
    );

    socketRef.current.emit("adminMessage", {
      toUserId: selectedUserId,
      message: adminMessage,
      timestamp,
    });

    setAdminMessage("");
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  // Sort messages
  const sortedMessages = [...selectedChat].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const groupedMessages = groupMessagesByDate(sortedMessages);

  // Get selected user info
  const selectedUser = users.find((u) => u._id === selectedUserId);

  // Auth error state
  if (authError) {
    return (
      <div className="admin-chat-page" data-testid="admin-auth-error">
        <div className="auth-error-container">
          <h2>Access Denied</h2>
          <p>{authError}</p>
          <button onClick={() => navigate("/signin")} className="signin-btn">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && users.length === 0) {
    return (
      <div className="admin-chat-page" data-testid="admin-loading">
        <div className="admin-loader">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-page" data-testid="admin-chat-page">
      {/* Sidebar - Users List */}
      <div className={`users-sidebar ${showMobileChat ? "hidden-mobile" : ""}`} data-testid="users-sidebar">
        <div className="sidebar-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            data-testid="admin-back-button"
          >
            <ArrowLeft size={20} />
          </button>
          <h2>Customer Chats</h2>
          <Users size={20} className="header-icon" />
        </div>

        <div className="users-list" data-testid="users-list">
          {users.length === 0 ? (
            <div className="no-users">
              <MessageCircle size={40} />
              <p>No conversations yet</p>
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user._id}
                className={`user-card ${selectedUserId === user._id ? "active" : ""}`}
                onClick={() => fetchUserChat(user._id)}
                data-testid={`user-card-${user._id}`}
              >
                <div className="user-avatar">
                  {user.image ? (
                    <img src={user.image} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span
                    className={`status-dot ${user.isOnline ? "online" : "offline"}`}
                    data-testid={`user-status-${user._id}`}
                  ></span>
                </div>
                <div className="user-info">
                  <div className="user-header">
                    <span className="user-number">#{users.length - index}</span>
                    <h4 className="user-name">{user.name || "Unknown User"}</h4>
                  </div>
                  <p className="last-message">{user.lastMessage || "No messages"}</p>
                  <span className="message-time">
                    {formatLastMessageTime(user.lastMessageTime)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`chat-area ${showMobileChat ? "visible-mobile" : ""}`} data-testid="chat-area">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="chat-header" data-testid="admin-chat-header">
              <button
                className="back-btn mobile-only"
                onClick={() => setShowMobileChat(false)}
                data-testid="chat-back-button"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="chat-user-info">
                <div className="user-avatar">
                  {selectedUser?.image ? (
                    <img src={selectedUser.image} alt={selectedUser?.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedUser?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span
                    className={`status-dot ${selectedUser?.isOnline ? "online" : "offline"}`}
                  ></span>
                </div>
                <div className="user-details">
                  <h3>{selectedUser?.name || "Unknown"}</h3>
                  <span className={`user-status ${selectedUser?.isOnline ? "online" : ""}`}>
                    {selectedUser?.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container" data-testid="messages-container">
              {sortedMessages.length === 0 ? (
                <div className="empty-chat">
                  <MessageCircle size={48} />
                  <h3>No messages yet</h3>
                  <p>Start a conversation with {selectedUser?.name}</p>
                </div>
              ) : (
                <div className="messages-wrapper">
                  {Object.keys(groupedMessages).map((dateKey) => (
                    <React.Fragment key={dateKey}>
                      <div className="date-divider">
                        <span>{formatMessageDate(groupedMessages[dateKey][0].timestamp)}</span>
                      </div>
                      {groupedMessages[dateKey].map((msg) => (
                        <div
                          key={msg._id || msg.tempId}
                          className={`message-bubble ${
                            msg.senderRole === "admin" ? "outgoing" : "incoming"
                          }`}
                          data-testid={`admin-message-${msg._id || msg.tempId}`}
                        >
                          <p className="message-text">{msg.message}</p>
                          <div className="message-meta">
                            <span className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {msg.senderRole === "admin" && (
                              <span className="message-status">
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
                  ))}
                  <div ref={messagesEndRef}></div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="message-input-area" data-testid="admin-message-input-area">
              <input
                type="text"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message ${selectedUser?.name || "user"}...`}
                className="message-input"
                data-testid="admin-message-input"
              />
              <button
                onClick={sendMessage}
                disabled={!adminMessage.trim()}
                className="send-btn"
                data-testid="admin-send-button"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected" data-testid="no-chat-selected">
            <MessageCircle size={64} />
            <h2>Welcome to Admin Chat</h2>
            <p>Select a customer from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
