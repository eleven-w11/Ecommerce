import React, { useEffect, useRef, useState } from "react";
import "./styles/Chat.css";
import admin from "./images/admin.png";

const Chat = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Sample user profile data
    const userProfile = {
        name: "Demo User",
        image: "https://lh3.googleusercontent.com/a/ACg8ocJ4YwnRno-0XrfMDaS5LQpWanxTK9B9OBycUXhop9STQ_Y4PzQ=s96-c"
    };

    // Simulated chat data
    const sampleChat = [
        {
            _id: 1,
            message: "Hello! How can I help you today?",
            fromAdmin: true,
            timestamp: new Date(Date.now() - 60000).toISOString()
        },
        {
            _id: 2,
            message: "Hi there! I'm having trouble with my account.",
            fromAdmin: false,
            timestamp: new Date(Date.now() - 30000).toISOString()
        },
        {
            _id: 3,
            message: "What seems to be the problem?",
            fromAdmin: true,
            timestamp: new Date(Date.now() - 15000).toISOString()
        }
    ];

    useEffect(() => {
        // Set initial loading state
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
            setChat(sampleChat);
        }, 3000); // 3 seconds loading simulation

        // Set chat height
        const setSignHeight = () => {
            const height = window.innerHeight - 60;
            const signElement = document.querySelector(".user-chat-app");
            if (signElement) {
                signElement.style.height = `${height}px`;
            }
        };

        setSignHeight();
        window.addEventListener("resize", setSignHeight);

        return () => {
            clearTimeout(loadingTimer);
            window.removeEventListener("resize", setSignHeight);
        };
    }, []);

    useEffect(() => {
        if (messagesEndRef.current && !isLoading) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat, isLoading]);

    const sendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            _id: Date.now(),
            message,
            fromAdmin: false,
            timestamp: new Date().toISOString()
        };

        setChat(prev => [...prev, newMessage]);
        setMessage("");

        // Simulate admin reply after 1-2 seconds
        setTimeout(() => {
            const replyMessage = {
                _id: Date.now() + 1,
                message: "Thanks for your message! This is an offline demo.",
                fromAdmin: true,
                timestamp: new Date().toISOString()
            };
            setChat(prev => [...prev, replyMessage]);
        }, 1500);
    };

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

                        <h2 className="chat-title">Chat Support (Offline Demo)</h2>

                        <div className="user-profile">
                            <div className="profile-info">
                                <p className="profile-name">{userProfile.name}</p>
                                <p className="profile-status">Active now</p>
                            </div>
                            <div className="profile-image-container">
                                <img src={userProfile.image} alt="Profile" className="profile-image" />
                                <span className="online-indicator"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chat-body">
                    {isLoading ? (
                        <div className="fp-chat">
                            <div className="fp-loader-container">
                                <div className="loader">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
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
                                        key={msg._id}
                                        className={`message-bubble ${msg.fromAdmin ? "admin-message" : "user-message"} fade-in`}
                                    >
                                        <p className="message-text">{msg.message}</p>
                                        <p className="message-time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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