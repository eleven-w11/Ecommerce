import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [expandedUser, setExpandedUser] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        activeToday: 0,
        googleUsers: 0
    });

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
            const usersData = response.data?.users || [];
            setUsers(usersData);
            calculateStats(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (usersData) => {
        const today = new Date().toDateString();
        const todayStr = formatDateShort(new Date());

        let newUsersToday = 0;
        let activeToday = 0;
        let googleUsers = 0;

        usersData.forEach(user => {
            // Check if Google user
            if (user.isGoogleUser || user.googleId) {
                googleUsers++;
            }

            // Check login history
            const loginHistory = user.loginHistory || [];
            if (loginHistory.length > 0) {
                // Check if user logged in today
                const loggedInToday = loginHistory.some(login => {
                    const loginDate = parseLoginDate(login);
                    return loginDate && loginDate.toDateString() === today;
                });
                if (loggedInToday) activeToday++;

                // Check if new user (first login today)
                if (loginHistory.length === 1) {
                    const firstLogin = parseLoginDate(loginHistory[0]);
                    if (firstLogin && firstLogin.toDateString() === today) {
                        newUsersToday++;
                    }
                }
            }
        });

        setStats({
            totalUsers: usersData.length,
            newUsersToday,
            activeToday,
            googleUsers
        });
    };

    const parseLoginDate = (loginStr) => {
        // Format: "DD-MM-YYYY HH:mm:ss"
        if (!loginStr) return null;
        const [datePart, timePart] = loginStr.split(' ');
        if (!datePart) return null;
        const [day, month, year] = datePart.split('-');
        if (!day || !month || !year) return null;
        return new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
    };

    const formatDateShort = (date) => {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    };

    const formatDateDisplay = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    const getFilteredUsers = () => {
        let filtered = [...users];
        const today = new Date().toDateString();

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply type filter
        if (filter === 'google') {
            filtered = filtered.filter(user => user.isGoogleUser || user.googleId);
        } else if (filter === 'local') {
            filtered = filtered.filter(user => !user.isGoogleUser && !user.googleId);
        } else if (filter === 'new') {
            filtered = filtered.filter(user => {
                const loginHistory = user.loginHistory || [];
                if (loginHistory.length === 1) {
                    const firstLogin = parseLoginDate(loginHistory[0]);
                    return firstLogin && firstLogin.toDateString() === today;
                }
                return false;
            });
        } else if (filter === 'returning') {
            filtered = filtered.filter(user => {
                const loginHistory = user.loginHistory || [];
                if (loginHistory.length > 1) {
                    const loggedInToday = loginHistory.some(login => {
                        const loginDate = parseLoginDate(login);
                        return loginDate && loginDate.toDateString() === today;
                    });
                    return loggedInToday;
                }
                return false;
            });
        }

        // Apply date filter
        if (dateFilter === 'today') {
            filtered = filtered.filter(user => {
                const loginHistory = user.loginHistory || [];
                return loginHistory.some(login => {
                    const loginDate = parseLoginDate(login);
                    return loginDate && loginDate.toDateString() === today;
                });
            });
        } else if (dateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(user => {
                const loginHistory = user.loginHistory || [];
                return loginHistory.some(login => {
                    const loginDate = parseLoginDate(login);
                    return loginDate && loginDate >= weekAgo;
                });
            });
        } else if (dateFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(user => {
                const loginHistory = user.loginHistory || [];
                return loginHistory.some(login => {
                    const loginDate = parseLoginDate(login);
                    return loginDate && loginDate >= monthAgo;
                });
            });
        }

        return filtered;
    };

    const groupUsersByDate = (users) => {
        const groups = {};
        
        users.forEach(user => {
            const loginHistory = user.loginHistory || [];
            if (loginHistory.length > 0) {
                // Get the most recent login
                const lastLogin = loginHistory[loginHistory.length - 1];
                const loginDate = parseLoginDate(lastLogin);
                if (loginDate) {
                    const dateKey = loginDate.toDateString();
                    if (!groups[dateKey]) {
                        groups[dateKey] = {
                            date: loginDate,
                            users: []
                        };
                    }
                    groups[dateKey].users.push(user);
                }
            } else {
                // No login history - group under "Never Logged In"
                if (!groups['never']) {
                    groups['never'] = {
                        date: null,
                        users: []
                    };
                }
                groups['never'].users.push(user);
            }
        });

        // Sort by date (most recent first)
        return Object.values(groups).sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date;
        });
    };

    const toggleUserExpand = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const getUserImage = (user) => {
        if (user.image) {
            if (user.image.startsWith('http') || user.image.startsWith('/uploads')) {
                return user.image.startsWith('/uploads') 
                    ? `${process.env.REACT_APP_API_BASE_URL}${user.image}`
                    : user.image;
            }
            return `${process.env.PUBLIC_URL}${user.image}`;
        }
        return `${process.env.PUBLIC_URL}/user.png`;
    };

    const filteredUsers = getFilteredUsers();
    const groupedUsers = groupUsersByDate(filteredUsers);

    return (
        <div className="admin-users" data-testid="admin-users">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">W</div>
                        <div className="sidebar-logo-text">Web<span>Verse</span></div>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main Menu</div>
                        <Link to="/AdminPanel" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/AdminProducts" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <span>Products</span>
                        </Link>
                        <Link to="/AdminOrders" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span>Orders</span>
                        </Link>
                        <Link to="/AdminUsers" className="nav-item active">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            <span>Users</span>
                        </Link>
                        <Link to="/AdminVisitors" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            <span>Analytics</span>
                        </Link>
                        <Link to="/UserList" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>Messages</span>
                        </Link>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Back to Store</span>
                    </Link>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>User Management</h1>
                        <p className="header-subtitle">Manage and monitor your customer base</p>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="user-stats-grid">
                    <div className="user-stat-card">
                        <div className="stat-icon total">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalUsers}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>
                    <div className="user-stat-card">
                        <div className="stat-icon new">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.newUsersToday}</span>
                            <span className="stat-label">New Today</span>
                        </div>
                    </div>
                    <div className="user-stat-card">
                        <div className="stat-icon active">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.activeToday}</span>
                            <span className="stat-label">Active Today</span>
                        </div>
                    </div>
                    <div className="user-stat-card">
                        <div className="stat-icon google">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.googleUsers}</span>
                            <span className="stat-label">Google Users</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            data-testid="search-users-input"
                        />
                    </div>
                    <div className="filter-buttons">
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                            data-testid="user-type-filter"
                        >
                            <option value="all">All Users</option>
                            <option value="new">New Users Today</option>
                            <option value="returning">Returning Users Today</option>
                            <option value="google">Google Users</option>
                            <option value="local">Local Auth Users</option>
                        </select>
                        <select 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="filter-select"
                            data-testid="date-filter"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="results-summary">
                    Showing {filteredUsers.length} of {users.length} users
                </div>

                {/* Users List - Grouped by Date */}
                {loading ? (
                    <div className="admin-loading">
                        <div className="loader"><span></span><span></span><span></span></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        <h3>No users found</h3>
                        <p>Try adjusting your filters or search term</p>
                    </div>
                ) : (
                    <div className="users-grouped">
                        {groupedUsers.map((group, groupIndex) => (
                            <div key={groupIndex} className="date-group">
                                <div className="date-group-header">
                                    <h3>
                                        {group.date 
                                            ? formatDateDisplay(group.date)
                                            : 'Never Logged In'
                                        }
                                    </h3>
                                    <span className="user-count">{group.users.length} users</span>
                                </div>
                                <div className="users-list">
                                    {group.users.map((user) => (
                                        <div 
                                            key={user._id} 
                                            className={`user-card ${expandedUser === user._id ? 'expanded' : ''}`}
                                            data-testid={`user-card-${user._id}`}
                                        >
                                            <div 
                                                className="user-card-main"
                                                onClick={() => toggleUserExpand(user._id)}
                                            >
                                                <div className="user-avatar">
                                                    <img 
                                                        src={getUserImage(user)} 
                                                        alt={user.name}
                                                        onError={(e) => { e.target.src = `${process.env.PUBLIC_URL}/user.png`; }}
                                                    />
                                                    {(user.isGoogleUser || user.googleId) && (
                                                        <span className="google-badge" title="Google User">G</span>
                                                    )}
                                                </div>
                                                <div className="user-info">
                                                    <h4>{user.name}</h4>
                                                    <p>{user.email}</p>
                                                </div>
                                                <div className="user-meta">
                                                    <span className="login-count">
                                                        {user.loginHistory?.length || 0} logins
                                                    </span>
                                                </div>
                                                <svg 
                                                    className="expand-icon" 
                                                    width="20" 
                                                    height="20" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2"
                                                >
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </div>
                                            {expandedUser === user._id && (
                                                <div className="user-card-details">
                                                    <div className="detail-section">
                                                        <h5>Login History</h5>
                                                        {user.loginHistory && user.loginHistory.length > 0 ? (
                                                            <div className="login-history-list">
                                                                {user.loginHistory.slice().reverse().map((login, idx) => (
                                                                    <div key={idx} className="login-entry">
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <circle cx="12" cy="12" r="10"></circle>
                                                                            <polyline points="12 6 12 12 16 14"></polyline>
                                                                        </svg>
                                                                        <span>{login}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="no-data">No login history available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminUsers;
