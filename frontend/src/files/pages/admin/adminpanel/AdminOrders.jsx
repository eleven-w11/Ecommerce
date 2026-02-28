import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminOrders.css';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(null);

    const API_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/orders`, {
                withCredentials: true
            });
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setStatusUpdating(orderId);
            const response = await axios.put(
                `${API_URL}/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            if (response.data.success) {
                setOrders(orders.map(order => 
                    order.orderId === orderId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setStatusUpdating(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            confirmed: '#3b82f6',
            processing: '#8b5cf6',
            shipped: '#06b6d4',
            delivered: '#10b981',
            cancelled: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/default.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`;
        return imagePath;
    };

    if (loading) {
        return (
            <div className="admin-orders-page">
                <div className="loading-container">
                    <div className="loader"><span></span><span></span><span></span></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-orders-page">
            <header className="orders-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/AdminPanel')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <h1>All Orders</h1>
                </div>
                <div className="header-stats">
                    <span className="stat-badge">{orders.length} Total Orders</span>
                </div>
            </header>

            <div className="orders-content">
                {orders.length === 0 ? (
                    <div className="no-orders">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <p>No orders yet</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-id-section">
                                        <span className="order-id">{order.orderId}</span>
                                        <span className="order-date">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="order-status-section">
                                        <select 
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                                            disabled={statusUpdating === order.orderId}
                                            style={{ borderColor: getStatusColor(order.status) }}
                                            className="status-select"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="order-user">
                                    <div className="user-avatar">
                                        {order.userId?.image ? (
                                            <img src={getImageUrl(order.userId.image)} alt={order.userId.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {order.userId?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <span className="user-name">{order.userId?.name || 'Unknown User'}</span>
                                        <span className="user-email">{order.userId?.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="order-shipping">
                                    <h4>Shipping Address</h4>
                                    <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                    <p className="contact">{order.shippingAddress?.phone} | {order.shippingAddress?.email}</p>
                                </div>

                                <div className="order-items">
                                    <h4>Items ({order.items?.length || 0})</h4>
                                    <div className="items-list">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="item-row">
                                                <img src={`/images/${item.image}`} alt={item.productName} onError={(e) => e.target.src = '/images/default.jpg'} />
                                                <div className="item-details">
                                                    <span className="item-name">{item.productName}</span>
                                                    <span className="item-meta">
                                                        {item.color && `Color: ${item.color}`}
                                                        {item.size && ` | Size: ${item.size}`}
                                                        {` | Qty: ${item.quantity}`}
                                                    </span>
                                                </div>
                                                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="order-footer">
                                    <div className="payment-method">
                                        <span className="label">Payment:</span>
                                        <span className="value">{order.paymentMethod?.replace('-', ' ').toUpperCase()}</span>
                                    </div>
                                    <div className="order-total">
                                        <span className="label">Total:</span>
                                        <span className="value">${order.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
