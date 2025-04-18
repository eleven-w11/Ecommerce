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
    const [cartCount, setCartCount] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const searchContainerRef = useRef(null);

    const linksRef = useRef([]);
    const animationPlayed = useRef(false);
    const [showManDropdown, setShowManDropdown] = useState(false);
    const [showWomanDropdown, setShowWomanDropdown] = useState(false);
    const manDropdownRef = useRef(null);
    const womanDropdownRef = useRef(null);


    // cart icon
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
        const isManClick = event.target.closest('.man_nolink');
        const isWomanClick = event.target.closest('.woman_nolink');

        if (!isInsideSlideMenu && !isMenuButton && !isManClick && !isWomanClick) {
            setIsToggle(false);
            setShowManDropdown(false); // hide dropdown also
            setShowWomanDropdown(false); // hide dropdown also
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


    // Animation for dropdown-man
    useEffect(() => {
        if (showManDropdown && manDropdownRef.current) {
            gsap.fromTo(
                manDropdownRef.current.children,
                { x: -50, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: 'power2.out'
                }
            );
        } else if (!showManDropdown && manDropdownRef.current) {
            gsap.to(manDropdownRef.current.children, {
                x: 50,
                opacity: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: 'power2.in'
            });
        }
    }, [showManDropdown]);

    // Animation for dropdown-woman
    useEffect(() => {
        if (showWomanDropdown && womanDropdownRef.current) {
            gsap.fromTo(
                womanDropdownRef.current.children,
                { x: -50, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: 'power2.out'
                }
            );
        } else if (!showWomanDropdown && womanDropdownRef.current) {
            gsap.to(womanDropdownRef.current.children, {
                x: 50,
                opacity: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: 'power2.in'
            });
        }
    }, [showWomanDropdown]);

    const handleManClick = (e) => {
        e.stopPropagation();
        setShowManDropdown(!showManDropdown);
    };
    const handleWomanClick = (e) => {
        e.stopPropagation();
        setShowWomanDropdown(!showWomanDropdown);
    };


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
                        <span onClick={handleToggle} className={`material-symbols-outlined `} >menu</span>
                    </div>
                    <div className="mob_icons">
                        <li className='userprofile-show'>
                            {Authentication ? (
                                <Link to="/UserProfile"
                                    ref={(el) => (linksRef.current[19] = el)}
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
                                    ref={(el) => (linksRef.current[19] = el)}
                                >
                                    <span className="material-symbols-outlined">account_circle</span>
                                </Link>
                            )}
                        </li>
                        <li className='userlocation-show'>
                            {country ? (
                                <Link to="/UserLocation"
                                    ref={(el) => (linksRef.current[18] = el)}
                                    className='country'>{country}</Link>
                            ) : (
                                <Link to="/UserLocation"
                                    ref={(el) => (linksRef.current[18] = el)}
                                >
                                    <span className="material-symbols-outlined">add_location</span>
                                </Link>
                            )}
                        </li>
                        <li className='search-show'
                            onClick={() => setShowSearch(!showSearch)}
                            ref={(el) => (linksRef.current[20] = el)}>

                            <span className="material-symbols-outlined">search</span>
                        </li>
                    </div>
                </div>
                <div className="navline navline_1st"
                    ref={(el) => (linksRef.current[1] = el)}></div>
                <ul>
                    <div className="line_hide_box"></div>
                    <li>
                        <Link
                            ref={(el) => (linksRef.current[2] = el)}>
                            On Sale
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[3] = el)}></div>
                    <li>
                        <Link to="/Top Products"
                            ref={(el) => (linksRef.current[4] = el)}>
                            Top Products
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[5] = el)}></div>
                    <li>
                        <Link to="/Best Selling"
                            ref={(el) => (linksRef.current[6] = el)}>
                            Best Selling
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[7] = el)}></div>
                    <li className="man_nolink" onClick={handleManClick}>
                        <span className='man_woman' ref={(el) => (linksRef.current[8] = el)}>Man</span>
                        <span className={`material-symbols-outlined arrow-icon ${showManDropdown ? 'rotate' : ''}`}
                            ref={(el) => (linksRef.current[9] = el)}
                        >
                            arrow_drop_down
                        </span>
                    </li>
                    <div
                        className="navline"
                        ref={(el) => (linksRef.current[10] = el)}
                    ></div>
                    {showManDropdown && (
                        <div className="dropdown-man" ref={manDropdownRef}>
                            <li><Link>Top</Link></li>
                            <div className="navline navline_dropdown"></div>
                            <li><Link>Bottom</Link></li>
                            <div className="navline navline_dropdown"></div>
                            <li><Link>Shoes</Link></li>
                            <div className="navline navline_dropdown"></div>
                        </div>
                    )}
                    <li className="woman_nolink" onClick={handleWomanClick}>
                        <span className='man_woman' ref={(el) => (linksRef.current[11] = el)}>Woman</span>
                        <span className={`material-symbols-outlined arrow-icon ${showWomanDropdown ? 'rotate' : ''}`}
                            ref={(el) => (linksRef.current[12] = el)}
                        >
                            arrow_drop_down
                        </span>
                    </li>

                    <div className="navline"
                        ref={(el) => (linksRef.current[13] = el)}></div>
                    {showWomanDropdown && (
                        <div className="dropdown-woman" ref={womanDropdownRef}>
                            <li><Link>Top</Link></li>
                            <div className="navline navline_dropdown"></div>
                            <li><Link>Bottom</Link></li>
                            <div className="navline navline_dropdown"></div>
                            <li><Link>Shoes</Link></li>
                            <div className="navline navline_dropdown"></div>
                            <li><Link>Bags</Link></li>
                            <div className="navline navline_dropdown"></div>
                            <li><Link>Accessories</Link></li>
                            <div className="navline navline_dropdown"></div>
                        </div>
                    )}
                    <li>
                        <Link
                            to="/Products"
                            ref={(el) => (linksRef.current[14] = el)}
                        >
                            About Us
                        </Link>

                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[15] = el)}></div>
                    <li>
                        <Link
                            ref={(el) => (linksRef.current[16] = el)}>
                            Contact Us
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[17] = el)}></div>

                </ul>
            </div>
        </>
    );
};

export default NavBar;