import React, { useEffect, useState, useRef } from "react";
import "./styles/AdminChat.css";
import { FiArrowLeft } from "react-icons/fi";

const AdminChat = () => {
    const [users, setUsers] = useState([
        {
            _id: "user1",
            name: "John Doe",
            image: "",
            lastMessage: "Thanks for your help!",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 1,
            isOnline: true,
        },
        {
            _id: "user2",
            name: "Jane Smith",
            image: "",
            lastMessage: "Can you check my order?",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isOnline: false,
        },
    ]);

    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedChat, setSelectedChat] = useState([]);
    const [adminMessage, setAdminMessage] = useState("");
    const [showMobileView, setShowMobileView] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchUserChat = (userId) => {
        setSelectedUserId(userId);
        setShowMobileView(true);

        const mockMessages = [
            {
                _id: "1",
                message: "Hi, I need help with my order.",
                fromAdmin: false,
                timestamp: new Date().toISOString(),
            },
            {
                _id: "2",
                message: "Sure, what seems to be the issue?",
                fromAdmin: true,
                timestamp: new Date().toISOString(),
            },
            {
                _id: "3",
                message: "The delivery is delayed.",
                fromAdmin: false,
                timestamp: new Date().toISOString(),
            },
        ];
        setSelectedChat(mockMessages);
    };

    const handleBackToUsers = () => {
        setShowMobileView(false);
    };

    const handleAdminReply = () => {
        if (!adminMessage.trim() || !selectedUserId) return;

        const newMessage = {
            _id: Date.now(),
            message: adminMessage,
            fromAdmin: true,
            timestamp: new Date().toISOString(),
        };
        setSelectedChat((prev) => [...prev, newMessage]);
        setAdminMessage("");
    };

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

        setSignHeight();
        window.addEventListener("resize", setSignHeight);
        return () => window.removeEventListener("resize", setSignHeight);
    }, []);

    return (
        <div className="admin-chat-app">
            <div className={`admin-sidebar glassmorphism ${showMobileView ? 'hidden-mobile' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Customer Chats</h2>
                    <div className="online-indicator">
                        <span className="pulse-dot"></span>
                        <span>Online</span>
                    </div>
                </div>

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
                                    {user.lastMessage}
                                </p>
                                <div className="message-meta">
                                    <span className="message-time">
                                        {new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            <div className={`admin-chat-area ${showMobileView ? 'visible-mobile' : ''}`}>
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
                            {selectedChat.map((msg, idx) => (
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
                            ))}
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
                                    disabled={!adminMessage.trim()}
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
