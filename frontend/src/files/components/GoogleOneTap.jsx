import React, { useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// Global flag to prevent multiple initializations
let isGoogleInitialized = false;

const GoogleOneTap = ({ isAuthenticated, onSignIn }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const initAttempted = useRef(false);

    const handleCredentialResponse = useCallback(async (response) => {
        try {
            console.log("🔐 Google One Tap: Processing sign-in...");
            
            const result = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/signup/google`,
                { id_token: response.credential },
                { withCredentials: true }
            );

            if (result.data.success) {
                console.log("✅ Google One Tap: Sign-in successful!");
                
                // Call the onSignIn callback to update auth state
                if (onSignIn) {
                    onSignIn();
                }

                const isAdmin = result.data.user?.isAdmin;
                const redirectPath = localStorage.getItem("redirectAfterAuth");

                // Redirect logic
                setTimeout(() => {
                    if (redirectPath) {
                        localStorage.removeItem("redirectAfterAuth");
                        navigate(redirectPath);
                    } else if (isAdmin) {
                        navigate("/AdminPanel");
                    } else if (location.pathname === '/SignIn' || location.pathname === '/SignUp') {
                        navigate("/UserProfile");
                    }
                    // If on other pages, stay on the same page (page will re-render with auth state)
                }, 500);
            }
        } catch (error) {
            console.error("❌ Google One Tap sign-in error:", error);
        }
    }, [navigate, onSignIn, location.pathname]);

    useEffect(() => {
        // Don't show One Tap if user is already authenticated
        if (isAuthenticated) {
            // Cancel any existing prompt when user becomes authenticated
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
            return;
        }

        // Don't show on admin pages or chat
        const excludedPages = ['/AdminPanel', '/AdminOrders', '/AdminUsers', '/AdminProducts', '/AdminVisitors', '/UserList', '/AdminChat', '/Chat'];
        if (excludedPages.some(page => location.pathname.startsWith(page))) {
            return;
        }

        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn("⚠️ Google Client ID not configured");
            return;
        }

        // Prevent multiple initializations on the same page
        if (initAttempted.current) {
            return;
        }
        initAttempted.current = true;

        const initializeOneTap = () => {
            if (!window.google?.accounts?.id) {
                setTimeout(initializeOneTap, 200);
                return;
            }

            // Only initialize once globally
            if (!isGoogleInitialized) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: false,
                        itp_support: true,
                        use_fedcm_for_prompt: true, // Enable FedCM for better compatibility
                    });
                    isGoogleInitialized = true;
                    console.log("✅ Google One Tap initialized globally");
                } catch (error) {
                    console.error("Error initializing Google:", error);
                    return;
                }
            }

            // Show the prompt
            try {
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed()) {
                        const reason = notification.getNotDisplayedReason();
                        console.log('ℹ️ One Tap not displayed:', reason);
                        // Common reasons:
                        // - browser_not_supported
                        // - invalid_client
                        // - missing_client_id
                        // - opt_out_or_no_session (no Google account logged in)
                        // - suppressed_by_user (user dismissed recently)
                    }
                    if (notification.isSkippedMoment()) {
                        console.log('ℹ️ One Tap skipped:', notification.getSkippedReason());
                    }
                    if (notification.isDismissedMoment()) {
                        console.log('ℹ️ One Tap dismissed:', notification.getDismissedReason());
                    }
                });
            } catch (error) {
                console.log("One Tap prompt error:", error);
            }
        };

        // Load or use existing Google script
        if (!document.getElementById('google-identity-script')) {
            const script = document.createElement('script');
            script.id = 'google-identity-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setTimeout(initializeOneTap, 100);
            };
            document.head.appendChild(script);
        } else {
            setTimeout(initializeOneTap, 100);
        }

        // Cleanup on unmount
        return () => {
            initAttempted.current = false;
        };
    }, [isAuthenticated, handleCredentialResponse, location.pathname]);

    // Re-trigger prompt when navigating to SignIn page
    useEffect(() => {
        if (isAuthenticated) return;
        
        const isAuthPage = location.pathname === '/SignIn' || location.pathname === '/SignUp';
        if (isAuthPage && window.google?.accounts?.id && isGoogleInitialized) {
            // Small delay to ensure page is rendered
            setTimeout(() => {
                try {
                    window.google.accounts.id.prompt();
                    console.log("🔄 One Tap re-triggered on auth page");
                } catch (e) {
                    // Ignore errors
                }
            }, 500);
        }
    }, [location.pathname, isAuthenticated]);

    return null;
};

// Export the initialization flag for other components
export const getGoogleInitialized = () => isGoogleInitialized;
export const setGoogleInitialized = (value) => { isGoogleInitialized = value; };

export default GoogleOneTap;
