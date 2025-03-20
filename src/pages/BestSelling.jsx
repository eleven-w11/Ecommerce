import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/BestSelling.css";
import { Link } from "react-router-dom";
import addTocart from "./images/add-to-cart.png";

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // 🛒 Cart me product add karne ka function
  const addToCart = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);

    // ✅ LocalStorage me bhi cart save karo
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    alert(`${product.product_name} added to cart!`);
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
    <div class="best-selling-section">
      <div class="product-container">
        <h2>Best Selling</h2>
        <div class="products-grid">
          <div class="product-card">
            <div class="product-image-wrapper">
              <img src="/images/Best-Selling-Products-image-1.png" class="bsp-img" alt="Product Name" />
              <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
            </div>
            <div class="product-details">
              <h3>Product Name</h3>
              <p class="product-price dual-price">
                <span class="original-price">$50.00</span>
                <span class="discount-price">$40.00</span>
              </p>
              <a href="/product/67b039830825e8bd03d89289">Shop Now</a>
            </div>
          </div>

          <div class="product-card">
            <div class="product-image-wrapper">
              <img src="/images/Best-Selling-Products-image-2.png" class="bsp-img" alt="Product Name" />
              <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
            </div>
            <div class="product-details">
              <h3>Product Name</h3>
              <p class="product-price">$30.00</p>
              <a href="/product/67b039830825e8bd03d89289">Shop Now</a>
            </div>
          </div>
          <div class="product-card">
            <div class="product-image-wrapper">
              <img src="/images/Best-Selling-Products-image-3.png" class="bsp-img" alt="Product Name" />
              <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
            </div>
            <div class="product-details">
              <h3>Product Name</h3>
              <p class="product-price">$30.00</p>
              <a href="/product/67b039830825e8bd03d89289">Shop Now</a>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default BestSellingProducts;
// http://localhost:3000/product/67b039830825e8bd03d89289