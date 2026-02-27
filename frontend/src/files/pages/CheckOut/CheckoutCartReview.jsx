import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/CheckOut/CheckoutCartReview.css";
import "../../styles/CheckOut/CartPopup.css";

const CheckoutCartReview = ({
    checkoutItems,
    setCheckoutItems,
    checkoutType,
    setCheckoutType,
    onProceedToShipping
}) => {
    const navigate = useNavigate();
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartProducts, setCartProducts] = useState([]);
    const [popupLoading, setPopupLoading] = useState(false);
    const [checkoutItem, setCheckoutItem] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState("idle"); // "idle", "loading", "error"

    // Effect to handle scrollbar visibility when popup is active
    useEffect(() => {
        const cartReviewContainer = document.querySelector('.cart-review-container');

        if (cartReviewContainer) {
            if (showCartPopup) {
                // Hide scrollbar when popup is active
                cartReviewContainer.style.overflow = 'hidden';
                cartReviewContainer.style.pointerEvents = 'none';
                cartReviewContainer.style.userSelect = 'none';
            } else {
                // Restore scrollbar when popup is closed
                cartReviewContainer.style.overflow = '';
                cartReviewContainer.style.pointerEvents = '';
                cartReviewContainer.style.userSelect = '';
            }
        }

        // Cleanup function to restore styles when component unmounts
        return () => {
            if (cartReviewContainer) {
                cartReviewContainer.style.overflow = '';
                cartReviewContainer.style.pointerEvents = '';
                cartReviewContainer.style.userSelect = '';
            }
        };
    }, [showCartPopup]);

    // Alternative approach: Using useRef for better performance
    const cartReviewRef = useRef(null);

    // useEffect(() => {
    //     if (cartReviewRef.current) {
    //         if (showCartPopup) {
    //             cartReviewRef.current.style.overflow = 'hidden';
    //             cartReviewRef.current.style.pointerEvents = 'none';
    //             cartReviewRef.current.style.userSelect = 'none';
    //         } else {
    //             cartReviewRef.current.style.overflow = '';
    //             cartReviewRef.current.style.pointerEvents = '';
    //             cartReviewRef.current.style.userSelect = '';
    //         }
    //     }
    // }, [showCartPopup]);

    // Fetch cart products details - EXACTLY like your original code
    const fetchCartProducts = async (cartItems) => {
        try {
            const productIds = cartItems.map(item => item.id);

            if (productIds.length === 0) return [];

            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/cart-products`, { productIds });

            // Combine cart items with their product details - PRESERVE COLOR FROM CART ITEM
            const productsWithDetails = cartItems.map(cartItem => {
                const product = response.data.find(p => p._id === cartItem.id);

                if (!product) {
                    console.warn(`Product not found for ID: ${cartItem.id}`);
                    return null;
                }

                return {
                    ...product,
                    uniqueId: cartItem.uniqueId || null,
                    addedAt: cartItem.addedAt || null,
                    // IMPORTANT: Preserve the color from the cart item, not from product
                    color: cartItem.color || product.images?.[0]?.color_code || null,
                    size: cartItem.size || null,
                    quantity: cartItem.quantity || 1,
                    image: cartItem.image || product.images?.[0]?.pi_1 || "default.jpg",
                    price: product.dis_product_price || product.product_price,
                    originalPrice: product.product_price,
                    hasDiscount: !!product.dis_product_price,
                    saveAmount: product.dis_product_price ? (product.product_price - product.dis_product_price) : 0,
                    productName: product.product_name
                };
            }).filter(Boolean);

            return productsWithDetails;
        } catch (error) {
            console.error("Failed to fetch cart products:", error);
            return [];
        }
    };

    useEffect(() => {
        const initializeCheckout = async () => {
            setLoadingStatus("loading");
            
            try {
                const itemFromStorage = JSON.parse(localStorage.getItem("checkoutItem"));
                const cartFromStorage = JSON.parse(localStorage.getItem("checkoutData"));
                const userCart = JSON.parse(localStorage.getItem("cart")) || [];

                console.log("📍 CheckoutCartReview Data:", {
                    itemFromStorage,
                    cartFromStorage,
                    userCart
                });

                // EXACTLY like your original logic
                // Check if user has cart items and is doing single product checkout
                if (itemFromStorage && userCart.length > 0) {
                    // Single product checkout with cart items - show popup
                    console.log("🔄 Showing cart popup - single item with cart items");
                    const singleItem = itemFromStorage;
                    setCheckoutItem(singleItem);
                    setCheckoutItems([singleItem]);
                    setCheckoutType("single");
                    setCartItems(userCart);

                    // Fetch cart products for popup display
                    setPopupLoading(true);
                    const cartProductsData = await fetchCartProducts(userCart);
                    setCartProducts(cartProductsData);
                    setPopupLoading(false);

                    setShowCartPopup(true);
                    setLoadingStatus("idle");
                } else if (itemFromStorage) {
                    // Single product checkout with no cart items
                    console.log("🔄 Single product checkout - no cart items");
                    const singleItem = itemFromStorage;
                    setCheckoutType("single");
                    setCheckoutItem(singleItem);
                    setCheckoutItems([singleItem]);
                    setLoadingStatus("idle");
                } else if (cartFromStorage) {
                    // Cart checkout
                    console.log("🔄 Cart checkout - no popup needed");
                    const cartData = cartFromStorage;

                    // If cart items don't have color info, fetch them
                    if (cartData.items && cartData.items.some(item => !item.color)) {
                        console.log("🔄 Fetching cart products for color info");
                        setPopupLoading(true);
                        const cartProductsData = await fetchCartProducts(cartData.items);
                        setCheckoutItems(cartProductsData);
                        setPopupLoading(false);
                    } else {
                        setCheckoutItems(cartData.items || []);
                    }

                    setCheckoutType("cart");
                    setLoadingStatus("idle");
                } else {
                    setLoadingStatus("idle");
                    // navigate("/products");
                }
            } catch (error) {
                console.error("Error initializing checkout:", error);
                setLoadingStatus("error");
            }
        };

        initializeCheckout();
    }, [setCheckoutItems, setCheckoutType]);

    // Handle user's choice from popup - EXACTLY like your original code
    const handlePopupChoice = async (addCartItems) => {
        if (addCartItems) {
            // User wants to add cart items - combine single product with cart items
            setPopupLoading(true);

            // Use the already fetched cart products
            const combinedItems = [
                checkoutItem,
                ...cartProducts.map(cartProduct => ({
                    id: cartProduct._id,
                    productId: cartProduct._id,
                    productName: cartProduct.product_name,
                    // Make sure color is preserved from cartProduct
                    color: cartProduct.color || cartProduct.images?.[0]?.color_code,
                    size: cartProduct.size,
                    quantity: cartProduct.quantity,
                    image: cartProduct.image,
                    price: cartProduct.dis_product_price || cartProduct.product_price,
                    originalPrice: cartProduct.product_price,
                    hasDiscount: !!cartProduct.dis_product_price,
                    saveAmount: cartProduct.saveAmount || 0,
                    uniqueId: cartProduct.uniqueId,
                    addedAt: cartProduct.addedAt
                }))
            ];

            setCheckoutItems(combinedItems);
            setCheckoutType("cart");

            // Update localStorage to reflect combined checkout
            const checkoutData = {
                items: combinedItems,
                subtotal: calculateCombinedSubtotal(combinedItems),
                totalItems: combinedItems.reduce((total, item) => total + item.quantity, 0),
                checkoutType: "cart"
            };

            localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
            localStorage.removeItem("checkoutItem");
            setPopupLoading(false);
        }

        setShowCartPopup(false);
    };

    const calculateCombinedSubtotal = (items) => {
        return items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const calculateSubtotal = () => {
        return checkoutItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal();
    };

    const calculateTotalItems = () => {
        return checkoutItems.reduce((total, item) => total + item.quantity, 0);
    };

    const calculateTotalDiscount = () => {
        return checkoutItems.reduce((total, item) => {
            // Only calculate discount for items that have both originalPrice and price, and originalPrice > price
            if (item.originalPrice && item.price && item.originalPrice > item.price) {
                const itemDiscount = (item.originalPrice - item.price) * item.quantity;
                return total + itemDiscount;
            }
            return total;
        }, 0);
    };

    // Helper function to safely display color
    const getColorStyle = (color) => {
        if (!color) return null;

        // If color is a valid CSS color, use it directly
        if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
            return { backgroundColor: color };
        }

        // If it's a color name, try to use it
        const validColorNames = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gray', 'brown'];
        if (validColorNames.includes(color.toLowerCase())) {
            return { backgroundColor: color.toLowerCase() };
        }

        // Default fallback
        return { backgroundColor: '#ccc' };
    };

    if (!checkoutItems || checkoutItems.length === 0) {
        return (
            <div className="checkout-empty">
                <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h2>No items to checkout</h2>
                    <p>Please add items to your cart before proceeding to checkout.</p>
                    <button onClick={() => navigate("/products")} className="modern-btn primary">
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {showCartPopup && (
                <div className="cart-popup-overlay">
                    <div className="cart-popup">

                        <div className="popup-header">
                            <h3>Items in Your Cart</h3>
                            <p>You have {cartItems.length} item(s) in your cart. Would you like to add them to this order?</p>
                        </div>

                        <div className="popup-items">
                            <div className="current-item">
                                <h4>Current Product:</h4>
                                <div className="item-preview">
                                    <img
                                        src={`/images/${checkoutItem?.image}`}
                                        alt={checkoutItem?.productName}
                                        onError={(e) => {
                                            e.target.src = '/images/default.jpg';
                                        }}
                                    />
                                    <div className="item-details">
                                        <span className="item-name">{checkoutItem?.productName}</span>
                                        <span className="item-price">${checkoutItem?.price}</span>
                                        <div className="item-meta-popup">
                                            {checkoutItem?.color && (
                                                <span className="color-badge-popup" style={getColorStyle(checkoutItem.color)}></span>
                                            )}
                                            {/* Show "NON" when no size is selected */}
                                            <span className="size-badge-popup">{checkoutItem?.size || "NON"}</span>
                                            <span className="quantity-badge-popup">Qty: {checkoutItem?.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="cart-items">
                                <h4>Cart Items ({cartProducts.length}):</h4>
                                {popupLoading ? (
                                    <div className="popup-loading">
                                        <div className="loader-small">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        {/* <p>Loading cart items...</p> */}
                                    </div>
                                ) : (
                                    <div className="cart-items-list">
                                        {cartProducts.map((item, index) => (
                                            <div key={item.uniqueId || index} className="cart-item-preview">
                                                <div className="cart-items-list-img">
                                                    <img
                                                        src={`/images/${item.image}`}
                                                        alt={item.productName}
                                                        onError={(e) => {
                                                            e.target.src = '/images/default.jpg';
                                                        }}
                                                    />
                                                </div>

                                                <div className="cart-item-details">
                                                    <span className="cart-item-name">{item.productName}</span>
                                                    <span className="cart-item-price">${item.price}</span>
                                                    <div className="cart-item-meta">
                                                        {item.color && (
                                                            <span className="color-badge-popup" style={getColorStyle(item.color)}></span>
                                                        )}
                                                        {/* Show "NON" when no size is selected for cart items too */}
                                                        <span className="size-badge-popup">{item.size || "NON"}</span>
                                                        <span className="quantity-badge-popup">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="popup-actions">
                            <button
                                className="popup-btn primary"
                                onClick={() => handlePopupChoice(true)}
                                disabled={popupLoading}
                            >
                                Yes
                            </button>
                            <button
                                className="popup-btn secondary"
                                onClick={() => handlePopupChoice(false)}
                                disabled={popupLoading}
                            >
                                No
                            </button>
                        </div>

                        <div className="popup-note">
                            <small>You can always checkout cart items separately later.</small>
                        </div>
                    </div>
                </div>
            )}

            {/* Add ref to the cart-review-container */}

            <div className="cart-review-layout">
                {/* Order Summary - Sticky */}
                <div className="order-summary-sidebar">
                    <div className="checkout-section-heading">
                        <h3>Order Summary</h3>
                    </div>

                    {/* {loadingStatus !== "idle" && (
                        <div className="cart-review-loader cart-loader-container">
                            {loadingStatus === "loading" && (
                                <div className="loader">
                                    <span></span><span></span><span></span>
                                </div>
                            )}
                            {loadingStatus === "error" && (
                                <div className="status-icon error">✕</div>
                            )}
                        </div>
                    )} */}

                    <div className="order-items-list">
                        {checkoutItems.map((item, index) => (
                            <div key={item.uniqueId || index} className="order-item">
                                <div className="item-image">
                                    <img
                                        src={`/images/${item.image}`}
                                        alt={item.productName}
                                        onError={(e) => {
                                            e.target.src = '/images/default.jpg';
                                        }}
                                    />
                                </div>
                                <div className="item-info">
                                    <div className="product-name-and-item-price">
                                        <h4>{item.productName}</h4>
                                        <div className="item-price">
                                            {item.hasDiscount ? (
                                                <div className="price-container">
                                                    <span className="original-price">${item.originalPrice}</span>
                                                    <span className="current-price">${item.price}</span>
                                                </div>
                                            ) : (
                                                <span className="current-price">${item.price}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-meta">
                                        {item.color && (
                                            <span className="color-badge" style={getColorStyle(item.color)}></span>
                                        )}
                                        <span className="size-badge">{item.size || "N/A"}</span>
                                        <span className="quantity-badge">Qty: {item.quantity}</span>
                                    </div>

                                    <div className="item-total">
                                        <span>Total: ${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="price-breakdown">
                        <div className="price-line">
                            <span>Subtotal ({calculateTotalItems()} {calculateTotalItems() === 1 ? 'item' : 'items'})</span>
                            <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="price-line">
                            <span>Shipping</span>
                            <span className="free-shipping">
                                FREE
                            </span>
                        </div>
                        {calculateTotalDiscount() > 0 && (
                            <div className="price-line discount">
                                <span>Discount</span>
                                <span>-${calculateTotalDiscount().toFixed(2)}</span>
                            </div>
                        )}
                        <div className="price-line total">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={onProceedToShipping}
                        className="place-order-btn modern-btn primary large"
                    >
                        Proceed to Shipping - ${calculateTotal().toFixed(2)}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CheckoutCartReview;