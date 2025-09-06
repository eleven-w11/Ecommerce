// src/components/NavBar/Search.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { gsap } from "gsap";

const Search = ({ onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [randomProducts, setRandomProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRandom, setIsLoadingRandom] = useState(true); // New state for random products loading
    const [activeSuggestion, setActiveSuggestion] = useState(null);
    const [popularList, setPopularList] = useState([
        "T Shirt", "Jeans", "Cap", "Polo", "Jacket",
        "hoodie", "Sweaters", "Shorts"
    ]);
    const [originalList] = useState([
        "T Shirt", "Jeans", "Cap", "Polo", "Jacket",
        "hoodie", "Sweaters", "Shorts"
    ]);

    const searchInputRef = useRef(null);
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);

    // Fetch random products when component mounts
    useEffect(() => {
        fetchRandomProducts();
    }, []);

    // Fetch random products function (updated)
    const fetchRandomProducts = async () => {
        try {
            setIsLoadingRandom(true);
            const res = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/products`
            );
            const allProducts = res.data;
            // Shuffle and get 6 random products
            const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
            setRandomProducts(shuffled.slice(0, 6));
        } catch (err) {
            console.error("Error fetching random products:", err);
            setRandomProducts([]);
        } finally {
            setIsLoadingRandom(false);
        }
    };

    // Fetch products based on query
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (!query.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}`
                );
                setResults(res.data.data || []);
            } catch (err) {
                console.error("Error fetching search results:", err);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutRef.current);
    }, [query]);

    // Auto-focus input
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Animate mount/unmount
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { y: "-100%", opacity: 0, zIndex: -1 },
                { y: "0%", opacity: 1, zIndex: 999, duration: 0.5, ease: "power3.out" }
            );
        }
        return () => {
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    y: "-100%",
                    opacity: 0,
                    zIndex: -1,
                    duration: 0.4,
                    ease: "power3.in",
                });
            }
        };
    }, []);

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setActiveSuggestion(suggestion);

        // move selected suggestion to top
        setPopularList((prev) => {
            const filtered = prev.filter((item) => item !== suggestion);
            return [suggestion, ...filtered];
        });
    };

    const handleClearActive = () => {
        setActiveSuggestion(null);
        setQuery("");
        setPopularList(originalList); // restore original order
        fetchRandomProducts(); // Refresh random products when clearing search
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose?.();
    };

    // Function to render product items
    const renderProductItem = (product) => {
        const imageObj = product.images?.[0];
        if (!imageObj) return null;

        const imageKey = Object.keys(imageObj).find((key) =>
            key.startsWith("pi_")
        );
        const imageToShow = imageObj[imageKey];

        return (
            <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="search-item"
                onClick={onClose}
            >
                <img
                    src={`/images/${imageToShow}`}
                    alt={product.product_name}
                    className="search-item-image"
                    onError={(e) => {
                        e.target.src = "/images/placeholder.jpg";
                    }}
                />
                <div className="search-item-details">
                    <h3>{product.product_name}</h3>
                    <p className="search-item-price">
                        ${(product.product_price || 0).toFixed(2)}
                    </p>

                    {/* 🟠 Debug info (agar backend se aya hai) */}
                    {product._debug && (
                        <div className="search-item-debug">
                            <small>
                                <strong>Matched In:</strong>{" "}
                                {product._debug.matchedIn.join(", ")}
                            </small>
                            <ul>
                                {Object.entries(product._debug.tokens).map(([token, fields]) => (
                                    <li key={token}>
                                        <strong>{token}:</strong> {fields.join(", ")}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </Link>

        );
    };

    return (
        <div className="search-container" ref={containerRef}>
            <div className="search-bar-container">
                <div className="search-bar">
                    <div className="search-input-wrapper">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-input"
                            onKeyDown={handleKeyDown}
                        />
                        {isLoading && <div className="search-loader"></div>}
                    </div>
                    <button
                        className="cancel-btn"
                        onClick={onClose}
                        aria-label="Close search"
                    >
                        <span className="close-search">×</span>
                    </button>
                </div>

                <div className="search-results-container">
                    <div className="search-results-grid">
                        {/* Popular Searches Section */}
                        <div className="suggestions-section">
                            <h4 className="section-title">Popular Searches</h4>
                            <div className="suggestions-list">
                                {popularList.slice(0, 8).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className={`suggestion-item ${activeSuggestion === suggestion ? "active-suggestion" : ""}`}
                                        onClick={() =>
                                            activeSuggestion === suggestion
                                                ? handleClearActive()
                                                : handleSuggestionClick(suggestion)
                                        }
                                    >
                                        <div className="suggestion-item-content">
                                            <span className="suggestion-icon">🔍</span>
                                            <span className="suggestion-text">{suggestion}</span>
                                        </div>
                                        {activeSuggestion === suggestion && (
                                            <div className="parent-clear-suggestion-icon">
                                                <span
                                                    className="clear-suggestion-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClearActive();
                                                    }}
                                                >
                                                    ×
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="products-section">
                            {isLoading ? (
                                <div className="fp-loader-container">
                                    <div className="loader">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <p>Searching products...</p>
                                </div>
                            ) : results.length > 0 ? (
                                <>
                                    <h4 className="section-title">
                                        Products ({results.length})
                                    </h4>
                                    <div className="products-grid-container">
                                        <div className="products-grid">
                                            {results.slice(0, 6).map(renderProductItem)}
                                        </div>
                                    </div>
                                    {results.length > 6 && (
                                        <div className="view-all-results">
                                            <Link to={`/search?q=${encodeURIComponent(query)}`} onClick={onClose}>
                                                View all {results.length} results
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : query ? (
                                <div className="search-no-results">
                                    <p>No products found for "{query}"</p>
                                    <p className="try-different">
                                        Try a different search term
                                    </p>
                                </div>
                            ) : isLoadingRandom ? (
                                <div className="fp-loader-container">
                                    <div className="loader">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            ) : randomProducts.length > 0 ? (
                                <>
                                    <h4 className="section-title">
                                        Featured Products
                                    </h4>
                                    <div className="products-grid-container">
                                        <div className="products-grid">
                                            {randomProducts.map(renderProductItem)}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="search-welcome">
                                    <p>Start typing to search for products</p>
                                    <p className="try-examples">
                                        Try: T-Shirts, Jeans, Shoes
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;