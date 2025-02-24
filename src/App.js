import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// import BeInspired from './pages/BeInspired';
import NavBar from './pages/NavBar';
// import ShopTheLook from './pages/ShopTheLook';
import UserLocation from './pages/UserLocation';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './pages/UserProfile';
import Products from './pages/Products';
import TeSt from './pages/teSt';
import TestHero from './pages/Hero';
import BestSellingProducts from './pages/BestSellingProducts';
// import AllProducts from './pages/AllProducts';
import TopProduct from './pages/TopProducts';
import ProductView from './pages/ProductView';
import CaRt from './pages/Cart';
// import CaRt from './pages/Cart';

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
      <Routes>
        <Route path="/" element={
          <>
            <TestHero />
            <BestSellingProducts />
            <TopProduct />

            {/* <CaRt /> */}
          </>
        } />
        <Route path="/UserLocation" element={<UserLocation />} />
        <Route path="/SignIn" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/SignUp" element={<SignUp onSignUp={handleSignUp} />} />
        <Route path="/UserProfile" element={<UserProfile onSignOut={handleSignOut} />} />
        <Route path="/Products" element={<Products />} />
        <Route path='/test' element={<TeSt />} />
        <Route path="/product/:id" element={<ProductView />} />
        <Route path="/Cart" element={<CaRt />} />
      </Routes>
    </div>
  );
}

export default App;
