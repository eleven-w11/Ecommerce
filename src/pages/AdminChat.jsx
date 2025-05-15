import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./styles/AdminChat.css";
import { FiArrowLeft } from "react-icons/fi";

const AdminChat = () => {
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [selectedChat, setSelectedChat] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [adminMessage, setAdminMessage] = useState("");
    const socketRef = useRef(null);
    const isMounted = useRef(true);
    const messagesEndRef = useRef(null);
    // const [showMobileChat, setShowMobileChat] = useState(false);
    const [showMobileView, setShowMobileView] = useState(false);

    useEffect(() => {
        isMounted.current = true;

        // Initialize socket connection
        socketRef.current = io("http://localhost:5000", {
            withCredentials: true,
        });

        // Register admin socket
        const adminId = "681edcb10cadbac1be3540aa";
        socketRef.current.emit("register", { userId: adminId });

        const handleReceiveMessage = (message) => {
            if (!isMounted.current) return;

            setSelectedChat(prev => {
                const isDuplicate = prev.some(msg =>
                    msg._id === message._id ||
                    (msg.message === message.message &&
                        new Date(msg.timestamp).getTime() === new Date(message.timestamp).getTime())
                );

                if (!isDuplicate &&
                    (message.fromUserId === selectedUserId ||
                        (!message.fromAdmin && !selectedUserId))
                ) {
                    return [...prev, message];
                }
                return prev;
            });
        };

        socketRef.current.on("receiveMessage", handleReceiveMessage);

        return () => {
            isMounted.current = false;
            if (socketRef.current) {
                socketRef.current.off("receiveMessage", handleReceiveMessage);
                socketRef.current.disconnect();
            }
        };
    }, [selectedUserId]);

    useEffect(() => {
        const fetchAllMessages = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/admin/all-chats`, {
                    withCredentials: true,
                });
                if (isMounted.current) {
                    const sortedUsers = (res.data.users || []).sort((a, b) => {
                        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
                    });
                    setUsers(sortedUsers);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                if (isMounted.current) {
                    setError("Failed to load users.");
                }
            }
        };

        fetchAllMessages();
    }, [API_BASE]);

    // Remove unnecessary states

    // Modify fetchUserChat for mobile
    const fetchUserChat = async (userId) => {
        if (!isMounted.current) return;

        setSelectedUserId(userId);
        try {
            const res = await axios.get(`${API_BASE}/api/admin/chat/${userId}`, {
                withCredentials: true,
            });
            if (isMounted.current) {
                setSelectedChat(res.data.messages || []);
                setShowMobileView(true);
            }
        } catch (err) {
            console.error("Error fetching chat:", err);
            if (isMounted.current) {
                setError("Failed to load chat.");
            }
        }
    };

    const handleBackToUsers = () => {
        setShowMobileView(false);
    };

    const handleAdminReply = async () => {
        if (!adminMessage.trim() || !selectedUserId || !isMounted.current) return;

        const tempId = Date.now();
        const timestamp = new Date().toISOString();

        try {
            const newMessage = {
                _id: tempId,
                message: adminMessage,
                fromAdmin: true,
                timestamp,
                toUserId: selectedUserId
            };
            setSelectedChat(prev => [...prev, newMessage]);
            setAdminMessage("");

            socketRef.current.emit("adminMessage", {
                toUserId: selectedUserId,
                message: adminMessage
            });

        } catch (err) {
            console.error("❌ Error sending admin reply:", err);
            if (isMounted.current) {
                setError("Failed to send message.");
                setSelectedChat(prev => prev.filter(msg => msg._id !== tempId));
            }
        }
    };

    // const handleBackToUsers = () => {
    //     setSelectedUserId("");
    //     setShowUserListMobile(true);
    // };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat]);

    useEffect(() => {
        const setSignHeight = () => {
            const height = window.innerHeight - 60;
            const signElement = document.querySelector(".admin-chat-app");

            if (signElement) {
                signElement.style.height = `${height}px`;
            }
        };

        // Set on mount
        setSignHeight();

        // Update on window resize
        window.addEventListener("resize", setSignHeight);

        // Cleanup
        return () => window.removeEventListener("resize", setSignHeight);
    }, []);

    return (
        <div className="admin-chat-app">
            {/* Sidebar: Users - Always visible on desktop, conditionally on mobile */}
            <div className={`admin-sidebar glassmorphism  ${showMobileView ? 'hidden-mobile' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Customer Chats</h2>
                    <div className="online-indicator">
                        <span className="pulse-dot"></span>
                        <span>Online</span>
                        
                    </div>
                </div>

                {error && <div className="error-message slide-in">{error}</div>}

                <div className="users-list">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className={`user-card ${selectedUserId === user._id ? "active" : ""} fade-in`}
                            onClick={() => fetchUserChat(user._id)}
                        >
                            <div className="user-avatar-container">
                                <img
                                    src={user.image || "https://ui-avatars.com/api/?name=" + user.name + "&background=random"}
                                    alt="User"
                                    className="user-avatar"
                                />
                                <span className={`status-dot ${user.isOnline ? 'online' : 'offline'}`}></span>
                            </div>
                            <div className="user-info">
                                <h3 className="user-name">{user.name}</h3>
                                <p className="user-last-message truncate">
                                    {user.lastMessage || "No messages yet"}
                                </p>
                                <div className="message-meta">
                                    <span className="message-time">
                                        {user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                    {user.unreadCount > 0 && (
                                        <span className="unread-badge">{user.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area - Conditionally rendered based on selected chat */}
            <div className={`admin-chat-area  ${showMobileView ? 'visible-mobile' : ''}`}>
                {selectedUserId ? (
                    <>
                        <div className="chat-header">
                            <button className="back-button" onClick={handleBackToUsers}>
                                <FiArrowLeft size={20} />
                            </button>
                            <div className="chat-partner-info">
                                <img
                                    src={users.find(u => u._id === selectedUserId)?.image || "https://ui-avatars.com/api/?name=" + users.find(u => u._id === selectedUserId)?.name + "&background=random"}
                                    alt="User"
                                    className="chat-avatar"
                                />
                                <div>
                                    <h2 className="partner-name">{users.find(u => u._id === selectedUserId)?.name}</h2>
                                    <p className="partner-status">Active now</p>
                                </div>
                            </div>
                        </div>

                        <div className="messages-container">
                            {selectedChat.length === 0 ? (
                                <div className="empty-chat">
                                    <div className="empty-icon">💬</div>
                                    <h3>No messages yet</h3>
                                    <p>Start the conversation with {users.find(u => u._id === selectedUserId)?.name}</p>
                                </div>
                            ) : (
                                selectedChat.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={`message-bubble ${msg.fromAdmin ? "outgoing" : "incoming"} fade-in`}
                                    >
                                        <div className="message-content">
                                            <p className="message-text">{msg.message}</p>
                                            <p className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
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
                                    placeholder={`Message ${users.find(u => u._id === selectedUserId)?.name}...`}
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAdminReply()}
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