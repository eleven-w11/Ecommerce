import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import addTocart from "../../images/add-to-cart.png";

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();

    useEffect(() => {
        // Get search query from URL parameters
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get("q") || "";
        setSearchQuery(query);

        if (query) {
            fetchSearchResults(query);
        } else {
            setLoading(false);
        }
    }, [location]);

    const fetchSearchResults = async (query) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}`
            );

            // Handle both array and object responses
            const responseData = response.data;
            const productsArray = Array.isArray(responseData)
                ? responseData
                : responseData.data || responseData.products || [];

            setProducts(productsArray);
        } catch (error) {
            console.error("❌ Error fetching search results:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const timeStamp = Date.now();
        const uniqueId = `${product._id}-${timeStamp}`;

        const index = storedCart.findIndex(item => item.id === product._id);
        if (index !== -1) {
            storedCart[index].quantity = (storedCart[index].quantity || 1) + 1;
            storedCart[index].addedAt = new Date().toISOString();

            localStorage.setItem("cart", JSON.stringify(storedCart));
            window.dispatchEvent(new Event("storage"));
            return;
        }

        const newCartItem = {
            uniqueId: uniqueId,
            id: product._id,
            quantity: 1,
            addedAt: new Date().toISOString()
        };

        const updatedCart = [...storedCart, newCartItem];
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("storage"));
    };

    return (
        <div className="best-selling-section top-product-section SearchResults">
            <div className="product-container">
                <h2>Search Results for "{searchQuery}<span className="product-length">({products.length})</span>"</h2>
                

                <div className={products.length > 0 ? "products-grid" : "products-flex"}>
                    {loading ? (
                        <div className="loader-container">
                            <div className="loader">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    ) : products.length > 0 ? (
                        products.map(product => {
                            const hasDiscount = product.dis_product_price !== undefined;
                            const firstImage = product.images?.[0]?.pi_1 || "default.jpg";

                            return (
                                <div key={product._id} className="product-card">
                                    <div className="product-image-wrapper">
                                        <img
                                            src={`${process.env.PUBLIC_URL}/images/${firstImage}`}
                                            className="tp-img"
                                            {...(product.width ? { style: { width: product.width } } : {})}
                                            alt={product.product_name}
                                            onError={(e) => {
                                                e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.jpg`;
                                            }}
                                        />
                                        <img
                                            src={addTocart}
                                            className="add-to-cart-icon"
                                            alt="Add to Cart"
                                            onClick={() => addToCart(product)}
                                        />
                                    </div>
                                    <div className="product-details">
                                        <h3>{product.product_name}</h3>
                                        {hasDiscount ? (
                                            <p className="product-price dual-price">
                                                <span className="original-price">${product.product_price}</span>
                                                <span className="discount-price">${product.dis_product_price}</span>
                                            </p>
                                        ) : (
                                            <p className="product-price">${product.product_price}</p>
                                        )}
                                        <Link to={`/product/${product._id}`}>
                                            Shop Now
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-results">
                            <p>No products found for "{searchQuery}"</p>
                            <Link to="/" className="continue-shopping">
                                Continue Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;