import React, { useEffect } from "react";

const Google = ({ onSuccess }) => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.setAttribute("data-auto_prompt", "false");
        document.body.appendChild(script);

        window.handleCredentialResponse = async (response) => {
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
                        onSuccess(data.user); // ✅ Pass user to parent (e.g., SignUp.jsx)
                    }
                } else {
                    console.error("Google login failed:", data.message);
                }
            } catch (error) {
                console.error("❌ Error during Google login:", error);
            }
        };

        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: window.handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: false
            });

            window.google.accounts.id.renderButton(
                document.getElementById("google-login-button"),
                {
                    theme: "outline",
                    size: "large",
                    type: "standard",
                    text: "continue_with",
                    shape: "rectangular",
                    width: "100%"
                }
            );
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [onSuccess]);

    return (
        <div id="google-login-button" style={{ width: "100%", padding: "1px 0" }}></div>
    );
};

export default Google;