import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./styles/Cart.css";
import left from "./images/left.png";
import right from "./images/right.png";
import { Link } from "react-router-dom";

const Cart = () => {
    const [cartProducts, setCartProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [editProductId, setEditProductId] = useState(null);
    const [tempChanges, setTempChanges] = useState({});
    const [imageIndexMap, setImageIndexMap] = useState({});
    const [activeId, setActiveId] = useState(null);
    const wrapperRef = useRef(null);





    const fetchCartProducts = () => {
        setLoading(true);

        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        const productIds = cart.map(item => item.id);

        axios.post("${process.env.REACT_APP_API_BASE_URL}/api/cart-products", { productIds })
            .then(response => {
                console.log("🧾 API Response:", response.data);

                const productsWithDetails = cart.map(cartItem => {
                    const product = response.data.find(p => p._id === cartItem.id);

                    if (!product) return null;

                    return {
                        ...product,
                        uniqueId: cartItem.uniqueId || null,
                        addedAt: cartItem.addedAt || null,
                        color: cartItem.color || null,
                        size: cartItem.size || null,
                        quantity: cartItem.quantity || 1,
                        image: cartItem.image || product.images?.[0]?.pi_1 || "default.jpg"
                    };
                }).filter(Boolean);

                productsWithDetails.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));

                setCartProducts(productsWithDetails);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch cart products:", error);
                setLoading(false);
            });
    };






    useEffect(() => {
        fetchCartProducts();


        const handleStorageChange = () => {
            fetchCartProducts();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const updateQuantity = (uniqueId, change) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        cart = cart.map(item =>
            item.uniqueId === uniqueId
                ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) }
                : item
        );

        localStorage.setItem("cart", JSON.stringify(cart));

        refreshUpdatedProduct(uniqueId);
    };




    useEffect(() => {
        if (editProductId) {
            const currentProduct = cartProducts.find(p => p.uniqueId === editProductId);
            if (currentProduct) {
                setTempChanges({
                    color: currentProduct.color || currentProduct.images?.[0]?.color_code,
                    size: currentProduct.size || Object.keys(currentProduct.sizes || {})[0]
                });
            }
        }
    }, [editProductId]);

    useEffect(() => {
        if (editProductId) {
            const product = cartProducts.find(p => p.uniqueId === editProductId);
            if (product?.images) {
            }
        }
    }, [editProductId, cartProducts]);

    const handleTempColorChange = (colorCode) => {
        const product = cartProducts.find(p => p.uniqueId === editProductId);
        if (!product) return;

        const matchedImage = product.images.find(img => img.color_code === colorCode);
        const key = Object.keys(matchedImage || {}).find(k => k.startsWith("pi_"));
        const image = matchedImage?.[key];

        setTempChanges(prev => ({
            ...prev,
            color: colorCode,
            image: image
        }));
    };

    const handleTempSizeChange = (size) => {
        setTempChanges(prev => ({ ...prev, size }));
    };


    // code 2
    const handleUpdate = (uniqueId) => {
        setUpdatingId(uniqueId);
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

        const updatedCart = storedCart.map((item) => {
            if (item.uniqueId === uniqueId) {
                return {
                    ...item,
                    color: tempChanges.color || item.color,
                    size: tempChanges.size || item.size,
                    quantity: tempChanges.quantity || item.quantity,
                    image: tempChanges.image || item.image,
                };
            }
            return item;
        });

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCart(updatedCart);
        setEditProductId(null);

        setTempChanges({});

        refreshUpdatedProduct(uniqueId);

        setUpdatingId(null);
    };


    const refreshUpdatedProduct = (uniqueId) => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        const updatedItem = cart.find(item => item.uniqueId === uniqueId);
        if (!updatedItem) return;

        setCartProducts(prev =>
            prev.map(p =>
                p.uniqueId === uniqueId
                    ? {
                        ...p,
                        ...updatedItem,
                        image: updatedItem.image || p.images?.[0]?.pi_1 || "default.jpg"
                    }
                    : p
            )
        );
    };





    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {

        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart]);






    const handleNextImage = (uniqueId, images) => {
        setImageIndexMap(prev => {
            const currentIndex = prev[uniqueId] || 0;
            const nextIndex = (currentIndex + 1) % images.length;

            const imgObj = images[nextIndex];
            const colorCode = imgObj?.color_code;
            const key = Object.keys(imgObj || {}).find(k => k.startsWith("pi_"));
            const image = imgObj?.[key];

            setTempChanges(prev => ({
                ...prev,
                color: colorCode,
                image: image
            }));

            return {
                ...prev,
                [uniqueId]: nextIndex
            };
        });
    };

    const handlePrevImage = (uniqueId, images) => {
        setImageIndexMap(prev => {
            const currentIndex = prev[uniqueId] || 0;
            const prevIndex = (currentIndex - 1 + images.length) % images.length;

            const imgObj = images[prevIndex];
            const colorCode = imgObj?.color_code;
            const key = Object.keys(imgObj || {}).find(k => k.startsWith("pi_"));
            const image = imgObj?.[key];

            setTempChanges(prev => ({
                ...prev,
                color: colorCode,
                image: image
            }));

            return {
                ...prev,
                [uniqueId]: prevIndex
            };
        });
    };

    const removeFromCart = (uniqueId) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter(item => item.uniqueId !== uniqueId);
        localStorage.setItem("cart", JSON.stringify(cart));

        setCartProducts(prevProducts => prevProducts.filter(p => p.uniqueId !== uniqueId));

        window.dispatchEvent(new Event("storage"));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setActiveId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleBox = (id) => {
        setActiveId((prevId) => (prevId === id ? null : id));
    };

    useEffect(() => {
        if (activeId) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }


        return () => {
            document.body.style.overflow = "auto";
        };
    }, [activeId]);



    return (
        <>
            <div className="cart-page">
                {loading ? (
                    <div className="pro_view_loader">
                        <div className="loader-container">
                            <div className="loader">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                ) : cartProducts.length > 0 ? (
                    cartProducts.map(product => {
                        const isEditing = editProductId === product.uniqueId;

                        const currentImageObj = isEditing
                            ? product.images?.[imageIndexMap[product.uniqueId] || 0] || null
                            : null;

                        const imageKey = isEditing
                            ? (currentImageObj && Object.keys(currentImageObj).find(k => k.startsWith('pi_'))) || null
                            : null;


                        const currentImage = isEditing
                            ? currentImageObj?.[imageKey] || product.image
                            : product.image;
                        return (
                            <>
                                <div key={product.uniqueId} className="cart-item">
                                    {activeId === product.uniqueId && (
                                        <>
                                            <div
                                                className="input-des_background"
                                                onClick={() => setActiveId(null)}
                                            ></div>

                                            <div className="input-des">
                                                <span
                                                    className="material-symbols-outlined close"
                                                    onClick={() => setActiveId(null)}
                                                >
                                                    close
                                                </span>
                                                <textarea
                                                    placeholder={`Enter description for ${product.product_name} X ${product.quantity} `}
                                                ></textarea>
                                                <button onClick={() => setActiveId(null)}>Submit</button>
                                            </div>
                                        </>
                                    )}
                                    {updatingId === product.uniqueId ? (
                                        <div className="inline-loader">
                                            <div className="loader">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="cart_item-wrapper">


                                            <div className="images-frame">
                                                {editProductId === product.uniqueId && (
                                                    <>
                                                        <div className="left-icon-img" onClick={() => handlePrevImage(product.uniqueId, product.images)}>
                                                            <img src={left} className="left-icon" alt="Previous" />
                                                        </div>
                                                        <div className="right-icon-img" onClick={() => handleNextImage(product.uniqueId, product.images)}>
                                                            <img src={right} className="right-icon" alt="Next" />
                                                        </div>
                                                    </>
                                                )}

                                                <img
                                                    src={
                                                        editProductId === product.uniqueId
                                                            ? `/images/${tempChanges.image
                                                            || (() => {
                                                                const imgObj = product.images?.[imageIndexMap[product.uniqueId] || 0];
                                                                const key = Object.keys(imgObj || {}).find(k => k.startsWith('pi_'));
                                                                return imgObj?.[key];
                                                            })()
                                                            || product.image
                                                            }`
                                                            : `/images/${product.image}`
                                                    }
                                                    alt={product.product_name}
                                                />
                                            </div>




                                            <div className="cart-detail-container">
                                                <div className="cart-details">
                                                    <h2>{product.product_name}</h2>

                                                    {editProductId === product.uniqueId ? (
                                                        <>
                                                            <div className="color-options">
                                                                <span>Color:</span>
                                                                {product.images?.map((img, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`color-box ${tempChanges.color === img.color_code ? 'selected' : ''}`}
                                                                        style={{ backgroundColor: img.color_code }}
                                                                        onClick={() => handleTempColorChange(img.color_code)}
                                                                    />
                                                                ))}
                                                            </div>

                                                            <div className="size-option">
                                                                <span>Size:</span>
                                                                {Object.keys(product.sizes || {}).map((s, i) => {
                                                                    const isAvailable = product.sizes[s];
                                                                    return (
                                                                        <button
                                                                            key={i}
                                                                            className={`size-btn ${tempChanges.size === s ? 'selected' : ''} ${!isAvailable ? 'disabled-size' : ''}`}
                                                                            onClick={() => isAvailable && handleTempSizeChange(s)}
                                                                            disabled={!isAvailable}
                                                                        >
                                                                            {s}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="color-options">
                                                                <span>Color:</span>
                                                                <div
                                                                    className="color-box selected"
                                                                    style={{
                                                                        backgroundColor: product.color || product.images?.[0]?.color_code
                                                                    }}
                                                                    title={`Color: ${product.color || product.images?.[0]?.color_code}`}
                                                                ></div>
                                                            </div>
                                                            <div className="size-option">
                                                                <p>Size: </p>
                                                                <button>{product.size || "N0N"}</button>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="quantity-addtocart">
                                                        <div className="quantity">
                                                            <button className="quantity-btn decreaseQuantity"
                                                                onClick={() => updateQuantity(product.uniqueId, -1)}>
                                                                -
                                                            </button>
                                                            <span className="quantity-input">{product.quantity}</span>
                                                            <button
                                                                className="quantity-btn"
                                                                onClick={() => updateQuantity(product.uniqueId, +1)}>
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="price-container_buttons">
                                                    <div className="price-container">
                                                        {product.dis_product_price ? (
                                                            <div className="discount-box_price">
                                                                <div className="dis_price">
                                                                    <h4>Price</h4>
                                                                    <p className="original-price">${product.product_price}</p>
                                                                </div>
                                                                <div className="Price">
                                                                    <h4>Discount Price</h4>
                                                                    <p className="price">${product.dis_product_price}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="price-box">
                                                                <h4>Price</h4>
                                                                <p className="price">${product.product_price}</p>
                                                            </div>
                                                        )}
                                                        <div className="total">
                                                            <h4>Total</h4>
                                                            <p className="total-amount_per_item">
                                                                ${(
                                                                    product.quantity *
                                                                    (product.dis_product_price || product.product_price)
                                                                ).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="edit_remove">
                                                        {editProductId === product.uniqueId ? (
                                                            <>
                                                                <div className="update mob_top">
                                                                    <button onClick={() => handleUpdate(product.uniqueId)}>Update</button> {/* ✅ pass uniqueId */}
                                                                </div>
                                                                <div className="edit mob_top">
                                                                    <button onClick={() => setEditProductId(null)}>Cancel</button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="edit mob_top">
                                                                <button onClick={() => setEditProductId(product.uniqueId)}>Edit</button> {/* ✅ set edit ID to uniqueId */}
                                                            </div>
                                                        )}

                                                        <div className="remove">
                                                            <button onClick={() => removeFromCart(product.uniqueId)}>Remove</button> {/* ✅ pass uniqueId */}
                                                        </div>
                                                        <div className="description">
                                                            <button onClick={() => toggleBox(product.uniqueId)}>
                                                                Add Description
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                </div>
                            </>
                        );

                    })

                ) : (
                    <div className="empty-cart">
                        <p>No items in your cart.</p>
                    </div>
                )}
                <div className="hr"></div>
                <div className="total-amount_checkout">
                    <div className="E-total">
                        <h3>Estimated Total</h3>
                        <p className="estimated-total-amount">
                            ${cartProducts.reduce((total, product) => {
                                const price = product.dis_product_price || product.product_price;
                                return total + price * product.quantity;
                            }, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="hr"></div>
                    <div className="checkout_button">
                        <Link>Checkout</Link>
                    </div>
                </div>

            </div>
        </>

    );

};

export default Cart;