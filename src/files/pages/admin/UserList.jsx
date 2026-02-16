import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import '../../styles/admin/UserList.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_BASE_URL;
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL;

    // Check admin status
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                // First verify token
                const tokenRes = await axios.get(`${API_URL}/api/verifytoken`, {
                    withCredentials: true
                });
                
                if (!tokenRes.data?.success) {
                    navigate('/SignIn');
                    return;
                }
                
                setUserId(tokenRes.data.userId);

                // Then check if admin
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
                navigate('/SignIn');
            }
        };
        checkAdmin();
    }, [API_URL, navigate]);

    // Fetch users with chats
    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/chat/users`, {
                withCredentials: true
            });
            
            if (response.data?.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, fetchUsers]);

    // Socket connection
    useEffect(() => {
        if (!isAdmin || !userId) return;

        const newSocket = io(SOCKET_URL, {
            path: '/api/socket.io/',
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Admin socket connected');
            newSocket.emit('register', { userId });
        });

        newSocket.on('onlineUsers', (users) => {
            setOnlineUsers(new Set(users));
        });

        newSocket.on('userOnline', ({ userId: onlineUserId, online }) => {
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                if (online) {
                    updated.add(onlineUserId);
                } else {
                    updated.delete(onlineUserId);
                }
                return updated;
            });
        });

        newSocket.on('newMessage', () => {
            // Refresh user list on new message
            fetchUsers();
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAdmin, userId, SOCKET_URL, fetchUsers]);

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    // Loading state
    if (isLoading || isAdmin === null) {
        return (
            <div className="chat-loader-container" data-testid="userlist-loader">
                <div className="loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    return (
        <div className="userlist-container" data-testid="userlist-container">
            <div className="userlist-header" data-testid="userlist-header">
                <div className="back-arrow" onClick={() => navigate(-1)}>
                    <span>←</span>
                </div>
                <h2>Chats</h2>
            </div>

            <div className="userlist-content" data-testid="userlist-content">
                {users.length === 0 ? (
                    <div className="no-users" data-testid="no-users">
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    users.map(user => (
                        <div 
                            key={user._id} 
                            className="user-item"
                            onClick={() => navigate(`/AdminChat/${user._id}`)}
                            data-testid={`user-item-${user._id}`}
                        >
                            <div className="user-avatar">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className={`online-dot ${onlineUsers.has(user._id) ? 'online' : 'offline'}`}></span>
                            </div>
                            
                            <div className="user-info">
                                <div className="user-top">
                                    <h4>{user.name}</h4>
                                    <span className="last-time">
                                        {formatTime(user.lastMessageTime)}
                                    </span>
                                </div>
                                <div className="user-bottom">
                                    <p className="last-message">
                                        {user.lastMessage?.messageType === 'image' && '📷 Photo'}
                                        {user.lastMessage?.messageType === 'file' && '📎 File'}
                                        {user.lastMessage?.messageType === 'text' && 
                                            (user.lastMessage?.message?.substring(0, 35) + 
                                            (user.lastMessage?.message?.length > 35 ? '...' : ''))}
                                        {!user.lastMessage && 'No messages yet'}
                                    </p>
                                    {user.unreadCount > 0 && (
                                        <span className="unread-badge" data-testid="unread-badge">
                                            {user.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserList;
