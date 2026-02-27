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
                    setIsAdmin(response.data.isAdmin === true);
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
                <div className="loader" style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                        width: '12px',
                        height: '12px',
                        background: '#6366f1',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out'
                    }}></span>
                    <span style={{
                        width: '12px',
                        height: '12px',
                        background: '#6366f1',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out',
                        animationDelay: '-0.16s'
                    }}></span>
                    <span style={{
                        width: '12px',
                        height: '12px',
                        background: '#6366f1',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out',
                        animationDelay: '-0.32s'
                    }}></span>
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
