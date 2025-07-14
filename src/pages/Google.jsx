import React, { useEffect, useState } from "react";

const Google = () => {
    const [user, setUser] = useState(null);

    const handleGoogleLogin = () => {
        window.open("http://localhost:5000/api/auth/google", "_self");
    };

    // ✅ Fetch user after login
    useEffect(() => {
        fetch("http://localhost:5000/api/auth/user", {
            method: "GET",
            credentials: "include", // 💡 send session cookie
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUser(data.user);
                }
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            {!user ? (
                <>
                    <h2>Login Page</h2>
                    <button
                        onClick={handleGoogleLogin}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#4285F4",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            cursor: "pointer",
                        }}
                    >
                        Continue with Google
                    </button>
                </>
            ) : (
                <>
                    <h2>Welcome, {user.displayName}</h2>
                    <p>Email: {user.emails[0].value}</p>
                    <img
                        src={user.photos[0].value}
                        alt="Profile"
                        style={{ borderRadius: "50%", width: "100px", marginTop: "10px" }}
                    />
                </>
            )}
        </div>
    );
};

export default Google;