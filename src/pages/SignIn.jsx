import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import './styles/Sign.css';
import { useGoogleLogin } from '@react-oauth/google';
import google from "./images/google.png";

const SignIn = ({ onSignIn }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || "/";

    const handleUserEmail = (event) => {
        setEmail(event.target.value);
    };

    const handleUserPassword = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            setError("Email and password are required.");
            setSuccess("");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/signin`, { email, password }, { withCredentials: true });

            onSignIn();
            setError("");
            setSuccess("Sign in SuccessFully");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            navigate(from, { replace: true });

            setEmail("");
            setPassword("");

        } catch (error) {
            // console.warn("Error during Sign In:", error);
            setError(error.response?.data?.message || "Failed to sign in. Please try again.");
            setSuccess("");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        // setGoogleLoading(true);
        // setError("");

        try {
            // First get the ID token from Google
            const googleResponse = await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                        // Accept: 'application/json'
                    }
                }
            );

            // Then send the user info to your backend
            const { data } = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/signup/google`,
                {
                    email: googleResponse.data.email,
                    name: googleResponse.data.name,
                    picture: googleResponse.data.picture,
                    googleId: googleResponse.data.id
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            onSignIn();
            setSuccess("Google signup successful!");
            setTimeout(() => navigate("/userprofile"), 1500);
            localStorage.setItem('token', data.token);
            navigate("/userprofile");
        } catch (error) {
            console.error("Google Signup Error:", error);
            setError(error.response?.data?.message || "Google signup failed. Please try again.");
        } finally {
            setGoogleLoading(false);
        }
    };




    const handleGoogleFailure = () => {
        setError("Google authentication failed. Please try again.");
    };

    const login = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleFailure,
        flow: 'implicit'
    });


    useEffect(() => {
        const setSignHeight = () => {
            const height = window.innerHeight - 60;
            const signElement = document.querySelector(".sign");

            if (signElement) {
                signElement.style.height = `${height}px`;
            }
        };

        // Set on mount
        setSignHeight();

        // Update on window resize
        window.addEventListener("resize", setSignHeight);

        // Cleanup
        return () => window.removeEventListener("resize", setSignHeight);
    }, []);



    return (
        <div className='sign'>

            <div className="sign_google">
                <div className='errorndsucc'>
                    {error && <p className={`err ${error ? 'visible' : 'hidden'}`}>{error}</p>}
                    {success && <p className={`suc ${success ? 'visible' : 'hidden'} `}>{success}</p>}
                </div>
                <div className="sign-up">
                    <h1>Sign In</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={handleUserEmail}
                    />
                    <div className='input-unhide'>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={handleUserPassword}
                        />
                        <div className="forget_password">
                            <Link>forget password</Link>
                        </div>
                        {password && <span
                            type="button"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ?
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                                    <path d="m630-444-41-41q8-60-33-96t-91-28l-41-41q6-3 23-6.5t33-3.5q68 0 114 46t46 114q0 16-2.5 31t-7.5 25Zm129 127-40-38q38-29 69-64.5t52-80.5q-51-103-146.5-163.5T480-724q-29 0-58.5 4T366-708l-43-43q36-14 76.5-20.5T480-778q138 0 252.5 76.5T900-500q-22 52-57.5 98T759-317Zm37 229L632-252q-24 12-63.5 21t-88.5 9q-139 0-253.5-76.5T60-500q23-54 60.5-101t81.5-80L88-796l38-38 708 708-38 38ZM242-642q-33 24-68 61.5T120-500q51 103 146.5 163.5T480-276q31 0 64.5-6t42.5-13l-54-56q-6 5-23 8t-30 3q-68 0-114-46t-46-114q0-12 3-28t8-25l-89-89Zm301 110Zm-128 63Z" /></svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                                    <path d="M480.24-340q66.76 0 113.26-46.74 46.5-46.73 46.5-113.5 0-66.76-46.74-113.26-46.73-46.5-113.5-46.5-66.76 0-113.26 46.74-46.5 46.73-46.5 113.5 0 66.76 46.74 113.26 46.73 46.5 113.5 46.5Zm-.36-50Q434-390 402-422.12q-32-32.12-32-78T402.12-578q32.12-32 78-32T558-577.88q32 32.12 32 78T557.88-422q-32.12 32-78 32Zm.26 168Q341-222 228-298T60-500q55-126 167.86-202 112.85-76 252-76Q619-778 732-702t168 202q-55 126-167.86 202-112.85 76-252 76ZM480-500Zm0 224q115 0 211.87-60.58T840-500q-51.26-102.84-148.13-163.42Q595-724 480-724t-211.87 60.58Q171.26-602.84 120-500q51.26 102.84 148.13 163.42Q365-276 480-276Z" /></svg>}
                        </span>}
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="signup-link">
                    <p>Don't have an account? <Link to="/SignUp">Sign Up</Link></p>
                </div>
                <div className="hr_or_hr">
                    <div className="hr"></div>
                    <p>or</p>
                    <div className="hr"></div>
                </div>

                <button
                    className="google-btn"
                    onClick={() => login()}
                    disabled={googleLoading}
                >
                    <img src={google} alt="Google" className="icon" />
                    <p>{googleLoading ? 'Signing Up...' : 'Sign Up With Google'}</p>
                </button>

            </div>

        </div>

    );
}

export default SignIn;