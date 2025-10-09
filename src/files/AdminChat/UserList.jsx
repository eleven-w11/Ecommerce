import React from "react";
import "../styles/AdminChat.css";

const UserList = ({
    users,
    selectedUserId,
    fetchUserChat,
}) => {

    // ✅ 1. Background color based on source
    const getUserColor = (source) => {
        switch (source) {
            case "socket-init":
                return "#d4edda"; // 🟢 green
            case "socket-update-existing":
                return "#f8d7da"; // 🔴 red
            case "socket-update-new":
                return "#fff3cd"; // 🟡 yellow
            default:
                return "#ffffff"; // ⚪ default white
        }
    };

    // ✅ 2. Remove duplicates
    const uniqueUsers = [...new Map(users.map(u => [u._id, u])).values()];

    // ✅ 3. Sort users by lastMessageTime (descending)
    const sortedUsers = [...uniqueUsers].sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || 0);
        const timeB = new Date(b.lastMessageTime || 0);
        return timeB - timeA; // latest on top
    });

    const totalUsers = sortedUsers.length;

    return (
        <div className="users-list">
            {sortedUsers.map((user, index) => {
                // ✅ Calculate numbering (reverse)
                const displayNumber = totalUsers - index;

                return (
                    <div
                        key={user._id}
                        className={`user-card ${selectedUserId === user._id ? "active" : ""} fade-in`}
                        onClick={() => fetchUserChat(user._id)}
                        style={{ backgroundColor: getUserColor(user.source) }}
                    >
                        <div className="user-avatar-container">
                            <img
                                src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt="User"
                                className="user-avatar"
                            />
                            <span className={`status-dot ${user.isOnline ? "online" : "offline"}`}></span>

                        </div>

                        <div className="user-info">
                            <div className="user-header">
                                <span className="user-number">#{displayNumber}</span>
                                <h3 className="user-name">{user.name}</h3>
                            </div>
                            <p className="user-last-message truncate">
                                {user.lastMessage || "No messages yet"}
                            </p>
                            <div className="message-meta">
                                <span className="message-time">
                                    {user.lastMessageTime
                                        ? new Date(user.lastMessageTime).toLocaleString([], {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : ""}
                                </span>
                                {user.unreadCount > 0 && (
                                    <span className="unread-badge">{user.unreadCount}</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserList;
