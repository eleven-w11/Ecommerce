import { useState, useEffect } from "react";
import './styles/TestWeb.css';


function NavBar() {
    const [isToggle, setIsToggle] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);

    // code b

    useEffect(() => {
        if (isToggle) {
            // Save current scroll position when menu opens
            setScrollPosition(window.scrollY);
        } else {
            // Restore scroll position when menu closes
            window.scrollTo(0, scrollPosition);
        }
    }, [isToggle]);

    const toggleMenu = () => {
        setIsToggle(!isToggle);
    };

    return (
        <nav className="navbar">
            <button className="menu" onClick={toggleMenu}>
                ☰ Menu
            </button>
            <div className={`slidemenu ${isToggle ? "open" : ""}`}>
                <button onClick={toggleMenu}>Close</button>
                {/* Menu Content */}
            </div>
        </nav>
    );
}

export default NavBar;
