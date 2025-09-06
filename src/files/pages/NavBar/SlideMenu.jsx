// src/components/NavBar/SlideMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from "../../images/menu.png";
import SearchIcon from "../../images/search.png";
import UserIcon from "../../images/userIcon.png";
import LocationIcon from "../../images/location.png";


const SlideMenu = ({
    isToggle, handleToggle, toggleSearch,
    Authentication, loading, userData,
    country, activePath, linksRef,
    showManDropdown, showWomanDropdown,
    handleManClick, handleWomanClick,
    manDropdownRef, womanDropdownRef
}) => {
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
                            <Link to="/UserProfile" ref={(el) => (linksRef.current[19] = el)}>
                                {loading || !userData ? (
                                    // <img className='default-user-profile' src="./user.png" alt="Default" />
                                    <img className='default-user-profile' src="./user.png" alt="Default" />
                                ) : (
                                    <img crossOrigin="anonymous" src={userData.image} alt="User" className='userimg' />
                                )}
                            </Link>
                        ) : (
                            <Link to="/SignIn" ref={(el) => (linksRef.current[19] = el)}>
                                {/* <span className="material-symbols-outlined">account_circle</span> */}
                                <img src={UserIcon} className='icon usericon' alt="" />

                            </Link>
                        )}
                    </li>
                    <li className='userlocation-show'>
                        {country ? (
                            <Link to="/UserLocation" ref={(el) => (linksRef.current[18] = el)} className='country'>
                                {country}
                            </Link>
                        ) : (
                            <Link to="/UserLocation" ref={(el) => (linksRef.current[18] = el)}>
                                {/* <span className="material-symbols-outlined">add_location</span> */}
                                <img src={LocationIcon} className='locationicon' alt="" />

                            </Link>
                        )}
                    </li>
                    <li className='search-show'
                        onClick={() => {
                            handleToggle();
                            toggleSearch();
                        }}
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
                    <Link to="/Chat" ref={(el) => (linksRef.current[2] = el)} className={activePath === "/Chat" ? "active-link" : ""}>
                        On Sale
                    </Link>
                </li>
                <div className={`navline ${activePath === "/UserLocation" ? "active-line" : ""}`} ref={(el) => (linksRef.current[3] = el)}></div>

                <li>
                    <Link to="DelNav" className={activePath === "DelNav" ? "active-link" : ""} ref={(el) => (linksRef.current[4] = el)}>
                        Top Products
                    </Link>
                </li>
                <div className={`navline ${activePath === "DelNav" ? "active-line" : ""}`} ref={(el) => (linksRef.current[6] = el)}></div>

                <li>
                    <Link to="/BestSelling" className={activePath === "/BestSelling" ? "active-link" : ""} ref={(el) => (linksRef.current[6] = el)}>
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
                        <li><Link to="/ManTop" state={{ category: "man", type: "top" }} className={activePath === "/ManTop" ? "active-link" : ""}>Top</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/ManTop" ? "active-line" : ""}`}></div>
                        <li><Link to="/ManBottom" state={{ category: "man", type: "bottom" }} className={activePath === "/ManBottom" ? "active-link" : ""}>Bottom</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/ManBottom" ? "active-line" : ""}`}></div>
                        <li><Link to="/ManShoes" state={{ category: "man", type: "shoes" }} className={activePath === "/ManShoes" ? "active-link" : ""}>Shoes</Link></li>
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
                        <li><Link to="/WomanTop" state={{ category: "woman", type: "top" }} className={activePath === "/WomanTop" ? "active-link" : ""}>Top</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanTop" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanBottom" state={{ category: "woman", type: "bottom" }} className={activePath === "/WomanBottom" ? "active-link" : ""}>Bottom</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanBottom" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanShoes" state={{ category: "woman", type: "shoes" }} className={activePath === "/WomanShoes" ? "active-link" : ""}>Shoes</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanShoes" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanBags" state={{ category: "woman", type: "bags" }} className={activePath === "/WomanBags" ? "active-link" : ""}>Bags</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanBags" ? "active-line" : ""}`}></div>
                        <li><Link to="/WomanAccessories" state={{ category: "woman", type: "accessories" }} className={activePath === "/WomanAccessories" ? "active-link" : ""}>Accessories</Link></li>
                        <div className={`navline navline_dropdown ${activePath === "/WomanAccessories" ? "active-line" : ""}`}></div>
                    </div>
                )}

                {/* Remaining Links */}
                <li><Link to="/SignIn" className={activePath === "/SignIn" ? "active-link" : ""} ref={(el) => (linksRef.current[14] = el)}>About Us</Link></li>
                <div className="navline" ref={(el) => (linksRef.current[15] = el)}></div>
                <li><Link to="/Cart" className={activePath === "/Cart" ? "active-link" : ""} ref={(el) => (linksRef.current[16] = el)}>Contact Us</Link></li>
                <div className="navline" ref={(el) => (linksRef.current[17] = el)}></div>
                <li><Link to="/AdminChat" className={activePath === "/AdminChat" ? "active-link" : ""} ref={(el) => (linksRef.current[16] = el)}>Admin Chat</Link></li>
                <div className="navline" ref={(el) => (linksRef.current[17] = el)}></div>
            </ul>
        </div>
    );
};

export default SlideMenu;
