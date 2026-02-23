import React, { useState } from 'react';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Sign.css';
import Google from './Google';

const SignUp = ({ onSignUp }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: '' });
    const navigate = useNavigate();

    const checkPasswordStrength = (pass) => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[a-z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++;

        const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return { level: strength, text: levels[strength] || '' };
    };

    const validatePassword = (password) => {
        if (!name || !email || !password) {
            return "All fields are required";
        }
        if (/\s/.test(password)) {
            return "Password should not contain spaces";
        }
        if (password.length < 8 || password.length > 20) {
            return "Password should be 8-20 characters";
        }
        if (!/[A-Z]/.test(password)) {
            return "Include at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Include at least one lowercase letter";
        }
        if (!/[0-9]/.test(password)) {
            return "Include at least one number";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Include at least one special character";
        }
        return '';
    };

    const handleUserName = (event) => {
        setName(event.target.value);
    };

    const handleUserEmail = (event) => {
        setEmail(event.target.value);
    };

    const handleUserPassword = (event) => {
        const pass = event.target.value;
        setPassword(pass);
        setPasswordStrength(checkPasswordStrength(pass));

        if (pass.length > 0) {
            const validationError = validatePassword(pass);
            if (validationError && pass.length >= 3) {
                // Only show validation after user starts typing
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const validationError = validatePassword(password);
        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/signup`,
                { name, email, password },
                { withCredentials: true }
            );

            onSignUp();
            setSuccess("Account created successfully! Redirecting...");

            const isAdmin = response.data?.user?.isAdmin;
            setTimeout(() => {
                if (isAdmin) {
                    navigate("/UserList");
                } else {
                    navigate("/UserProfile");
                }
            }, 1500);

        } catch (error) {
            setError(error.response?.data?.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleSuccess = (userData) => {
        onSignUp();
        if (userData.isAdmin) {
            setSuccess("Welcome Admin! Redirecting...");
            setTimeout(() => navigate("/UserList"), 1500);
        } else {
            setSuccess("Welcome! Redirecting...");
            setTimeout(() => navigate("/UserProfile"), 1500);
        }
    };

    const getStrengthClass = (index) => {
        if (index < passwordStrength.level) {
            if (passwordStrength.level <= 2) return 'weak';
            if (passwordStrength.level <= 3) return 'medium';
            return 'strong';
        }
        return '';
    };

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
                    <h1>Create Account</h1>
                    <p>Join us and start your journey</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={handleUserName}
                            autoComplete="name"
                        />
                        <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>

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
                                placeholder="Create password"
                                value={password}
                                onChange={handleUserPassword}
                                autoComplete="new-password"
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

                    {/* Password Strength Indicator */}
                    {password && (
                        <div className="password-strength">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`strength-bar ${getStrengthClass(i)}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={isLoading ? 'loading' : ''}
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Sign In Link */}
                <div className="signup-link">
                    <p>Already have an account? <Link to="/SignIn">Sign in</Link></p>
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

export default SignUp;