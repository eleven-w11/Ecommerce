// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// const Cart = () => {
//     const [cartProducts, setCartProducts] = useState([]);

//     useEffect(() => {
//         const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

//         if (storedCart.length > 0) {
//             axios.post("http://localhost:5000/api/cart-products", { productIds: storedCart })
//                 .then(response => {
//                     setCartProducts(response.data);
//                 })
//                 .catch(error => console.error("Error fetching cart products:", error));
//         }
//     }, []);

//     return (
//         <div className="cart-page">
//             <h2>🛒 Your Cart</h2>
//             {cartProducts.length > 0 ? (
//                 cartProducts.map(product => (
//                     <div key={product._id} className="cart-item">
//                         <img src={`/images/${product.product_image}`} alt={product.product_name} className="cart-img" />
//                         <div className="cart-details">
//                             <h3>{product.product_name}</h3>
//                             <p>Price: ${product.product_price}</p>
//                             <button onClick={() => removeFromCart(product._id)}>Remove</button>
//                         </div>
//                     </div>
//                 ))
//             ) : (
//                 <p>Cart is empty!</p>
//             )}
//         </div>
//     );
// };

// export default Cart;
