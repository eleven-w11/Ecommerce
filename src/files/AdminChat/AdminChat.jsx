import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/AdminChat.css";
import UserList from "./UserList";
import { Link } from "react-router-dom";

const AdminChat = () => {
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [selectedChat, setSelectedChat] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const socketRef = useRef(null);
    const isMounted = useRef(true);
    const messagesEndRef = useRef(null);
    const [showMobileView, setShowMobileView] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [adminMessage, setAdminMessage] = useState("");
    const selectedUserIdRef = useRef(selectedUserId);

    // Keep ref in sync with state
    useEffect(() => {
        selectedUserIdRef.current = selectedUserId;
    }, [selectedUserId]);

    // Function to format date for display
    const formatMessageDate = (timestamp) => {
        const messageDate = new Date(timestamp);
        return messageDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Function to group messages by date
    const groupMessagesByDate = (messages) => {
        const grouped = {};
        messages.forEach(message => {
            const dateKey = new Date(message.timestamp).toDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(message);
        });
        return grouped;
    };

    // ✅ Handle incoming messages
    const handleReceiveMessage = useCallback(async (message) => {
        if (!isMounted.current) return;

        const userId = message.senderRole === "admin" ? message.toUserId : message.fromUserId;
        if (!userId) return;

        // Update chat if this user is selected
        if (userId === selectedUserIdRef.current) {
            setSelectedChat((prev) => {
                const isDuplicate = prev.some(
                    (msg) =>
                        msg._id === message._id ||
                        (msg.message === message.message &&
                            new Date(msg.timestamp).getTime() === new Date(message.timestamp).getTime())
                );
                return isDuplicate ? prev : [...prev, message];
            });
        }

        // Update users list
        setUsers((prev) => {
            const userExists = prev.find((u) => u._id === userId);
            const name = message.user?.name || "New User";
            const image = message.user?.image || "";

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
                            unreadCount: u._id !== selectedUserIdRef.current ? (u.unreadCount || 0) + 1 : 0,
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
                        unreadCount: 1,
                        isOnline: true,
                    },
                    ...prev,
                ];
            }

            return updatedUsers.sort(
                (a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
            );
        });
    }, []);

    useEffect(() => {
        isMounted.current = true;
        setIsLoading(true);

        const backendURL = process.env.REACT_APP_API_BASE_URL;
        socketRef.current = io(backendURL, { withCredentials: true });

        const adminId = "681edcb10cadbac1be3540aa";
        socketRef.current.emit("register", { userId: adminId, role: "admin" });

        socketRef.current.emit("getUsers");
        socketRef.current.on("usersList", (data) => {
            if (isMounted.current) {
                setUsers(data);
                setIsLoading(false);
            }
        });

        socketRef.current.on("receiveMessage", handleReceiveMessage);

        // ✅ NEW: Listen for user online/offline status
        socketRef.current.on("userOnline", (data) => {
            if (isMounted.current && data.role === "user") {
                setUsers((prev) =>
                    prev.map((u) =>
                        u._id === data.userId ? { ...u, isOnline: true } : u
                    )
                );
            }
        });

        socketRef.current.on("userOffline", (data) => {
            if (isMounted.current && data.role === "user") {
                setUsers((prev) =>
                    prev.map((u) =>
                        u._id === data.userId ? { ...u, isOnline: false } : u
                    )
                );
            }
        });

        // ✅ Message acknowledgments
        socketRef.current.on("messageSentAck", (msgId) => {
            setSelectedChat((prev) =>
                prev.map((msg) =>
                    msg._id === msgId || msg._id === parseInt(msgId)
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

        return () => {
            isMounted.current = false;
            socketRef.current?.off("receiveMessage", handleReceiveMessage);
            socketRef.current?.off("userOnline");
            socketRef.current?.off("userOffline");
            socketRef.current?.disconnect();
        };
    }, [handleReceiveMessage]);

    const fetchUserChat = async (userId) => {
        if (!isMounted.current) return;

        try {
            setIsLoading(true);
            const res = await axios.get(`${API_BASE}/api/admin/chat/${userId}`, {
                withCredentials: true,
            });

            if (isMounted.current) {
                setSelectedChat(res.data.messages || []);
                setSelectedUserId(userId);
                setShowMobileView(true);
                setIsLoading(false);
                
                // Reset unread count for this user
                setUsers((prev) =>
                    prev.map((u) =>
                        u._id === userId ? { ...u, unreadCount: 0 } : u
                    )
                );
            }
        } catch (err) {
            console.error("Error fetching chat:", err);
            if (isMounted.current) {
                setError("Failed to load chat.");
                setIsLoading(false);
            }
        }
    };

    const handleAdminReply = () => {
        if (!adminMessage.trim() || !selectedUserId || !isMounted.current) return;

        const tempId = Date.now();
        const timestamp = new Date().toISOString();

        const newMessage = {
            _id: tempId,
            message: adminMessage,
            senderRole: "admin",
            timestamp,
            toUserId: selectedUserId,
            status: "pending",
        };

        setSelectedChat((prev) => [...prev, newMessage]);
        
        // Update last message in user list
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
        });
        
        setAdminMessage("");
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat]);

    const handleBackToUsers = () => setShowMobileView(false);

    // Sort and group messages
    const sortedMessages = [...selectedChat].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const groupedMessages = groupMessagesByDate(sortedMessages);

    // Get selected user info
    const selectedUser = users.find((u) => u._id === selectedUserId);

    // Show loader for AdminChat while initial loading
    if (isLoading && users.length === 0) {
        return (
            <div className="chat-loader-container">
                <div className="loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-chat-app">
            <div className={`admin-sidebar ${showMobileView ? "hidden-mobile" : ""}`}>
                <div className="sidebar-header">
                    <div className="back-arrow">
                        <Link to="/">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                    </div>
                    <h2 className="sidebar-title">Customer Chats</h2>
                </div>
                {error && <div className="error-message slide-in">{error}</div>}

                <UserList
                    users={users}
                    selectedUserId={selectedUserId}
                    fetchUserChat={fetchUserChat}
                    isLoading={isLoading}
                />
            </div>

            <div className={`admin-chat-area ${showMobileView ? "visible-mobile" : ""}`}>
                {selectedUserId ? (
                    <>
                        <div className="chat-header">
                            <span className="back-arrow" onClick={handleBackToUsers}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </span>
                            <div className="chat-partner-info">
                                <div className="partner-avatar-container">
                                    <img
                                        src={
                                            selectedUser?.image ||
                                            `https://ui-avatars.com/api/?name=${selectedUser?.name}&background=random`
                                        }
                                        alt="User"
                                        className="chat-avatar"
                                    />
                                    {/* ✅ NEW: Online indicator */}
                                    <span className={`status-indicator ${selectedUser?.isOnline ? 'online' : 'offline'}`}></span>
                                </div>
                                <div>
                                    <h2 className="partner-name">{selectedUser?.name}</h2>
                                    {/* ✅ NEW: Dynamic status text */}
                                    <p className={`partner-status ${selectedUser?.isOnline ? 'online' : 'offline'}`}>
                                        {selectedUser?.isOnline ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="messages-container">
                            {sortedMessages.length === 0 ? (
                                <div className="empty-chat">
                                    <div className="empty-icon">💬</div>
                                    <h3>No messages found</h3>
                                    <p>Try refreshing or wait for new messages from {selectedUser?.name || "user"}.</p>
                                </div>
                            ) : (
                                Object.keys(groupedMessages).map(dateKey => (
                                    <div key={dateKey}>
                                        <div className="date-separator">
                                            <div className="date">
                                                {formatMessageDate(groupedMessages[dateKey][0].timestamp)}
                                            </div>
                                        </div>
                                        {groupedMessages[dateKey].map((msg, idx) => (
                                            <div
                                                key={msg._id || idx}
                                                className={`message-bubble ${msg.senderRole === "admin" ? "outgoing" : "incoming"} fade-in`}
                                            >
                                                <div className="message-content">
                                                    <p className="message-text">{msg.message}</p>
                                                    <div className="message-meta">
                                                        <span className="message-time">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {/* ✅ Message status for admin's messages */}
                                                        {msg.senderRole === "admin" && (
                                                            <span className="message-status">
                                                                {msg.status === "pending" && <span className="status-pending">🕓</span>}
                                                                {msg.status === "sent" && <span className="status-sent">✓</span>}
                                                                {msg.status === "delivered" && <span className="status-delivered">✓✓</span>}
                                                                {msg.status === "seen" && <span className="status-seen">✓✓</span>}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef}></div>
                        </div>

                        <div className="message-input-container slide-up">
                            <div className="input-wrapper">
                                <textarea
                                    rows="1"
                                    className="message-input"
                                    placeholder={`Message ${selectedUser?.name}...`}
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleAdminReply()}
                                ></textarea>
                                <button
                                    className="send-button hover-effect"
                                    onClick={handleAdminReply}
                                    disabled={!adminMessage.trim() || !selectedUserId}
                                >
                                    <span className="send-icon">✈️</span>
                                    <span className="send-text">Send</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="empty-state">
                            <div className="empty-icon">👋</div>
                            <h2>Welcome to Admin Chat</h2>
                            <p>Select a customer from the sidebar to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
