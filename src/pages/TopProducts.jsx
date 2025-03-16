import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles/BestSelling.css";
import addTocart from "./images/add-to-cart.png";
// import p1 from "p-1.png";


const TopProduct = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        const updatedCart = [...cart, product];
        setCart(updatedCart);

        localStorage.setItem("cart", JSON.stringify(updatedCart));

        alert(`${product.product_name} added to cart!`);
    };

    useEffect(() => {
        axios.get("http://localhost:5000/api/products/bestselling")
            .then(response => {
                console.log("Fetched Products:", response.data);
                const filteredProducts = response.data.filter(product =>
                    product._id && product.id && product.id.startsWith("ap-")
                );
                setProducts(filteredProducts);
            })
            .catch(error => console.error("Error fetching products:", error));
    }, []);




    return (
        <div class="best-selling-section">
            <div class="product-container">
                <h2>Top Products</h2>
                <div class="products-grid">
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-1.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price dual-price">
                                <span class="original-price">$50.00</span>
                                <span class="discounted-price">$40.00</span>
                            </p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>

                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-2.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-3.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-4.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-5.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-6.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-7.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-8.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-9.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-10.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-11.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image-wrapper">
                            <img src="/images/p-12.png" class="product-main-image" alt="Product Name" />
                            <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
                        </div>
                        <div class="product-details">
                            <h3>Product Name</h3>
                            <p class="product-price">$30.00</p>
                            <a href="/product/sample-id">Shop Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TopProduct;
