import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/NavBar.css';
import { Link } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from 'axios';
import { gsap } from "gsap";
import ImageSwapper from './HeroSection';


const NavBar = ({ Authentication }) => {
    console.warn("Navbar.jsx", Authentication);

    const [country, setCountry] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isToggle, setIsToggle] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [visibleDiv, setVisibleDiv] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const searchContainerRef = useRef(null);

    const linksRef = useRef([]);
    const animationPlayed = useRef(false);
    const extNavRef = useRef(null);

    useEffect(() => {
        const updateCartCount = () => {
            const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCartCount(storedCart.length);
        };

        // ✅ Pehli dafa count update karo
        updateCartCount();

        // ✅ Storage event listen karo (Dusre components ki updates bhi ayengi)
        window.addEventListener("storage", updateCartCount);

        // ✅ Cleanup function (Jab component unmount ho to listener hata do)
        return () => {
            window.removeEventListener("storage", updateCartCount);
        };
    }, []);




    useEffect(() => {
        console.warn("toggle", isToggle);

        if (isToggle && !animationPlayed.current) {
            animationPlayed.current = true;

            const tl = gsap.timeline();
            tl.fromTo(
                linksRef.current,
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: {
                        amount: 1,
                        from: "start",
                        each: 0.2,
                    },
                    duration: 0.3,
                    ease: "power2.out",
                }
            );
        }
        if (!isToggle) {
            animationPlayed.current = false;
        }
    }, [isToggle]);



    useEffect(() => {
        if (visibleDiv) {
            gsap.fromTo(
                extNavRef.current,
                { x: "-100%", opacity: 0 },
                { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" }
            );

            const visibleLinks = extNavRef.current.querySelectorAll(
                `.slidenavlinks.visible a`
            );
            gsap.fromTo(
                visibleLinks,
                { x: -60, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    stagger: 0.2,
                    duration: 0.4,
                    ease: "power2.out",
                }
            );
        } else {

            gsap.to(extNavRef.current, {
                x: "-100%",
                opacity: 0,
                duration: 0.3,
                ease: "power3.in",
            });
        }
    }, [visibleDiv]);





    // slidemenu 

    useEffect(() => {
        if (isToggle) {
            // ✅ Save current scroll position when menu opens
            setScrollPosition(window.scrollY);
            document.body.style.overflow = "hidden"; // Disable scrolling
        } else {
            // ✅ Restore scroll position when menu closes
            document.body.style.overflow = ""; // Enable scrolling
            window.scrollTo(0, scrollPosition);
        }
    }, [isToggle]);

    const handleToggle = () => {
        setIsToggle(!isToggle);
    };

    const handleOutsideClick = (event) => {
        const isInsideSlideMenu = event.target.closest('.slidenav');
        const isMenuButton = event.target.closest('.menu');

        if (!isInsideSlideMenu && !isMenuButton) {
            setIsToggle(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    // search-container 
    // & a little slidemanu code istoggle


    useEffect(() => {
        if (showSearch || isToggle) {
            setScrollPosition(window.scrollY);
            document.body.style.overflow = "hidden"; // ✅ Disable scrolling when any modal is open
        } else {
            document.body.style.overflow = ""; // ✅ Enable scrolling when both are closed
            window.scrollTo(0, scrollPosition);
        }
    }, [showSearch, isToggle]);

    // ✅ GSAP Animation for Search Container
    useEffect(() => {
        if (showSearch && searchContainerRef.current) {
            gsap.fromTo(
                searchContainerRef.current,
                { opacity: 0, scale: 0.1 }, // Start from invisible & small
                { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" } // Animate to full opacity & scale
            );
        } else if (!showSearch && searchContainerRef.current) {
            gsap.to(searchContainerRef.current, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in" });
        }
    }, [showSearch]);

    const handleSearchOutsideClick = useCallback((event) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
            setShowSearch(false);
        }
    }, []);

    useEffect(() => {
        if (showSearch) {
            setTimeout(() => {
                document.addEventListener('click', handleSearchOutsideClick);
            }, 0);
        } else {
            document.removeEventListener('click', handleSearchOutsideClick);
        }

        return () => {
            document.removeEventListener('click', handleSearchOutsideClick);
        };
    }, [showSearch, handleSearchOutsideClick]);

    useEffect(() => {
        const countryFromCookie = Cookies.get("country");
        if (countryFromCookie) {
            setCountry(countryFromCookie);
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/user/profile", { withCredentials: true });
                setUserData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <>
            <nav>
                <ul>
                    <li className='menu'>
                        <span onClick={handleToggle} className={`material-symbols-outlined `} >menu</span>
                    </li>
                    <li className='baroque-logo'>
                        <Link to="/">
                            <h1>YOUR<span>W</span>EB</h1>
                        </Link>
                    </li>
                    <li className="location-account-search-cart">
                        <div className='userlocation-hide'>
                            {country ? (
                                <Link to="/UserLocation" className='country'>{country}</Link>
                            ) : (
                                <Link to="/UserLocation">
                                    <span className="material-symbols-outlined">add_location</span>
                                </Link>
                            )}
                        </div>
                        <div className='userprofile-hide'>
                            {Authentication ? (
                                <Link to="/UserProfile">
                                    {loading ? (
                                        <span>Loading...</span>
                                    ) : (
                                        userData ? (
                                            <img src="./user.png" alt="User" className='userimg' />
                                        ) : (
                                            <img src="./favicon.ico" alt="Default" />
                                        )
                                    )}
                                </Link>
                            ) : (
                                <Link to="/SignIn">
                                    <span className="material-symbols-outlined">account_circle</span>
                                </Link>
                            )}
                        </div>
                        <div className='search-hide' onClick={() => setShowSearch(!showSearch)}>
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <div>
                            <Link to="/Cart" className='cart_count'>
                                <span className="material-symbols-outlined cart">shopping_cart</span>
                                <p className='count'>{cartCount}</p>
                            </Link>
                        </div>
                    </li>
                </ul>
            </nav>
            {showSearch && (
                <div className="search-container" ref={searchContainerRef}>
                    <div className="search-box">
                        <input type="text" placeholder="Search..." />
                        <button onClick={() => setShowSearch(false)}>Close</button>
                    </div>
                </div>
            )}
            <div className={`slidemenu ${isToggle ? 'toggle' : ''}`}>
                <div className="mob_top_icons">
                    <div className="close_menu">
                        {/* <span onClick={handleToggle} className={`material-symbols-outlined`} >close</span> */}
                        <span onClick={handleToggle} className={`material-symbols-outlined `} >menu</span>
                    </div>
                    <div className="mob_icons">
                        <li className='userprofile-show'>
                            {Authentication ? (
                                <Link to="/UserProfile"
                                    ref={(el) => (linksRef.current[13] = el)}
                                >
                                    {loading ? (
                                        <span>Loading...</span>
                                    ) : (
                                        userData ? (
                                            <img src="./user.png" alt="User" className='userimg' />
                                        ) : (
                                            <img src="./favicon.ico" alt="Default" />
                                        )
                                    )}
                                </Link>
                            ) : (
                                <Link to="/SignIn"
                                    ref={(el) => (linksRef.current[14] = el)}
                                >
                                    <span className="material-symbols-outlined">account_circle</span>
                                </Link>
                            )}
                        </li>
                        <li className='userlocation-show'>
                            {country ? (
                                <Link to="/UserLocation"
                                    ref={(el) => (linksRef.current[16] = el)}
                                    className='country'>{country}</Link>
                            ) : (
                                <Link to="/UserLocation"
                                    ref={(el) => (linksRef.current[16] = el)}
                                >
                                    <span className="material-symbols-outlined">add_location</span>
                                </Link>
                            )}
                        </li>
                        <li className='search-show'>
                            <span className="material-symbols-outlined">search</span>
                        </li>
                    </div>
                </div>
                <ul>
                    <li>
                        <Link
                            ref={(el) => (linksRef.current[0] = el)}>
                            On Sale
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[2] = el)}></div>
                    <li>
                        <Link
                            ref={(el) => (linksRef.current[3] = el)}>
                            Shop Now
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[4] = el)}></div>
                    <li>
                        <Link to="/Top Products"
                            ref={(el) => (linksRef.current[5] = el)}>
                            Top Products
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[6] = el)}></div>
                    <li>
                        <Link to="/Best Selling"
                            ref={(el) => (linksRef.current[7] = el)}>
                            Best Selling
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[8] = el)}></div>
                    <li>
                        <Link
                            to="/Products"
                            ref={(el) => (linksRef.current[9] = el)}
                        >
                            About Us
                        </Link>

                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[10] = el)}></div>
                    <li>
                        <Link
                            ref={(el) => (linksRef.current[11] = el)}>
                            Contact Us
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[12] = el)}></div>

                </ul>
            </div>
        </>
    );
};

export default NavBar;