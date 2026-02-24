import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../styles/CheckOut/SignInPopup.css";

const SignInPopup = ({ isOpen, onClose, onSignInSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/signin`,
                { email, password },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Call the success callback
                onSignInSuccess(response.data.user);
                onClose();
            }
        } catch (error) {
            setError(error.response?.data?.message || "Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToSignUp = () => {
        // Store current path for redirect after signup
        localStorage.setItem("redirectAfterAuth", location.pathname);
        navigate("/SignUp");
        onClose();
    };

    const handleGoToSignIn = () => {
        // Store current path for redirect after signin
        localStorage.setItem("redirectAfterAuth", location.pathname);
        navigate("/SignIn");
        onClose();
    };

    return (
        <div className="signin-popup-overlay" onClick={onClose}>
            <div className="signin-popup-container" onClick={(e) => e.stopPropagation()}>
                <button className="signin-popup-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="signin-popup-header">
                    <div className="signin-popup-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h2>Sign In Required</h2>
                    <p>Please sign in to continue with your checkout</p>
                </div>

                {error && <div className="signin-popup-error">{error}</div>}

                <form onSubmit={handleSubmit} className="signin-popup-form">
                    <div className="signin-popup-input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>

                    <div className="signin-popup-input-group">
                        <label>Password</label>
                        <div className="signin-popup-password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="signin-popup-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="signin-popup-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="signin-popup-spinner"></div>
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="signin-popup-divider">
                    <span>or</span>
                </div>

                <div className="signin-popup-actions">
                    <button 
                        className="signin-popup-secondary-btn"
                        onClick={handleGoToSignIn}
                    >
                        Go to Full Sign In Page
                    </button>
                    <p className="signin-popup-signup-link">
                        Don't have an account? 
                        <button onClick={handleGoToSignUp}>Create one</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignInPopup;
