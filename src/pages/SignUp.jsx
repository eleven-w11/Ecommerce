import React, { useState } from 'react';
import axios from "axios";
import '../index.css';
import { useNavigate } from "react-router-dom";

const SignUp = ({ onSignUp }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();


    const validatePassword = (password) => {
        if (!name || !email || !password) {
            return "All fields are required";
        }
        if (/\s/.test(password)) {
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

        return '';
    };

    const handleUserName = (event) => {
        setName(event.target.value);
    };

    const handleUserEmail = (event) => {
        setEmail(event.target.value);
    };

    const handleUserPassword = (event) => {
        const Password = event.target.value;
        setPassword(Password);
        const validationError = validatePassword(Password);
        setError(validationError);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validatePassword(password);

        if (validationError) {
            setError(validationError);
            setSuccess("");
            return;
        }


        try {
            const response = await axios.post(
                "http://localhost:5000/api/signup",
                { name, email, password },
                { withCredentials: true }
            );

            onSignUp();
            setError("");
            navigate("/userprofile");
            setName("");
            setEmail("");
            setPassword("");
        } catch (error) {
            
            console.error("Signup Error:", error);
            setError(error.response?.data?.message || "Failed to create account. Please try again.");
            setSuccess("");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='sign'>
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
                <button type="submit">Sign Up</button>
            </form>
            <div className="hr"></div>
            <div className='errorndsucc'>
                {error && <p className={`err ${error ? 'visible' : 'hidden'}`}>{error}</p>}
                {success && <p className={`suc ${success ? 'visible' : 'hidden'}`}>{success}</p>}
            </div>
            <div className="google">
                <button>Continue With Goolge</button>
            </div>
        </div>
    );
}

export default SignUp;