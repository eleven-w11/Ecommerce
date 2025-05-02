import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/NavBar.css';
import { Link, useLocation } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from 'axios';
import { gsap } from "gsap";
import ImageSwapper from './HeroSection';


const NavBar = ({ Authentication }) => {
    // console.warn("Navbar.jsx", Authentication);

    const [country, setCountry] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isToggle, setIsToggle] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const searchContainerRef = useRef(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const linksRef = useRef([]);
    const animationPlayed = useRef(false);
    const [showManDropdown, setShowManDropdown] = useState(false);
    const [showWomanDropdown, setShowWomanDropdown] = useState(false);
    const manDropdownRef = useRef(null);
    const womanDropdownRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const selectedRefs = useRef([]);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    // active-link
    const location = useLocation();
    const [activePath, setActivePath] = useState(location.pathname);







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
    }, [isToggle]); // ✅ Jab toggle change ho tabhi chale


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
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/profile`, { withCredentials: true });
                setUserData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [Authentication]);


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





    // In useEffect:
    useEffect(() => {
        const fetchFiltered = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/search?query=${query}`);
                setResults(res.data); // already filtered results
            } catch (err) {
                console.error("❌ Error fetching search results:", err);
            }
        };

        if (query) fetchFiltered();
    }, [query]);


    // Function to highlight the search term in the product name


    const handleKeyDown = (e) => {
        if (!results.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            const selectedProduct = results[selectedIndex];
            if (selectedProduct) {
                window.location.href = `/product/${selectedProduct._id}`;
                setShowSearch(false);
            }
        }
    };

    useEffect(() => {
        if (selectedIndex !== -1 && selectedRefs.current[selectedIndex]) {
            selectedRefs.current[selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (showSearch && searchContainerRef.current) {
            gsap.fromTo(
                searchContainerRef.current,
                {
                    opacity: 0,
                    scale: 0.5,
                    transformOrigin: "top right",
                    y: -50,
                    clipPath: "circle(0% at 90% 10%)",
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    clipPath: "circle(150% at 90% 10%)",
                    duration: 1,
                    ease: "elastic.out(1, 0.5)", // 🧠 elastic bounce style
                }
            );
        } else if (!showSearch && searchContainerRef.current) {
            gsap.to(searchContainerRef.current, {
                opacity: 0,
                scale: 0.5,
                y: -50,
                clipPath: "circle(0% at 90% 10%)",
                duration: 0.5,
                ease: "power3.inOut",
            });
        }
    }, [showSearch]);


    // activelink

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);



    return (
        <>
            <nav>
                <ul>
                    <li className='menu'>
                        <span onClick={handleToggle} className={`material-symbols-outlined `} >menu</span>
                    </li>
                    <li className='nav-logo'>
                        <Link to="/">
                            <h1>WEB<span>V</span>ERSE</h1>
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
                                    {loading || !userData ? (
                                        <img src="./user.png" alt="Default" />
                                    ) : (
                                        <img src={userData.image} alt="User" className='userimg' />
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
                <div
                    className="search-overlay"
                    ref={searchContainerRef}
                    tabIndex={0} // 👈 important for keyboard events
                    onKeyDown={(e) => handleKeyDown(e)}
                >
                    <div className="search-box">
                        <div className="search-header">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(-1); // Reset selection on typing
                                }}
                                className="search-input"
                            />
                            <button className="cancel-btn" onClick={() => setShowSearch(false)}>×</button>
                        </div>

                        <div className="search-results">
                            {Array.isArray(results) && results.length > 0 && results.map((product, index) => {
                                const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
                                const matchingImageObj = product.images.find(img =>
                                    queryWords.includes(img.color?.toLowerCase())
                                );
                                const fallbackImageObj = product.images[0];
                                const imageObjToUse = matchingImageObj || fallbackImageObj;
                                const imageKey = Object.keys(imageObjToUse).find(key =>
                                    key.startsWith("pi_")
                                );
                                const imageToShow = imageObjToUse[imageKey];

                                return (
                                    <Link
                                        key={product._id}
                                        to={`/product/${product._id}`}
                                        className={`search-item ${index === selectedIndex ? "selected" : ""}`}
                                        ref={(el) => selectedRefs.current[index] = el}
                                    >
                                        <img
                                            src={`/images/${imageToShow}`}
                                            alt={product.product_name}
                                            className="search-item-image"
                                        />
                                        <div className="search-item-details">
                                            <h3>{product.product_name}</h3>
                                        </div>
                                    </Link>
                                );
                            })}


                        </div>
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
                            to="/UserLocation"
                            ref={(el) => (linksRef.current[2] = el)}
                            className={activePath === "/UserLocation" ? "active-link" : ""}
                        >
                            On Sale
                        </Link>
                    </li>
                    <div
                        className={`navline ${activePath === "/UserLocation" ? "active-line" : ""}`}
                        ref={(el) => (linksRef.current[3] = el)}
                    ></div>
                    <li>
                        <Link
                            to="/TopProducts"
                            className={activePath === "/TopProducts" ? "active-link" : ""}
                            ref={(el) => (linksRef.current[4] = el)}>
                            Top Products
                        </Link>
                    </li>
                    <div
                        className={`navline ${activePath === "/TopProducts" ? "active-line" : ""}`}
                        ref={(el) => (linksRef.current[6] = el)}
                    ></div>
                    <li>
                        <Link
                            to="/BestSelling"
                            className={activePath === "/BestSelling" ? "active-link" : ""}
                            ref={(el) => (linksRef.current[6] = el)}>
                            Best Selling
                        </Link>
                    </li>
                    <div
                        className={`navline ${activePath === "/BestSelling" ? "active-line" : ""}`}
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
                            <li><Link
                                to="/ManTop"
                                state={{ category: "man", type: "top" }}
                                className={activePath === "/ManTop" ? "active-link" : ""}
                            >Top</Link></li>
                            <div
                                className={`navline navline_dropdown ${activePath === "/ManTop" ? "active-line" : ""}`}
                            ></div>
                            <li><Link
                                to="/ManBottom"
                                state={{ category: "man", type: "bottom" }}
                                className={activePath === "/ManBottom" ? "active-link" : ""}
                            >Bottom</Link></li>

                            <div
                                className={`navline navline_dropdown ${activePath === "/ManBottom" ? "active-line" : ""}`}
                            ></div>
                            <li><Link
                                to="/ManShoes"
                                state={{ category: "man", type: "shoes" }}
                                className={activePath === "/ManShoes" ? "active-link" : ""}
                            >Shoes</Link></li>
                            <div
                                className={`navline navline_dropdown ${activePath === "/ManShoes" ? "active-line" : ""}`}
                            ></div>
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
                            <li>
                                <Link
                                    to="/WomanTop"
                                    state={{ category: "woman", type: "top" }}
                                    className={activePath === "/WomanTop" ? "active-link" : ""}
                                >Top</Link>
                            </li>
                            <div
                                className={`navline navline_dropdown ${activePath === "/WomanTop" ? "active-line" : ""}`}
                            ></div>
                            <li><Link
                                to="/WomanBottom"
                                state={{ category: "woman", type: "bottom" }}
                                className={activePath === "/WomanBottom" ? "active-link" : ""}
                            >Bottom</Link></li>
                            <div
                                className={`navline navline_dropdown ${activePath === "/WomanBottom" ? "active-line" : ""}`}
                            ></div>
                            <li><Link
                                to="/WomanShoes"
                                state={{ category: "woman", type: "shoes" }}
                                className={activePath === "/WomanShoes" ? "active-link" : ""}
                            >Shoes</Link></li>
                            <div
                                className={`navline navline_dropdown ${activePath === "/WomanShoes" ? "active-line" : ""}`}
                            ></div>

                            <li><Link
                                to="/WomanBags"
                                state={{ category: "woman", type: "bags" }}
                                className={activePath === "/WomanBags" ? "active-link" : ""}
                            >Bags</Link></li>
                            <div
                                className={`navline navline_dropdown ${activePath === "/WomanBags" ? "active-line" : ""}`}
                            ></div>
                            <li><Link
                                to="/WomanAccessories"
                                state={{ category: "woman", type: "accessories" }}
                                className={activePath === "/WomanAccessories" ? "active-link" : ""}
                            >Accessories</Link></li>
                            <div
                                className={`navline navline_dropdown ${activePath === "/WomanAccessories" ? "active-line" : ""}`}
                            ></div>
                        </div>
                    )}
                    <li>
                        <Link
                            to="/SignIn"
                            className={activePath === "/SignIn" ? "active-link" : ""}
                            ref={(el) => (linksRef.current[14] = el)}
                        >
                            About Us
                        </Link>

                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[15] = el)}></div>
                    <li>
                        <Link
                            to="/Cart"
                            className={activePath === "/Cart" ? "active-link" : ""}
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