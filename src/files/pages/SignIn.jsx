import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../styles/Sign.css';
import Google from './Google';

const SignIn = ({ onSignIn }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleUserEmail = (event) => {
        setEmail(event.target.value);
    };

    const handleUserPassword = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
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

            onSignIn();
            setError("");
            setSuccess("Welcome back! Redirecting...");

            const isAdmin = response.data?.user?.isAdmin;

            // Check for redirect after auth
            const redirectPath = localStorage.getItem("redirectAfterAuth");

            setTimeout(() => {
                if (redirectPath) {
                    localStorage.removeItem("redirectAfterAuth");
                    navigate(redirectPath);
                } else if (isAdmin) {
                    navigate("/UserList");
                } else {
                    navigate("/UserProfile");
                }
            }, 1500);

            setEmail("");
            setPassword("");

        } catch (error) {
            setError(error.response?.data?.message || "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleSuccess = (userData) => {
        onSignIn();
        
        // Check for redirect after auth
        const redirectPath = localStorage.getItem("redirectAfterAuth");
        
        if (redirectPath) {
            localStorage.removeItem("redirectAfterAuth");
            setSuccess("Welcome! Redirecting...");
            setTimeout(() => navigate(redirectPath), 1500);
        } else if (userData.isAdmin) {
            setSuccess("Welcome Admin! Redirecting...");
            setTimeout(() => navigate("/UserList"), 1500);
        } else {
            setSuccess("Welcome! Redirecting...");
            setTimeout(() => navigate("/UserProfile"), 1500);
        }
    };

    useEffect(() => {
        const setSignHeight = () => {
            const height = window.innerHeight - 0;
            const signElement = document.querySelector(".sign");

            if (signElement) {
                signElement.style.height = `${height}px`;
            }
        };

        setSignHeight();

        window.addEventListener("resize", setSignHeight);

        return () => window.removeEventListener("resize", setSignHeight);
    }, []);

    return (
        <div className='sign'>
            <div className="sign_google">
                {/* Error/Success Messages */}
                <div className='errorndsucc'>
                    {error && <p className={`err ${error ? 'visible' : 'hidden'}`}>{error}</p>}
                    {success && <p className={`suc ${success ? 'visible' : 'hidden'}`}>{success}</p>}
                </div>

                {/* Title */}
                <div className="sign-up">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={handleUserEmail}
                            autoComplete="email"
                        />
                        <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>

                    {/* Password Input */}
                    <div className='input-unhide'>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={handleUserPassword}
                                autoComplete="current-password"
                            />
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        {password && (
                            <span onClick={togglePasswordVisibility}>
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
                            </span>
                        )}
                    </div>

                    {/* Forget Password */}
                    <div className="forget_password">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={isLoading ? 'loading' : ''}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Sign Up Link */}
                <div className="signup-link">
                    <p>Don't have an account? <Link to="/SignUp">Sign up</Link></p>
                </div>

                {/* Divider */}
                <div className="hr_or_hr">
                    <div className="hr"></div>
                    <p>or continue with</p>
                    <div className="hr"></div>
                </div>

                {/* Google Button */}
                <div className="google-button">
                    <Google onSuccess={handleGoogleSuccess} />
                </div>
            </div>
        </div>
    );
};

export default SignIn;