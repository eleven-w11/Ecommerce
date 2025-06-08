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
        <button onClick={handleGoogleLogin} className="google-signin-btn">
            Continue with Google
        </button>
    );
};

export default GoogleSign;
