import React, { useState, useEffect, useRef } from 'react';
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
    const [isToggle, setisToggle] = useState(false);
    const [visibleDiv, setVisibleDiv] = useState(null);
    const linksRef = useRef([]);
    const animationPlayed = useRef(false);
    const extNavRef = useRef(null);



    const handleOutsideClick = (event) => {
        const isInsideSlideMenu = event.target.closest('.slidemenu');
        const isInsideExtNav = event.target.closest('.extnav');
        const isMenuButton = event.target.closest('.menu');

        if (!isInsideSlideMenu && !isMenuButton && !isInsideExtNav) {
            setisToggle(false);
            setVisibleDiv(null);

            const savedScrollPosition = parseInt(document.body.style.top || "0", 10);
            document.body.style.position = "";
            document.body.style.top = "";

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
        const currentScrollPosition = window.scrollY;

        setisToggle((prevState) => {
            if (!prevState) {
                document.body.style.position = "fixed";
                document.body.style.top = `-${currentScrollPosition}px`;
                document.body.style.width = "100%";

            } else {
                const savedScrollPosition = -parseInt(document.body.style.top, 10);
                document.body.style.position = "";
                document.body.style.top = "";
                window.scrollTo(0, savedScrollPosition);
            }

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
                        <div className='search-hide'>
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <div>
                            <Link to="/Cart"><span className="material-symbols-outlined cart">shopping_cart</span></Link>
                        </div>
                    </li>
                </ul>
            </nav>

            <div className={`slidemenu ${isToggle ? 'toggle' : ''}`}>
                <span onClick={handleToggle} className={`material-symbols-outlined close `} >close</span>
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

                    <div className="navline userprofile-show"
                        ref={(el) => (linksRef.current[15] = el)}></div>
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
                    <div className="navline userlocation-show"
                        ref={(el) => (linksRef.current[17] = el)}></div>
                    <li className='search-show'>
                        <span className="material-symbols-outlined">search</span>
                    </li>
                    <div className="navline userlocation-show"></div>
                </ul>
            </div>
        </>
    );
};

export default NavBar;
// import React, { useState, useEffect, useRef } from 'react';
// import './styles/NavBar.css';
// import { Link } from 'react-router-dom';
// import Cookies from "js-cookie";
// import axios from 'axios';
// import { gsap } from "gsap";
// import ImageSwapper from './HeroSection';


// const NavBar = ({ Authentication }) => {
//     console.warn("Navbar.jsx", Authentication);

//     const [country, setCountry] = useState("");
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [isToggle, setisToggle] = useState(false);
//     const [visibleDiv, setVisibleDiv] = useState(null);
//     const linksRef = useRef([]);
//     const animationPlayed = useRef(false);
//     const extNavRef = useRef(null);



//     const handleOutsideClick = (event) => {
//         const isInsideSlideMenu = event.target.closest('.slidemenu');
//         const isInsideExtNav = event.target.closest('.extnav');
//         const isMenuButton = event.target.closest('.menu');

//         if (!isInsideSlideMenu && !isMenuButton && !isInsideExtNav) {
//             setisToggle(false);
//             setVisibleDiv(null);

//             const savedScrollPosition = parseInt(document.body.style.top || "0", 10);
//             document.body.style.position = "";
//             document.body.style.top = "";

//             if (savedScrollPosition) {
//                 window.scrollTo(0, -savedScrollPosition);
//             }

//             document.body.classList.remove("no-scroll");
//         }
//     };


//     useEffect(() => {
//         console.warn("toggle", isToggle);

//         if (isToggle && !animationPlayed.current) {
//             animationPlayed.current = true;

//             const tl = gsap.timeline();
//             tl.fromTo(
//                 linksRef.current,
//                 { y: 20, opacity: 0 },
//                 {
//                     y: 0,
//                     opacity: 1,
//                     stagger: {
//                         amount: 1,
//                         from: "start",
//                         each: 0.2,
//                     },
//                     duration: 0.3,
//                     ease: "power2.out",
//                 }
//             );
//         }
//         if (!isToggle) {
//             animationPlayed.current = false;
//         }
//     }, [isToggle]);



//     useEffect(() => {
//         if (visibleDiv) {
//             gsap.fromTo(
//                 extNavRef.current,
//                 { x: "-100%", opacity: 0 },
//                 { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" }
//             );

//             const visibleLinks = extNavRef.current.querySelectorAll(
//                 `.slidenavlinks.visible a`
//             );
//             gsap.fromTo(
//                 visibleLinks,
//                 { x: -60, opacity: 0 },
//                 {
//                     x: 0,
//                     opacity: 1,
//                     stagger: 0.2,
//                     duration: 0.4,
//                     ease: "power2.out",
//                 }
//             );
//         } else {

//             gsap.to(extNavRef.current, {
//                 x: "-100%",
//                 opacity: 0,
//                 duration: 0.3,
//                 ease: "power3.in",
//             });
//         }
//     }, [visibleDiv]);




//     useEffect(() => {
//         document.addEventListener('click', handleOutsideClick);
//         return () => {
//             document.removeEventListener('click', handleOutsideClick);
//         };
//     }, []);


//     const handleToggle = () => {
//         const currentScrollPosition = window.scrollY;

//         setisToggle((prevState) => {
//             if (!prevState) {
//                 document.body.style.position = "fixed";
//                 document.body.style.top = `-${currentScrollPosition}px`;
//                 document.body.style.width = "100%";

//             } else {
//                 const savedScrollPosition = -parseInt(document.body.style.top, 10);
//                 document.body.style.position = "";
//                 document.body.style.top = "";
//                 window.scrollTo(0, savedScrollPosition);
//             }

//             setVisibleDiv(null);

//             return !prevState;
//         });
//     };






//     useEffect(() => {
//         return () => {
//             document.body.classList.remove("no-scroll");
//         };
//     }, []);


//     useEffect(() => {
//         const countryFromCookie = Cookies.get("country");
//         if (countryFromCookie) {
//             setCountry(countryFromCookie);
//         }

//         const fetchUserData = async () => {
//             try {
//                 const response = await axios.get("http://localhost:5000/api/user/profile", { withCredentials: true });
//                 setUserData(response.data);
//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUserData();
//     }, []);

//     return (
//         <>
//             <nav>
//                 <ul>
//                     <li className='menu'>
//                         <span onClick={handleToggle} className={`material-symbols-outlined `} >menu</span>
//                     </li>
//                     <li className='baroque-logo'>
//                         <Link to="/">
//                             <h1>YOUR<span>W</span>EB</h1>
//                         </Link>
//                     </li>
//                     <li className="location-account-search-cart">
//                         <div className='userlocation-hide'>
//                             {country ? (
//                                 <Link to="/UserLocation" className='country'>{country}</Link>
//                             ) : (
//                                 <Link to="/UserLocation">
//                                     <span className="material-symbols-outlined">add_location</span>
//                                 </Link>
//                             )}
//                         </div>
//                         <div className='userprofile-hide'>
//                             {Authentication ? (
//                                 <Link to="/UserProfile">
//                                     {loading ? (
//                                         <span>Loading...</span>
//                                     ) : (
//                                         userData ? (
//                                             <img src="./user.png" alt="User" className='userimg' />
//                                         ) : (
//                                             <img src="./favicon.ico" alt="Default" />
//                                         )
//                                     )}
//                                 </Link>
//                             ) : (
//                                 <Link to="/SignIn">
//                                     <span className="material-symbols-outlined">account_circle</span>
//                                 </Link>
//                             )}
//                         </div>
//                         <div>
//                             <span className="material-symbols-outlined">search</span>
//                         </div>
//                         <div>
//                             <Link to="/Cart"><span className="material-symbols-outlined cart">shopping_cart</span></Link>
//                         </div>
//                     </li>
//                 </ul>
//             </nav>

//             <div className={`slidemenu ${isToggle ? 'toggle' : ''}`}>
//                 <span onClick={handleToggle} className={`material-symbols-outlined close `} >close</span>
//                 <ul>
//                     <li>
//                         <Link
//                             ref={(el) => (linksRef.current[0] = el)}>
//                             On Sale
//                         </Link>
//                     </li>
//                     <div className="navline"
//                         ref={(el) => (linksRef.current[2] = el)}></div>
//                     <li>
//                         <Link
//                             ref={(el) => (linksRef.current[3] = el)}>
//                             Shop Now
//                         </Link>
//                     </li>
//                     <div className="navline"
//                         ref={(el) => (linksRef.current[4] = el)}></div>
//                     <li>
//                         <Link to="/Top Products"
//                             ref={(el) => (linksRef.current[5] = el)}>
//                             Top Products
//                         </Link>
//                     </li>
//                     <div className="navline"
//                         ref={(el) => (linksRef.current[6] = el)}></div>
//                     <li>
//                         <Link to="/Best Selling"
//                             ref={(el) => (linksRef.current[7] = el)}>
//                             Best Selling
//                         </Link>
//                     </li>
//                     <div className="navline"
//                         ref={(el) => (linksRef.current[8] = el)}></div>
//                     <li>
//                         <Link
//                             to="/Products"
//                             ref={(el) => (linksRef.current[9] = el)}
//                         >
//                             About Us
//                         </Link>

//                     </li>
//                     <div className="navline"
//                         ref={(el) => (linksRef.current[10] = el)}></div>
//                     <li>
//                         <Link
//                             ref={(el) => (linksRef.current[11] = el)}>
//                             Contact Us
//                         </Link>
//                     </li>
//                     <div className="navline"
//                         ref={(el) => (linksRef.current[12] = el)}></div>
//                     <li className='userprofile-show'>
//                         {Authentication ? (
//                             <Link to="/UserProfile"
//                                 ref={(el) => (linksRef.current[13] = el)}
//                             >
//                                 {loading ? (
//                                     <span>Loading...</span>
//                                 ) : (
//                                     userData ? (
//                                         <img src="./user.png" alt="User" className='userimg' />
//                                     ) : (
//                                         <img src="./favicon.ico" alt="Default" />
//                                     )
//                                 )}
//                             </Link>
//                         ) : (
//                             <Link to="/SignIn"
//                                 ref={(el) => (linksRef.current[14] = el)}
//                             >
//                                 <span className="material-symbols-outlined">account_circle</span>
//                             </Link>
//                         )}
//                     </li>

//                     <div className="navline"
//                         ref={(el) => (linksRef.current[15] = el)}></div>
//                     <li className='userlocation-show'>
//                         {country ? (
//                             <Link to="/UserLocation"
//                                 ref={(el) => (linksRef.current[16] = el)}
//                                 className='country'>{country}</Link>
//                         ) : (
//                             <Link to="/UserLocation"
//                                 ref={(el) => (linksRef.current[16] = el)}
//                             >
//                                 <span className="material-symbols-outlined">add_location</span>
//                             </Link>
//                         )}
//                     </li>
//                     <div className="navline"
//                         ref={(el) => (linksRef.current[17] = el)}></div>
//                 </ul>
//             </div>
//         </>
//     );
// };

// export default NavBar;
