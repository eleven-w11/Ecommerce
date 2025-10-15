import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/AdminChat.css";

const UserList = () => {
    const navigate = useNavigate();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [users, setUsers] = useState([]); // ✅ Initialize as empty array
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        const backendURL = process.env.REACT_APP_API_BASE_URL;
        socketRef.current = io(backendURL, { withCredentials: true });

        // Register admin
        // const adminId = "681edcb10cadbac1be3540aa";
        // socketRef.current.emit("register", { userId: adminId, role: "admin" });

        // Get initial users list
        socketRef.current.emit("getUsers");

        // Listen for users list
        socketRef.current.on("usersList", (data) => {
            if (isMounted.current) {
                setUsers(Array.isArray(data) ? data : []);
                setLoading(false);
            }
        });

        // Listen for new messages to update user list
        const handleReceiveMessage = async (message) => {
            if (!isMounted.current) return;

            const userId = message.senderRole === "admin"
                ? message.toUserId
                : message.fromUserId;

            if (!userId) return;

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
                                unreadCount: (u.unreadCount || 0) + 1,
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
                    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
                );
            });

            // Fetch missing user details
            const userInState = users.find((u) => u._id === userId);
            if (!userInState || !userInState.name) {
                try {
                    const res = await axios.get(
                        `${backendURL}/api/user/${userId}`,
                        { withCredentials: true }
                    );
                    const user = res.data;

                    setUsers((prev) =>
                        prev.map((u) =>
                            u._id === user._id
                                ? {
                                    ...u,
                                    name: user.name,
                                    image: user.profileImage,
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
    }, []);

    const getUserColor = (source) => {
        switch (source) {
            case "socket-init":
                return "#d4edda";
            case "socket-update-existing":
                return "#f8d7da";
            case "socket-update-new":
                return "#fff3cd";
            default:
                return "#ffffff";
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/AdminChat/${userId}`);
    };

    // ✅ Safe array operations
    const safeUsers = Array.isArray(users) ? users : [];
    const uniqueUsers = [...new Map(safeUsers.map(u => u && u._id ? [u._id, u] : []).filter(item => item.length > 0)).values()];

    const sortedUsers = [...uniqueUsers].sort((a, b) => {
        const timeA = a?.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
        const timeB = b?.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
        return timeB - timeA;
    });

    const totalUsers = sortedUsers.length;

    if (loading) {
        return (
            <div className="home-loader-container">
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
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Customer Chats</h2>
                    <div className="users-stats">
                        Total Users: {totalUsers}
                    </div>
                </div>

                {error && <div className="error-message slide-in">{error}</div>}

                <div className="users-list">
                    {sortedUsers.length === 0 ? (
                        <div className="no-users-message">
                            <div className="empty-icon">💬</div>
                            <h3>No users found</h3>
                            <p>Waiting for customers to start conversations...</p>
                        </div>
                    ) : (
                        sortedUsers.map((user, index) => {
                            if (!user || !user._id) return null;

                            const displayNumber = totalUsers - index;
                            const userName = user?.name || "Unknown User";
                            const userImage = user?.image || `https://ui-avatars.com/api/?name=${userName}&background=random`;
                            const lastMessage = user?.lastMessage || "No messages yet";
                            const lastMessageTime = user?.lastMessageTime;
                            const unreadCount = user?.unreadCount || 0;
                            const isOnline = user?.isOnline || false;

                            return (
                                <div
                                    key={user._id}
                                    className="user-card fade-in"
                                    onClick={() => handleUserClick(user._id)}
                                    style={{ backgroundColor: getUserColor(user.source) }}
                                >
                                    <div className="user-avatar-container">
                                        <img
                                            src={userImage}
                                            alt="User"
                                            className="user-avatar"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${userName}&background=random`;
                                            }}
                                        />
                                        <span className={`status-dot ${isOnline ? "online" : "offline"}`}></span>
                                    </div>

                                    <div className="user-info">
                                        <div className="user-header">
                                            <span className="user-number">#{displayNumber}</span>
                                            <h3 className="user-name">{userName}</h3>
                                        </div>
                                        <p className="user-last-message truncate">
                                            {lastMessage}
                                        </p>
                                        <div className="message-meta">
                                            <span className="message-time">
                                                {lastMessageTime
                                                    ? new Date(lastMessageTime).toLocaleString([], {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : ""}
                                            </span>
                                            {unreadCount > 0 && (
                                                <span className="unread-badge">{unreadCount}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Empty chat area for consistent layout */}
            <div className="admin-chat-area">
                <div className="no-chat-selected">
                    <div className="empty-state">
                        <div className="empty-icon">👋</div>
                        <h2>Welcome to Admin Chat</h2>
                        <p>Select a customer from the sidebar to start chatting</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;