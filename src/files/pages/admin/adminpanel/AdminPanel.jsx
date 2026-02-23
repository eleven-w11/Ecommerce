import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminPanel.css';

// Icons as SVG components
const Icons = {
    Dashboard: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
    ),
    Users: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    Products: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
    ),
    Orders: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    ),
    Analytics: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
    ),
    Settings: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    ),
    Security: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    ),
    Chat: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
    ),
    Content: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
    ),
    Search: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    Bell: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    ),
    TrendUp: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    ),
    TrendDown: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
        </svg>
    ),
    DollarSign: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    ),
    ShoppingCart: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
    ),
    Eye: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    Edit: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    ),
    Trash: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
    ),
    Menu: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    ),
    Logout: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    Plus: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    )
};

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [adminUser, setAdminUser] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSales: 0,
        totalOrders: 0,
        todaySales: 0,
        monthlyRevenue: 0,
        activeUsers: 0
    });
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [activities, setActivities] = useState([]);

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_BASE_URL;

    // Check admin access
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const tokenRes = await axios.get(`${API_URL}/api/verifytoken`, {
                    withCredentials: true
                });
                
                if (!tokenRes.data?.success) {
                    navigate('/SignIn');
                    return;
                }

                const adminRes = await axios.get(`${API_URL}/api/chat/is-admin`, {
                    withCredentials: true
                });
                
                if (!adminRes.data?.isAdmin) {
                    navigate('/');
                    return;
                }
                
                setIsAdmin(true);
                
                // Get admin user info
                const userRes = await axios.get(`${API_URL}/api/user/profile`, {
                    withCredentials: true
                });
                if (userRes.data) {
                    setAdminUser(userRes.data);
                }
                
                // Load dashboard data
                await loadDashboardData();
                
            } catch (error) {
                console.error('Auth check failed:', error);
                navigate('/SignIn');
            } finally {
                setIsLoading(false);
            }
        };
        checkAdmin();
    }, [API_URL, navigate]);

    const loadDashboardData = async () => {
        try {
            // Load users
            const usersRes = await axios.get(`${API_URL}/api/admin/users`, {
                withCredentials: true
            });
            if (usersRes.data?.users) {
                setUsers(usersRes.data.users);
                setStats(prev => ({ ...prev, totalUsers: usersRes.data.users.length }));
            }

            // Load products
            const productsRes = await axios.get(`${API_URL}/api/products`, {
                withCredentials: true
            });
            if (productsRes.data) {
                const productsList = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.products || [];
                setProducts(productsList);
            }

            // Set mock stats for demo (replace with real API calls)
            setStats(prev => ({
                ...prev,
                totalSales: 124500,
                totalOrders: 856,
                todaySales: 3420,
                monthlyRevenue: 45200,
                activeUsers: Math.floor(prev.totalUsers * 0.3)
            }));

            // Mock activities
            setActivities([
                { type: 'order', text: '<strong>New order</strong> #1234 placed', time: '2 minutes ago' },
                { type: 'user', text: '<strong>John Doe</strong> registered', time: '15 minutes ago' },
                { type: 'product', text: '<strong>Product</strong> "Winter Jacket" updated', time: '1 hour ago' },
                { type: 'order', text: '<strong>Order</strong> #1230 shipped', time: '2 hours ago' },
                { type: 'alert', text: '<strong>Low stock</strong> alert for 3 items', time: '3 hours ago' }
            ]);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${API_URL}/api/signout`, { withCredentials: true });
            navigate('/SignIn');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
        { id: 'users', label: 'Users', icon: Icons.Users, badge: users.length },
        { id: 'products', label: 'Products', icon: Icons.Products },
        { id: 'orders', label: 'Orders', icon: Icons.Orders },
        { id: 'content', label: 'Content', icon: Icons.Content },
        { id: 'analytics', label: 'Analytics', icon: Icons.Analytics },
        { id: 'chat', label: 'Support Chat', icon: Icons.Chat },
        { id: 'settings', label: 'Settings', icon: Icons.Settings },
        { id: 'security', label: 'Security', icon: Icons.Security }
    ];

    if (isLoading) {
        return (
            <div className="admin-panel">
                <div className="loading-spinner" style={{ width: '100%' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            {/* Mobile Overlay */}
            <div 
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">W</div>
                        <div className="sidebar-logo-text">Web<span>verse</span></div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main</div>
                        {navItems.slice(0, 6).map(item => (
                            <div
                                key={item.id}
                                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    if (item.id === 'chat') {
                                        navigate('/UserList');
                                    } else {
                                        setActiveSection(item.id);
                                        setSidebarOpen(false);
                                    }
                                }}
                            >
                                <span className="nav-item-icon"><item.icon /></span>
                                <span>{item.label}</span>
                                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                            </div>
                        ))}
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">System</div>
                        {navItems.slice(6).map(item => (
                            <div
                                key={item.id}
                                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    if (item.id === 'chat') {
                                        navigate('/UserList');
                                    } else {
                                        setActiveSection(item.id);
                                        setSidebarOpen(false);
                                    }
                                }}
                            >
                                <span className="nav-item-icon"><item.icon /></span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={handleLogout}>
                        <div className="sidebar-user-avatar">
                            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{adminUser?.name || 'Admin'}</div>
                            <div className="sidebar-user-role">Administrator</div>
                        </div>
                        <Icons.Logout />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            className="mobile-menu-btn"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Icons.Menu />
                        </button>
                        <div className="header-search">
                            <span className="header-search-icon"><Icons.Search /></span>
                            <input type="text" placeholder="Search..." />
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="header-action-btn">
                            <Icons.Bell />
                            <span className="badge">3</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="admin-content">
                    {activeSection === 'dashboard' && (
                        <DashboardSection 
                            stats={stats} 
                            activities={activities}
                            users={users}
                        />
                    )}
                    {activeSection === 'users' && (
                        <UsersSection users={users} setUsers={setUsers} API_URL={API_URL} />
                    )}
                    {activeSection === 'products' && (
                        <ProductsSection products={products} API_URL={API_URL} />
                    )}
                    {activeSection === 'orders' && (
                        <OrdersSection />
                    )}
                    {activeSection === 'content' && (
                        <ContentSection />
                    )}
                    {activeSection === 'analytics' && (
                        <AnalyticsSection stats={stats} />
                    )}
                    {activeSection === 'settings' && (
                        <SettingsSection />
                    )}
                    {activeSection === 'security' && (
                        <SecuritySection />
                    )}
                </div>
            </main>
        </div>
    );
};

// Dashboard Section Component
const DashboardSection = ({ stats, activities, users }) => (
    <>
        <div className="content-header">
            <div>
                <h1 className="content-title">Dashboard</h1>
                <p className="content-subtitle">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="content-actions">
                <button className="btn btn-secondary">
                    <Icons.Analytics /> Export
                </button>
                <button className="btn btn-primary">
                    <Icons.Plus /> Add Product
                </button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon blue"><Icons.Users /></div>
                    <div className="stat-trend up">
                        <Icons.TrendUp /> +12%
                    </div>
                </div>
                <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                <div className="stat-label">Total Users</div>
            </div>

            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon green"><Icons.DollarSign /></div>
                    <div className="stat-trend up">
                        <Icons.TrendUp /> +8%
                    </div>
                </div>
                <div className="stat-value">${stats.totalSales.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
            </div>

            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon purple"><Icons.ShoppingCart /></div>
                    <div className="stat-trend up">
                        <Icons.TrendUp /> +23%
                    </div>
                </div>
                <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
                <div className="stat-label">Total Orders</div>
            </div>

            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon orange"><Icons.Eye /></div>
                    <div className="stat-trend down">
                        <Icons.TrendDown /> -3%
                    </div>
                </div>
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-label">Active Users</div>
            </div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
            <div className="chart-card">
                <div className="chart-header">
                    <h3 className="chart-title">Revenue Overview</h3>
                    <div className="chart-filters">
                        <button className="chart-filter">Week</button>
                        <button className="chart-filter active">Month</button>
                        <button className="chart-filter">Year</button>
                    </div>
                </div>
                <div className="chart-placeholder">
                    {[65, 45, 78, 52, 89, 67, 94, 73, 85, 62, 91, 77].map((h, i) => (
                        <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3 className="chart-title">Recent Activity</h3>
                </div>
                <div className="activity-list">
                    {activities.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className={`activity-icon ${activity.type}`}>
                                {activity.type === 'order' && <Icons.ShoppingCart />}
                                {activity.type === 'user' && <Icons.Users />}
                                {activity.type === 'product' && <Icons.Products />}
                                {activity.type === 'alert' && <Icons.Bell />}
                            </div>
                            <div className="activity-content">
                                <div 
                                    className="activity-text"
                                    dangerouslySetInnerHTML={{ __html: activity.text }}
                                />
                                <div className="activity-time">{activity.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Recent Users Table */}
        <div className="table-card">
            <div className="table-header">
                <h3 className="table-title">Recent Users</h3>
                <div className="table-actions">
                    <button className="btn btn-secondary">View All</button>
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.slice(0, 5).map((user, index) => (
                        <tr key={user._id || index}>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div className="user-info-name">{user.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                                <span className="status-badge active">
                                    <span className="status-dot"></span>
                                    Active
                                </span>
                            </td>
                            <td>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td>
                                <div className="action-btns">
                                    <button className="action-btn"><Icons.Eye /></button>
                                    <button className="action-btn"><Icons.Edit /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
);

// Users Section Component
const UsersSection = ({ users, setUsers, API_URL }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="content-header">
                <div>
                    <h1 className="content-title">User Management</h1>
                    <p className="content-subtitle">Manage all registered users</p>
                </div>
                <div className="content-actions">
                    <button className="btn btn-primary">
                        <Icons.Plus /> Add User
                    </button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <h3 className="table-title">All Users ({users.length})</h3>
                    <div className="header-search" style={{ width: '250px' }}>
                        <span className="header-search-icon"><Icons.Search /></span>
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={user._id || index}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="user-info-name">{user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className="status-badge active">
                                        <span className="status-dot"></span>
                                        Active
                                    </span>
                                </td>
                                <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                                <td>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn"><Icons.Eye /></button>
                                        <button className="action-btn"><Icons.Edit /></button>
                                        <button className="action-btn danger"><Icons.Trash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// Products Section Component
const ProductsSection = ({ products, API_URL }) => (
    <>
        <div className="content-header">
            <div>
                <h1 className="content-title">Product Management</h1>
                <p className="content-subtitle">Manage your product catalog</p>
            </div>
            <div className="content-actions">
                <button className="btn btn-primary">
                    <Icons.Plus /> Add Product
                </button>
            </div>
        </div>

        <div className="table-card">
            <div className="table-header">
                <h3 className="table-title">All Products ({products.length})</h3>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.slice(0, 10).map((product, index) => (
                        <tr key={product._id || index}>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar" style={{ borderRadius: '8px' }}>
                                        {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                    </div>
                                    <div>
                                        <div className="user-info-name">{product.name}</div>
                                        <div className="user-info-email">{product.brand}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{product.category || 'General'}</td>
                            <td>${product.price?.toLocaleString() || '0'}</td>
                            <td>{product.stock || 'In Stock'}</td>
                            <td>
                                <span className="status-badge active">
                                    <span className="status-dot"></span>
                                    Active
                                </span>
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button className="action-btn"><Icons.Eye /></button>
                                    <button className="action-btn"><Icons.Edit /></button>
                                    <button className="action-btn danger"><Icons.Trash /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
);

// Orders Section Component
const OrdersSection = () => {
    const mockOrders = [
        { id: '#1234', customer: 'John Doe', total: 299, status: 'pending', date: '2024-01-15' },
        { id: '#1233', customer: 'Jane Smith', total: 549, status: 'shipped', date: '2024-01-14' },
        { id: '#1232', customer: 'Mike Johnson', total: 199, status: 'active', date: '2024-01-14' },
        { id: '#1231', customer: 'Sarah Williams', total: 899, status: 'active', date: '2024-01-13' },
        { id: '#1230', customer: 'Chris Brown', total: 149, status: 'pending', date: '2024-01-13' },
    ];

    return (
        <>
            <div className="content-header">
                <div>
                    <h1 className="content-title">Orders</h1>
                    <p className="content-subtitle">Manage customer orders</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <h3 className="table-title">Recent Orders</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockOrders.map((order, index) => (
                            <tr key={index}>
                                <td><strong>{order.id}</strong></td>
                                <td>{order.customer}</td>
                                <td>${order.total}</td>
                                <td>
                                    <span className={`status-badge ${order.status}`}>
                                        <span className="status-dot"></span>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td>{order.date}</td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn"><Icons.Eye /></button>
                                        <button className="action-btn"><Icons.Edit /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// Content Section Component
const ContentSection = () => (
    <>
        <div className="content-header">
            <div>
                <h1 className="content-title">Content Management</h1>
                <p className="content-subtitle">Manage website content and pages</p>
            </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
                <div className="stat-icon purple"><Icons.Content /></div>
                <div className="stat-value" style={{ fontSize: '20px', marginTop: '16px' }}>Hero Section</div>
                <div className="stat-label">Edit homepage hero</div>
            </div>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
                <div className="stat-icon blue"><Icons.Products /></div>
                <div className="stat-value" style={{ fontSize: '20px', marginTop: '16px' }}>Top Products</div>
                <div className="stat-label">Manage featured products</div>
            </div>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
                <div className="stat-icon green"><Icons.ShoppingCart /></div>
                <div className="stat-value" style={{ fontSize: '20px', marginTop: '16px' }}>Best Sellers</div>
                <div className="stat-label">Edit best selling section</div>
            </div>
        </div>
    </>
);

// Analytics Section Component
const AnalyticsSection = ({ stats }) => (
    <>
        <div className="content-header">
            <div>
                <h1 className="content-title">Analytics & Reports</h1>
                <p className="content-subtitle">Detailed insights and performance metrics</p>
            </div>
            <div className="content-actions">
                <button className="btn btn-secondary">
                    <Icons.Analytics /> Export Report
                </button>
            </div>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon green"><Icons.DollarSign /></div>
                </div>
                <div className="stat-value">${stats.monthlyRevenue.toLocaleString()}</div>
                <div className="stat-label">Monthly Revenue</div>
            </div>
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon blue"><Icons.DollarSign /></div>
                </div>
                <div className="stat-value">${stats.todaySales.toLocaleString()}</div>
                <div className="stat-label">Today's Sales</div>
            </div>
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon purple"><Icons.Users /></div>
                </div>
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-label">Active Users (30d)</div>
            </div>
            <div className="stat-card">
                <div className="stat-header">
                    <div className="stat-icon orange"><Icons.ShoppingCart /></div>
                </div>
                <div className="stat-value">4.2%</div>
                <div className="stat-label">Conversion Rate</div>
            </div>
        </div>

        <div className="chart-card">
            <div className="chart-header">
                <h3 className="chart-title">Sales Performance</h3>
                <div className="chart-filters">
                    <button className="chart-filter">7 Days</button>
                    <button className="chart-filter active">30 Days</button>
                    <button className="chart-filter">90 Days</button>
                </div>
            </div>
            <div className="chart-placeholder">
                {[45, 62, 78, 55, 89, 72, 94, 68, 85, 91, 77, 83].map((h, i) => (
                    <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    </>
);

// Settings Section Component
const SettingsSection = () => {
    const [settings, setSettings] = useState({
        siteName: 'Webverse',
        emailNotifications: true,
        twoFactorAuth: false,
        darkMode: true
    });

    return (
        <>
            <div className="content-header">
                <div>
                    <h1 className="content-title">Settings</h1>
                    <p className="content-subtitle">Manage your website settings</p>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-header">
                    <h3 className="settings-title">General Settings</h3>
                    <p className="settings-description">Basic website configuration</p>
                </div>
                <div className="settings-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Website Name</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={settings.siteName}
                                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Admin Email</label>
                            <input type="email" className="form-input" placeholder="admin@example.com" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-header">
                    <h3 className="settings-title">Notifications</h3>
                    <p className="settings-description">Configure notification preferences</p>
                </div>
                <div className="settings-body">
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <h4>Email Notifications</h4>
                            <p>Receive email alerts for new orders</p>
                        </div>
                        <div 
                            className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
                            onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                        />
                    </div>
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <h4>Two-Factor Authentication</h4>
                            <p>Add extra security to your account</p>
                        </div>
                        <div 
                            className={`toggle-switch ${settings.twoFactorAuth ? 'active' : ''}`}
                            onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
                        />
                    </div>
                </div>
            </div>

            <button className="btn btn-primary">Save Changes</button>
        </>
    );
};

// Security Section Component
const SecuritySection = () => {
    const mockLogs = [
        { action: 'Login', ip: '192.168.1.1', time: '2 minutes ago', status: 'success' },
        { action: 'Password Change', ip: '192.168.1.1', time: '1 hour ago', status: 'success' },
        { action: 'Login Attempt', ip: '45.33.22.11', time: '3 hours ago', status: 'failed' },
        { action: 'Settings Update', ip: '192.168.1.1', time: '1 day ago', status: 'success' },
    ];

    return (
        <>
            <div className="content-header">
                <div>
                    <h1 className="content-title">Security</h1>
                    <p className="content-subtitle">Monitor security and access logs</p>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-header">
                    <h3 className="settings-title">Change Password</h3>
                    <p className="settings-description">Update your admin password</p>
                </div>
                <div className="settings-body">
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input type="password" className="form-input" placeholder="••••••••" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input type="password" className="form-input" placeholder="••••••••" />
                        </div>
                    </div>
                    <button className="btn btn-primary">Update Password</button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <h3 className="table-title">Activity Logs</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>IP Address</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockLogs.map((log, index) => (
                            <tr key={index}>
                                <td>{log.action}</td>
                                <td>{log.ip}</td>
                                <td>{log.time}</td>
                                <td>
                                    <span className={`status-badge ${log.status === 'success' ? 'active' : 'inactive'}`}>
                                        <span className="status-dot"></span>
                                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AdminPanel;
