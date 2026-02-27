import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminUsers.css';

const AdminUsers = () => {
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);

    const navItems = [
        { path: '/AdminPanel', label: 'Dashboard' },
        { path: '/AdminProducts', label: 'Products' },
        { path: '/AdminOrders', label: 'Orders' },
        { path: '/AdminUsers', label: 'Users' },
        { path: '/UserList', label: 'Messages' }
    ];

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users`, { withCredentials: true });
            setUsers(res.data?.users || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getImg = (u) => {
        if (u.image) {
            if (u.image.startsWith('http')) return u.image;
            if (u.image.startsWith('/uploads')) return `${process.env.REACT_APP_API_BASE_URL}${u.image}`;
        }
        return '/user.png';
    };

    return (
        <div className="admin-page admin-users">
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
                <h1>Users ({users.length})</h1>

                <input type="text" className="search-input" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty">No users found</div>
                ) : (
                    <div className="user-list">
                        {filtered.map((u) => (
                            <div key={u._id} className={`user-card ${expandedUser === u._id ? 'expanded' : ''}`}>
                                <div className="user-row" onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
                                    <img src={getImg(u)} alt={u.name} onError={(e) => e.target.src = '/user.png'} />
                                    <div className="user-info">
                                        <strong>{u.name}</strong>
                                        <span>{u.email}</span>
                                    </div>
                                    <span className="login-badge">{u.loginHistory?.length || 0} logins</span>
                                    <span className="arrow">{expandedUser === u._id ? '▲' : '▼'}</span>
                                </div>
                                {expandedUser === u._id && (
                                    <div className="user-details">
                                        <strong>Login History:</strong>
                                        {u.loginHistory?.length > 0 ? (
                                            <div className="login-list">
                                                {u.loginHistory.slice().reverse().slice(0, 10).map((l, i) => (
                                                    <span key={i}>{l}</span>
                                                ))}
                                                {u.loginHistory.length > 10 && <span>...and {u.loginHistory.length - 10} more</span>}
                                            </div>
                                        ) : (
                                            <span className="no-data">No login history</span>
                                        )}
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

export default AdminUsers;
