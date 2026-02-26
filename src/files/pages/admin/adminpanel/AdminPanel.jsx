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
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize Socket.IO connection
        const socket = io(process.env.REACT_APP_API_BASE_URL, {
            path: '/api/socket.io/',
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('🟢 Admin connected to socket');
            setIsConnected(true);
            // Request current visitor count
            socket.emit('getVisitorCount');
        });

        socket.on('visitorCount', (data) => {
            console.log('👥 Visitor count updated:', data.count);
            setActiveVisitors(data.count);
        });

        socket.on('disconnect', () => {
            console.log('🔴 Admin disconnected from socket');
            setIsConnected(false);
        });

        // Fetch dashboard stats
        fetchDashboardStats();

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            
            // Fetch products count
            const productsRes = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/products`,
                { withCredentials: true }
            );
            
            // Fetch users count (admin only)
            const usersRes = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/users`,
                { withCredentials: true }
            ).catch(() => ({ data: { users: [] } }));

            // Fetch orders count
            const ordersRes = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/admin/orders`,
                { withCredentials: true }
            ).catch(() => ({ data: { orders: [] } }));

            const orders = ordersRes.data?.orders || [];
            const pendingOrders = orders.filter(o => o.status === 'pending').length;

            setStats(prev => ({
                ...prev,
                totalProducts: productsRes.data?.products?.length || 0,
                totalUsers: usersRes.data?.users?.length || 0,
                totalOrders: orders.length,
                pendingOrders: pendingOrders
            }));

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

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">W</div>
                        <div className="sidebar-logo-text">Web<span>Verse</span></div>
                    </div>
                </div>
                
                {/* <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main</div>
                        <div className="nav-item active">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Dashboard</span>
                        </div>
                        <Link to="/UserList" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>Messages</span>
                        </Link>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Management</div>
                        <div className="nav-item" onClick={() => navigate('/')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <span>Products</span>
                        </div>
                        <div className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Customers</span>
                        </div>
                        <div className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <span>Settings</span>
                        </div>
                    </div>
                </nav> */}

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
                        <h1>Dashboard</h1>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {/* Active Visitors Card - Highlighted */}
                    <div className="stat-card visitors-card">
                        <div className="stat-card-header">
                            <div className="stat-icon visitors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            {/* <div className="live-indicator">
                                <span className="live-dot"></span>
                                LIVE
                            </div> */}
                        </div>
                        <div className="stat-value">{formatNumber(activeVisitors)}</div>
                        <div className="stat-label">Active Visitors</div>
                        {/* <div className="stat-subtitle">Currently browsing the site</div> */}
                    </div>

                    {/* Total Products */}
                    <div className="stat-card">
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
                    </div>

                    {/* Total Users */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon users">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        </div>
                        <div className="stat-value">{formatNumber(stats.totalUsers)}</div>
                        <div className="stat-label">Users</div>
                    </div>

                    {/* Messages */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon messages">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                        </div>
                        <div className="stat-value">
                            <Link to="/UserList" className="stat-link">View</Link>
                        </div>
                        <div className="stat-label">Messages</div>
                    </div>
                </div>

                {/* Active Visitors Detail Section */}
                {/* <div className="visitors-detail-section">
                    <div className="section-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Real-time Activity
                        </h2>
                    </div>
                    <div className="visitors-detail-card">
                        <div className="visitors-count-large">
                            <div className="count-number">{activeVisitors}</div>
                            <div className="count-label">
                                {activeVisitors === 1 ? 'Person' : 'People'} actively viewing your site
                            </div>
                            <div className="count-sublabel">
                                Only counts users with the site in their active browser tab
                            </div>
                        </div>
                        <div className="visitors-visual">
                            <div className="visitors-bar">
                                {[...Array(Math.min(activeVisitors, 20))].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="visitor-dot"
                                        style={{ 
                                            animationDelay: `${i * 0.1}s`,
                                            opacity: 1 - (i * 0.04)
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="7" r="4"></circle>
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        </svg>
                                    </div>
                                ))}
                                {activeVisitors > 20 && (
                                    <div className="more-visitors">+{activeVisitors - 20}</div>
                                )}
                            </div>
                        </div>
                        <div className="connection-info">
                            <span className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
                                <span className="pulse-dot"></span>
                                {isConnected ? 'Socket Connected' : 'Reconnecting...'}
                            </span>
                        </div>
                    </div>
                </div> */}

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <div className="section-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="quick-actions-grid">
                        <Link to="/" className="quick-action-card">
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>
                            <span>Add Product</span>
                        </Link>
                        <Link to="/UserList" className="quick-action-card">
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <span>View Messages</span>
                        </Link>
                        <div className="quick-action-card">
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                            </div>
                            <span>View Orders</span>
                        </div>
                        <div className="quick-action-card">
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            </div>
                            <span>Settings</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
