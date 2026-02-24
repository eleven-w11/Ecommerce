// src/components/NavBar/NavBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from 'axios';
import { gsap } from "gsap";
import Search from './Search';
import SlideMenu from './SlideMenu';
import '../../styles/NavBar/NavBar.css';
import '../../styles/NavBar/Search.css';
import { animateNavbarOnLoad } from "./NavbarAnimation";

const NavBar = ({ Authentication }) => {
    const [country, setCountry] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isToggle, setIsToggle] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const [bgColor, setBgColor] = useState(`linear-gradient(to right, rgba(181,181,181,1), rgba(255,255,255,0.66))`);


    const linksRef = useRef([]);
    const manDropdownRef = useRef(null);
    const womanDropdownRef = useRef(null);
    const [showManDropdown, setShowManDropdown] = useState(false);
    const [showWomanDropdown, setShowWomanDropdown] = useState(false);
    const [activePath, setActivePath] = useState("");
    const animationPlayed = useRef(false);
    const location = useLocation();
    const [searchActive, setSearchActive] = useState(false);
    // const [query, setQuery] = useState("");
    const navRef = useRef(null);
    // const searchRef = useRef(null);
    const searchContainerRef = useRef(null);

    // GSAP animation for search
    const toggleSearch = () => {
        if (!searchActive) {
            // Open search with smooth animation
            setSearchActive(true);
            setShowSearch(true);

            // Animate navbar up
            gsap.to(navRef.current, {
                y: -navRef.current.offsetHeight,
                duration: 0.35,
                ease: "power2.inOut"
            });

            // Show search with smooth slide down
            setTimeout(() => {
                if (searchContainerRef.current) {
                    gsap.fromTo(searchContainerRef.current,
                        { y: -100, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            onComplete: () => {
                                // Focus on input after animation
                                const input = document.querySelector('.search-input');
                                if (input) input.focus();
                            }
                        }
                    );
                }
            }, 50);
        } else {
            // Close search with smooth animation
            if (searchContainerRef.current) {
                gsap.to(searchContainerRef.current, {
                    y: -100,
                    opacity: 0,
                    duration: 0.35,
                    ease: "power2.in",
                    onComplete: () => {
                        setShowSearch(false);
                        setSearchActive(false);

                        // Bring navbar back down
                        gsap.to(navRef.current, {
                            y: 0,
                            duration: 0.4,
                            ease: "power2.out"
                        });
                    }
                });
            }
        }
    };

    // Scroll listener for background change
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY <= 350) {
                const opacity = 1 - scrollY / 350;
                setBgColor(
                    `linear-gradient(to right, rgba(181,181,181,${opacity}), rgba(255,255,255,${opacity * 0.66}))`
                );
            } else {
                setBgColor(
                    `linear-gradient(to right, rgba(181,181,181,0), rgba(255,255,255,0))`
                );
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);



    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const updateCartCount = () => {
            const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCartCount(storedCart.length);
        };

        updateCartCount();

        // Listen custom event (same tab)
        window.addEventListener("cartUpdated", updateCartCount);

        // Optional: keep storage for multi-tab support
        window.addEventListener("storage", updateCartCount);

        return () => {
            window.removeEventListener("cartUpdated", updateCartCount);
            window.removeEventListener("storage", updateCartCount);
        };
    }, []);

    useEffect(() => {
        if (isToggle && !animationPlayed.current) {
            animationPlayed.current = true;
            const tl = gsap.timeline();
            tl.fromTo(
                linksRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: { amount: 1, each: 0.2 }, duration: 0.3, ease: "power2.out" }
            );
        }
    }, [isToggle]);

    useEffect(() => {
        if (isToggle || showSearch) {
            setScrollPosition(window.scrollY);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            window.scrollTo(0, scrollPosition);
        }
    }, [isToggle, showSearch]);

    const handleToggle = () => {
        setIsToggle(!isToggle);
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            const isInsideSlideMenu = event.target.closest('.slidemenu');
            const isMenuButton = event.target.closest('.menu');
            const isManClick = event.target.closest('.man_nolink');
            const isWomanClick = event.target.closest('.woman_nolink');
            if (!isInsideSlideMenu && !isMenuButton && !isManClick && !isWomanClick) {
                setIsToggle(false);
                setShowManDropdown(false);
                setShowWomanDropdown(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    useEffect(() => {
        const countryFromCookie = Cookies.get("country");
        if (countryFromCookie) setCountry(countryFromCookie);

        const fetchUserData = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/profile`, { withCredentials: true });
                setUserData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [Authentication]);

    useEffect(() => {
        if (showManDropdown && manDropdownRef.current) {
            gsap.fromTo(manDropdownRef.current.children, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' });
        } else if (!showManDropdown && manDropdownRef.current) {
            gsap.to(manDropdownRef.current.children, { x: 50, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.in' });
        }
    }, [showManDropdown]);

    useEffect(() => {
        if (showWomanDropdown && womanDropdownRef.current) {
            gsap.fromTo(womanDropdownRef.current.children, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' });
        } else if (!showWomanDropdown && womanDropdownRef.current) {
            gsap.to(womanDropdownRef.current.children, { x: 50, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.in' });
        }
    }, [showWomanDropdown]);

    const handleManClick = (e) => { e.stopPropagation(); setShowManDropdown(!showManDropdown); };
    const handleWomanClick = (e) => { e.stopPropagation(); setShowWomanDropdown(!showWomanDropdown); };

    useEffect(() => {
        animateNavbarOnLoad(animationPlayed);
    }, []);


    return (
        <>
            <nav
                ref={navRef}
                className="navbar"
                style={{ background: bgColor }}
            >
                <ul>
                    <li className='menu'>
                        <span className='menuicon' onClick={handleToggle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </span>
                    </li>
                    <li className='nav-logo'><Link to="/"><h1>WEB<span>V</span>ERSE</h1></Link></li>
                    <li className="location-account-search-cart">
                        <div className='userlocation-hide'>
                            {country ?
                                <Link to="/UserLocation" className='country'>{country}</Link>
                                :
                                <Link to="/UserLocation" className="nav-icon-link">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </Link>}
                        </div>
                        <div className='userprofile-hide'>
                            {Authentication ? (
                                <Link to="/UserProfile">
                                    {loading || !userData ?
                                        <img className='default-user-profile' src="./user.png" alt="Default" />
                                        :
                                        <img crossOrigin="anonymous" src={userData.image} alt="User" className='userimg' />
                                    }
                                </Link>
                            ) : <Link to="/SignIn" className="nav-icon-link">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </Link>}
                        </div>
                        <div className='search-hide nav-icon-link' onClick={toggleSearch}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        <div><Link to="/Cart" className='cart_count nav-icon-link'>
                            <p className='count'>{cartCount}</p>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </Link></div>
                    </li>
                </ul>
            </nav>

            {showSearch && (
                <div ref={searchContainerRef} className="search-container">
                    <Search onClose={toggleSearch} />
                </div>
            )}

            <SlideMenu
                isToggle={isToggle}
                handleToggle={handleToggle}
                toggleSearch={toggleSearch}
                Authentication={Authentication}
                loading={loading}
                userData={userData}
                country={country}
                activePath={activePath}
                linksRef={linksRef}
                showManDropdown={showManDropdown}
                showWomanDropdown={showWomanDropdown}
                handleManClick={handleManClick}
                handleWomanClick={handleWomanClick}
                manDropdownRef={manDropdownRef}
                womanDropdownRef={womanDropdownRef}
            />

            <div className={`black-screen ${isToggle ? 'visible' : 'hidden'}`}></div>
        </>
    );
};

export default NavBar;