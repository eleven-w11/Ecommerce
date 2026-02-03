import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "../styles/Chat.css";
import admin from "../images/admin.png";
import { Link } from "react-router-dom";

const Chat = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [userId, setUserId] = useState(undefined);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [authError, setAuthError] = useState(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const isMounted = useRef(true);
    const pendingMessages = useRef(new Map());
    const inputRef = useRef(null);

    // ✅ Format date
    const formatMessageDate = (timestamp) => {
        const messageDate = new Date(timestamp);
        return messageDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const groupMessagesByDate = (messages) => {
        const grouped = {};
        messages.forEach((msg) => {
            const dateKey = new Date(msg.timestamp).toDateString();
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(msg);
        });
        return grouped;
    };

    useEffect(() => {
        const setSignHeight = () => {
            const height = window.innerHeight - 60;
            const signElement = document.querySelector(".user-chat-app");
            if (signElement) signElement.style.height = `${height}px`;
        };
        setSignHeight();
        window.addEventListener("resize", setSignHeight);
        return () => window.removeEventListener("resize", setSignHeight);
    }, []);

    useEffect(() => {
        isMounted.current = true;
        const authTimeout = setTimeout(() => {
            if (isLoading && !userProfile && isMounted.current) {
                setAuthError("Please sign in to access the chat");
            }
        }, 5000);
        return () => {
            isMounted.current = false;
            pendingMessages.current.clear();
            clearTimeout(authTimeout);
        };
    }, [isLoading, userProfile]);

    // ✅ Initialize socket
    useEffect(() => {
        const backendURL = process.env.REACT_APP_API_BASE_URL;
        socketRef.current = io(backendURL, { withCredentials: true });

        // ✅ Message acknowledgments
        socketRef.current.on("messageSentAck", (msgId) => {
            setChat((prev) =>
                prev.map((msg) =>
                    msg._id === msgId ? { ...msg, status: "sent" } : msg
                )
            );
        });

        socketRef.current.on("messageDelivered", (msgId) => {
            setChat((prev) =>
                prev.map((msg) =>
                    msg._id === msgId ? { ...msg, status: "delivered" } : msg
                )
            );
        });

        socketRef.current.on("messageSeen", (msgId) => {
            setChat((prev) =>
                prev.map((msg) =>
                    msg._id === msgId ? { ...msg, status: "seen" } : msg
                )
            );
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    // ✅ Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/user/profile`,
                    { withCredentials: true }
                );
                if (response.data._id && isMounted.current) {
                    const fetchedUserId = response.data._id;
                    const adminStatus = response.data.isAdmin || false;
                    setUserId(fetchedUserId);
                    setIsAdmin(adminStatus);
                    setUserProfile(response.data);
                    setAuthError(null);
                    socketRef.current.emit("register", {
                        userId: fetchedUserId,
                        role: adminStatus ? "admin" : "user",
                    });
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                if (isMounted.current) {
                    setAuthError("Please sign in to access the chat");
                    setIsLoading(false);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleReceiveMessage = useCallback((data) => {
        if (!isMounted.current) return;
        setChat((prev) => {
            const exists = prev.some(
                (msg) =>
                    (msg._id && msg._id === data._id) ||
                    (msg.timestamp === data.timestamp &&
                        msg.message === data.message)
            );
            if (exists) return prev;
            // ✅ Send delivery acknowledgment back
            socketRef.current.emit("deliveredAck", data._id);
            return [...prev, data];
        });
    }, []);

    // ✅ Fetch chat history
    useEffect(() => {
        if (!userId || !socketRef.current) return;
        const fetchChatHistory = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/messages/chat/history/${userId}`,
                    { withCredentials: true }
                );
                if (res.data.success && isMounted.current) {
                    setChat(res.data.messages || []);
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
            } finally {
                if (isMounted.current) setIsLoading(false);
            }
        };
        fetchChatHistory();
        socketRef.current.on("receiveMessage", handleReceiveMessage);
        return () => socketRef.current?.off("receiveMessage", handleReceiveMessage);
    }, [userId, handleReceiveMessage]);

    // ✅ Auto scroll
    useEffect(() => {
        if (messagesEndRef.current && !isLoading) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat, isLoading]);

    // ✅ Send message with optimistic UI
    const sendMessage = useCallback(() => {
        if (!message.trim() || !socketRef.current) return;
        const tempId = Date.now();
        const timestamp = new Date().toISOString();
        const currentMessage = message.trim();

        const optimisticMsg = {
            _id: tempId,
            message: currentMessage,
            fromAdmin: isAdmin,
            fromUserId: userId,
            toUserId: selectedUserId,
            timestamp,
            status: "pending", // ✅ new field
        };

        setChat((prev) => [...prev, optimisticMsg]);

        const emitEvent = isAdmin ? "adminMessage" : "userMessage";
        socketRef.current.emit(emitEvent, {
            ...optimisticMsg,
            senderRole: isAdmin ? "admin" : "user",
        });

        setMessage("");
        Promise.resolve().then(() => inputRef.current?.focus());
    }, [message, isAdmin, selectedUserId, userId]);

    // ✅ Sort and group messages
    const sortedMessages = [...chat].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    const groupedMessages = groupMessagesByDate(sortedMessages);

    if (isLoading && !userProfile) {
        return (
            <div className="fp-chat">
                <div className="fp-loader-container">
                    <div className="loader">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-chat-app">
            <div className="chat-app">
                <div className="chat-header glassmorphism">
                    <div className="header-content">
                        <div className="back-arrow">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </div>
                        <div className="admin-profile">
                            <div className="profile-image-container">
                                <img src={admin} alt="Admin" className="profile-image" />
                                <span className="online-indicator"></span>
                            </div>
                            <div className="profile-info">
                                <p className="profile-name">Admin</p>
                                <p className="profile-status">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chat-body">
                    {authError ? (
                        <div className="auth-error-message">
                            <div className="auth-error-content">
                                <div className="error-icon">⚠️</div>
                                <h3>Authentication Required</h3>
                                <p>{authError}</p>
                                <Link to="/signin" className="auth-redirect-button pulse">
                                    Sign In Now
                                </Link>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="messages-loading">
                            <div className="loading-animation">
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="messages-container">
                            {sortedMessages.length === 0 ? (
                                <div className="empty-chat">
                                    <div className="empty-icon">💬</div>
                                    <h3>Start the conversation</h3>
                                    <p>Send your first message to get started</p>
                                </div>
                            ) : (
                                <div className="messages-wrapper">
                                    {Object.keys(groupedMessages).map((dateKey) => (
                                        <React.Fragment key={dateKey}>
                                            <div className="date-separator">
                                                <div className="date">
                                                    {formatMessageDate(
                                                        groupedMessages[dateKey][0].timestamp
                                                    )}
                                                </div>
                                            </div>
                                            {groupedMessages[dateKey].map((msg) => (
                                                <div
                                                    key={msg._id || msg.timestamp}
                                                    className={`message-bubble ${msg.fromAdmin
                                                            ? "admin-message"
                                                            : msg.fromUserId === userId
                                                                ? "user-message self"
                                                                : "user-message"
                                                        } fade-in`}
                                                >
                                                    <p className="message-text">{msg.message}</p>
                                                    <div className="message-meta">
                                                        <span className="message-time">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {/* ✅ Tick system */}
                                                        <span className="message-status">
                                                            {msg.status === "pending" && "🕓"}
                                                            {msg.status === "sent" && "✔️"}
                                                            {msg.status === "delivered" && "✔️✔️"}
                                                            {msg.status === "seen" && (
                                                                <span style={{ color: "blue" }}>✔️✔️</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                            <div ref={messagesEndRef}></div>
                        </div>
                    )}
                </div>

                {!authError && !isLoading && (
                    <div className="message-input-container slide-up">
                        <div className="input-wrapper">
                            <input
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type your message..."
                                className="message-input"
                            />
                            <button
                                onClick={sendMessage}
                                className="send-button hover-effect"
                                disabled={!message.trim()}
                            >
                                <span className="send-icon">✈️</span>
                                <span className="send-text">Send</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
