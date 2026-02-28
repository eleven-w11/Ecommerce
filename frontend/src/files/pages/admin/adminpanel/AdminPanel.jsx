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
        pendingOrders: 0
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
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [productsRes, usersRes, ordersRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`, { withCredentials: true }),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users`, { withCredentials: true }).catch(() => ({ data: { users: [] } })),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/orders`, { withCredentials: true }).catch(() => ({ data: { orders: [] } }))
            ]);

            const orders = ordersRes.data?.orders || [];
            const users = usersRes.data?.users || [];

            setStats({
                totalProducts: productsRes.data?.length || 0,
                totalUsers: users.length,
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'pending').length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page admin-dashboard" data-testid="admin-dashboard">
            {/* Top Navigation Bar */}
            <nav className="admin-nav" data-testid="admin-nav">
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

            {/* Full Width Content */}
            <div className="admin-body" data-testid="admin-body">
                <h1>Dashboard</h1>

                {loading ? (
                    <div className="loading" data-testid="loading">Loading...</div>
                ) : (
                    <>
                        {/* Stats Grid - 3 cards only (removed Active Visitors) */}
                        <div className="stats-grid" data-testid="stats-grid">
                            <div className="stat-box" data-testid="stat-users">
                                <span className="stat-num">{stats.totalUsers}</span>
                                <span className="stat-text">Total Users</span>
                            </div>
                            <div className="stat-box" data-testid="stat-products">
                                <span className="stat-num">{stats.totalProducts}</span>
                                <span className="stat-text">Products</span>
                            </div>
                            <div className="stat-box" data-testid="stat-orders">
                                <span className="stat-num">{stats.totalOrders}</span>
                                <span className="stat-text">Total Orders</span>
                                {stats.pendingOrders > 0 && (
                                    <span className="pending-badge">{stats.pendingOrders} pending</span>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions - 4 cards only (removed Analytics & Visitors) */}
                        <h2>Quick Actions</h2>
                        <div className="quick-links" data-testid="quick-links">
                            <Link to="/AdminProducts" className="quick-link" data-testid="link-products">
                                <span className="link-icon">📦</span>
                                <span className="link-title">Manage Products</span>
                                <span className="link-desc">Add, edit or remove products</span>
                            </Link>
                            <Link to="/AdminOrders" className="quick-link" data-testid="link-orders">
                                <span className="link-icon">🛒</span>
                                <span className="link-title">View Orders</span>
                                <span className="link-desc">Process and track orders</span>
                            </Link>
                            <Link to="/AdminUsers" className="quick-link" data-testid="link-users">
                                <span className="link-icon">👥</span>
                                <span className="link-title">User Management</span>
                                <span className="link-desc">View user activity and history</span>
                            </Link>
                            <Link to="/UserList" className="quick-link" data-testid="link-messages">
                                <span className="link-icon">💬</span>
                                <span className="link-title">Customer Messages</span>
                                <span className="link-desc">Respond to customer inquiries</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
