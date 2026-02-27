import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * Google One Tap Sign-In Component
 * 
 * HOW IT WORKS:
 * -------------
 * 1. Shows a popup in the corner of the screen (not a full page)
 * 2. User clicks their Google account → Instantly signed in
 * 3. No need to go to sign-in page
 * 
 * WHEN IT APPEARS:
 * ----------------
 * - User is NOT logged in to your site
 * - User HAS a Google account logged in their browser
 * - User hasn't dismissed it in the last few hours (Google cooldown)
 * - Page has this component mounted
 * 
 * WHO SEES IT:
 * ------------
 * - Any visitor with a Google account in their browser
 * - Works on desktop and mobile
 * - Won't show if user already has your site's auth cookie
 * 
 * WHERE TO USE:
 * -------------
 * - Homepage
 * - Product pages
 * - Any page where you want easy sign-up/sign-in
 * - NOT on sign-in/sign-up pages (they already have Google button)
 */

const GoogleOneTap = ({ onLoginSuccess }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const checkAuthAndShowOneTap = async () => {
            try {
                // Check if user is already authenticated
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/user/profile`,
                    { withCredentials: true }
                );
                
                // User is logged in, don't show One Tap
                if (response.data && response.data.email) {
                    return;
                }
            } catch (error) {
                // User not logged in, show One Tap
                initializeOneTap();
            }
        };

        const initializeOneTap = () => {
            // Load Google script if not loaded
            if (!window.google) {
                const script = document.createElement("script");
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.defer = true;
                script.onload = setupOneTap;
                document.body.appendChild(script);
            } else {
                setupOneTap();
            }
        };

        const setupOneTap = () => {
            if (!window.google) return;

            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: true,  // Auto-select if only one account
                cancel_on_tap_outside: false,  // Don't close when clicking outside
                itp_support: true,  // Safari support
            });

            // Show the One Tap prompt
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    console.log("One Tap not displayed:", notification.getNotDisplayedReason());
                    // Reasons: browser_not_supported, invalid_client, missing_client_id,
                    // opt_out_or_no_session, secure_http_required, suppressed_by_user, etc.
                }
                if (notification.isSkippedMoment()) {
                    console.log("One Tap skipped:", notification.getSkippedReason());
                    // Reasons: auto_cancel, user_cancel, tap_outside, issuing_failed
                }
            });
        };

        const handleCredentialResponse = async (response) => {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/api/signup/google`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ id_token: response.credential }),
                    }
                );

                const data = await res.json();
                
                if (data.success) {
                    console.log("One Tap login successful!");
                    
                    if (onLoginSuccess) {
                        onLoginSuccess(data.user);
                    }
                    
                    // Redirect based on user type
                    if (data.user.isAdmin) {
                        navigate("/AdminPanel");
                    } else {
                        navigate("/UserProfile");
                    }
                    
                    // Reload to update navbar state
                    window.location.reload();
                }
            } catch (error) {
                console.error("One Tap login error:", error);
            }
        };

        // Small delay to let the page load first
        const timer = setTimeout(checkAuthAndShowOneTap, 1000);

        return () => {
            clearTimeout(timer);
            // Cancel One Tap if component unmounts
            if (window.google) {
                window.google.accounts.id.cancel();
            }
        };
    }, [navigate, onLoginSuccess]);

    // This component doesn't render anything visible
    // The One Tap popup is managed by Google's script
    return null;
};

export default GoogleOneTap;
