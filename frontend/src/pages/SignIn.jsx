import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import "@/pages/Auth.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SignIn = ({ onSignIn }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Store token in cookie
        Cookies.set("token", response.data.token, {
          expires: 7,
          secure: true,
          sameSite: "None",
        });

        if (onSignIn) onSignIn();

        // Redirect based on role
        if (response.data.role === "admin") {
          navigate("/admin/chat");
        } else {
          navigate("/chat");
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page" data-testid="signin-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <LogIn size={32} className="auth-icon" />
            <h1>Welcome Back</h1>
            <p>Sign in to continue to chat</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" data-testid="signin-form">
            {error && (
              <div className="error-message" data-testid="signin-error">
                {error}
              </div>
            )}

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="signin-email"
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
                data-testid="signin-password"
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

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
              data-testid="signin-submit"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" data-testid="signup-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
