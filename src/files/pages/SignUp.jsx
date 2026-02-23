<<<<<<< HEAD
import React, { useState } from 'react';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Sign.css';
import Google from './Google';

=======
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Google from './Google';




>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14
const SignUp = ({ onSignUp }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
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
=======
    const navigate = useNavigate();

>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14

    const validatePassword = (password) => {
        if (!name || !email || !password) {
            return "All fields are required";
        }
        if (/\s/.test(password)) {
<<<<<<< HEAD
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
=======
            return "Password should not contain any spaces.";
        }
        if (password.length < 8 || password.length > 20) {
            return "Password should be between 8 to 20 characters long.";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter.";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter.";
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one numeric character.";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Password must contain at least one special character.";
        }

>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14
        return '';
    };

    const handleUserName = (event) => {
        setName(event.target.value);
    };

    const handleUserEmail = (event) => {
        setEmail(event.target.value);
    };

    const handleUserPassword = (event) => {
<<<<<<< HEAD
        const pass = event.target.value;
        setPassword(pass);
        setPasswordStrength(checkPasswordStrength(pass));
        
        if (pass.length > 0) {
            const validationError = validatePassword(pass);
            if (validationError && pass.length >= 3) {
                // Only show validation after user starts typing
            }
        }
=======
        const Password = event.target.value;
        setPassword(Password);
        const validationError = validatePassword(Password);
        setError(validationError);
>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14
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
<<<<<<< HEAD
            setSuccess("Account created successfully! Redirecting...");
=======
            setSuccess("Account created successfully!");
>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14

            const isAdmin = response.data?.user?.isAdmin;
            setTimeout(() => {
                if (isAdmin) {
<<<<<<< HEAD
                    navigate("/UserList");
=======
                    navigate("/AdminChat");
>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14
                } else {
                    navigate("/UserProfile");
                }
            }, 1500);

        } catch (error) {
<<<<<<< HEAD
=======
            console.error("Signup Error:", error);
>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14
            setError(error.response?.data?.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

<<<<<<< HEAD
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
=======








    const handleGoogleSuccess = (userData) => {
        onSignUp();
        if (userData.isAdmin) {
            setSuccess("Welcome Admin! Redirecting to admin panel...");
            setTimeout(() => navigate("/UserList"), 1500);
        } else {
            setSuccess("Google signup successful!");
            setTimeout(() => navigate("/UserProfile"), 1500);
        }
        console.log("✅ Signed in as:", userData);
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
>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14

    return (
        <div className='sign'>
            <div className="sign_google">
<<<<<<< HEAD
                {/* Error/Success Messages */}
=======
>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14
                <div className='errorndsucc'>
                    {error && <p className={`err ${error ? 'visible' : 'hidden'}`}>{error}</p>}
                    {success && <p className={`suc ${success ? 'visible' : 'hidden'}`}>{success}</p>}
                </div>
<<<<<<< HEAD

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
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
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
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
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
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        {password && (
                            <span onClick={togglePasswordVisibility}>
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
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
=======
                <div className="sign-up">
                    <h1>Sign Up</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={handleUserName}
                    />
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
                        {password && <span
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ?
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                                    <path d="m630-444-41-41q8-60-33-96t-91-28l-41-41q6-3 23-6.5t33-3.5q68 0 114 46t46 114q0 16-2.5 31t-7.5 25Zm129 127-40-38q38-29 69-64.5t52-80.5q-51-103-146.5-163.5T480-724q-29 0-58.5 4T366-708l-43-43q36-14 76.5-20.5T480-778q138 0 252.5 76.5T900-500q-22 52-57.5 98T759-317Zm37 229L632-252q-24 12-63.5 21t-88.5 9q-139 0-253.5-76.5T60-500q23-54 60.5-101t81.5-80L88-796l38-38 708 708-38 38ZM242-642q-33 24-68 61.5T120-500q51 103 146.5 163.5T480-276q31 0 64.5-6t42.5-13l-54-56q-6 5-23 8t-30 3q-68 0-114-46t-46-114q0-12 3-28t8-25l-89-89Zm301 110Zm-128 63Z" /></svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                                    `<path d="M480.24-340q66.76 0 113.26-46.74 46.5-46.73 46.5-113.5 0-66.76-46.74-113.26-46.73-46.5-113.5-46.5-66.76 0-113.26 46.74-46.5 46.73-46.5 113.5 0 66.76 46.74 113.26 46.73 46.5 113.5 46.5Zm-.36-50Q434-390 402-422.12q-32-32.12-32-78T402.12-578q32.12-32 78-32T558-577.88q32 32.12 32 78T557.88-422q-32.12 32-78 32Zm.26 168Q341-222 228-298T60-500q55-126 167.86-202 112.85-76 252-76Q619-778 732-702t168 202q-55 126-167.86 202-112.85 76-252 76ZM480-500Zm0 224q115 0 211.87-60.58T840-500q-51.26-102.84-148.13-163.42Q595-724 480-724t-211.87 60.58Q171.26-602.84 120-500q51.26 102.84 148.13 163.42Q365-276 480-276Z" /></svg>}

                        </span>}
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="signup-link">
                    <p>Already have an account? <Link to="/SignIn">Sign In</Link></p>
                </div>
                <div className="hr_or_hr">
                    <div className="hr"></div>
                    <p>or</p>
                    <div className="hr"></div>
                </div>

                <div className="google-button">
                    <Google onSuccess={handleGoogleSuccess} />
                </div>

            </div>
        </div>
    );
}

export default SignUp;
>>>>>>> 22db2700b112c260606532a27f36f9623dd09a14
