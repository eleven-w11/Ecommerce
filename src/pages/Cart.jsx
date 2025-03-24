import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles/Cart.css";


const Cart = () => {
    const [cartProducts, setCartProducts] = useState([]);

    // ✅ Cart Products Fetch Karna
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

        if (storedCart.length > 0) {
            axios.post("http://localhost:5000/api/cart-products", { productIds: storedCart.map(item => item.id) })
                .then(response => {
                    // 🔹 Response me addedAt bhi include karo
                    const productsWithTime = response.data.map(product => {
                        const cartItem = storedCart.find(item => item.id === product._id);
                        return { ...product, addedAt: cartItem ? cartItem.addedAt : null };
                    });

                    // ✅ Cart ko addedAt ke mutabiq sort karo
                    productsWithTime.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));

                    setCartProducts(productsWithTime);
                })
                .catch(error => console.error("Error fetching cart products:", error));
        }
    }, []);

    const removeFromCart = (productId) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem("cart", JSON.stringify(cart));

        setCartProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
    };

    return (
        <div className="cart-page">
            <h2>🛒 Your Cart</h2>
            {cartProducts.length > 0 ? (
                cartProducts.map(product => (
                    <div key={product._id} className="cart-item">
                        <img src={`/images/${product.product_image}`} alt={product.product_name} className="cart-img" />
                        <div className="cart-details">
                            <h3>{product.product_name}</h3>
                            <p>Price: ${product.product_price}</p>
                            <p>🕒 Added At: {new Date(product.addedAt).toLocaleString()}</p> {/* ✅ Time Show Karna */}
                            <button onClick={() => removeFromCart(product._id)}>Remove</button>
                        </div>
                    </div>
                ))
            ) : (
                <p>Cart is empty!</p>
            )}
        </div>
    );
};

export default Cart;