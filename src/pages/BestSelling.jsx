import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/BestSelling.css";
import { Link } from "react-router-dom";
import addTocart from "./images/add-to-cart.png";

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

    // 🔹 New Cart Item me Date & Time Add Karna
    const newCartItem = {
      id: product._id,
      addedAt: new Date().toISOString() // ✅ ISO format me date-time store hoga
    };

    const updatedCart = [...storedCart, newCartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    alert(`Product ID: ${product._id} added to cart at ${new Date().toLocaleString()}!`);
  };



  useEffect(() => {
    axios.get("http://localhost:5000/api/products/bestselling")
      .then(response => {
        const filteredProducts = response.data.filter(product =>
          product.id && product.id.startsWith("bsp-")
        );
        setProducts(filteredProducts);
      })
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  return (
    <div className="best-selling-section">
      <div className="product-container">
        <h2>Best Selling</h2>
        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => {
              const hasDiscount = product.dis_product_price !== undefined;

              return (
                <div key={product._id} className="product-card">
                  <div className="product-image-wrapper">
                    <img src={`/images/${product.product_image}`} className="bsp-img" alt={product.product_name} />
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
                    <Link
                      to={`/product/${product._id}`}
                      onClick={() => console.log("Redirecting to Product ID:", product._id)}
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestSellingProducts;