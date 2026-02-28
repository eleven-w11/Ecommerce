import React, { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleOneTap = ({ isAuthenticated, onSignIn }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleCredentialResponse = useCallback(async (response) => {
        try {
            const result = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/signup/google`,
                { id_token: response.credential },
                { withCredentials: true }
            );

            if (result.data.success) {
                // Call the onSignIn callback to update auth state
                if (onSignIn) {
                    onSignIn();
                }

                const isAdmin = result.data.user?.isAdmin;
                const redirectPath = localStorage.getItem("redirectAfterAuth");

                // Redirect logic
                if (redirectPath) {
                    localStorage.removeItem("redirectAfterAuth");
                    navigate(redirectPath);
                } else if (isAdmin) {
                    navigate("/AdminPanel");
                } else if (location.pathname === '/SignIn' || location.pathname === '/SignUp') {
                    navigate("/UserProfile");
                }
                // If on other pages, stay on the same page
            }
        } catch (error) {
            console.error("Google One Tap sign-in error:", error);
        }
    }, [navigate, onSignIn, location.pathname]);

    useEffect(() => {
        // Don't show One Tap if user is already authenticated
        if (isAuthenticated) {
            return;
        }

        // Don't show on admin pages
        const adminPages = ['/AdminPanel', '/AdminOrders', '/AdminUsers', '/AdminProducts', '/AdminVisitors', '/UserList', '/AdminChat'];
        if (adminPages.some(page => location.pathname.startsWith(page))) {
            return;
        }

        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn("Google Client ID not configured");
            return;
        }

        // Load Google Identity Services script
        const loadGoogleScript = () => {
            if (document.getElementById('google-identity-script')) {
                initializeOneTap();
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-identity-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeOneTap;
            document.head.appendChild(script);
        };

        const initializeOneTap = () => {
            if (!window.google?.accounts?.id) {
                // Retry after a short delay if Google API isn't ready
                setTimeout(initializeOneTap, 100);
                return;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    auto_select: false, // Don't auto-select, let user choose
                    cancel_on_tap_outside: false, // Don't cancel when clicking outside
                    itp_support: true, // Support Intelligent Tracking Prevention
                });

                // Show the One Tap prompt
                // Use 'prompt_parent_id' for better positioning on SignIn page
                const isSignInPage = location.pathname === '/SignIn' || location.pathname === '/SignUp';
                
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed()) {
                        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
                    }
                    if (notification.isSkippedMoment()) {
                        console.log('One Tap skipped:', notification.getSkippedReason());
                    }
                    if (notification.isDismissedMoment()) {
                        console.log('One Tap dismissed:', notification.getDismissedReason());
                    }
                });

            } catch (error) {
                console.error("Error initializing Google One Tap:", error);
            }
        };

        loadGoogleScript();

        // Cleanup
        return () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
        };
    }, [isAuthenticated, handleCredentialResponse, location.pathname]);

    // This component doesn't render anything visible - One Tap is shown by Google
    return null;
};

export default GoogleOneTap;
