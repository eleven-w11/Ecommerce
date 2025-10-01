// OOK Code Mob testing 367 line
import React, { useEffect, useRef, useState } from "react";
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
    // const navigate = useNavigate();


    useEffect(() => {
        const setSignHeight = () => {
            const height = window.innerHeight - 60;
            const signElement = document.querySelector(".user-chat-app");

            if (signElement) {
                signElement.style.height = `${height}px`;
            }
        };

        setSignHeight();

        window.addEventListener("resize", setSignHeight);

        return () => window.removeEventListener("resize", setSignHeight);
    }, []);

    // Component mount/unmount
    useEffect(() => {
        isMounted.current = true;

        // Set timeout for showing auth error if loading takes too long
        const authTimeout = setTimeout(() => {
            if (isLoading && !userProfile && isMounted.current) {
                setAuthError("Please sign in to access the chat");
            }
        }, 5000); // Show error after 5 seconds

        return () => {
            isMounted.current = false;
            pendingMessages.current.clear();
            clearTimeout(authTimeout);
        };
    }, [isLoading, userProfile]);

    // Socket connection
    useEffect(() => {
        const backendURL = process.env.REACT_APP_BACKEND_URL;

        socketRef.current = io(backendURL, {
            withCredentials: true,
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);



    // Fetch user data and register socket
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/user/profile`,
                    { withCredentials: true }
                );

                if (response.data._id && isMounted.current) {
                    setUserId(response.data._id);
                    setIsAdmin(response.data.isAdmin || false);
                    setUserProfile(response.data);
                    setAuthError(null);

                    socketRef.current.emit("register", {
                        userId: response.data._id,
                        isAdmin: response.data.isAdmin
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

    // Fetch chat history and setup socket listener
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
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        const handleReceiveMessage = (data) => {
            if (!isMounted.current) return;

            setChat(prev => {
                // Check if this is a response to our own message
                const isOwnMessage = data.fromUserId === userId && !data.fromAdmin;
                const isOwnAdminMessage = data.fromAdmin && data.toUserId === selectedUserId;

                if (isOwnMessage || isOwnAdminMessage) {
                    // Find and replace the optimistic update
                    const existingIndex = prev.findIndex(msg =>
                        pendingMessages.current.has(msg.timestamp) &&
                        pendingMessages.current.get(msg.timestamp).message === data.message
                    );

                    if (existingIndex !== -1) {
                        pendingMessages.current.delete(prev[existingIndex].timestamp);
                        const newChat = [...prev];
                        newChat[existingIndex] = data;
                        return newChat;
                    }
                }

                // Check for duplicates using database _id
                const exists = prev.some(msg =>
                    (msg._id && msg._id === data._id) ||
                    (msg.timestamp === data.timestamp && msg.message === data.message)
                );

                return exists ? prev : [...prev, data];
            });
        };

        fetchChatHistory();
        socketRef.current.on("receiveMessage", handleReceiveMessage);

        return () => {
            if (socketRef.current) {
                socketRef.current.off("receiveMessage", handleReceiveMessage);
            }
        };
    }, [userId, selectedUserId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current && !isLoading) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat, isLoading]);

    const sendMessage = () => {
        if (!message.trim() || !socketRef.current) return;

        const tempId = Date.now();
        const timestamp = new Date().toISOString();

        if (isAdmin) {
            if (!selectedUserId) {
                alert("Please select a user to chat with");
                return;
            }

            const optimisticMsg = {
                _id: tempId,
                message,
                fromAdmin: true,
                timestamp,
                toUserId: selectedUserId
            };

            pendingMessages.current.set(timestamp, {
                tempId,
                message
            });

            setChat(prev => [...prev, optimisticMsg]);
            socketRef.current.emit("adminMessage", {
                toUserId: selectedUserId,
                message,
                timestamp
            });
        } else {
            const optimisticMsg = {
                _id: tempId,
                message,
                fromAdmin: false,
                timestamp,
                fromUserId: userId
            };

            pendingMessages.current.set(timestamp, {
                tempId,
                message
            });

            setChat(prev => [...prev, optimisticMsg]);
            socketRef.current.emit("userMessage", {
                fromUserId: userId,
                message,
                timestamp
            });
        }

        setMessage("");
    };




    if (authError) {
        return (
            <div className="auth-error-container">
                <div className="auth-error-card">
                    <div className="error-icon">⚠️</div>
                    <h2>Authentication Required</h2>
                    <p>{authError}</p>
                    <Link to="/signin" className="auth-redirect-button pulse">
                        Sign In Now
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading && !userProfile) {
        return (
            <div className="fp-chat">
                <div className="fp-loader-container">
                    <div className="loader">
                        <span></span>
                        <span></span>
                        <span></span>
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

                        <h2 className="chat-title">Chat Support</h2>

                        <div className="user-profile">
                            <div className="profile-info">
                                <p className="profile-name">{userProfile?.name || "User"}</p>
                                <p className="profile-status">Active now</p>
                            </div>
                            <div className="profile-image-container">
                                {userProfile?.image ? (
                                    <img src={userProfile.image} alt="Profile" className="profile-image" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {userProfile?.name?.charAt(0) || "U"}
                                    </div>
                                )}
                                <span className="online-indicator"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chat-body">
                    {isLoading ? (
                        <div className="messages-loading">
                            <div className="loading-animation">
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="messages-container">
                            {chat.length === 0 ? (
                                <div className="empty-chat">
                                    <div className="empty-icon">💬</div>
                                    <h3>Start the conversation</h3>
                                    <p>Send your first message to get started</p>
                                </div>
                            ) : (
                                chat.map((msg) => (
                                    <div
                                        key={msg._id || msg.timestamp}
                                        className={`message-bubble ${msg.fromAdmin ? "admin-message" : "user-message"} fade-in`}
                                    >
                                        <p className="message-text">{msg.message}</p>
                                        <p className="message-time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef}></div>
                        </div>
                    )}

                    <div className="message-input-container slide-up">
                        <div className="input-wrapper">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
                </div>
            </div>
        </div>
    );
};


export default Chat;