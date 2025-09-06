import React, { useEffect, useState } from "react";

const DelNavbar = () => {
    const [bgColor, setBgColor] = useState("rgba(0, 0, 255, 1)");

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            if (scrollY <= 150) {
                const opacity = 1 - scrollY / 150;
                setBgColor(`rgba(0, 0, 255, ${opacity})`);
            } else {
                setBgColor("rgba(0, 0, 255, 0)");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "60px",
                background: bgColor,
                transition: "background 0.2s linear",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                color: "#fff",
                fontWeight: "bold",
                zIndex: "900"
            }}
        >
            <a href="#home" style={{ color: "inherit", textDecoration: "none" }}>
                Home
            </a>
            <a href="#about" style={{ color: "inherit", textDecoration: "none" }}>
                About
            </a>
            <a href="#services" style={{ color: "inherit", textDecoration: "none" }}>
                Services
            </a>
            <a href="#contact" style={{ color: "inherit", textDecoration: "none" }}>
                Contact
            </a>
        </div>
    );
};

export default DelNavbar;
