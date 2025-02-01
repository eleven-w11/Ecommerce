import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import "./styles/Hero.css";

import heroImage1 from "./images/hero-ecommerce-1.jpg";
import heroImage2 from "./images/hero-ecommerce-2.jpg";
import heroImage3 from "./images/hero-ecommerce-3.webp";
import heroImage4 from "./images/hero-ecommerce-1.jpg";
import heroImage5 from "./images/hero-ecommerce-2.jpg";
import heroImage6 from "./images/hero-ecommerce-3.webp";

const seasons = ["WINTER", "SUMMER", "AUTUMN", "SPRING"];

const TestHero = () => {
    const images = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage5, heroImage6];
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeSeason, setActiveSeason] = useState(0);
    const seasonRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        const seasonInterval = setInterval(() => {
            gsap.to(seasonRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                onComplete: () => {
                    setActiveSeason((prev) => (prev + 1) % seasons.length);
                    gsap.fromTo(
                        seasonRef.current,
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
                    );
                },
            });
        }, 4000);

        return () => clearInterval(seasonInterval);
    }, []);



    return (
        <div className="hero">
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

                    {/* Static "THIS", Animated Season */}
                    <p className="THISSEASON">
                        <span className="static-this">THIS</span>
                        <span className="animated-season" ref={seasonRef}>{seasons[activeSeason]}</span>
                    </p>

                    <p className="THEPERFECTCHOICE">PERFECT CHOICE</p>
                    <div className="all_button hero-button">
                        <Link to="UserLocation" className="white">Shop Now</Link>
                        <Link to="UserLocation" className="gollden">On Sale</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestHero;

// .THISSEASON {
//     width: 700px;
    
//     position: relative;
//     overflow: hidden;
//     background-color: #e9defa73;
//     z-index: 2;

// }

// .THISSEASON .static-this {

//     position: relative;
//     top: 50%;
//     left: 20%;
//     transform: translate(-50%, -50%);
// }

// .THISSEASON .animated-season {
//     position: absolute;
//     top: 10%;
//     left: 10%;
//     transform: translate(-50%, -50%);
//     z-index: 2;

//     left: 110px;

//     color: gold;
//     width: 200px;
//     text-align: left;
//     white-space: nowrap;
//     background-color: cadetblue;
// }