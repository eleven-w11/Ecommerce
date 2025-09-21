import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import "../styles/Hero.css";

import heroImage1 from "../images/hero-ecommerce-1.jpg";
import heroImage2 from "../images/hero-ecommerce-2.jpg";
import heroImage3 from "../images/hero-ecommerce-3.webp";
import heroImage4 from "../images/hero-ecommerce-1.jpg";
import heroImage5 from "../images/hero-ecommerce-2.jpg";
import heroImage6 from "../images/hero-ecommerce-3.webp";

import heroMob1 from "../images/hero-ecommerce-mob-1.webp";
import heroMob2 from "../images/hero-ecommerce-mob-2.webp";
import heroMob3 from "../images/hero-ecommerce-mob-3.webp";
import heroMob4 from "../images/hero-ecommerce-mob-1.webp";
import heroMob5 from "../images/hero-ecommerce-mob-2.webp";
import heroMob6 from "../images/hero-ecommerce-mob-3.webp";

// 👇 Season icons import karo
import winterIcon from "../images/WINTER.png";
import summerIcon from "../images/SUMMER.png";
import autumnIcon from "../images/AUTUMN.png";
import springIcon from "../images/SPRING.png";

const seasons = ["WINTER", "SUMMER", "AUTUMN", "SPRING"];

// 👇 Season images map
const seasonImages = {
    WINTER: winterIcon,
    SUMMER: summerIcon,
    AUTUMN: autumnIcon,
    SPRING: springIcon,
};

const TestHero = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeSeason, setActiveSeason] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const seasonRef = useRef(null);
    const iconRef = useRef(null);
    const heroRef = useRef(null);


    const desktopImages = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage5, heroImage6];
    const mobileImages = [heroMob1, heroMob2, heroMob3, heroMob4, heroMob5, heroMob6];

    const images = isMobile ? mobileImages : desktopImages;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        const seasonInterval = setInterval(() => {
            // Dono refs ek sath animate karna
            gsap.to([seasonRef.current, iconRef.current], {
                y: -20,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                onComplete: () => {
                    setActiveSeason((prev) => (prev + 1) % seasons.length);
                    gsap.fromTo(
                        [seasonRef.current, iconRef.current],
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
                    );
                },
            });
        }, 4000);

        return () => clearInterval(seasonInterval);
    }, []);

    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // resize listener
        window.addEventListener("resize", handleResize);

        // cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    // 👉 Page load par sirf ek baar animation
    // 👉 Page load par sirf ek baar animation
    useEffect(() => {
        // thoda delay taake active image DOM me aa jaye
        const timer = setTimeout(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

            tl.from(".hero-image.active", { scale: 1.1, opacity: 0, duration: 1.2 }) // background hero image
                .from(".hero-data-style-2", { y: 50, opacity: 0 }, "-=0.8") // blur box
                .from(".LOOKBEAUTIFUL", { y: 30, opacity: 0 }, "-=0.6") // text
                .from(".static-this", { x: -40, opacity: 0 }, "-=0.6") // THIS
                .from(".animated-season", { x: 40, opacity: 0 }, "-=0.6") // season text
                .from(".THEPERFECTCHOICE", { y: 30, opacity: 0 }, "-=0.5") // perfect choice
                .from(".hero-button .white", { y: 20, opacity: 0 }, "-=0.4") // shop now btn
                .from(".hero-button .gollden", { y: 20, opacity: 0 }, "-=0.3"); // location btn
        }, 100); // 100ms delay

        return () => clearTimeout(timer);
    }, []);


    return (
        <div className="hero" ref={heroRef}>
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    alt={`Hero ${index + 1}`}
                    className={`hero-image ${index === activeIndex ? "active" : ""}`}
                    style={{
                        transform: `translateX(${(index - activeIndex) * 100}%)`,
                    }}
                />
            ))}

            <div className="hero-data-style-2">
                <div className="hero-data-2">
                    <p className="LOOKBEAUTIFUL">LOOK BEAUTIFUL</p>

                    <p className="THISSEASON">
                        <span className="static-this">THIS</span>
                        <span className="animated-season" ref={seasonRef}>
                            {seasons[activeSeason]}
                            <img
                                ref={iconRef}
                                src={seasonImages[seasons[activeSeason]]}
                                alt={seasons[activeSeason]}
                                className="season-icon"
                            />
                        </span>
                    </p>

                    <p className="THEPERFECTCHOICE">PERFECT CHOICE</p>
                    <div className="hero-button">
                        <Link to="Google" className="white">Shop Now</Link>
                        <Link to="UserLocation" className="gollden">{size.width} X {size.height}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestHero;
