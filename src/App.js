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
// import TestWeb from './pages/TestWeb';
import AllProducts from './pages/AllProducts';
import ChatBox from './pages/Chat';
import AdminChat from './pages/AdminChat';
import Google from './pages/Google';
// import AnimationTest from './pages/AnimationT';
// import GoogleSignIn from './pages/GoogleSign';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.warn("app.js Say's", isAuthenticated);

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
        <Route path="/BestSelling" element={<BestSellingProducts />} />
        <Route path="/TopProducts" element={<TopProduct />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/ManTop" element={<AllProducts />}/>
        <Route path="/ManBottom" element={<AllProducts />}/>
        <Route path="/ManShoes" element={<AllProducts />}/>
        <Route path="/WomanTop" element={<AllProducts />}/>
        <Route path="/WomanBottom" element={<AllProducts />}/>
        <Route path="/WomanShoes" element={<AllProducts />}/>
        <Route path="/WomanBags" element={<AllProducts />}/>
        <Route path="/WomanAccessories" element={<AllProducts />}/>
        <Route path="/Chat" element={<ChatBox />}/>
        <Route path="/AdminChat" element={<AdminChat />}/>
        <Route path="/Google" element={<Google />}  />
        {/* <Route path="/GoogleSignIn" element={<GoogleSignIn /> } /> */}


      </Routes>
    </div>
  );
}

export default App;

// muja aik flaw nazr aya ka like app.js mn setIsAuthenticated 3 points pr true ho rha ha const handleSignIn = () => {
//     setIsAuthenticated(true);
//   };

//   const handleSignUp = () => {
//     setIsAuthenticated(true);
//   };

//   const handleSignOut = () => {
//     setIsAuthenticated(false);
//   }; 