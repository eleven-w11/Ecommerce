import React from "react";
import '../styles/AdminChat.css';

const UserList = ({
    users,
    selectedUserId,
    fetchUserChat,
}) => {
    // ✅ 1. Source-based background color function
    const getUserColor = (source) => {
        switch (source) {
            case "socket-init":
                return "#d4edda"; // 🟢 green - initial fetch
            case "socket-update-existing":
                return "#f8d7da"; // 🔴 red - updated existing
            case "socket-update-new":
                return "#fff3cd"; // 🟡 yellow - new user
            default:
                return "#ffffff"; // ⚪ default white
        }
    };


    // ✅ 2. Unique users
    const uniqueUsers = [...new Map(users.map(u => [u._id, u])).values()];

    return (
        <div className="users-list">
            {uniqueUsers.map((user) => (
                <div
                    key={user._id}
                    className={`user-card ${selectedUserId === user._id ? "active" : ""} fade-in`}
                    onClick={() => fetchUserChat(user._id)}
                    style={{ backgroundColor: getUserColor(user.source) }} // ✅ 3. Background color
                >
                    <div className="user-avatar-container">
                        <img
                            src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
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
                                {user.lastMessageTime
                                    ? new Date(user.lastMessageTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : ''}
                            </span>
                            {user.unreadCount > 0 && (
                                <span className="unread-badge">{user.unreadCount}</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserList;
