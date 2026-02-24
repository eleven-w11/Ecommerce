// src/components/NavBar/SlideMenu.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MenuIcon from "../../images/menu.png";
import SearchIcon from "../../images/search.png";
import UserIcon from "../../images/userIcon.png";
import LocationIcon from "../../images/location.png";
import '../../styles/NavBar/NavBar.css';

const SlideMenu = ({
    isToggle, handleToggle, toggleSearch,
    Authentication, loading, userData,
    country, activePath, linksRef,
    showManDropdown, showWomanDropdown,
    handleManClick, handleWomanClick,
    manDropdownRef, womanDropdownRef
}) => {
    const [hasPendingOrder, setHasPendingOrder] = useState(false);

    // Check for pending orders when user is authenticated
    useEffect(() => {
        const checkPendingOrders = async () => {
            if (!Authentication) {
                setHasPendingOrder(false);
                return;
            }

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/orders/my-orders`,
                    { withCredentials: true }
                );

                if (response.data.success && response.data.orders) {
                    // Check if user has any pending orders
                    const pendingOrders = response.data.orders.filter(
                        order => order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing'
                    );
                    setHasPendingOrder(pendingOrders.length > 0);
                }
            } catch (error) {
                console.error("Error checking orders:", error);
                setHasPendingOrder(false);
            }
        };

        checkPendingOrders();
    }, [Authentication]);

    const handleLinkClick = () => {
        handleToggle(); // Close the slide menu
    };

    const handleSearchClick = () => {
        handleToggle(); // Close the slide menu
        toggleSearch(); // Open search
    };

    return (
        <div className={`slidemenu ${isToggle ? 'toggle' : ''}`}>
            <div className="mob_top_icons">
                <div className="close_menu">
                    <img
                        className='menuicon'
                        onClick={handleToggle}
                        src={MenuIcon}
                        alt="" />
                </div>
                <div className="mob_icons">
                    <li className='userprofile-show'>
                        {Authentication ? (
                            <Link to="/UserProfile" ref={(el) => (linksRef.current[19] = el)} onClick={handleLinkClick}>
                                {loading || !userData ? (
                                    <img className='default-user-profile' src="./user.png" alt="Default" />
                                ) : (
                                    <img crossOrigin="anonymous" src={userData.image} alt="User" className='userimg' />
                                )}
                            </Link>
                        ) : (
                            <Link to="/SignIn" ref={(el) => (linksRef.current[19] = el)} onClick={handleLinkClick}>
                                <img src={UserIcon} className='icon usericon' alt="" />
                            </Link>
                        )}
                    </li>
                    <li className='userlocation-show'>
                        {country ? (
                            <Link to="/UserLocation" ref={(el) => (linksRef.current[18] = el)} className='country' onClick={handleLinkClick}>
                                {country}
                            </Link>
                        ) : (
                            <Link to="/UserLocation" ref={(el) => (linksRef.current[18] = el)} onClick={handleLinkClick}>
                                <img src={LocationIcon} className='locationicon' alt="" />
                            </Link>
                        )}
                    </li>
                    <li className='search-show'
                        onClick={handleSearchClick}
                        ref={(el) => (linksRef.current[20] = el)}
                    >
                        <img src={SearchIcon} className='icon searchicon' alt="" />
                    </li>
                </div>
            </div>

            <div className="navline navline_1st" ref={(el) => (linksRef.current[1] = el)}></div>
            <ul>
                <div className="line_hide_box"></div>
                <li>
                    <Link to="/" ref={(el) => (linksRef.current[2] = el)} className={activePath === "/" ? "active-link" : ""} onClick={handleLinkClick}>
                        On Sale
                    </Link>
                </li>
                <div className={`navline ${activePath === "/" ? "active-line" : ""}`} ref={(el) => (linksRef.current[3] = el)}></div>

                <li>
                    <Link to="/TopProducts" className={activePath === "/TopProducts" ? "active-link" : ""} ref={(el) => (linksRef.current[4] = el)} onClick={handleLinkClick}>
                        Top Products
                    </Link>
                </li>
                <div className={`navline ${activePath === "/TopProducts" ? "active-line" : ""}`} ref={(el) => (linksRef.current[5] = el)}></div>

                <li>
                    <Link to="/BestSelling" className={activePath === "/BestSelling" ? "active-link" : ""} ref={(el) => (linksRef.current[6] = el)} onClick={handleLinkClick}>
                        Best Selling
                    </Link>
                </li>
                <div className={`navline ${activePath === "/BestSelling" ? "active-line" : ""}`} ref={(el) => (linksRef.current[7] = el)}></div>

                {/* Man Dropdown */}
                <li className="man_nolink" onClick={handleManClick}>
                    <span className='man_woman' ref={(el) => (linksRef.current[8] = el)}>Man</span>
                    <span className={`material-symbols-outlined arrow-icon ${showManDropdown ? 'rotate' : ''}`} ref={(el) => (linksRef.current[9] = el)}>arrow_drop_down</span>
                </li>
                <div className="navline" ref={(el) => (linksRef.current[10] = el)}></div>
                {showManDropdown && (
                    <div className="dropdown-man" ref={manDropdownRef}>
                        <li><Link to="/ManTop" state={{ category: "man", type: "top" }} className={activePath === "/ManTop" ? "active-link" : ""} onClick={handleLinkClick}>Top</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/ManTop" ? "active-line" : ""}`}></div>
                        <li><Link to="/ManBottom" state={{ category: "man", type: "bottom" }} className={activePath === "/ManBottom" ? "active-link" : ""} onClick={handleLinkClick}>Bottom</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/ManBottom" ? "active-line" : ""}`}></div>
                        <li><Link to="/ManShoes" state={{ category: "man", type: "shoes" }} className={activePath === "/ManShoes" ? "active-link" : ""} onClick={handleLinkClick}>Shoes</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/ManShoes" ? "active-line" : ""}`}></div>
                    </div>
                )}

                {/* Woman Dropdown */}
                <li className="woman_nolink" onClick={handleWomanClick}>
                    <span className='man_woman' ref={(el) => (linksRef.current[11] = el)}>Woman</span>
                    <span className={`material-symbols-outlined arrow-icon ${showWomanDropdown ? 'rotate' : ''}`} ref={(el) => (linksRef.current[12] = el)}>arrow_drop_down</span>
                </li>
                <div className="navline" ref={(el) => (linksRef.current[13] = el)}></div>
                {showWomanDropdown && (
                    <div className="dropdown-woman" ref={womanDropdownRef}>
                        <li><Link to="/WomanTop" state={{ category: "woman", type: "top" }} className={activePath === "/WomanTop" ? "active-link" : ""} onClick={handleLinkClick}>Top</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanTop" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanBottom" state={{ category: "woman", type: "bottom" }} className={activePath === "/WomanBottom" ? "active-link" : ""} onClick={handleLinkClick}>Bottom</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanBottom" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanShoes" state={{ category: "woman", type: "shoes" }} className={activePath === "/WomanShoes" ? "active-link" : ""} onClick={handleLinkClick}>Shoes</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanShoes" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanBags" state={{ category: "woman", type: "bags" }} className={activePath === "/WomanBags" ? "active-link" : ""} onClick={handleLinkClick}>Bags</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanBags" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanAccessories" state={{ category: "woman", type: "accessories" }} className={activePath === "/WomanAccessories" ? "active-link" : ""} onClick={handleLinkClick}>Accessories</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanAccessories" ? "active-line" : ""}`}></div>
                    </div>
                )}

                {/* Remaining Links */}
                <li><Link to="/AboutUs" className={activePath === "/AboutUs" ? "active-link" : ""} ref={(el) => (linksRef.current[14] = el)} onClick={handleLinkClick}>About Us</Link></li>
                <div className={`navline ${activePath === "/AboutUs" ? "active-line" : ""}`} ref={(el) => (linksRef.current[15] = el)}></div>
                <li><Link to="/ContactUs" className={activePath === "/ContactUs" ? "active-link" : ""} ref={(el) => (linksRef.current[16] = el)} onClick={handleLinkClick}>Contact Us</Link></li>
                <div className={`navline ${activePath === "/ContactUs" ? "active-line" : ""}`} ref={(el) => (linksRef.current[17] = el)}></div>
            </ul>
        </div>
    );
};

export default SlideMenu;