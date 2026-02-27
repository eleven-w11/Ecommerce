import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminUsers.css';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/users`, {
                withCredentials: true
            });
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`;
        return imagePath;
    };

    const formatLoginTime = (loginTime) => {
        // loginTime format: "DD-MM-YYYY HH:mm:ss"
        if (!loginTime) return 'N/A';
        const parts = loginTime.split(' ');
        if (parts.length !== 2) return loginTime;
        
        const dateParts = parts[0].split('-');
        if (dateParts.length !== 3) return loginTime;
        
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1]}`);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-users-page">
                <div className="loading-container">
                    <div className="loader"><span></span><span></span><span></span></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-users-page">
            <header className="users-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/AdminPanel')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <h1>All Users</h1>
                </div>
                <div className="header-right">
                    <span className="stat-badge">{users.length} Users</span>
                </div>
            </header>

            <div className="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input 
                    type="text" 
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="users-content">
                {filteredUsers.length === 0 ? (
                    <div className="no-users">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="users-grid">
                        {filteredUsers.map(user => (
                            <div 
                                key={user._id} 
                                className={`user-card ${selectedUser === user._id ? 'expanded' : ''}`}
                                onClick={() => setSelectedUser(selectedUser === user._id ? null : user._id)}
                            >
                                <div className="user-main">
                                    <div className="user-avatar">
                                        {user.image ? (
                                            <img src={getImageUrl(user.image)} alt={user.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        {user.isGoogleUser && (
                                            <span className="google-badge" title="Google User">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <h3>{user.name}</h3>
                                        <p>{user.email}</p>
                                        <span className="login-count">{user.loginHistory?.length || 0} logins</span>
                                    </div>
                                    <div className="expand-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </div>
                                </div>

                                {selectedUser === user._id && (
                                    <div className="user-login-history">
                                        <h4>Login History</h4>
                                        {user.loginHistory && user.loginHistory.length > 0 ? (
                                            <div className="login-list">
                                                {user.loginHistory.slice().reverse().map((login, idx) => (
                                                    <div key={idx} className="login-item">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <polyline points="12 6 12 12 16 14"/>
                                                        </svg>
                                                        <span>{formatLoginTime(login)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-logins">No login history</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
