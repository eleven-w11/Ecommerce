import React, { useEffect } from "react";

const Google = ({ onSuccess }) => {
    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (!window.google) {
                console.error("Google library not loaded yet");
                return;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    callback: window.handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: false
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("google-login-button"),
                    {
                        // theme: "outline",
                        size: "large",
                        // type: "standard",
                        text: "continue_with",
                        shape: "rectangular",
                        width: "100%", // Fixed width often works better than 100%
                        logo_alignment: "left"
                    }
                );

                console.log("Google button rendered successfully");
            } catch (error) {
                console.error("Error initializing Google button:", error);
            }
        };

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            console.log("Google script loaded");
            window.handleCredentialResponse = async (response) => {
                console.log("Google credential response received");
                const id_token = response.credential;

                try {
                    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/signup/google`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({ id_token })
                    });

                    const data = await res.json();

                    if (data.success) {
                        if (onSuccess) {
                            onSuccess(data.user);
                        }
                    } else {
                        console.error("Google login failed:", data.message);
                    }
                } catch (error) {
                    console.error("Error during Google login:", error);
                }
            };

            // Add slight delay to ensure everything is ready
            setTimeout(initializeGoogleSignIn, 100);
        };

        script.onerror = () => {
            console.error("Failed to load Google script");
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            delete window.handleCredentialResponse;
        };
    }, [onSuccess]);

    return (
        <div id="google-login-button" style={{
            width: "100%", // Match the width in renderButton options
            // height: "44px", // Standard height for large button
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto"
        }}></div>
    );
};

export default Google;