import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { MessageCircle, LogIn, UserPlus, Shield, LogOut } from "lucide-react";

// Pages
import Chat from "@/pages/Chat";
import AdminChat from "@/pages/AdminChat";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Home Page Component
const Home = ({ isAuthenticated, userRole, onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.log("Logout error:", e);
    }
    Cookies.remove("token");
    if (onSignOut) onSignOut();
    navigate("/");
  };

  return (
    <div className="home-page" data-testid="home-page">
      <div className="home-container">
        <div className="home-hero">
          <MessageCircle size={64} className="hero-icon" />
          <h1>Real-Time Chat Support</h1>
          <p>Connect with our support team instantly</p>
        </div>

        <div className="home-actions">
          {isAuthenticated ? (
            <>
              {userRole === "admin" ? (
                <Link to="/admin/chat" className="btn btn-primary" data-testid="admin-chat-btn">
                  <Shield size={20} />
                  Admin Dashboard
                </Link>
              ) : (
                <Link to="/chat" className="btn btn-primary" data-testid="user-chat-btn">
                  <MessageCircle size={20} />
                  Start Chatting
                </Link>
              )}
              <button onClick={handleSignOut} className="btn btn-secondary" data-testid="signout-btn">
                <LogOut size={20} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn btn-primary" data-testid="signin-home-btn">
                <LogIn size={20} />
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-secondary" data-testid="signup-home-btn">
                <UserPlus size={20} />
                Create Account
              </Link>
            </>
          )}
        </div>

        <div className="home-features">
          <div className="feature-card" data-testid="feature-realtime">
            <h3>Real-Time Messaging</h3>
            <p>Instant message delivery with read receipts</p>
          </div>
          <div className="feature-card" data-testid="feature-status">
            <h3>Online Status</h3>
            <p>See when support is available</p>
          </div>
          <div className="feature-card" data-testid="feature-history">
            <h3>Chat History</h3>
            <p>Your conversations are saved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/auth/verify`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setIsAuthenticated(true);
          setUserRole(response.data.role || "user");
        } else {
          setIsAuthenticated(false);
          Cookies.remove("token");
        }
      } catch (error) {
        setIsAuthenticated(false);
        Cookies.remove("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    // Re-check to get role
    const checkRole = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`${BACKEND_URL}/api/auth/verify`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.data.success) {
          setUserRole(response.data.role || "user");
        }
      } catch (e) {
        console.log("Role check error:", e);
      }
    };
    checkRole();
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    setUserRole("user");
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserRole("user");
  };

  if (isLoading) {
    return (
      <div className="loading-screen" data-testid="loading-screen">
        <div className="loader">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                onSignOut={handleSignOut}
              />
            }
          />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin/chat" element={<AdminChat />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
