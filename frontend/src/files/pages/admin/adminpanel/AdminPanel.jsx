import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminPanel.css';

const AdminPanel = () => {
    const location = useLocation();
    const [activeVisitors, setActiveVisitors] = useState(0);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        pendingOrders: 0,
        todayOrders: 0,
        newUsersToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const socket = io(process.env.REACT_APP_API_BASE_URL, {
            path: '/api/socket.io/',
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socket.on('connect', () => {
            socket.emit('getVisitorCount');
        });

        socket.on('visitorCount', (data) => {
            setActiveVisitors(data.count);
        });

        fetchDashboardStats();

        return () => socket.disconnect();
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

            setStats({
                totalProducts: productsRes.data?.length || 0,
                totalUsers: users.length,
                totalOrders: orders.length,
                pendingOrders,
                todayOrders,
                newUsersToday: 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { path: '/AdminPanel', label: 'Dashboard' },
        { path: '/AdminProducts', label: 'Products' },
        { path: '/AdminOrders', label: 'Orders' },
        { path: '/AdminUsers', label: 'Users' },
        { path: '/AdminVisitors', label: 'Analytics' },
        { path: '/UserList', label: 'Messages' }
    ];

    return (
        <div className="admin-container">
            {/* Simple Admin Navbar */}
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
                    <Link to="/" className="back-to-store">
                        Back to Store
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="admin-content">
                <div className="admin-page-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your store overview.</p>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="stats-row">
                            <div className="stat-card">
                                <div className="stat-icon green">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 6v6l4 2"></path>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-number">{activeVisitors}</span>
                                    <span className="stat-label">Active Visitors</span>
                                </div>
                                <span className="live-badge">LIVE</span>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon blue">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.totalUsers}</span>
                                    <span className="stat-label">Total Users</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon orange">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.totalProducts}</span>
                                    <span className="stat-label">Products</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon purple">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.totalOrders}</span>
                                    <span className="stat-label">Total Orders</span>
                                </div>
                                {stats.pendingOrders > 0 && (
                                    <span className="pending-badge">{stats.pendingOrders} pending</span>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="actions-grid">
                                <Link to="/AdminProducts" className="action-card">
                                    <span className="action-icon orange">📦</span>
                                    <span className="action-title">Manage Products</span>
                                    <span className="action-desc">Add, edit or remove products</span>
                                </Link>
                                <Link to="/AdminOrders" className="action-card">
                                    <span className="action-icon purple">📋</span>
                                    <span className="action-title">View Orders</span>
                                    <span className="action-desc">Process and track orders</span>
                                </Link>
                                <Link to="/AdminUsers" className="action-card">
                                    <span className="action-icon blue">👥</span>
                                    <span className="action-title">User Management</span>
                                    <span className="action-desc">View user activity</span>
                                </Link>
                                <Link to="/AdminVisitors" className="action-card">
                                    <span className="action-icon green">📊</span>
                                    <span className="action-title">Analytics</span>
                                    <span className="action-desc">View site statistics</span>
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
