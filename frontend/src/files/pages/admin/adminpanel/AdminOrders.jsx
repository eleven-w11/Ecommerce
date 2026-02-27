import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminOrders.css';

const AdminOrders = () => {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const navItems = [
        { path: '/AdminPanel', label: 'Dashboard' },
        { path: '/AdminProducts', label: 'Products' },
        { path: '/AdminOrders', label: 'Orders' },
        { path: '/AdminUsers', label: 'Users' },
        { path: '/UserList', label: 'Messages' }
    ];

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/orders`, { withCredentials: true });
            setOrders(res.data?.orders || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/admin/orders/${orderId}/status`, { status }, { withCredentials: true });
            setOrders(orders.map(o => o.orderId === orderId ? { ...o, status } : o));
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusColor = (status) => {
        const colors = { pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', shipped: '#06b6d4', delivered: '#22c55e', cancelled: '#ef4444' };
        return colors[status] || '#888';
    };

    return (
        <div className="admin-page admin-orders">
            <nav className="admin-nav">
                <Link to="/AdminPanel" className="admin-brand">Admin Panel</Link>
                <div className="admin-links">
                    {navItems.map((item) => (
                        <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active' : ''}>{item.label}</Link>
                    ))}
                </div>
                <Link to="/" className="back-link">← Back to Store</Link>
            </nav>

            <div className="admin-body">
                <h1>Orders ({orders.length})</h1>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : orders.length === 0 ? (
                    <div className="empty">No orders yet</div>
                ) : (
                    <div className="order-list">
                        {orders.map((o) => (
                            <div key={o.orderId} className={`order-card ${expandedOrder === o.orderId ? 'expanded' : ''}`}>
                                <div className="order-row" onClick={() => setExpandedOrder(expandedOrder === o.orderId ? null : o.orderId)}>
                                    <div className="order-id">#{o.orderId?.slice(-8)}</div>
                                    <div className="order-info">
                                        <strong>{o.user?.name || 'Unknown'}</strong>
                                        <span>${o.totalAmount?.toFixed(2)}</span>
                                    </div>
                                    <span className="status-badge" style={{ background: getStatusColor(o.status) + '20', color: getStatusColor(o.status) }}>{o.status}</span>
                                    <span className="arrow">{expandedOrder === o.orderId ? '▲' : '▼'}</span>
                                </div>
                                {expandedOrder === o.orderId && (
                                    <div className="order-details">
                                        <div className="detail-row">
                                            <strong>Customer:</strong>
                                            <span>{o.user?.name} ({o.user?.email})</span>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Address:</strong>
                                            <span>{o.shippingAddress?.address}, {o.shippingAddress?.city}</span>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Items:</strong>
                                            <span>{o.items?.length || 0} items</span>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Date:</strong>
                                            <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="status-update">
                                            <strong>Update Status:</strong>
                                            <select value={o.status} onChange={(e) => updateStatus(o.orderId, e.target.value)}>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
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

export default AdminOrders;
