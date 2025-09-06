import { useEffect, useState } from "react";
// import "./styles/Cart.css";

const CaRt = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    return (
        <div className="cart-page">
            <h2>Shopping Cart</h2>

            {cart.length > 0 ? (
                cart.map((product, index) => (
                    <div key={index} className="cart-item">
                        <img src={`/images/${product.product_image}`} alt={product.product_name} className="cart-img" />
                        <div className="cart-details">
                            <h3>{product.product_name}</h3>
                            <p>Price: ${product.product_price}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
};

export default CaRt;
