import React, { useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// Global flag to prevent multiple initializations
let isGoogleInitialized = false;

// ⏱️ CONFIGURABLE SETTINGS
const ONE_TAP_CONFIG = {
    // Delay before showing One Tap (in milliseconds)
    DELAY_ON_REGULAR_PAGES: 120000,  // 2 minutes delay on regular pages
    DELAY_ON_PRIORITY_PAGES: 0,      // Immediate on SignIn, SignUp, Cart, Products pages
    
    // Pages where One Tap shows immediately
    PRIORITY_PAGES: ['/SignIn', '/SignUp', '/Cart', '/BestSellingProducts', '/TopProducts', '/ProductView'],
    
    // Should One Tap auto-select the account if only one is available?
    AUTO_SELECT: false,
    
    // Cancel when user clicks outside the popup?
    CANCEL_ON_TAP_OUTSIDE: false,
};

const GoogleOneTap = ({ isAuthenticated, onSignIn }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const initAttempted = useRef(false);
    const promptTimeoutRef = useRef(null);

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
                
                if (onSignIn) {
                    onSignIn();
                }

                const isAdmin = result.data.user?.isAdmin;
                const redirectPath = localStorage.getItem("redirectAfterAuth");

                setTimeout(() => {
                    if (redirectPath) {
                        localStorage.removeItem("redirectAfterAuth");
                        navigate(redirectPath);
                    } else if (isAdmin) {
                        navigate("/AdminPanel");
                    } else if (location.pathname === '/SignIn' || location.pathname === '/SignUp') {
                        navigate("/UserProfile");
                    }
                }, 500);
            }
        } catch (error) {
            console.error("❌ Google One Tap sign-in error:", error);
        }
    }, [navigate, onSignIn, location.pathname]);

    const showPrompt = useCallback((delay = 0) => {
        // Clear any existing timeout
        if (promptTimeoutRef.current) {
            clearTimeout(promptTimeoutRef.current);
        }

        promptTimeoutRef.current = setTimeout(() => {
            if (!window.google?.accounts?.id) return;
            
            try {
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed()) {
                        const reason = notification.getNotDisplayedReason();
                        console.log('ℹ️ One Tap not displayed:', reason);
                        // Reasons: opt_out_or_no_session, suppressed_by_user, etc.
                    }
                    if (notification.isSkippedMoment()) {
                        console.log('ℹ️ One Tap skipped:', notification.getSkippedReason());
                    }
                    if (notification.isDismissedMoment()) {
                        console.log('ℹ️ One Tap dismissed:', notification.getDismissedReason());
                    }
                });
                console.log(`⏱️ One Tap prompt shown after ${delay}ms delay`);
            } catch (error) {
                console.log("One Tap prompt error:", error);
            }
        }, delay);
    }, []);

    useEffect(() => {
        // Don't show One Tap if user is already authenticated
        if (isAuthenticated) {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
            if (promptTimeoutRef.current) {
                clearTimeout(promptTimeoutRef.current);
            }
            return;
        }

        // Don't show on admin/chat pages
        const excludedPages = ['/AdminPanel', '/AdminOrders', '/AdminUsers', '/AdminProducts', '/AdminVisitors', '/UserList', '/AdminChat', '/Chat'];
        if (excludedPages.some(page => location.pathname.startsWith(page))) {
            return;
        }

        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn("⚠️ Google Client ID not configured");
            return;
        }

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
                        auto_select: ONE_TAP_CONFIG.AUTO_SELECT,
                        cancel_on_tap_outside: ONE_TAP_CONFIG.CANCEL_ON_TAP_OUTSIDE,
                        itp_support: true,
                        use_fedcm_for_prompt: true,
                    });
                    isGoogleInitialized = true;
                    console.log("✅ Google One Tap initialized");
                } catch (error) {
                    console.error("Error initializing Google:", error);
                    return;
                }
            }

            // Determine delay based on current page
            const isAuthPage = location.pathname === '/SignIn' || location.pathname === '/SignUp';
            const delay = isAuthPage 
                ? ONE_TAP_CONFIG.DELAY_ON_AUTH_PAGES 
                : ONE_TAP_CONFIG.DELAY_ON_REGULAR_PAGES;

            showPrompt(delay);
        };

        // Load or use existing Google script
        if (!document.getElementById('google-identity-script')) {
            const script = document.createElement('script');
            script.id = 'google-identity-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => setTimeout(initializeOneTap, 100);
            document.head.appendChild(script);
        } else {
            setTimeout(initializeOneTap, 100);
        }

        // Cleanup
        return () => {
            initAttempted.current = false;
            if (promptTimeoutRef.current) {
                clearTimeout(promptTimeoutRef.current);
            }
        };
    }, [isAuthenticated, handleCredentialResponse, location.pathname, showPrompt]);

    // Re-trigger prompt when navigating to SignIn page
    useEffect(() => {
        if (isAuthenticated) return;
        
        const isAuthPage = location.pathname === '/SignIn' || location.pathname === '/SignUp';
        if (isAuthPage && window.google?.accounts?.id && isGoogleInitialized) {
            showPrompt(ONE_TAP_CONFIG.DELAY_ON_AUTH_PAGES);
        }
    }, [location.pathname, isAuthenticated, showPrompt]);

    return null;
};

// Export for other components
export const getGoogleInitialized = () => isGoogleInitialized;
export const setGoogleInitialized = (value) => { isGoogleInitialized = value; };

export default GoogleOneTap;
