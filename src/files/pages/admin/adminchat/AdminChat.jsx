import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import '../../../styles/admin/adminchat/AdminChat.css';

const AdminChat = () => {
    const { odirUserId } = useParams();
    const [isAdmin, setIsAdmin] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [isUserOnline, setIsUserOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [error, setError] = useState(''); // Error state
    
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_BASE_URL;
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL;

    // Improved scroll to bottom
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Auto-hide error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Check admin status and get admin ID
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const tokenRes = await axios.get(`${API_URL}/api/verifytoken`, {
                    withCredentials: true
                });
                
                if (!tokenRes.data?.success) {
                    navigate('/SignIn');
                    return;
                }
                
                setAdminId(tokenRes.data.userId);

                const adminRes = await axios.get(`${API_URL}/api/chat/is-admin`, {
                    withCredentials: true
                });
                
                if (!adminRes.data?.isAdmin) {
                    navigate('/');
                    return;
                }
                
                setIsAdmin(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                setError('Authentication failed. Please sign in again.');
                navigate('/SignIn');
            }
        };
        checkAdmin();
    }, [API_URL, navigate]);

    // Fetch other user info
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!isAdmin || !odirUserId) return;
            
            try {
                // Get user info from users list
                const response = await axios.get(`${API_URL}/api/chat/users`, {
                    withCredentials: true
                });
                
                if (response.data?.success) {
                    const user = response.data.users.find(u => u._id === odirUserId);
                    if (user) {
                        setOtherUser(user);
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                setError('Failed to load user information.');
            }
        };
        fetchUserInfo();
    }, [isAdmin, odirUserId, API_URL]);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        if (!odirUserId) return;
        
        try {
            const response = await axios.get(`${API_URL}/api/chat/messages/${odirUserId}`, {
                withCredentials: true
            });
            if (response.data?.success) {
                setMessages(response.data.messages);
                scrollToBottom('auto');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages. Please refresh the page.');
        } finally {
            setIsLoading(false);
        }
    }, [odirUserId, API_URL, scrollToBottom]);

    useEffect(() => {
        if (isAdmin) {
            fetchMessages();
        }
    }, [isAdmin, fetchMessages]);

    // Socket connection
    useEffect(() => {
        if (!isAdmin || !adminId) return;

        const newSocket = io(SOCKET_URL, {
            path: '/api/socket.io/',
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Admin chat socket connected');
            newSocket.emit('register', { userId: adminId });
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setError('Connection error. Messages may be delayed.');
        });

        newSocket.on('onlineUsers', (users) => {
            setIsUserOnline(users.includes(odirUserId));
        });

        newSocket.on('userOnline', ({ userId: onlineUserId, online }) => {
            if (onlineUserId === odirUserId) {
                setIsUserOnline(online);
            }
        });

        newSocket.on('newMessage', (message) => {
            // Only add if it's from the current conversation and not duplicate
            if (message.senderId?._id === odirUserId || message.senderId === odirUserId) {
                setMessages(prev => {
                    const exists = prev.some(m => m._id === message._id);
                    if (exists) return prev;
                    return [...prev, message];
                });
                // Mark as seen
                newSocket.emit('markSeen', { senderId: odirUserId, receiverId: adminId });
                scrollToBottom();
            }
        });

        newSocket.on('messageSent', (message) => {
            setMessages(prev => {
                // Replace temp message with confirmed one (status: sent)
                const filtered = prev.filter(m => 
                    m.tempId !== message.tempId && m._id !== message._id
                );
                return [...filtered, { ...message, status: 'sent' }];
            });
            scrollToBottom();
        });

        // Single message delivered
        newSocket.on('messageDelivered', ({ messageId, tempId }) => {
            setMessages(prev => prev.map(m => {
                if (m._id === messageId || m.tempId === tempId) {
                    return { ...m, status: 'delivered' };
                }
                return m;
            }));
        });

        // Multiple messages delivered (when user comes online)
        newSocket.on('messagesDelivered', ({ messageIds, recipientId }) => {
            if (recipientId === odirUserId) {
                setMessages(prev => prev.map(m => {
                    if (messageIds.includes(m._id) || messageIds.includes(m._id?.toString())) {
                        return { ...m, status: 'delivered' };
                    }
                    return m;
                }));
            }
        });

        newSocket.on('messagesSeen', ({ by }) => {
            // Only update messages sent to the person who saw them
            if (by === odirUserId) {
                setMessages(prev => prev.map(m => {
                    const isMine = m.senderId?._id === adminId || m.senderId === adminId;
                    if (isMine && m.status !== 'seen') {
                        return { ...m, status: 'seen' };
                    }
                    return m;
                }));
            }
        });

        newSocket.on('userTyping', ({ userId: typingUserId, isTyping: typing }) => {
            if (typingUserId === odirUserId) {
                setIsTyping(typing);
            }
        });

        newSocket.on('messageError', ({ error: errMsg }) => {
            setError(errMsg || 'Failed to send message. Please try again.');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAdmin, adminId, odirUserId, SOCKET_URL, scrollToBottom]);

    // Mark messages as seen when viewing
    useEffect(() => {
        if (socket && odirUserId && adminId) {
            socket.emit('markSeen', { senderId: odirUserId, receiverId: adminId });
        }
    }, [socket, odirUserId, adminId, messages.length]);

    // Send message
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !socket || !odirUserId) return;

        const tempId = Date.now().toString();
        const tempMessage = {
            tempId,
            senderId: { _id: adminId },
            receiverId: { _id: odirUserId },
            message: newMessage,
            messageType: 'text',
            status: 'sent',
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        scrollToBottom();

        socket.emit('sendMessage', {
            senderId: adminId,
            receiverId: odirUserId,
            message: newMessage,
            messageType: 'text',
            tempId
        });

        socket.emit('typing', { senderId: adminId, receiverId: odirUserId, isTyping: false });
    };

    // Handle typing
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (socket && odirUserId) {
            socket.emit('typing', { senderId: adminId, receiverId: odirUserId, isTyping: true });
            
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { senderId: adminId, receiverId: odirUserId, isTyping: false });
            }, 2000);
        }
    };

    // Handle file upload - Fixed to prevent duplicates
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !odirUserId) return;

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            fileInputRef.current.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 
                            'application/pdf', 'text/plain', 
                            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setError('File type not supported. Please upload images, PDF, or documents.');
            fileInputRef.current.value = '';
            return;
        }

        setUploadingFile(true);
        setError('');

        // Create temp message for immediate UI feedback
        const tempId = Date.now().toString();
        const isImage = file.type.startsWith('image/');
        const tempMessage = {
            tempId,
            senderId: { _id: adminId },
            receiverId: { _id: odirUserId },
            message: '',
            messageType: isImage ? 'image' : 'file',
            fileName: file.name,
            fileUrl: isImage ? URL.createObjectURL(file) : null,
            status: 'sending',
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('receiverId', odirUserId);
        formData.append('messageType', isImage ? 'image' : 'file');

        try {
            const response = await axios.post(`${API_URL}/api/chat/send`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data?.success) {
                const msg = response.data.message;
                
                // Replace temp message with actual message
                setMessages(prev => {
                    const filtered = prev.filter(m => m.tempId !== tempId);
                    return [...filtered, msg];
                });
                
                // Notify receiver via socket (without creating duplicate)
                if (socket) {
                    socket.emit('notifyNewMessage', {
                        messageId: msg._id,
                        receiverId: odirUserId
                    });
                }
                
                scrollToBottom();
            } else {
                throw new Error(response.data?.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.tempId !== tempId));
            setError(error.response?.data?.message || 'Failed to upload file. Please try again.');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Render message status
    const renderStatus = (message) => {
        if (message.senderId?._id !== adminId && message.senderId !== adminId) return null;
        
        if (message.status === 'sending') {
            return <span className="tick sending" data-testid="tick-sending">⏳</span>;
        }
        
        switch (message.status) {
            case 'sent':
                return <span className="tick single" data-testid="tick-sent">✓</span>;
            case 'delivered':
                return <span className="tick double" data-testid="tick-delivered">✓✓</span>;
            case 'seen':
                return <span className="tick double blue" data-testid="tick-seen">✓✓</span>;
            default:
                return <span className="tick single">✓</span>;
        }
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Loading state
    if (isLoading || isAdmin === null) {
        return (
            <div className="chat-loader-container" data-testid="adminchat-loader">
                <div className="loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    return (
        <div className="adminchat-container" data-testid="adminchat-container">
            {/* Error Message */}
            {error && (
                <div className="chat-error" data-testid="chat-error">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="error-close">×</button>
                </div>
            )}

            {/* Header */}
            <div className="chat-header" data-testid="adminchat-header">
                <div className="back-arrow" onClick={() => navigate('/UserList')}>
                    <span>←</span>
                </div>
                <div className="header-info">
                    <div className="user-avatar">
                        {otherUser?.image ? (
                            <img src={otherUser.image} alt={otherUser.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className={`online-dot ${isUserOnline ? 'online' : 'offline'}`}
                              data-testid="user-online-status"></span>
                    </div>
                    <div className="header-text">
                        <h3>{otherUser?.name || 'User'}</h3>
                        <span className="status-text">
                            {isTyping ? 'typing...' : isUserOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-area" ref={messagesContainerRef} data-testid="messages-area">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.senderId?._id === adminId || msg.senderId === adminId;
                        return (
                            <div 
                                key={msg._id || msg.tempId || index} 
                                className={`message ${isMine ? 'sent' : 'received'} ${msg.status === 'sending' ? 'sending' : ''}`}
                                data-testid={`message-${isMine ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">
                                    {msg.messageType === 'image' && msg.fileUrl && (
                                        <img 
                                            src={msg.fileUrl.startsWith('blob:') ? msg.fileUrl : `${API_URL}${msg.fileUrl}`} 
                                            alt="Shared" 
                                            className="message-image"
                                            onClick={() => !msg.fileUrl.startsWith('blob:') && window.open(`${API_URL}${msg.fileUrl}`, '_blank')}
                                        />
                                    )}
                                    {msg.messageType === 'file' && (
                                        <a 
                                            href={msg.fileUrl ? `${API_URL}${msg.fileUrl}` : '#'} 
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

            {/* Input */}
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
                    {uploadingFile ? '⏳' : '📎'}
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

export default AdminChat;
