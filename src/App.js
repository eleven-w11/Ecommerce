import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import NavBar from './files/pages/NavBar/NavBar';
import UserLocation from './files/pages/UserLocationInfo';
import SignIn from './files/pages/SignIn';
import SignUp from './files/pages/SignUp';
import { useState, useEffect } from 'react';
import axios from 'axios';
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

// Routes where navbar should be hidden on mobile
const hideNavBarRoutes = ['/Chat', '/UserList', '/AdminChat', '/AdminPanel'];


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const location = useLocation();

  console.warn("app.js Say's", isAuthenticated);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldShowNavBar = !(width < 600 && hideNavBarRoutes.some(route =>
    location.pathname.startsWith(route.replace(':userId', ''))
  ));

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

  return (
    <div>
      {shouldShowNavBar && <NavBar Authentication={isAuthenticated} />}
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
        <Route path="/UserList" element={<UserList />} />
        <Route path="/AdminChat/:odirUserId" element={<AdminChat />} />
        
        {/* Admin Panel */}
        <Route path="/AdminPanel" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default App;