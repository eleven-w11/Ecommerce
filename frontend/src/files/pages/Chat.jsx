import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import '../styles/Chat.css';

const Chat = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userId, setUserId] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const [adminInfo, setAdminInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_BASE_URL;
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL;

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/verifytoken`, {
                    withCredentials: true
                });
                
                if (response.data?.success && response.data?.userId) {
                    setIsAuthenticated(true);
                    setUserId(response.data.userId);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [API_URL]);

    // Fetch admin info
    useEffect(() => {
        const fetchAdmin = async () => {
            if (!isAuthenticated || !userId) return;
            
            try {
                const response = await axios.get(`${API_URL}/api/chat/admin`, {
                    withCredentials: true
                });
                if (response.data?.success) {
                    setAdminInfo(response.data.admin);
                    setAdminId(response.data.admin._id);
                }
            } catch (error) {
                console.error('Error fetching admin:', error);
            }
        };
        fetchAdmin();
    }, [isAuthenticated, userId, API_URL]);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        if (!adminId) return;
        
        try {
            const response = await axios.get(`${API_URL}/api/chat/messages/${adminId}`, {
                withCredentials: true
            });
            if (response.data?.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [adminId, API_URL]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Socket connection
    useEffect(() => {
        if (!isAuthenticated || !userId) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            newSocket.emit('register', { userId });
        });

        newSocket.on('onlineUsers', (users) => {
            if (adminId) {
                setIsAdminOnline(users.includes(adminId));
            }
        });

        newSocket.on('userOnline', ({ userId: onlineUserId, online }) => {
            if (onlineUserId === adminId) {
                setIsAdminOnline(online);
            }
        });

        newSocket.on('newMessage', (message) => {
            setMessages(prev => [...prev, message]);
            // Mark as seen since user is viewing chat
            if (adminId) {
                newSocket.emit('markSeen', { senderId: adminId, receiverId: userId });
            }
        });

        newSocket.on('messageSent', (message) => {
            setMessages(prev => {
                // Replace temp message with confirmed one
                const filtered = prev.filter(m => m.tempId !== message.tempId);
                return [...filtered, message];
            });
        });

        newSocket.on('messagesSeen', () => {
            setMessages(prev => prev.map(m => ({
                ...m,
                status: m.senderId?._id === userId || m.senderId === userId ? 'seen' : m.status
            })));
        });

        newSocket.on('userTyping', ({ userId: typingUserId, isTyping: typing }) => {
            if (typingUserId === adminId) {
                setIsTyping(typing);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, userId, adminId, SOCKET_URL]);

    // Mark messages as seen when chat opens
    useEffect(() => {
        if (socket && adminId && userId) {
            socket.emit('markSeen', { senderId: adminId, receiverId: userId });
        }
    }, [socket, adminId, userId, messages.length]);

    // Send message
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !socket || !adminId) return;

        const tempId = Date.now().toString();
        const tempMessage = {
            tempId,
            senderId: { _id: userId },
            receiverId: { _id: adminId },
            message: newMessage,
            messageType: 'text',
            status: 'sent',
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        socket.emit('sendMessage', {
            senderId: userId,
            receiverId: adminId,
            message: newMessage,
            messageType: 'text',
            tempId
        });

        // Stop typing indicator
        socket.emit('typing', { senderId: userId, receiverId: adminId, isTyping: false });
    };

    // Handle typing
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (socket && adminId) {
            socket.emit('typing', { senderId: userId, receiverId: adminId, isTyping: true });
            
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { senderId: userId, receiverId: adminId, isTyping: false });
            }, 2000);
        }
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !adminId) return;

        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('receiverId', adminId);
        formData.append('messageType', file.type.startsWith('image/') ? 'image' : 'file');

        try {
            const response = await axios.post(`${API_URL}/api/chat/send`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data?.success) {
                const msg = response.data.message;
                setMessages(prev => [...prev, msg]);
                
                // Notify via socket
                socket.emit('sendMessage', {
                    senderId: userId,
                    receiverId: adminId,
                    message: '',
                    messageType: msg.messageType,
                    fileUrl: msg.fileUrl,
                    fileName: msg.fileName,
                    tempId: Date.now().toString()
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploadingFile(false);
            fileInputRef.current.value = '';
        }
    };

    // Render message status ticks
    const renderStatus = (message) => {
        if (message.senderId?._id !== userId && message.senderId !== userId) return null;
        
        switch (message.status) {
            case 'sent':
                return <span className="tick single" data-testid="tick-sent">✓</span>;
            case 'delivered':
                return <span className="tick double" data-testid="tick-delivered">✓✓</span>;
            case 'seen':
                return <span className="tick double blue" data-testid="tick-seen">✓✓</span>;
            default:
                return <span className="tick single" data-testid="tick-pending">✓</span>;
        }
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="chat-loader-container" data-testid="chat-loader">
                <div className="loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <div className="chat-not-auth" data-testid="chat-not-auth">
                <div className="not-auth-content">
                    <div className="not-auth-icon">💬</div>
                    <h2>Please Sign In to Start Chat</h2>
                    <p>You need to be signed in to chat with our support team</p>
                    <Link to="/SignIn" className="signin-btn" data-testid="signin-link">
                        Sign In
                    </Link>
                    <p className="signup-text">
                        Don't have an account? <Link to="/SignUp">Sign Up</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container" data-testid="chat-container">
            {/* Chat Header */}
            <div className="chat-header" data-testid="chat-header">
                <div className="back-arrow" onClick={() => navigate(-1)}>
                    <span>←</span>
                </div>
                <div className="header-info">
                    <div className="admin-avatar">
                        {adminInfo?.image ? (
                            <img src={adminInfo.image} alt="Admin" />
                        ) : (
                            <div className="avatar-placeholder">S</div>
                        )}
                        <span className={`online-dot ${isAdminOnline ? 'online' : 'offline'}`} 
                              data-testid="admin-online-status"></span>
                    </div>
                    <div className="header-text">
                        <h3>Support Team</h3>
                        <span className="status-text">
                            {isTyping ? 'typing...' : isAdminOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area" data-testid="messages-area">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.senderId?._id === userId || msg.senderId === userId;
                        return (
                            <div 
                                key={msg._id || msg.tempId || index} 
                                className={`message ${isMine ? 'sent' : 'received'}`}
                                data-testid={`message-${isMine ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">
                                    {msg.messageType === 'image' && msg.fileUrl && (
                                        <img 
                                            src={`${API_URL}${msg.fileUrl}`} 
                                            alt="Shared" 
                                            className="message-image"
                                            onClick={() => window.open(`${API_URL}${msg.fileUrl}`, '_blank')}
                                        />
                                    )}
                                    {msg.messageType === 'file' && msg.fileUrl && (
                                        <a 
                                            href={`${API_URL}${msg.fileUrl}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="file-link"
                                        >
                                            📎 {msg.fileName || 'Download File'}
                                        </a>
                                    )}
                                    {msg.message && <p>{msg.message}</p>}
                                    <div className="message-meta">
                                        <span className="time">{formatTime(msg.createdAt)}</span>
                                        {renderStatus(msg)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {isTyping && (
                    <div className="typing-indicator" data-testid="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="chat-input-area" onSubmit={sendMessage} data-testid="chat-input-form">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                    data-testid="file-input"
                />
                <button 
                    type="button" 
                    className="attach-btn"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploadingFile}
                    data-testid="attach-btn"
                >
                    {uploadingFile ? '...' : '📎'}
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="message-input"
                    data-testid="message-input"
                />
                <button 
                    type="submit" 
                    className="send-btn"
                    disabled={!newMessage.trim()}
                    data-testid="send-btn"
                >
                    ➤
                </button>
            </form>
        </div>
    );
};

export default Chat;
