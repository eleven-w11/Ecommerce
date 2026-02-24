import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/CheckOut/SignInPopup.css";

const SignInPopup = ({ isOpen, onClose, onSignInSuccess }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!isOpen) return null;

    const handleGoToSignIn = () => {
        // Store current path for redirect after signin
        localStorage.setItem("redirectAfterAuth", location.pathname);
        navigate("/SignIn");
        onClose();
    };

    const handleGoToSignUp = () => {
        // Store current path for redirect after signup
        localStorage.setItem("redirectAfterAuth", location.pathname);
        navigate("/SignUp");
        onClose();
    };

    return (
        <div className="signin-popup-overlay">
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

                <div className="signin-popup-instructions">
                    <div className="instruction-item">
                        <span className="instruction-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                        </span>
                        <span>Sign in to save your order securely</span>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                        </span>
                        <span>Track your order status anytime</span>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                        </span>
                        <span>Access your order history</span>
                    </div>
                </div>

                <div className="signin-popup-actions">
                    <button 
                        className="signin-popup-primary-btn"
                        onClick={handleGoToSignIn}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        Sign In
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
