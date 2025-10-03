import React, { useEffect, useRef, useState } from "react";

const Google = ({ onSuccess, onError }) => {
    const googleButtonRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleCredentialResponse = async (response) => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/api/signup/google`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 👈 token cookie store hoga
                        body: JSON.stringify({ id_token: response.credential }),
                    }
                );

                const data = await res.json();
                if (data.success) {
                    if (onSuccess) onSuccess(data.user);
                } else {
                    if (onError) onError(data.message || "Google sign-in failed");
                }
            } catch (error) {
                console.error("Google login error:", error);
                if (onError) onError("Google login error, please try again.");
            } finally {
                setLoading(false);
            }
        };

        const loadGoogleAuth = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: false,
                });

                // Render invisible button
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    type: "icon",
                    size: "large",
                    theme: "outline",
                    width: "0", // invisible
                });
            }
        };

        // Load Google script
        if (!window.google) {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = loadGoogleAuth;
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        } else {
            loadGoogleAuth();
        }
    }, [onSuccess, onError]);

    const handleCustomButtonClick = () => {
        if (window.google && googleButtonRef.current) {
            const btn = googleButtonRef.current.querySelector("div[role=button]");
            if (btn) btn.click();
        }
    };

    return (
        <>
            {/* Invisible Google button */}
            <div ref={googleButtonRef} style={{ display: "none" }}></div>

            {/* Custom Google button */}
            <button
                onClick={handleCustomButtonClick}
                className="custom-google-button"
                disabled={loading}
            >
                <span className="google-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </span>
                {loading ? "Signing in..." : "Continue with Google"}
            </button>
        </>
    );
};

export default Google;