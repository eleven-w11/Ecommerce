import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './pages/NavBar';
import UserLocation from './pages/UserLocationInfo';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './pages/UserProfilePage';
import TeSt from './pages/teSt';
import TestHero from './pages/HeroSection';
import BestSellingProducts from './pages/BestSelling';
import TopProduct from './pages/TopProducts';
import ProductView from './pages/ProductView';
// import CaRt from './pages/Cart';
import ScrollToTop from "./pages/ScrollToTop";
import Footer from './pages/Footer';
import Cart from './pages/Cart';
import TestWeb from './pages/TestWeb';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.warn("app.js Say's", isAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/verifytoken",
          { withCredentials: true }
        );

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

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <div>
      <NavBar Authentication={isAuthenticated} />
      {/* <TestWeb /> */}


      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <>
            <TestHero />
            <BestSellingProducts />
            <TopProduct />
            <Footer />
          </>
        } />
        <Route path="/UserLocation" element={<UserLocation />} />
        <Route path="/SignIn" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/SignUp" element={<SignUp onSignUp={handleSignUp} />} />
        <Route path="/UserProfile" element={<UserProfile onSignOut={handleSignOut} />} />
        <Route path='/test' element={<TeSt />} />
        <Route path="/product/:id" element={<ProductView />} />
        <Route path="/Best Selling" element={<BestSellingProducts />} />
        <Route path="/Top Products" element={<TopProduct />} />
        <Route path="/Cart" element={<Cart />} />


      </Routes>
    </div>
  );
}

export default App;