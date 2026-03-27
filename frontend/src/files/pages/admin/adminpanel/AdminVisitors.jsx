import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../../../styles/admin/adminpanel/AdminVisitors.css';

const AdminVisitors = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeVisitors, setActiveVisitors] = useState(0);
    const [stats, setStats] = useState({
        today: {
            totalVisitors: 0,
            uniqueVisitors: 0,
            ordersReceived: 0,
            peakVisitors: 0,
            hourlyStats: []
        },
        history: [],
        allTime: {
            totalVisitors: 0,
            totalOrders: 0,
            totalUniqueVisitors: 0,
            maxPeakVisitors: 0
        }
    });

    const API_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        // Fetch visitor stats
        fetchVisitorStats();

        // Connect to socket for live count
        const socket = io(API_URL, {
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

        return () => {
            socket.disconnect();
        };
    }, [API_URL]);

    const fetchVisitorStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/visitor-stats`, {
                withCredentials: true
            });
            if (response.data.success) {
                setStats({
                    today: response.data.today,
                    history: response.data.history,
                    allTime: response.data.allTime
                });
            }
        } catch (error) {
            console.error('Error fetching visitor stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getHourLabel = (hour) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 || 12;
        return `${h}${ampm}`;
    };

    if (loading) {
        return (
            <div className="admin-visitors-page">
                <div className="loading-container">
                    <div className="loader"><span></span><span></span><span></span></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-visitors-page">
            <header className="visitors-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/AdminPanel')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <h1>Visitor Analytics</h1>
                </div>
                <div className="live-badge">
                    <span className="live-dot"></span>
                    {activeVisitors} Live Now
                </div>
            </header>

            <div className="visitors-content">
                {/* Live Stats Card */}
                <div className="stats-row">
                    <div className="stat-card live">
                        <div className="stat-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{activeVisitors}</span>
                            <span className="stat-label">Active Right Now</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon today">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.today.totalVisitors}</span>
                            <span className="stat-label">Total Visits Today</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon unique">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.today.uniqueVisitors}</span>
                            <span className="stat-label">Unique Visitors Today</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orders">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 01-8 0"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.today.ordersReceived}</span>
                            <span className="stat-label">Orders Today</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon peak">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                <polyline points="17 6 23 6 23 12"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.today.peakVisitors}</span>
                            <span className="stat-label">Peak Concurrent Today</span>
                        </div>
                    </div>
                </div>

                {/* Hourly Chart */}
                <div className="chart-section">
                    <h2>Today's Hourly Activity</h2>
                    <div className="hourly-chart">
                        {stats.today.hourlyStats && stats.today.hourlyStats.length > 0 ? (
                            <div className="chart-bars">
                                {stats.today.hourlyStats.map((hour, idx) => {
                                    const maxVisitors = Math.max(...stats.today.hourlyStats.map(h => h.visitors), 1);
                                    const height = (hour.visitors / maxVisitors) * 100;
                                    const currentHour = new Date().getHours();
                                    
                                    return (
                                        <div key={idx} className={`bar-container ${hour.hour === currentHour ? 'current' : ''}`}>
                                            <div className="bar-wrapper">
                                                <div 
                                                    className="bar" 
                                                    style={{ height: `${Math.max(height, 2)}%` }}
                                                >
                                                    {hour.visitors > 0 && (
                                                        <span className="bar-value">{hour.visitors}</span>
                                                    )}
                                                </div>
                                                {hour.orders > 0 && (
                                                    <div className="orders-dot" title={`${hour.orders} orders`}>
                                                        {hour.orders}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="bar-label">{getHourLabel(hour.hour)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="no-data">No hourly data available</p>
                        )}
                    </div>
                </div>

                {/* All Time Stats */}
                <div className="alltime-section">
                    <h2>All Time Statistics</h2>
                    <div className="alltime-grid">
                        <div className="alltime-card">
                            <span className="alltime-value">{stats.allTime.totalVisitors?.toLocaleString() || 0}</span>
                            <span className="alltime-label">Total Page Views</span>
                        </div>
                        <div className="alltime-card">
                            <span className="alltime-value">{stats.allTime.totalUniqueVisitors?.toLocaleString() || 0}</span>
                            <span className="alltime-label">Total Unique Visitors</span>
                        </div>
                        <div className="alltime-card">
                            <span className="alltime-value">{stats.allTime.totalOrders?.toLocaleString() || 0}</span>
                            <span className="alltime-label">Total Orders</span>
                        </div>
                        <div className="alltime-card">
                            <span className="alltime-value">{stats.allTime.maxPeakVisitors || 0}</span>
                            <span className="alltime-label">Record Peak Visitors</span>
                        </div>
                    </div>
                </div>

                {/* Historical Records */}
                <div className="history-section">
                    <h2>Previous Records (Last 30 Days)</h2>
                    {stats.history.length === 0 ? (
                        <p className="no-data">No historical data yet</p>
                    ) : (
                        <div className="history-table">
                            <div className="table-header">
                                <span>Date</span>
                                <span>Total Visits</span>
                                <span>Unique</span>
                                <span>Orders</span>
                                <span>Peak</span>
                            </div>
                            {stats.history.map((day, idx) => (
                                <div key={idx} className="table-row">
                                    <span className="date-cell">{formatDate(day.date)}</span>
                                    <span>{day.totalVisitors}</span>
                                    <span>{day.uniqueVisitors}</span>
                                    <span className="orders-cell">{day.ordersReceived}</span>
                                    <span>{day.peakVisitors}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminVisitors;
