import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/AdminChat.css";

const AdminChat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [selectedChat, setSelectedChat] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(userId || "");
    const [adminMessage, setAdminMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const socketRef = useRef(null);
    const isMounted = useRef(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (userId) {
            setSelectedUserId(userId);
            fetchUserChat(userId);
        }
    }, [userId]);

    useEffect(() => {
        isMounted.current = true;

        const backendURL = process.env.REACT_APP_API_BASE_URL;
        socketRef.current = io(backendURL, { withCredentials: true });

        const adminId = "681edcb10cadbac1be3540aa";
        socketRef.current.emit("register", { userId: adminId, role: "admin" });

        const handleReceiveMessage = async (message) => {
            if (!isMounted.current) return;

            const userId = message.senderRole === "admin"
                ? message.toUserId
                : message.fromUserId;

            if (!userId) return;

            // If this message is for the currently selected user, add to chat
            if (userId === selectedUserId) {
                setSelectedChat((prev) => {
                    const isDuplicate = prev.some(
                        (msg) =>
                            msg._id === message._id ||
                            (msg.message === message.message &&
                                new Date(msg.timestamp).getTime() ===
                                new Date(message.timestamp).getTime())
                    );
                    if (!isDuplicate) {
                        return [...prev, message];
                    }
                    return prev;
                });
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
            // Fetch chat messages
            const res = await axios.get(`${API_BASE}/api/admin/chat/${userId}`, {
                withCredentials: true,
            });

            // Fetch user details
            const userRes = await axios.get(`${API_BASE}/api/user/${userId}`, {
                withCredentials: true,
            });

            if (isMounted.current) {
                setSelectedChat(res.data.messages || []);
                setSelectedUserId(userId);
                setCurrentUser(userRes.data);
                setError("");
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
            senderRole: "admin",
            timestamp,
            toUserId: selectedUserId,
        };

        setSelectedChat((prev) => [...prev, newMessage]);
        setAdminMessage("");

        socketRef.current.emit("adminMessage", {
            toUserId: selectedUserId,
            message: adminMessage,
        });
    };

    const handleBackToUsers = () => {
        navigate("/UserList");
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat]);

    if (!selectedUserId) {
        return (
            <div className="admin-chat-app">
                <div className="no-chat-selected">
                    <div className="empty-state">
                        <div className="empty-icon">👋</div>
                        <h2>Welcome to Admin Chat</h2>
                        <p>Select a customer to start chatting</p>
                        <button
                            className="back-to-users-btn"
                            onClick={handleBackToUsers}
                        >
                            Back to Users List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-chat-app">
            <div className="admin-chat-area">
                <div className="chat-header">
                    <button
                        className="back-button"
                        onClick={handleBackToUsers}
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                    </button>
                    <div className="chat-partner-info">
                        <img
                            src={
                                currentUser?.profileImage ||
                                `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`
                            }
                            alt="User"
                            className="chat-avatar"
                        />
                        <div>
                            <h2 className="partner-name">
                                {currentUser?.name || "Loading..."}
                            </h2>
                            <p className="partner-status">Active now</p>
                        </div>
                    </div>
                </div>

                <div className="messages-container">
                    {selectedChat.length === 0 ? (
                        <div className="empty-chat">
                            <div className="empty-icon">💬</div>
                            <h3>No messages found</h3>
                            <p>
                                Start a conversation with {currentUser?.name || "this user"}
                            </p>
                        </div>
                    ) : (
                        selectedChat
                            .sort(
                                (a, b) =>
                                    new Date(a.timestamp) -
                                    new Date(b.timestamp)
                            )
                            .map((msg, idx) => (
                                <div
                                    key={msg._id || idx}
                                    className={`message-bubble ${msg.senderRole === "admin"
                                        ? "outgoing"
                                        : "incoming"
                                        } fade-in`}
                                >
                                    <div className="message-content">
                                        <p className="message-text">
                                            {msg.message}
                                        </p>
                                        <p className="message-time">
                                            {new Date(
                                                msg.timestamp
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
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
                            placeholder={`Message ${currentUser?.name || 'user'}...`}
                            value={adminMessage}
                            onChange={(e) =>
                                setAdminMessage(e.target.value)
                            }
                            onKeyPress={(e) =>
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                handleAdminReply()
                            }
                        ></textarea>
                        <button
                            className="send-button hover-effect"
                            onClick={handleAdminReply}
                            disabled={
                                !adminMessage.trim() || !selectedUserId
                            }
                        >
                            <span className="send-icon">✈️</span>
                            <span className="send-text">Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChat;