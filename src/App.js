import { Routes, Route } from 'react-router-dom';
import './App.css';
import BeInspired from './pages/BeInspired';
import NavBar from './pages/NavBar';
import ProductDisplay from './pages/ProductDisplay';
import ShopTheLook from './pages/ShopTheLook';
import UserLocation from './pages/UserLocation';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './pages/UserProfile';
import Products from './pages/Products';
import TeSt from './pages/teSt';
import TestHero from './pages/Hero';

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
            {/* <ProductDisplay /> */}
            {/* <BeInspired /> */}
            {/* <ShopTheLook /> */}

          </>
        } />
        <Route path="/UserLocation" element={<UserLocation />} />
        <Route path="/SignIn" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/SignUp" element={<SignUp onSignUp={handleSignUp} />} />
        <Route path="/UserProfile" element={<UserProfile onSignOut={handleSignOut} />} />
        <Route path="/Products" element={<Products />} />
        <Route path='/test' element={<TeSt />} />
      </Routes>
    </div>
  );
}

export default App;
