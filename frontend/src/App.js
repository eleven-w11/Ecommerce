import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import NavBar from './files/pages/NavBar/NavBar';
import UserLocation from './files/pages/UserLocationInfo';
import SignIn from './files/pages/SignIn';
import SignUp from './files/pages/SignUp';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import UserProfile from './files/pages/UserProfilePage';
import TeSt from './files/pages/teSt';
import TestHero from './files/pages/HeroSection';
import BestSellingProducts from './files/pages/BestSelling';
import TopProduct from './files/pages/TopProducts';
import ProductView from './files/pages/ProductView';
import ScrollToTop from "./files/pages/ScrollToTop";
import Footer from './files/pages/Footer';
import Cart from './files/pages/Cart';
import Google from './files/pages/Google';
import SearchResults from './files/pages/NavBar/SearchResults';
import Checkout from './files/pages/CheckOut/Checkout';
import OrderConfirmation from './files/pages/OrderConfirmation';
import AboutUs from './files/pages/AboutUs';
import ContactUs from './files/pages/ContactUs';
// Chat imports
import Chat from './files/pages/Chat';
import UserList from './files/pages/admin/adminchat/UserList';
import AdminChat from './files/pages/admin/adminchat/AdminChat';
// Admin Panel
import AdminPanel from './files/pages/admin/adminpanel/AdminPanel';
import AdminOrders from './files/pages/admin/adminpanel/AdminOrders';
import AdminUsers from './files/pages/admin/adminpanel/AdminUsers';
import AdminProducts from './files/pages/admin/adminpanel/AdminProducts';
import AdminVisitors from './files/pages/admin/adminpanel/AdminVisitors';
// Admin Protection
import AdminProtectedRoute from './files/components/AdminProtectedRoute';
// Google One Tap
import GoogleOneTap from './files/components/GoogleOneTap';

// Routes where navbar should be completely hidden (admin pages)
const hideNavBarRoutes = ['/Chat', '/UserList', '/AdminChat', '/AdminPanel', '/AdminOrders', '/AdminUsers', '/AdminProducts', '/AdminVisitors'];

// Check if current route is an admin route
const isAdminRoute = (pathname) => {
  return hideNavBarRoutes.some(route => pathname.startsWith(route.replace(':userId', '')));
};

// Routes where One Tap should NOT show (sign-in pages already have Google button)
const hideOneTapRoutes = ['/SignIn', '/SignUp', '/UserProfile', '/AdminPanel', '/AdminOrders', '/AdminUsers', '/AdminProducts', '/AdminVisitors', '/UserList', '/AdminChat', '/Chat'];


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const location = useLocation();
  const socketRef = useRef(null);

  console.warn("app.js Say's", isAuthenticated);

  // Initialize socket connection for visitor tracking
  useEffect(() => {
    // Connect to socket for visitor tracking
    socketRef.current = io(process.env.REACT_APP_API_BASE_URL, {
      path: '/api/socket.io/',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('🟢 Visitor connected to socket');
      
      // Send initial visibility state
      const isVisible = document.visibilityState === 'visible';
      socketRef.current.emit('visibilityChange', { isVisible });
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔴 Visitor disconnected from socket');
    });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      console.log(`👁️ Page visibility changed: ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
      
      if (socketRef.current?.connected) {
        socketRef.current.emit('visibilityChange', { isVisible });
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Send heartbeat every 5 seconds to let server know we're still here
    const heartbeatInterval = setInterval(() => {
      if (socketRef.current?.connected && document.visibilityState === 'visible') {
        socketRef.current.emit('heartbeat');
      }
    }, 5000);

    // Handle page unload (beforeunload) - send visibility hidden
    const handleBeforeUnload = () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('visibilityChange', { isVisible: false });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeatInterval);
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide navbar completely on admin routes, or on mobile for chat routes
  const shouldShowNavBar = !isAdminRoute(location.pathname) && 
    !(width < 600 && location.pathname.startsWith('/Chat'));

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/verifytoken`,
          { withCredentials: true }
        );

        console.log("✅ Auth Response:", response);

        if (response.data && response.data.success && response.data.userId) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleSignIn = () => setIsAuthenticated(true);
  const handleSignUp = () => setIsAuthenticated(true);
  const handleSignOut = () => setIsAuthenticated(false);
  
  // Handle One Tap login success
  const handleOneTapSuccess = (user) => {
    setIsAuthenticated(true);
  };

  // Check if One Tap should show on current page
  const shouldShowOneTap = !isAuthenticated && 
    !hideOneTapRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div>
      {shouldShowNavBar && <NavBar Authentication={isAuthenticated} />}
      {shouldShowOneTap && <GoogleOneTap onLoginSuccess={handleOneTapSuccess} />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <>
            <div className="Home-Webverse">
              
              <TestHero />
              <BestSellingProducts isBestSellingPage={false} />
              <TopProduct isTopProductsPage={false} />
              <Footer />

            </div>

          </>
        } />
        <Route path="/UserLocation" element={<UserLocation />} />
        <Route path="/SignIn" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/SignUp" element={<SignUp onSignUp={handleSignUp} />} />
        <Route path="/UserProfile" element={<UserProfile onSignOut={handleSignOut} />} />
        <Route path="/test" element={<TeSt />} />
        <Route path="/product/:id" element={<ProductView />} />
        <Route path="/BestSelling" element={<BestSellingProducts isBestSellingPage={true} />} />
        <Route path="/TopProducts" element={<TopProduct isTopProductsPage={true} />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ContactUs" element={<ContactUs />} />


        <Route path="/Google" element={<Google />} />
        <Route path="/search" element={<SearchResults />} />
        
        {/* Chat Routes */}
        <Route path="/Chat" element={<Chat />} />
        <Route path="/UserList" element={<AdminProtectedRoute><UserList /></AdminProtectedRoute>} />
        <Route path="/AdminChat/:odirUserId" element={<AdminProtectedRoute><AdminChat /></AdminProtectedRoute>} />
        
        {/* Admin Panel - All Protected */}
        <Route path="/AdminPanel" element={<AdminProtectedRoute><AdminPanel /></AdminProtectedRoute>} />
        <Route path="/AdminOrders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
        <Route path="/AdminUsers" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/AdminProducts" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;