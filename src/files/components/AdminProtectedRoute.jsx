import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AdminProtectedRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAdminAuth = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/user/profile`,
                    { withCredentials: true }
                );

                if (response.data && response.data.email) {
                    setIsAuthenticated(true);
                    // Check if user is admin
                    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'admin@admin.com';
                    setIsAdmin(response.data.isAdmin || response.data.email === adminEmail);
                } else {
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Admin auth check failed:', error);
                setIsAuthenticated(false);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="admin-loading" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0f0f23'
            }}>
                <div className="loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to sign in
    if (!isAuthenticated) {
        localStorage.setItem('redirectAfterAuth', location.pathname);
        return <Navigate to="/SignIn" replace />;
    }

    // Not admin - redirect to home
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
