import React, { useEffect } from "react";

const Google = ({ onSuccess }) => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        window.handleCredentialResponse = async (response) => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/signup/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ id_token: response.credential })
                });
                const data = await res.json();
                if (data.success && onSuccess) onSuccess(data.user);
            } catch (error) {
                console.error("Google login error:", error);
            }
        };

        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: window.handleCredentialResponse,
                auto_select: false
            });

            window.google.accounts.id.renderButton(
                document.getElementById("google-login-button"),
                { type: "standard", theme: "outline", text: "continue_with", size: "large" }
            );
        };

        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
            delete window.handleCredentialResponse;
        };
    }, [onSuccess]);

    return <div id="google-login-button" className="google-button-container"></div>;
};

export default Google;