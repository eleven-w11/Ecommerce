import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import "./styles/Footer.css";

const Footer = () => {
    const [openSection, setOpenSection] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSection = (section) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    useEffect(() => {
        if (!isMobile) return;

        const sectionClass = `.${openSection}-links li`;
        if (openSection) {
            gsap.fromTo(
                sectionClass,
                { x: "-100%", opacity: 0 },
                { x: "0%", opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, [openSection, isMobile]);

    return (
        <div className="site-footer">
            <div className="footer-brand">
                <Link to="/">
                    <h1>YOUR<span>W</span>EB</h1>
                </Link>
            </div>
            <div className="footer-social-media">
                <ul>
                    <li className="tiktok">
                        <a href="http://tiktok.com/">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#74767E">
                                <path d="M10.827 9.644v3.331a6.199 6.199 0 0 0-.478-.09c-1.599-.247-3.06.842-3.299 2.527a2.964 2.964 0 0 0 2.342 3.357c1.612.324 3.21-.855 3.4-2.527.062-.558.037-1.128.037-1.699V1.893h3.173c.34 3.085 2.002 4.77 4.998 5.094v3.24a7.673 7.673 0 0 1-2.594-.427 7.83 7.83 0 0 1-2.354-1.297v.234c0 2.333.013 4.666.013 6.999 0 2.307-.957 4.109-2.833 5.379-1.12.765-2.38 1.076-3.727.972-2.04-.155-3.638-1.114-4.771-2.864-1.75-2.735-1.07-6.455 1.498-8.4 1.31-.985 2.782-1.373 4.381-1.218.063.013.139.026.214.04Z">
                                </path>
                            </svg>
                        </a>


                    </li>
                    <li className="instagram">
                        <Link>
                            <svg viewBox="0 0 20 20" fill="#74767E" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.1814 6.06504C15.8442 6.06504 16.3814 5.52778 16.3814 4.86504C16.3814 4.2023 15.8442 3.66504 15.1814 3.66504C14.5187 3.66504 13.9814 4.2023 13.9814 4.86504C13.9814 5.52778 14.5187 6.06504 15.1814 6.06504Z">
                                </path>
                                <path d="M10 15C7.2425 15 5 12.7575 5 10C5 7.2425 7.2425 5 10 5C12.7575 5 15 7.2425 15 10C15 12.7575 12.7575 15 10 15ZM10 7.5C8.62125 7.5 7.5 8.62125 7.5 10C7.5 11.3787 8.62125 12.5 10 12.5C11.3787 12.5 12.5 11.3787 12.5 10C12.5 8.62125 11.3787 7.5 10 7.5Z">
                                </path>
                                <path d="M15 20H5C2.43 20 0 17.57 0 15V5C0 2.43 2.43 0 5 0H15C17.57 0 20 2.43 20 5V15C20 17.57 17.57 20 15 20ZM5 2.5C3.83125 2.5 2.5 3.83125 2.5 5V15C2.5 16.1912 3.80875 17.5 5 17.5H15C16.1688 17.5 17.5 16.1688 17.5 15V5C17.5 3.83125 16.1688 2.5 15 2.5H5Z">
                                </path>
                            </svg>
                        </Link>
                    </li>
                    <li className="facebook">
                        <Link>
                            <svg viewBox="0 0 20 20" fill="#74767E" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 10.0022C20.0004 8.09104 19.4532 6.2198 18.4231 4.61003C17.393 3.00026 15.9232 1.71938 14.1877 0.919062C12.4522 0.118741 10.5237 -0.167503 8.63053 0.0942223C6.73739 0.355948 4.9589 1.15468 3.50564 2.39585C2.05237 3.63701 0.985206 5.26863 0.430495 7.0975C-0.124217 8.92636 -0.143239 10.8759 0.37568 12.7152C0.894599 14.5546 1.92973 16.2067 3.35849 17.476C4.78726 18.7453 6.54983 19.5786 8.4375 19.8772V12.8922H5.89875V10.0022H8.4375V7.79843C8.38284 7.28399 8.44199 6.76382 8.61078 6.2748C8.77957 5.78577 9.05386 5.33986 9.4142 4.96866C9.77455 4.59746 10.2121 4.31007 10.6959 4.12684C11.1797 3.94362 11.6979 3.86905 12.2137 3.90843C12.9638 3.91828 13.7121 3.98346 14.4525 4.10343V6.56718H13.1925C12.9779 6.53911 12.7597 6.55967 12.554 6.62733C12.3484 6.69498 12.1607 6.80801 12.0046 6.95804C11.8486 7.10807 11.7283 7.29127 11.6526 7.49408C11.577 7.69689 11.5479 7.91411 11.5675 8.12968V10.0047H14.3412L13.8975 12.8947H11.5625V19.8834C13.9153 19.5112 16.058 18.3114 17.6048 16.4999C19.1516 14.6884 20.001 12.3842 20 10.0022Z">
                                </path>
                            </svg>
                        </Link>
                    </li>
                    <li className="twitter_X">
                        <Link>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#74767E">
                                <g clip-path="url(#twitter_icon_svg__a)">
                                    <path d="M11.64 8.464 18.923 0h-1.725l-6.323 7.35L5.824 0H0l7.636 11.114L0 19.99h1.726l6.676-7.761 5.334 7.76h5.824L11.64 8.465Zm-2.363 2.747-.773-1.106-6.157-8.806h2.65l4.969 7.107.774 1.106 6.458 9.238h-2.65l-5.27-7.538Z">
                                    </path>
                                </g>
                                <defs>
                                    <clipPath id="twitter_icon_svg__a">
                                        <path d="M0 0h19.56v20H0z">
                                        </path>
                                    </clipPath>
                                </defs>
                            </svg>
                        </Link>
                    </li>
                    <li className="email">
                        <Link>
                            <span class="material-symbols-outlined">
                                mail
                            </span>
                        </Link>
                    </li>
                    <li className="phone_call">
                        <Link >
                            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" fill="#74767E" >
                                <path d="M10,10c0-1.1,.9-2,2-2s2,.9,2,2-.9,2-2,2-2-.9-2-2Zm14-3v10c0,2.76-2.24,5-5,5H5c-2.76,0-5-2.24-5-5V7C0,4.24,2.24,2,5,2h14c2.76,0,5,2.24,5,5Zm-16,3c0,2.21,1.79,4,4,4s4-1.79,4-4-1.79-4-4-4-4,1.79-4,4Zm8.8,8.4c-1.15-1.52-2.9-2.4-4.8-2.4s-3.65,.88-4.8,2.4c-.33,.44-.24,1.07,.2,1.4,.44,.33,1.07,.24,1.4-.2,.76-1.02,1.93-1.6,3.2-1.6s2.44,.58,3.2,1.6c.2,.26,.5,.4,.8,.4,.21,0,.42-.07,.6-.2,.44-.33,.53-.96,.2-1.4Z" />
                            </svg>

                        </Link>
                    </li>
                </ul>
            </div>
            <div className="hr"></div>
            <div className="footer-navigation">
                <ul className="footer-column">
                    <h4 onClick={() => toggleSection("trend")}>
                        Wear the Trend
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </h4>
                    <div
                        className="footer-links trend-links"
                        style={{ display: isMobile ? (openSection === "trend" ? "block" : "none") : "block" }}
                    >
                        <li><Link to="#">Shop Now</Link></li>
                        <li><Link to="#">On Sale</Link></li>
                        <li><Link to="#">Women</Link></li>
                        <li><Link to="#">Men</Link></li>
                    </div>
                </ul>

                <ul className="footer-column">
                    <h4 onClick={() => toggleSection("quick")}>
                        Quick Access
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </h4>
                    <div
                        className="footer-links quick-links"
                        style={{ display: isMobile ? (openSection === "quick" ? "block" : "none") : "block" }}
                    >
                        <li><Link to="#">Location</Link></li>
                        <li><Link to="#">Sign In</Link></li>
                        <li><Link to="#">Cart</Link></li>
                    </div>
                </ul>

                <ul className="footer-column">
                    <h4 onClick={() => toggleSection("contact")}>
                        Get in Touch
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </h4>
                    <div
                        className="footer-links contact-links"
                        style={{ display: isMobile ? (openSection === "contact" ? "block" : "none") : "block" }}
                    >
                        <li><Link to="#">Help & Support</Link></li>
                        <li><Link to="#">Contact Us</Link></li>
                        <li><Link to="#">About Us</Link></li>
                    </div>
                </ul>
            </div>

            <div className="hr"></div>
            <div className="footer-copyright">
                &copy; {new Date().getFullYear()} YOURWEB. All Rights Reserved.
            </div>
        </div>
    );
};

export default Footer;