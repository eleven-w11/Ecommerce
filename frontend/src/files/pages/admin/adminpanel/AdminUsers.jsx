import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminUsers.css';

const AdminUsers = () => {
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [expandedUser, setExpandedUser] = useState(null);

    const navItems = [
        { path: '/AdminPanel', label: 'Dashboard' },
        { path: '/AdminProducts', label: 'Products' },
        { path: '/AdminOrders', label: 'Orders' },
        { path: '/AdminUsers', label: 'Users' },
        { path: '/AdminVisitors', label: 'Analytics' },
        { path: '/UserList', label: 'Messages' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/users`,
                { withCredentials: true }
            );
            setUsers(response.data?.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const parseLoginDate = (loginStr) => {
        if (!loginStr) return null;
        const [datePart, timePart] = loginStr.split(' ');
        if (!datePart) return null;
        const [day, month, year] = datePart.split('-');
        if (!day || !month || !year) return null;
        return new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
    };

    const getFilteredUsers = () => {
        let filtered = [...users];
        const today = new Date().toDateString();

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filter === 'google') {
            filtered = filtered.filter(user => user.isGoogleUser || user.googleId);
        } else if (filter === 'local') {
            filtered = filtered.filter(user => !user.isGoogleUser && !user.googleId);
        } else if (filter === 'today') {
            filtered = filtered.filter(user => {
                const loginHistory = user.loginHistory || [];
                return loginHistory.some(login => {
                    const loginDate = parseLoginDate(login);
                    return loginDate && loginDate.toDateString() === today;
                });
            });
        }

        return filtered;
    };

    const getUserImage = (user) => {
        if (user.image) {
            if (user.image.startsWith('http') || user.image.startsWith('/uploads')) {
                return user.image.startsWith('/uploads') 
                    ? `${process.env.REACT_APP_API_BASE_URL}${user.image}`
                    : user.image;
            }
        }
        return '/user.png';
    };

    const filteredUsers = getFilteredUsers();
    const googleUsers = users.filter(u => u.isGoogleUser || u.googleId).length;
    const today = new Date().toDateString();
    const activeToday = users.filter(u => {
        const loginHistory = u.loginHistory || [];
        return loginHistory.some(login => {
            const loginDate = parseLoginDate(login);
            return loginDate && loginDate.toDateString() === today;
        });
    }).length;

    return (
        <div className="admin-container">
            {/* Admin Navbar */}
            <nav className="admin-navbar">
                <div className="admin-nav-left">
                    <Link to="/AdminPanel" className="admin-logo">
                        <span className="logo-icon">W</span>
                        <span className="logo-text">Admin Panel</span>
                    </Link>
                </div>
                <div className="admin-nav-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="admin-nav-right">
                    <Link to="/" className="back-to-store">Back to Store</Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="admin-content">
                <div className="admin-page-header">
                    <h1>Users</h1>
                    <p>Manage and view your customer base</p>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card mini">
                        <span className="stat-number">{users.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                    <div className="stat-card mini">
                        <span className="stat-number">{activeToday}</span>
                        <span className="stat-label">Active Today</span>
                    </div>
                    <div className="stat-card mini">
                        <span className="stat-number">{googleUsers}</span>
                        <span className="stat-label">Google Users</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-row">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                        <option value="all">All Users</option>
                        <option value="today">Active Today</option>
                        <option value="google">Google Users</option>
                        <option value="local">Local Users</option>
                    </select>
                </div>

                <p className="results-count">Showing {filteredUsers.length} of {users.length} users</p>

                {/* Users List */}
                {loading ? (
                    <div className="admin-loading"><div className="spinner"></div></div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state"><p>No users found</p></div>
                ) : (
                    <div className="users-list">
                        {filteredUsers.map((user) => (
                            <div key={user._id} className={`user-card ${expandedUser === user._id ? 'expanded' : ''}`}>
                                <div className="user-main" onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}>
                                    <div className="user-avatar">
                                        <img src={getUserImage(user)} alt={user.name} onError={(e) => { e.target.src = '/user.png'; }} />
                                        {(user.isGoogleUser || user.googleId) && <span className="google-badge">G</span>}
                                    </div>
                                    <div className="user-info">
                                        <h4>{user.name}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="user-meta">
                                        <span className="login-count">{user.loginHistory?.length || 0} logins</span>
                                        <span className="expand-arrow">{expandedUser === user._id ? '▲' : '▼'}</span>
                                    </div>
                                </div>
                                {expandedUser === user._id && (
                                    <div className="user-details">
                                        <h5>Login History</h5>
                                        {user.loginHistory && user.loginHistory.length > 0 ? (
                                            <div className="login-list">
                                                {user.loginHistory.slice().reverse().map((login, idx) => (
                                                    <div key={idx} className="login-item">{login}</div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-data">No login history</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminUsers;
