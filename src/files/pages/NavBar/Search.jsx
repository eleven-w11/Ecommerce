// src/components/NavBar/Search.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { gsap } from "gsap";

const popularDefaults = [
    "T Shirt", "Jeans", "Cap", "Polo", "Jacket",
    "hoodie", "Sweaters", "Shorts",
    "T Shirt", "Jeans", "Cap", "Polo", "Jacket",
    "hoodie", "Sweaters", "Shorts"
];

const Search = ({ onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [randomProducts, setRandomProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRandom, setIsLoadingRandom] = useState(true);
    const [activeSuggestion, setActiveSuggestion] = useState(null);
    const [popularList, setPopularList] = useState(popularDefaults);

    const searchInputRef = useRef(null);
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);

    // Fetch Random Products
    const fetchRandomProducts = async () => {
        try {
            setIsLoadingRandom(true);
            const { data } = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/products`
            );
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            setRandomProducts(shuffled.slice(0, 6));
        } catch {
            setRandomProducts([]);
        } finally {
            setIsLoadingRandom(false);
        }
    };

    useEffect(() => { fetchRandomProducts(); }, []);

    // Fetch Products by Search
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!query.trim()) return setResults([]);

        setIsLoading(true);
        timeoutRef.current = setTimeout(async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}`
                );
                setResults(data.data || []);
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutRef.current);
    }, [query]);

    // Focus Input
    useEffect(() => { searchInputRef.current?.focus(); }, []);

    // Animation
    useEffect(() => {
        gsap.fromTo(containerRef.current, { y: "-100%", opacity: 0, zIndex: -1 }, {
            y: "0%", opacity: 1, zIndex: 999, duration: 0.5, ease: "power3.out"
        });
        return () => {
            gsap.to(containerRef.current, {
                y: "-100%", opacity: 0, zIndex: -1, duration: 0.4, ease: "power3.in"
            });
        };
    }, []);

    const handleSuggestionClick = (s) => {
        setQuery(s);
        setActiveSuggestion(s);
    };

    const handleClearActive = () => {
        setActiveSuggestion(null);
        setQuery("");
        setPopularList(popularDefaults);
        fetchRandomProducts();
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
                            onKeyDown={(e) => e.key === "Escape" && onClose?.()}
                            className="search-input"
                        />
                        {isLoading && <div className="search-loader"></div>}
                    </div>
                    <button className="cancel-btn" onClick={onClose} aria-label="Close search">
                        <span className="close-search">×</span>
                    </button>
                </div>

                <div className="search-results-container">
                    <div className="search-results-grid">

                        {/* Popular Searches */}
                        <div className="suggestions-section">
                            <h4 className="section-title">Popular Searches</h4>
                            <div className="suggestions-list">
                                {popularList.slice(0, 16).map((s, i) => (
                                    <button
                                        key={i}
                                        className={`suggestion-item ${activeSuggestion === s ? "active-suggestion" : ""}`}
                                        onClick={() =>
                                            activeSuggestion === s ? handleClearActive() : handleSuggestionClick(s)
                                        }
                                    >
                                        <div className="suggestion-item-content">
                                            <span className="suggestion-icon">🔍</span>
                                            <span className="suggestion-text">{s}</span>
                                        </div>
                                        {activeSuggestion === s && (
                                            <div className="parent-clear-suggestion-icon">
                                                <span
                                                    className="clear-suggestion-icon"
                                                    onClick={(e) => { e.stopPropagation(); handleClearActive(); }}
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
                                    <h4 className="section-title">Products ({results.length})</h4>
                                    <div className="products-grid-container">
                                        <div className="products-grid">
                                            {results.slice(0, 6).map((p) => {
                                                const imgObj = p.images?.[0];
                                                const imgKey = imgObj && Object.keys(imgObj).find((k) => k.startsWith("pi_"));
                                                return (
                                                    <Link
                                                        key={p._id}
                                                        to={`/product/${p._id}`}
                                                        className="search-item"
                                                        onClick={onClose}
                                                    >
                                                        <img
                                                            src={imgObj ? `/images/${imgObj[imgKey]}` : "/images/placeholder.jpg"}
                                                            alt={p.product_name}
                                                            className="search-item-image"
                                                            onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
                                                        />
                                                        <div className="search-item-details">
                                                            <h3>{p.product_name}</h3>
                                                            <p className="search-item-price">${(p.product_price || 0).toFixed(2)}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
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
                                    <p className="try-different">Try a different search term</p>
                                </div>
                            ) : isLoadingRandom ? (
                                <div className="fp-loader-container">
                                    <div className="loader"><span></span><span></span><span></span></div>
                                </div>
                            ) : randomProducts.length > 0 ? (
                                <>
                                    <h4 className="section-title">Featured Products</h4>
                                    <div className="products-grid-container">
                                        <div className="products-grid">
                                            {randomProducts.map((p) => {
                                                const imgObj = p.images?.[0];
                                                const imgKey = imgObj && Object.keys(imgObj).find((k) => k.startsWith("pi_"));
                                                return (
                                                    <Link
                                                        key={p._id}
                                                        to={`/product/${p._id}`}
                                                        className="search-item"
                                                        onClick={onClose}
                                                    >
                                                        <img
                                                            src={imgObj ? `/images/${imgObj[imgKey]}` : "/images/placeholder.jpg"}
                                                            alt={p.product_name}
                                                            className="search-item-image"
                                                            onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
                                                        />
                                                        <div className="search-item-details">
                                                            <h3>{p.product_name}</h3>
                                                            <p className="search-item-price">${(p.product_price || 0).toFixed(2)}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="search-welcome">
                                    <p>Start typing to search for products</p>
                                    <p className="try-examples">Try: T-Shirts, Jeans, Shoes</p>
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