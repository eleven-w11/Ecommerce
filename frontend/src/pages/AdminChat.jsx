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
  const selectedUserIdRef = useRef(selectedUserId);
  const navigate = useNavigate();

  // Keep ref in sync
  useEffect(() => { selectedUserIdRef.current = selectedUserId; }, [selectedUserId]);

  const formatDate = (ts) => new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const formatLastTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff === 1) return "Yesterday";
    if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Handle incoming messages
  const handleReceiveMessage = useCallback((msg) => {
    const uid = msg.senderRole === "admin" ? msg.toUserId : msg.fromUserId;
    if (!uid) return;

    if (uid === selectedUserIdRef.current) {
      setSelectedChat((prev) => {
        const dup = prev.some((m) => m._id === msg._id || (m.message === msg.message && new Date(m.timestamp).getTime() === new Date(msg.timestamp).getTime()));
        return dup ? prev : [...prev, msg];
      });
    }

    setUsers((prev) => {
      const exists = prev.find((u) => u._id === uid);
      const name = msg.user ? msg.user.name : "New User";
      const image = msg.user ? msg.user.image : null;
      let updated;
      if (exists) {
        updated = prev.map((u) => u._id === uid ? { ...u, name: name || u.name, image: image || u.image, lastMessage: msg.message, lastMessageTime: msg.timestamp, isOnline: true } : u);
      } else {
        updated = [{ _id: uid, name, image, lastMessage: msg.message, lastMessageTime: msg.timestamp, isOnline: true }, ...prev];
      }
      return updated.sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
    });
  }, []);

  // Initialize socket
  useEffect(() => {
    const init = async () => {
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

        socketRef.current = io(BACKEND_URL, { path: "/api/socket.io", withCredentials: true });
        socketRef.current.on("connect", () => {
          socketRef.current.emit("register", { userId: response.data._id, role: "admin" });
          socketRef.current.emit("getUsers");
        });
        socketRef.current.on("usersList", (data) => { setUsers(data); setIsLoading(false); });
        socketRef.current.on("receiveMessage", handleReceiveMessage);
        socketRef.current.on("userOnline", (data) => setUsers((prev) => prev.map((u) => u._id === data.userId ? { ...u, isOnline: true } : u)));
        socketRef.current.on("userOffline", (data) => setUsers((prev) => prev.map((u) => u._id === data.userId ? { ...u, isOnline: false } : u)));
        socketRef.current.on("messageSentAck", (msgId) => setSelectedChat((prev) => prev.map((m) => m._id === msgId || m.tempId === msgId ? { ...m, _id: msgId, status: "sent" } : m)));
        socketRef.current.on("messageDelivered", (msgId) => setSelectedChat((prev) => prev.map((m) => m._id === msgId ? { ...m, status: "delivered" } : m)));
      } catch (error) {
        setAuthError("Authentication required");
        setIsLoading(false);
      }
    };
    init();
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [handleReceiveMessage]);

  // Fetch user chat
  const fetchUserChat = async (uid) => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      const res = await axios.get(`${BACKEND_URL}/api/admin/chat/${uid}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data.success) {
        setSelectedChat(res.data.messages || []);
        setSelectedUserId(uid);
        setShowMobileChat(true);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!adminMessage.trim() || !selectedUserId || !socketRef.current || !socketRef.current.connected) return;
    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const msg = { _id: tempId, tempId, message: adminMessage, senderRole: "admin", fromAdmin: true, timestamp, toUserId: selectedUserId, status: "pending" };
    setSelectedChat((prev) => [...prev, msg]);
    setUsers((prev) => prev.map((u) => u._id === selectedUserId ? { ...u, lastMessage: adminMessage, lastMessageTime: timestamp } : u));
    socketRef.current.emit("adminMessage", { toUserId: selectedUserId, message: adminMessage, timestamp });
    setAdminMessage("");
  };

  // Auto scroll
  useEffect(() => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [selectedChat]);

  const sortedMsgs = [...selectedChat].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const selectedUser = users.find((u) => u._id === selectedUserId);

  if (authError) {
    return (
      <div className="admin-chat-page" data-testid="admin-auth-error">
        <div className="auth-error-container">
          <h2>Access Denied</h2>
          <p>{authError}</p>
          <button onClick={() => navigate("/signin")} className="signin-btn">Sign In</button>
        </div>
      </div>
    );
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="admin-chat-page" data-testid="admin-loading">
        <div className="admin-loader"><div className="loader-dot"></div><div className="loader-dot"></div><div className="loader-dot"></div></div>
      </div>
    );
  }

  let lastDate = "";

  return (
    <div className="admin-chat-page" data-testid="admin-chat-page">
      <div className={`users-sidebar ${showMobileChat ? "hidden-mobile" : ""}`} data-testid="users-sidebar">
        <div className="sidebar-header">
          <button className="back-btn" onClick={() => navigate(-1)} data-testid="admin-back-button"><ArrowLeft size={20} /></button>
          <h2>Customer Chats</h2>
          <Users size={20} className="header-icon" />
        </div>
        <div className="users-list" data-testid="users-list">
          {users.length === 0 ? (
            <div className="no-users"><MessageCircle size={40} /><p>No conversations yet</p></div>
          ) : (
            users.map((user, idx) => (
              <div key={user._id} className={`user-card ${selectedUserId === user._id ? "active" : ""}`} onClick={() => fetchUserChat(user._id)} data-testid={`user-card-${user._id}`}>
                <div className="user-avatar">
                  {user.image ? <img src={user.image} alt={user.name} /> : <div className="avatar-placeholder">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>}
                  <span className={`status-dot ${user.isOnline ? "online" : "offline"}`} data-testid={`user-status-${user._id}`}></span>
                </div>
                <div className="user-info">
                  <div className="user-header"><span className="user-number">#{users.length - idx}</span><h4 className="user-name">{user.name || "Unknown"}</h4></div>
                  <p className="last-message">{user.lastMessage || "No messages"}</p>
                  <span className="message-time">{formatLastTime(user.lastMessageTime)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`chat-area ${showMobileChat ? "visible-mobile" : ""}`} data-testid="chat-area">
        {selectedUserId ? (
          <>
            <div className="chat-header" data-testid="admin-chat-header">
              <button className="back-btn mobile-only" onClick={() => setShowMobileChat(false)} data-testid="chat-back-button"><ArrowLeft size={20} /></button>
              <div className="chat-user-info">
                <div className="user-avatar">
                  {selectedUser && selectedUser.image ? <img src={selectedUser.image} alt={selectedUser.name} /> : <div className="avatar-placeholder">{selectedUser && selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}</div>}
                  <span className={`status-dot ${selectedUser && selectedUser.isOnline ? "online" : "offline"}`}></span>
                </div>
                <div className="user-details">
                  <h3>{selectedUser ? selectedUser.name : "Unknown"}</h3>
                  <span className={`user-status ${selectedUser && selectedUser.isOnline ? "online" : ""}`}>{selectedUser && selectedUser.isOnline ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>
            <div className="messages-container" data-testid="messages-container">
              {sortedMsgs.length === 0 ? (
                <div className="empty-chat"><MessageCircle size={48} /><h3>No messages yet</h3><p>Start a conversation with {selectedUser ? selectedUser.name : "user"}</p></div>
              ) : (
                <div className="messages-wrapper">
                  {sortedMsgs.map((msg) => {
                    const msgDate = formatDate(msg.timestamp);
                    const showDate = msgDate !== lastDate;
                    lastDate = msgDate;
                    return (
                      <React.Fragment key={msg._id || msg.tempId}>
                        {showDate && <div className="date-divider"><span>{msgDate}</span></div>}
                        <div className={`message-bubble ${msg.senderRole === "admin" ? "outgoing" : "incoming"}`} data-testid={`admin-message-${msg._id || msg.tempId}`}>
                          <p className="message-text">{msg.message}</p>
                          <div className="message-meta">
                            <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
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
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef}></div>
                </div>
              )}
            </div>
            <div className="message-input-area" data-testid="admin-message-input-area">
              <input type="text" value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder={`Message ${selectedUser ? selectedUser.name : "user"}...`} className="message-input" data-testid="admin-message-input" />
              <button onClick={sendMessage} disabled={!adminMessage.trim()} className="send-btn" data-testid="admin-send-button"><Send size={20} /></button>
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
