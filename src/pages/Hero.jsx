import React, { useState, useEffect } from 'react';
import './styles/Hero.css';
import { Link } from 'react-router-dom';

const images = [
    "https://baroque.pk/cdn/shop/files/MAin_BAnner84_38e7bb9a-ec8d-440d-a6f7-1c17a0caff3c.jpg?v=1732608662&width=2000",
    "https://baroque.com.pk/cdn/shop/files/MAin_BAnner83.jpg?v=1732174950&width=2000",
    "https://baroque.pk/cdn/shop/files/MAin_BAnner53_1_05d05704-90c0-4d16-af2f-59fb317ddb33.jpg?v=1732964520&width=2000",
];

const mobileImage = "https://baroque.pk/cdn/shop/files/mobilebanner_91.jpg?v=1735833394&width=800";

export default function ImageSwapper() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

    useEffect(() => {
        // Update `isMobile` state on window resize
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (!isMobile && images.length > 1) {
            const intervalId = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [isMobile]);

    const currentImage = isMobile ? mobileImage : images[currentIndex];

    return (
        <>
            <div className='hero'
                style={{
                    backgroundImage: `url(${currentImage})`, // Corrected to use `currentImage`
                }}
            >
                <div className="buttons">
                    <div className="button-shop-now">
                        <Link className='shopnow' to="/Products">Shop Now</Link>
                    </div>
                    <div className="button-shop-now white-btn">
                        <Link className='shopnow' to="/Products">Stiched</Link>
                    </div>
                </div>
            </div>
        </>
    );
}