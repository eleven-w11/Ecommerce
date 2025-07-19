import React, { useEffect, useState } from "react";

const Google = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load Google One Tap script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        // When token is returned
        window.handleCredentialResponse = async (response) => {
            const id_token = response.credential;

            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/signup/google`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include", // 💡 send & receive cookies
                    body: JSON.stringify({ id_token })
                });

                const data = await res.json();

                if (data.success) {
                    setUser(data.user);
                } else {
                    console.error("Login failed:", data.message);
                }
            } catch (error) {
                console.error("❌ Error during login:", error);
            }
        };

        // Initialize Google Sign-In
        window.onload = () => {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: window.handleCredentialResponse
            });

            window.google.accounts.id.renderButton(
                document.getElementById("google-login-button"),
                { theme: "outline", size: "large" }
            );
        };
    }, []);

    const handleLogout = async () => {
        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/logout`, {
            method: "GET",
            credentials: "include"
        });
        setUser(null);
    };

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            {!user ? (
                <>
                    <h2>Login Page</h2>
                    <div id="google-login-button"></div>
                </>
            ) : (
                <>
                    <h2>Welcome, {user.name}</h2>
                    <p>Email: {user.email}</p>
                    <img src={user.image} alt="Profile" style={{ borderRadius: "50%", width: "100px" }} />
                    <br />
                    <button onClick={handleLogout} style={{ marginTop: "20px" }}>
                        Logout
                    </button>
                </>
            )}
        </div>
    );
};

export default Google;
