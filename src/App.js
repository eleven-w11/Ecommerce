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
import AllProducts from './files/pages/AllProducts';
import ChatBox from './files/pages/Chat';
import AdminChat from './files/AdminChat/AdminChat';
import UserList from './files/AdminChat/UserList';
import Google from './files/pages/Google';
import DelNavbar from './files/pages/NavBar/delnav';
import SearchResults from './files/pages/NavBar/SearchResults';
import AdminPanel from './files/pages/AdminPanel';

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

  const hideNavBarRoutes = ["/Chat", "/AdminChat", "/AdminChat/:userId"];
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
            <TestHero />
            <BestSellingProducts isBestSellingPage={false} />
            <TopProduct isTopProductsPage={false} />
            <Footer />
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
        <Route path="/ManTop" element={<AllProducts />} />
        <Route path="/ManBottom" element={<AllProducts />} />
        <Route path="/ManShoes" element={<AllProducts />} />
        <Route path="/WomanTop" element={<AllProducts />} />
        <Route path="/WomanBottom" element={<AllProducts />} />
        <Route path="/WomanShoes" element={<AllProducts />} />
        <Route path="/WomanBags" element={<AllProducts />} />
        <Route path="/WomanAccessories" element={<AllProducts />} />
        <Route path="/Chat" element={<ChatBox />} />

        <Route path="/UserList" element={<UserList />} />
        <Route path="/AdminChat" element={<AdminChat />} />

        <Route path="/Google" element={<Google />} />
        <Route path="/DelNav" element={<DelNavbar />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/AdminPanel" element={<AdminPanel />} />
        {/* <Route path="/UserListPage" element={<UserListPage />} /> */}
      </Routes>
    </div>
  );
}

export default App;