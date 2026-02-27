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
        <div className="admin-page">
            <nav className="admin-nav">
                <Link to="/AdminPanel" className="admin-brand">Admin Panel</Link>
                <div className="admin-links">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={location.pathname === item.path ? 'active' : ''}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <Link to="/" className="back-link">← Back to Store</Link>
            </nav>

            <div className="admin-body">
                <h1>Dashboard</h1>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <span className="stat-num">{stats.totalUsers}</span>
                                <span className="stat-text">Users</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num">{stats.totalProducts}</span>
                                <span className="stat-text">Products</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num">{stats.totalOrders}</span>
                                <span className="stat-text">Orders</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num">{stats.pendingOrders}</span>
                                <span className="stat-text">Pending</span>
                            </div>
                        </div>

                        <h2>Quick Links</h2>
                        <div className="quick-links">
                            <Link to="/AdminProducts" className="quick-link">Manage Products</Link>
                            <Link to="/AdminOrders" className="quick-link">View Orders</Link>
                            <Link to="/AdminUsers" className="quick-link">View Users</Link>
                            <Link to="/UserList" className="quick-link">Messages</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
