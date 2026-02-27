import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminPanel.css';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeVisitors, setActiveVisitors] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        pendingOrders: 0,
        todayOrders: 0,
        newUsersToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');

    useEffect(() => {
        // Initialize Socket.IO connection
        const socket = io(process.env.REACT_APP_API_BASE_URL, {
            path: '/api/socket.io/',
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('Admin connected to socket');
            setIsConnected(true);
            socket.emit('getVisitorCount');
        });

        socket.on('visitorCount', (data) => {
            setActiveVisitors(data.count);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        fetchDashboardStats();

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            
            const [productsRes, usersRes, ordersRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`, { withCredentials: true }),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users`, { withCredentials: true }).catch(() => ({ data: { users: [] } })),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/orders`, { withCredentials: true }).catch(() => ({ data: { orders: [] } }))
            ]);

            const orders = ordersRes.data?.orders || [];
            const users = usersRes.data?.users || [];
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            
            // Calculate today's stats
            const today = new Date().toDateString();
            const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
            const newUsersToday = users.filter(u => {
                const loginHistory = u.loginHistory || [];
                if (loginHistory.length === 1) {
                    return true; // Only one login means new user
                }
                return false;
            }).length;

            setStats({
                totalProducts: productsRes.data?.length || 0,
                totalUsers: users.length,
                totalOrders: orders.length,
                pendingOrders,
                todayOrders,
                newUsersToday
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid', path: '/AdminPanel' },
        { id: 'products', label: 'Products', icon: 'package', path: '/AdminProducts' },
        { id: 'orders', label: 'Orders', icon: 'file-text', path: '/AdminOrders' },
        { id: 'users', label: 'Users', icon: 'users', path: '/AdminUsers' },
        { id: 'analytics', label: 'Analytics', icon: 'trending-up', path: '/AdminVisitors' },
        { id: 'messages', label: 'Messages', icon: 'message-square', path: '/UserList' }
    ];

    const renderIcon = (iconName) => {
        const icons = {
            'grid': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
            'package': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
            'file-text': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
            'users': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
            'trending-up': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
            'message-square': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
            'home': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        };
        return icons[iconName] || null;
    };

    return (
        <div className="admin-panel" data-testid="admin-panel">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">W</div>
                        <div className="sidebar-logo-text">Web<span>Verse</span></div>
                    </div>
                </div>
                
                <div className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main Menu</div>
                        {menuItems.map((item) => (
                            <Link 
                                key={item.id}
                                to={item.path}
                                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                                data-testid={`nav-${item.id}`}
                            >
                                {renderIcon(item.icon)}
                                <span>{item.label}</span>
                                {item.id === 'orders' && stats.pendingOrders > 0 && (
                                    <span className="nav-badge">{stats.pendingOrders}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-item">
                        {renderIcon('home')}
                        <span>Back to Store</span>
                    </Link>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Dashboard Overview</h1>
                        <p className="header-subtitle">Welcome back! Here's what's happening today.</p>
                    </div>
                    <div className="header-right">
                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            <span className="status-dot"></span>
                            {isConnected ? 'Live' : 'Reconnecting...'}
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="admin-loading">
                        <div className="loader"><span></span><span></span><span></span></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="stats-grid">
                            {/* Active Visitors Card - Clickable */}
                            <Link to="/AdminVisitors" className="stat-card visitors-card clickable" data-testid="active-visitors-card">
                                <div className="stat-card-header">
                                    <div className="stat-icon visitors">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 6v6l4 2"></path>
                                        </svg>
                                    </div>
                                    <div className="live-indicator">
                                        <span className="live-dot"></span>
                                        LIVE
                                    </div>
                                </div>
                                <div className="stat-value">{formatNumber(activeVisitors)}</div>
                                <div className="stat-label">Active Visitors</div>
                                <div className="stat-subtitle">Currently on site</div>
                            </Link>

                            {/* Total Users */}
                            <Link to="/AdminUsers" className="stat-card clickable" data-testid="total-users-card">
                                <div className="stat-card-header">
                                    <div className="stat-icon users">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-value">{formatNumber(stats.totalUsers)}</div>
                                <div className="stat-label">Total Users</div>
                                <div className="stat-subtitle">+{stats.newUsersToday} new today</div>
                            </Link>

                            {/* Total Products */}
                            <Link to="/AdminProducts" className="stat-card clickable" data-testid="total-products-card">
                                <div className="stat-card-header">
                                    <div className="stat-icon products">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                            <line x1="3" y1="6" x2="21" y2="6"></line>
                                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-value">{formatNumber(stats.totalProducts)}</div>
                                <div className="stat-label">Products</div>
                                <div className="stat-subtitle">In catalog</div>
                            </Link>

                            {/* Total Orders */}
                            <Link to="/AdminOrders" className="stat-card clickable" data-testid="total-orders-card">
                                <div className="stat-card-header">
                                    <div className="stat-icon orders">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                    </div>
                                    {stats.pendingOrders > 0 && (
                                        <span className="pending-badge">{stats.pendingOrders} pending</span>
                                    )}
                                </div>
                                <div className="stat-value">{formatNumber(stats.totalOrders)}</div>
                                <div className="stat-label">Total Orders</div>
                                <div className="stat-subtitle">+{stats.todayOrders} today</div>
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-section">
                            <div className="section-header">
                                <h2>Quick Actions</h2>
                            </div>
                            <div className="quick-actions-grid">
                                <Link to="/AdminProducts" className="quick-action-card" data-testid="quick-action-products">
                                    <div className="action-icon products">
                                        {renderIcon('package')}
                                    </div>
                                    <div className="action-content">
                                        <span className="action-title">Manage Products</span>
                                        <span className="action-desc">Add, edit or remove products</span>
                                    </div>
                                    <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </Link>
                                <Link to="/AdminOrders" className="quick-action-card" data-testid="quick-action-orders">
                                    <div className="action-icon orders">
                                        {renderIcon('file-text')}
                                    </div>
                                    <div className="action-content">
                                        <span className="action-title">View Orders</span>
                                        <span className="action-desc">Process and track orders</span>
                                    </div>
                                    <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </Link>
                                <Link to="/AdminUsers" className="quick-action-card" data-testid="quick-action-users">
                                    <div className="action-icon users">
                                        {renderIcon('users')}
                                    </div>
                                    <div className="action-content">
                                        <span className="action-title">User Management</span>
                                        <span className="action-desc">View user activity and history</span>
                                    </div>
                                    <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </Link>
                                <Link to="/AdminVisitors" className="quick-action-card" data-testid="quick-action-analytics">
                                    <div className="action-icon analytics">
                                        {renderIcon('trending-up')}
                                    </div>
                                    <div className="action-content">
                                        <span className="action-title">Analytics & Visitors</span>
                                        <span className="action-desc">Live stats and daily reports</span>
                                    </div>
                                    <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </Link>
                                <Link to="/UserList" className="quick-action-card" data-testid="quick-action-messages">
                                    <div className="action-icon messages">
                                        {renderIcon('message-square')}
                                    </div>
                                    <div className="action-content">
                                        <span className="action-title">Customer Messages</span>
                                        <span className="action-desc">Respond to customer inquiries</span>
                                    </div>
                                    <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;
