// src/components/NavBar/SlideMenu.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MenuIcon from "../../images/menu.png";
import SearchIcon from "../../images/search.png";
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
                            <Link to="/SignIn" ref={(el) => (linksRef.current[19] = el)} onClick={handleLinkClick} className="user-icon-link">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
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

                {/* Order Confirmation Link - Only show for authenticated users with pending orders */}
                {Authentication && hasPendingOrder && (
                    <>
                        <li>
                            <Link 
                                to="/order-confirmation" 
                                className={`order-link ${activePath === "/order-confirmation" ? "active-link" : ""}`}
                                ref={(el) => (linksRef.current[21] = el)} 
                                onClick={handleLinkClick}
                            >
                                <span className="order-link-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </span>
                                My Order
                                <span className="pending-badge">Pending</span>
                            </Link>
                        </li>
                        <div className={`navline ${activePath === "/order-confirmation" ? "active-line" : ""}`} ref={(el) => (linksRef.current[22] = el)}></div>
                    </>
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