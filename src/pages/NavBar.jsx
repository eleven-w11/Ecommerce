import React, { useState, useEffect, useRef } from 'react';
import './styles/NavBar.css';
import { Link } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from 'axios';
import { gsap } from "gsap";
import ImageSwapper from './Hero';


const NavBar = ({ Authentication }) => {
    console.warn("Navbar.jsx", Authentication);

    const [country, setCountry] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isToggle, setisToggle] = useState(false);
    const [visibleDiv, setVisibleDiv] = useState(null);
    const linksRef = useRef([]);
    const animationPlayed = useRef(false);
    const extNavRef = useRef(null);

    const handleLinkClick = (id, state) => {
        console.warn("this is id", id, "this is state", state);

        if (state) {
            setisToggle(false);
            setVisibleDiv(null);
        }

        if (!state) {
            setVisibleDiv((prevId) => (prevId === id ? null : id));
        }
    };



    const handleOutsideClick = (event) => {
        const isInsideSlideMenu = event.target.closest('.slidemenu');
        const isInsideExtNav = event.target.closest('.extnav');
        const isMenuButton = event.target.closest('.menu');

        if (!isInsideSlideMenu && !isMenuButton && !isInsideExtNav) {
            setisToggle(false);
            setVisibleDiv(null);

            // Reset body scroll settings
            const savedScrollPosition = parseInt(document.body.style.top || "0", 10);
            document.body.style.position = "";
            document.body.style.top = "";

            // Restore scroll position only if it was previously set
            if (savedScrollPosition) {
                window.scrollTo(0, -savedScrollPosition);
            }

            document.body.classList.remove("no-scroll");
        }
    };


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




    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);


    const handleToggle = () => {
        const currentScrollPosition = window.scrollY; // Save current scroll position

        setisToggle((prevState) => {
            if (!prevState) {
                // When menu opens
                document.body.style.position = "fixed";
                document.body.style.top = `-${currentScrollPosition}px`;
                document.body.style.width = "100%";

                // Dynamically position .slidenavlinks
                const slidenavlinks = document.querySelector('.slidenavlinks');
                if (slidenavlinks) {
                    slidenavlinks.style.top = `${currentScrollPosition}px`;
                }
            } else {
                // When menu closes
                const savedScrollPosition = -parseInt(document.body.style.top, 10);
                document.body.style.position = "";
                document.body.style.top = "";
                window.scrollTo(0, savedScrollPosition);

                // Reset .slidenavlinks positioning
                const slidenavlinks = document.querySelector('.slidenavlinks');
                if (slidenavlinks) {
                    slidenavlinks.style.top = "0";
                }
            }

            // Hide `.slidenavlinks` when menu toggles
            setVisibleDiv(null);

            return !prevState;
        });
    };






    useEffect(() => {
        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, []);


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
                    <div className="location-account-search-cart">
                        <li className='userlocation-hide'>
                            {country ? (
                                <Link to="/UserLocation" className='country'>{country}</Link>
                            ) : (
                                <Link to="/UserLocation">
                                    <span className="material-symbols-outlined">add_location</span>
                                </Link>
                            )}
                        </li>
                        <li className='userprofile-hide'>
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
                        </li>
                        <li>
                            <span className="material-symbols-outlined">search</span>
                        </li>
                        <li>
                            <Link to="/Cart"><span className="material-symbols-outlined cart">shopping_cart</span></Link>
                        </li>
                    </div>
                </ul>
            </nav>

            <div className={`slidemenu ${isToggle ? 'toggle' : ''}`}>
                <span onClick={handleToggle} className={`material-symbols-outlined close `} >close</span>
                <ul>
                    <li>
                        <Link onClick={() => handleLinkClick('Chantelle')}
                            ref={(el) => (linksRef.current[0] = el)}>
                            Chantelle
                            <span className="material-symbols-outlined">chevron_right</span>
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[2] = el)}></div>
                    <li>
                        <Link
                            onClick={() => handleLinkClick('Unstitched')}
                            ref={(el) => (linksRef.current[3] = el)}>
                            Unstitched
                            <span className="material-symbols-outlined">chevron_right</span>
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[4] = el)}></div>
                    <li>
                        <Link
                            onClick={() => handleLinkClick('Stitched')}
                            ref={(el) => (linksRef.current[5] = el)}>
                            Stitched
                            <span className="material-symbols-outlined">chevron_right</span>
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[6] = el)}></div>
                    <li>
                        <Link
                            onClick={() => handleLinkClick('ReadyToWear')}
                            ref={(el) => (linksRef.current[7] = el)}>
                            Ready To Wear
                            <span className="material-symbols-outlined">chevron_right</span>
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[8] = el)}></div>
                    <li>
                        <Link
                            to="/Products"
                            onClick={() => handleLinkClick('Special Prices', { category: "anyvalue" })}
                            ref={(el) => (linksRef.current[9] = el)}
                            state={{ category1: "SpecialPrices", category2: "SpecialPrices" }}
                        >
                            Special Prices
                        </Link>

                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[10] = el)}></div>
                    <li>
                        <Link
                            onClick={() => handleLinkClick('Seperates')}
                            ref={(el) => (linksRef.current[11] = el)}>
                            Seperates
                            <span className="material-symbols-outlined">chevron_right</span>
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[12] = el)}></div>
                    <li>
                        <Link
                            to="/Products"
                            onClick={() => handleLinkClick('Shawls', { category: "anyvalue" })}
                            ref={(el) => (linksRef.current[13] = el)}
                            state={{ category1: "Shawls", category2: "Shawls" }}>
                            Shawls
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[14] = el)}></div>
                    <li>
                        <Link
                            to="/test"
                            ref={(el) => (linksRef.current[15] = el)}
                        >
                            Test
                        </Link>
                    </li>
                    <div className="navline"
                        ref={(el) => (linksRef.current[16] = el)}></div>
                    <li className='userprofile-show'>
                        {Authentication ? (
                            <Link to="/UserProfile"
                                ref={(el) => (linksRef.current[17] = el)}
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
                                ref={(el) => (linksRef.current[17] = el)}
                            >
                                <span className="material-symbols-outlined">account_circle</span>
                            </Link>
                        )}
                    </li>

                    <div className="navline"
                        ref={(el) => (linksRef.current[18] = el)}></div>
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
                    <div className="navline"
                        ref={(el) => (linksRef.current[20] = el)}></div>
                </ul>
            </div>


            <div className={`extnav slidenavlinks ${visibleDiv === 'Chantelle' ? 'visible' : ''}`} id="Chantelle"
                ref={extNavRef}
            >
                <ul>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Unstitched', { category: "anyvalue" })}
                            state={{ category1: "Chantelle", category2: "Unstitched" }}>Unstitched</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Stitched', { category: "anyvalue" })}
                            state={{ category1: "Chantelle", category2: "Stitched" }}>Stitched</Link>
                    </li>
                    <div className="navline"></div>
                </ul>
            </div>

            <div className={`extnav slidenavlinks ${visibleDiv === 'Unstitched' ? 'visible' : ''}`} id="Unstitched"
                ref={extNavRef}
            >
                <ul>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('ShopAll', { category: "anyvalue" })}
                            state={{ category1: "Unstitched", category2: "ShopAll" }}>Shop All</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Formals', { category: "anyvalue" })}
                            state={{ category1: "Unstitched", category2: "Formals" }}>Formals</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Velvet', { category: "anyvalue" })}
                            state={{ category1: "Unstitched", category2: "Velvet" }}>Velvet</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Summer', { category: "anyvalue" })}
                            state={{ category1: "Unstitched", category2: "Summer" }}>Summer</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Winter', { category: "anyvalue" })}
                            state={{ category1: "Unstitched", category2: "Winter" }}>Winter</Link>
                    </li>
                    <div className="navline"></div>
                </ul>
            </div>

            <div className={`extnav slidenavlinks ${visibleDiv === 'Stitched' ? 'visible' : ''}`} id="Stitched"
                ref={extNavRef}
            >
                <ul>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('ShopAll', { category: "anyvalue" })}
                            state={{ category1: "Stitched", category2: "ShopAll" }}>Shop All</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Formals', { category: "anyvalue" })}
                            state={{ category1: "Stitched", category2: "Formals" }}>Formals</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Velvet', { category: "anyvalue" })}
                            state={{ category1: "Stitched", category2: "Velvet" }}>Velvet</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Summer', { category: "anyvalue" })}
                            state={{ category1: "Stitched", category2: "Summer" }}>Summer</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Winter', { category: "anyvalue" })}
                            state={{ category1: "Stitched", category2: "Winter" }}>Winter</Link>
                    </li>
                    <div className="navline"></div>
                </ul>
            </div >

            <div className={`extnav slidenavlinks ${visibleDiv === 'ReadyToWear' ? 'visible' : ''}`} id="ReadyToWear"
                ref={extNavRef}
            >
                <ul>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('ShopAll', { category: "anyvalue" })}
                            state={{ category1: "ReadyToWear", category2: "ShopAll" }}>Shop All</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Formals', { category: "anyvalue" })}
                            state={{ category1: "ReadyToWear", category2: "Formals" }}> Formals</Link >
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Velvet', { category: "anyvalue" })}
                            state={{ category1: "ReadyToWear", category2: "Velvet" }}>Velvet</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Summer', { category: "anyvalue" })}
                            state={{ category1: "ReadyToWear", category2: "Summer" }}>Summer</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Winter', { category: "anyvalue" })}
                            state={{ category1: "ReadyToWear", category2: "Winter" }}>Winter</Link>
                    </li>
                    <div className="navline"></div>
                </ul>
            </div >

            <div className={`extnav slidenavlinks ${visibleDiv === 'Seperates' ? 'visible' : ''}`} id="Seperates"
                ref={extNavRef}
            >
                <ul>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Dupattas', { category: "anyvalue" })}
                            state={{ category1: "Seperates", category2: "Dupattas" }}>Dupattas</Link>
                    </li>
                    <div className="navline"></div>
                    <li>
                        <Link to="/Products"
                            onClick={() => handleLinkClick('Bottoms', { category: "anyvalue" })}
                            state={{ category1: "Seperates", category2: "Bottoms" }}> Bottoms</Link >
                    </li>
                    <div className="navline"></div>
                </ul>
            </div >
            <div className={`black-screen ${isToggle ? 'visible' : 'hidden'}`}></div>



        </>
    );
};

export default NavBar;
