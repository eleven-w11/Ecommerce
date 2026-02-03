import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";
import "@/pages/Auth.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SignUp = ({ onSignUp }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/signup`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Store token in cookie
        Cookies.set("token", response.data.token, {
          expires: 7,
          secure: true,
          sameSite: "None",
        });

        if (onSignUp) onSignUp();
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page" data-testid="signup-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <UserPlus size={32} className="auth-icon" />
            <h1>Create Account</h1>
            <p>Sign up to start chatting with support</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" data-testid="signup-form">
            {error && (
              <div className="error-message" data-testid="signup-error">
                {error}
              </div>
            )}

            <div className="input-group">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                data-testid="signup-name"
              />
            </div>

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="signup-email"
              />
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                data-testid="signup-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                data-testid="signup-confirm-password"
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
              data-testid="signup-submit"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/signin" data-testid="signin-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
