// src/utils/NavbarAnimation.jsx
import gsap from "gsap";

/**
 * Animate navbar icons on initial page load
 * @param {React.MutableRefObject} animationPlayedRef — React ref to avoid repeat animation
 */
export const animateNavbarOnLoad = (animationPlayedRef) => {
    if (animationPlayedRef.current) return;

    const tl = gsap.timeline();

    const logo = document.querySelector(".nav-logo h1");
    if (logo) {
        tl.fromTo(
            logo,
            { y: -20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                clearProps: "all" // This clears GSAP styles after animation
            },
            0
        );
    }

    const menuIcon = document.querySelector(".menuicon");
    if (menuIcon) {
        tl.fromTo(
            menuIcon,
            { x: -20, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.6,
                ease: "back.out(1.7)",
                clearProps: "all" // Clear GSAP styles
            },
            0.2
        );
    }

    // Animate all right-side icons
    const iconSelectors = [".locationicon", ".usericon", ".searchicon", ".carticon"];

    iconSelectors.forEach((selector, index) => {
        const icon = document.querySelector(selector);
        if (icon) {
            tl.fromTo(
                icon,
                { y: -15, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    clearProps: "all" // Clear GSAP styles
                },
                0.3 + (index * 0.1)
            );
        }
    });

    // Special handling for cart count
    const cartCount = document.querySelector(".count");
    if (cartCount && cartCount.textContent && cartCount.textContent.trim() !== "") {
        tl.fromTo(
            cartCount,
            { scale: 0, rotation: -180, opacity: 0 },
            {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.7,
                ease: "elastic.out(1, 0.8)",
                clearProps: "all", // Clear GSAP styles
                onComplete: () => {
                    animationPlayedRef.current = true;
                }
            },
            0.8
        );
    } else {
        tl.call(() => {
            animationPlayedRef.current = true;
        }, null, "+=0.2");
    }
};

/**
 * Animate cart count when it changes
 * @param {Number} count - The new cart count
 */
export const animateCartCount = (count) => {
    const cartCount = document.querySelector(".count");
    const cartIcon = document.querySelector(".carticon");

    if (cartCount) {
        gsap.fromTo(cartCount,
            { scale: 1.5, rotation: 10 },
            {
                scale: 1,
                rotation: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.8)",
                clearProps: "transform, opacity" // Only clear transform/opacity
            }
        );
    }

    if (cartIcon && count > 0) {
        gsap.fromTo(cartIcon,
            { y: -5 },
            {
                y: 0,
                duration: 0.5,
                ease: "bounce.out",
                clearProps: "y" // Only clear the y transform
            }
        );
    }
};