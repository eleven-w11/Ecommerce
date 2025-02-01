import React, { useState } from "react";

const TeSt = () => {
    const [showSecondNavbar, setShowSecondNavbar] = useState(false);
    const [showThirdNavbar, setShowThirdNavbar] = useState(null);

    const secondNavbarLinks = Array.from({ length: 10 }, (_, i) => `Link ${i + 1}`);

    const generateRandomLinks = () => {
        const count = Math.floor(Math.random() * 5) + 2; // 2 to 6 random links
        return Array.from({ length: count }, (_, i) => `Sub-Link ${i + 1}`);
    };

    return (
        <div>
            {/* First Navbar */}
            <nav className="first-navbar">
                <div className="logo">Logo</div>
                <button onClick={() => setShowSecondNavbar(!showSecondNavbar)}>Menu</button>
                <div className="icons">
                    <span>Location</span>
                    <span>Account</span>
                    <span>Search</span>
                    <span>Cart</span>
                </div>
            </nav>

            {/* Second Navbar */}
            {showSecondNavbar && (
                <div className="second-navbar">
                    <h3>Second Navbar</h3>
                    {secondNavbarLinks.map((link, index) => (
                        <button key={index} onClick={() => setShowThirdNavbar(index)}>
                            {link}
                        </button>
                    ))}
                </div>
            )}

            {/* Third Navbar */}
            {showThirdNavbar !== null && (
                <div className="third-navbar">
                    <h3>Third Navbar for {secondNavbarLinks[showThirdNavbar]}</h3>
                    {generateRandomLinks().map((sublink, index) => (
                        <button key={index}>{sublink}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeSt;
