import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Cart.css";


const Cart = () => {
    const [cartProducts, setCartProducts] = useState([]);

    const fetchCartProducts = () => {
        let storedCart = JSON.parse(localStorage.getItem("cart")) || [];

        // ✅ Remove duplicates
        const uniqueCart = storedCart.filter((item, index, self) =>
            index === self.findIndex(t => t.id === item.id)
        );

        // ✅ Update localStorage if duplicates found
        if (uniqueCart.length !== storedCart.length) {
            localStorage.setItem("cart", JSON.stringify(uniqueCart));
        }

        const uniqueProductIds = uniqueCart.map(item => item.id);

        if (uniqueProductIds.length > 0) {
            axios.post("http://localhost:5000/api/cart-products", { productIds: uniqueProductIds })
                .then(response => {
                    const productsWithTime = response.data.map(product => {
                        const cartItem = uniqueCart.find(item => item.id === product._id);
                        return { ...product, addedAt: cartItem ? cartItem.addedAt : null };
                    });

                    productsWithTime.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
                    setCartProducts(productsWithTime);
                })
                .catch(error => console.error("Error fetching cart products:", error));
        } else {
            setCartProducts([]);
        }
    };

    useEffect(() => {
        fetchCartProducts(); // ✅ Fetch cart data on page load

        // ✅ Listen for storage changes
        const handleStorageChange = () => {
            fetchCartProducts();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const removeFromCart = (productId) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem("cart", JSON.stringify(cart));

        setCartProducts(prevProducts => prevProducts.filter(p => p._id !== productId));

        // ✅ Update Navbar Count
        window.dispatchEvent(new Event("storage"));
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
                            <p>🕒 Added At: {new Date(product.addedAt).toLocaleString()}</p>
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