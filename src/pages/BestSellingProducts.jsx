import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/BestSellingProducts.css";
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
    <div className="best-selling-products">
      <div className="product-box">
        <h2>Best Selling</h2>
        <div className="products-display">
          {products.length > 0 ? (
            products.map(product => {
              const hasDiscount = product.dis_product_price !== undefined;

              return (
                <div key={product._id} className="product-card">
                  <div className="product-img">
                    <img src={`/images/${product.pi_1}`} className="bsp-img" alt={product.product_name} />
                    <img
                      src={addTocart}
                      className="addTocart"
                      alt="Add to Cart"
                      onClick={() => addToCart(product)}
                    />
                  </div>
                  <div className="product-data">
                    <h3>{product.product_name}</h3>
                    {hasDiscount ? (
                      <p className="price dual-price">
                        <span className="original-price">${product.product_price}</span>
                        <span className="discount-price">${product.dis_product_price}</span>
                      </p>
                    ) : (
                      <p className="price">${product.product_price}</p>
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