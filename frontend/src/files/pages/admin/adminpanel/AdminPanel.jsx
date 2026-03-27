import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminPanel.css';

const AdminPanel = () => {
    const location = useLocation();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        pendingOrders: 0,
        todayOrders: 0,
        newUsersToday: 0
    });
    const [loading, setLoading] = useState(true);

    const navItems = [
        { path: '/AdminPanel', label: 'Dashboard' },
        { path: '/AdminProducts', label: 'Products' },
        { path: '/AdminOrders', label: 'Orders' },
        { path: '/AdminUsers', label: 'Users' },
        { path: '/UserList', label: 'Messages' }
    ];

    useEffect(() => {
        fetchDashboardStats();
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
            
            const today = new Date().toDateString();
            const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
            const newUsersToday = users.filter(u => {
                const loginHistory = u.loginHistory || [];
                return loginHistory.length === 1;
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

    const renderIcon = (iconName) => {
        const icons = {
            'package': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
            'file-text': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
            'users': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
            'message-square': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        };
        return icons[iconName] || null;
    };

    return (
        <div className="admin-panel" data-testid="admin-panel">
            {/* Top Navigation Bar */}
            <nav className="admin-topnav" data-testid="admin-nav">
                <Link to="/AdminPanel" className="admin-brand">Admin Panel</Link>
                <div className="admin-links">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={location.pathname === item.path ? 'active' : ''}
                            data-testid={`nav-${item.label.toLowerCase()}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <Link to="/" className="back-link" data-testid="back-to-store">← Back to Store</Link>
            </nav>

            {/* Full Width Main Content */}
            <main className="admin-main-full" data-testid="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Dashboard Overview</h1>
                        <p className="header-subtitle">Welcome back! Here's what's happening today.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="admin-loading">
                        <div className="loader"><span></span><span></span><span></span></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid - 3 cards (removed Active Visitors) */}
                        <div className="stats-grid-full">
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

                        {/* Quick Actions - 4 cards (removed Analytics & Visitors) */}
                        <div className="quick-actions-section">
                            <div className="section-header">
                                <h2>Quick Actions</h2>
                            </div>
                            <div className="quick-actions-grid-full">
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
