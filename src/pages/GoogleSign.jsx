import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GoogleSign = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: () => {
            // Directly open the backend auth endpoint
            window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google`;
        },
        onError: () => {
            navigate('/login?error=google_auth_failed');
        }
    });

    return (
        <a href="http://localhost:5000/auth/google" className="google-signin-btn">
            Continue with Google
        </a>

    );
};

export default GoogleSign;