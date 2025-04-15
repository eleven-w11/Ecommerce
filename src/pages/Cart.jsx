import React, { useState } from 'react';

import left from "./images/left.png";
import right from "./images/right.png";

const CartPage = () => {
    const [cartProducts, setCartProducts] = useState([
        {
            uniqueId: '1',
            product_name: 'Blue Shirt',
            quantity: 2,
            image: 'Bsp-1_blue.png',
            images: [
                { color_code: '#0000FF', pi_1: 'Bsp-1_blue.png' },
                { color_code: '#0000CC', pi_2: 'Bsp-1_gray.png' },
                { color_code: '#0033CC', pi_3: 'Bsp-1_green.png' }
            ],
            sizes: { S: true, M: true, L: false },
            product_price: 30,
            dis_product_price: 25,
            color: '#0000FF',
            size: 'M',
        },
        {
            uniqueId: '2',
            product_name: 'Green Shirt',
            quantity: 1,
            image: 'p-6_green.png',
            images: [
                { color_code: '#008000', pi_1: 'p-6_green.png' },
                { color_code: '#006400', pi_2: 'p-6_white.png' },
                { color_code: '#006400', pi_2: 'p-6_yellow.png' }
            ],
            sizes: { S: true, M: true, L: true },
            product_price: 28,
            dis_product_price: 22,
            color: '#008000',
            size: 'S',
        },
    ]);

    const [editProductId, setEditProductId] = useState(null);
    const [imageIndexMap, setImageIndexMap] = useState({});
    const [tempChanges, setTempChanges] = useState({});
    const [activeId, setActiveId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const updateQuantity = (id, delta) => {
        setCartProducts(prev =>
            prev.map(item =>
                item.uniqueId === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const removeFromCart = (id) => {
        setCartProducts(prev => prev.filter(item => item.uniqueId !== id));
    };

    const handleUpdate = (id) => {
        setUpdatingId(id);
        setTimeout(() => {
            setEditProductId(null);
            setUpdatingId(null);
        }, 500);
    };

    const handlePrevImage = (id, images) => {
        setImageIndexMap(prev => ({
            ...prev,
            [id]: (prev[id] > 0 ? prev[id] - 1 : images.length - 1)
        }));
    };

    const handleNextImage = (id, images) => {
        setImageIndexMap(prev => ({
            ...prev,
            [id]: (prev[id] + 1) % images.length || 0
        }));
    };

    const handleTempColorChange = (color_code) => {
        setTempChanges(prev => ({ ...prev, color: color_code }));
    };

    const handleTempSizeChange = (size) => {
        setTempChanges(prev => ({ ...prev, size }));
    };

    const toggleBox = (id) => {
        setActiveId(prev => (prev === id ? null : id));
    };

    const loading = false;

    return (
        <div className="cart-page">
            {loading ? (
                <div className="pro_view_loader">
                    <div className="loader-container">
                        <div className="loader"><span></span><span></span><span></span></div>
                    </div>
                </div>
            ) : cartProducts.length > 0 ? (
                cartProducts.map(product => {
                    const isEditing = editProductId === product.uniqueId;
                    const currentImageObj = isEditing
                        ? product.images?.[imageIndexMap[product.uniqueId] || 0] || null
                        : null;

                    const imageKey = isEditing
                        ? currentImageObj && Object.keys(currentImageObj).find(k => k.startsWith('pi_')) || null
                        : null;

                    const currentImage = isEditing
                        ? currentImageObj?.[imageKey] || product.image
                        : product.image;

                    return (
                        <div key={product.uniqueId} className="cart-item">
                            {activeId === product.uniqueId && (
                                <>
                                    <div className="input-des_background" onClick={() => setActiveId(null)}></div>
                                    <div className="input-des">
                                        <span className="material-symbols-outlined close" onClick={() => setActiveId(null)}>close</span>
                                        <textarea placeholder={`Enter description for ${product.product_name} X ${product.quantity} `}></textarea>
                                        <button onClick={() => setActiveId(null)}>Submit</button>
                                    </div>
                                </>
                            )}

                            {updatingId === product.uniqueId ? (
                                <div className="inline-loader">
                                    <div className="loader"><span></span><span></span><span></span></div>
                                </div>
                            ) : (
                                <div className="cart_item-wrapper">
                                    <div className="images-frame">
                                        {isEditing && (
                                            <>
                                                <div className="left-icon-img" onClick={() => handlePrevImage(product.uniqueId, product.images)}>
                                                    <img src={left} className="left-icon" alt="Previous" />
                                                </div>
                                                <div className="right-icon-img" onClick={() => handleNextImage(product.uniqueId, product.images)}>
                                                    <img src={right} className="right-icon" alt="Next" />
                                                </div>
                                            </>
                                        )}
                                        <img src={`/images/${currentImage}`} alt={product.product_name} />
                                    </div>

                                    <div className="cart-detail-container">
                                        <div className="cart-details">
                                            <h2>{product.product_name}</h2>

                                            {isEditing ? (
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
                                                    <button className="quantity-btn decreaseQuantity" onClick={() => updateQuantity(product.uniqueId, -1)}>-</button>
                                                    <span className="quantity-input">{product.quantity}</span>
                                                    <button className="quantity-btn" onClick={() => updateQuantity(product.uniqueId, +1)}>+</button>
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
                                                        ${(product.quantity * (product.dis_product_price || product.product_price)).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="edit_remove">
                                                {isEditing ? (
                                                    <>
                                                        <div className="update">
                                                            <button onClick={() => handleUpdate(product.uniqueId)}>Update</button>
                                                        </div>
                                                        <div className="edit">
                                                            <button onClick={() => setEditProductId(null)}>Cancel</button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="edit">
                                                        <button onClick={() => setEditProductId(product.uniqueId)}>Edit</button>
                                                    </div>
                                                )}
                                                <div className="remove">
                                                    <button onClick={() => removeFromCart(product.uniqueId)}>Remove</button>
                                                </div>
                                                <div className="description">
                                                    <button onClick={() => toggleBox(product.uniqueId)}>Add Description</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <p className="no-cart-items">No items in your cart.</p>
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
                    <button>Checkout</button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
