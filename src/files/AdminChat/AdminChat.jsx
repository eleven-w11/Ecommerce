import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/AdminChat.css";
import { FiArrowLeft } from "react-icons/fi";
import UserList from "./UserList";


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
    const [showMobileView, setShowMobileView] = useState(false);

    console.warn("users", users);


    useEffect(() => {
        isMounted.current = true;

        const backendURL = process.env.REACT_APP_API_BASE_URL;

        socketRef.current = io(backendURL, {
            withCredentials: true,
        });

        const adminId = "681edcb10cadbac1be3540aa";
        socketRef.current.emit("register", { userId: adminId });

        socketRef.current.emit("getUsers");
        socketRef.current.on("usersList", (data) => {
            console.log("📥 usersList received from backend:", data);
            if (isMounted.current) {
                const usersWithSource = data.map(user => ({
                    ...user,
                    source: "socket-init"
                }));
                setUsers(usersWithSource);
            }
        });

        const handleReceiveMessage = async (message) => {
            if (!isMounted.current) return;

            const userId = message.fromAdmin ? message.toUserId : message.fromUserId;
            if (!userId) return;

            setSelectedChat(prev => {
                const isDuplicate = prev.some(msg =>
                    msg._id === message._id ||
                    (msg.message === message.message &&
                        new Date(msg.timestamp).getTime() === new Date(message.timestamp).getTime())
                );
                if (!isDuplicate && userId === selectedUserId) {
                    return [...prev, message];
                }
                return prev;
            });

            setUsers(prev => {
                const userExists = prev.find(u => u._id === userId);
                const name = message.user?.name || "New User";
                const image = message.user?.image || "";
                console.log("🧾 Message from user:", {
                    userId,
                    name,
                    image,
                    message: message.message
                });

                let updatedUsers;
                if (userExists) {
                    updatedUsers = prev.map(u =>
                        u._id === userId
                            ? {
                                ...u,
                                name: name || u.name,
                                image: image || u.image,
                                lastMessage: message.message,
                                lastMessageTime: message.timestamp,
                                unreadCount: u._id !== selectedUserId ? (u.unreadCount || 0) + 1 : 0,
                                isOnline: true,
                                source: "socket-update-existing"
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
                            source: "socket-update-new",
                            needsUpdate: false
                        },
                        ...prev
                    ];
                }

                const safeDate = (d) => d ? new Date(d).getTime() : 0;
                return [...updatedUsers].sort((a, b) => safeDate(b.lastMessageTime) - safeDate(a.lastMessageTime));
            });

            const userInState = users.find(u => u._id === userId);
            if (!userInState || !userInState.name) {
                try {
                    const res = await axios.get(`${backendURL}/api/user/${userId}`, {
                        withCredentials: true,
                    });
                    const user = res.data;

                    setUsers(prev =>
                        prev.map(u =>
                            u._id === user._id
                                ? {
                                    ...u,
                                    name: user.name,
                                    image: user.profileImage,
                                    needsUpdate: false
                                }
                                : u
                        )
                    );
                } catch (err) {
                    console.error("❌ Failed to fetch user:", err.message);
                }
            }
        };

        socketRef.current.on("receiveMessage", handleReceiveMessage);

        return () => {
            isMounted.current = false;
            socketRef.current?.off("receiveMessage", handleReceiveMessage);
            socketRef.current?.disconnect();
        };
    }, [selectedUserId]);



    const fetchUserChat = async (userId) => {
        if (!isMounted.current) return;

        try {
            const res = await axios.get(`${API_BASE}/api/admin/chat/${userId}`, {
                withCredentials: true,
            });

            if (isMounted.current) {
                setSelectedChat(res.data.messages || []);
                setSelectedUserId(userId);
                setShowMobileView(true);
            }
        } catch (err) {
            console.error("Error fetching chat:", err);
            if (isMounted.current) {
                setError("Failed to load chat.");
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

    const handleBackToUsers = () => setShowMobileView(false);

    const uniqueUsers = [...new Map(users.map(u => [u._id, u])).values()];




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
                {error && <div className="error-message slide-in">{error}</div>}

                {/* ✅ Replaced user list block with UserList component */}
                <UserList
                    users={users}
                    selectedUserId={selectedUserId}
                    fetchUserChat={fetchUserChat}
                />
            </div>
            {/* 🟢 Keep the remaining part of chat area, message input, and rest as-is */}
            <div className={`admin-chat-area ${showMobileView ? 'visible-mobile' : ''}`}>
                {selectedUserId ? (
                    <>
                        <div className="chat-header">
                            <button className="back-button" onClick={handleBackToUsers}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div className="chat-partner-info">
                                <img
                                    src={users.find(u => u._id === selectedUserId)?.image || `https://ui-avatars.com/api/?name=${users.find(u => u._id === selectedUserId)?.name}&background=random`}
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
                                    <h3>No messages found</h3>
                                    <p>Try refreshing or wait for new messages from {users.find(u => u._id === selectedUserId)?.name || "user"}.</p>
                                </div>
                            ) : (
                                selectedChat
                                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                    .map((msg, idx) => (
                                        <div
                                            key={msg._id || idx}
                                            className={`message-bubble ${msg.fromAdmin ? "outgoing" : "incoming"} fade-in`}
                                        >
                                            <div className="message-content">
                                                <p className="message-text">{msg.message}</p>
                                                <p className="message-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
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