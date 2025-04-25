// TopProduct.jsx


// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import "./styles/BestSelling.css";
// import addTocart from "./images/add-to-cart.png";


// const TopProduct = () => {
//     const [products, setProducts] = useState([]);
//     const [cart, setCart] = useState([]);

//     const addToCart = (product) => {
//         const updatedCart = [...cart, product];
//         setCart(updatedCart);

//         localStorage.setItem("cart", JSON.stringify(updatedCart));

//         alert(`${product.product_name} added to cart!`);
//     };

//     useEffect(() => {
//         axios.get("http://localhost:5000/api/products/bestselling")
//             .then(response => {
//                 console.log("Fetched Products:", response.data);
//                 const filteredProducts = response.data.filter(product =>
//                     product._id && product.id && product.id.startsWith("ap-")
//                 );
//                 setProducts(filteredProducts);
//             })
//             .catch(error => console.error("Error fetching products:", error));
//     }, []);




//     return (
//         <div className="best-selling-section">
//             <div className="product-container">
//                 <h2>Top Products</h2>
//                 <div className="products-grid">
//                     {products.length > 0 ? (
//                         products.map(product => {
//                             const hasDiscount = product.dis_product_price !== undefined;

//                             return (
//                                 <div key={product._id} className="product-card">
//                                     <div className="product-image-wrapper">
//                                         <img src={`/images/${product.product_image}`} className="product-main-image" alt={product.product_name} />
//                                         <img
//                                             src={addTocart}
//                                             className="add-to-cart-icon"
//                                             alt="Add to Cart"
//                                             onClick={() => addToCart(product)}
//                                         />
//                                     </div>
//                                     <div className="product-details">
//                                         <h3>{product.product_name}</h3>
//                                         {hasDiscount ? (
//                                             <p className="product-price dual-price">
//                                                 <span className="original-price">${product.product_price}</span>
//                                                 <span className="discounted-price">${product.dis_product_price}</span>
//                                             </p>
//                                         ) : (
//                                             <p className="product-price">${product.product_price}</p>
//                                         )}
//                                         <Link
//                                             to={`/product/${product._id}`}
//                                             onClick={() => console.log("Redirecting to Product ID:", product._id)}
//                                         >
//                                             Shop Now
//                                         </Link>

//                                     </div>
//                                 </div>
//                             );
//                         })
//                     ) : (
//                         <p>Loading...</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TopProduct;










// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import "./styles/BestSelling.css";
// import addTocart from "./images/add-to-cart.png";
// // import p1 from "p-1.png";


// const TopProduct = () => {
//     // const [products, setProducts] = useState([]);
//     // const [cart, setCart] = useState([]);

//     // const addToCart = (product) => {
//     //     const updatedCart = [...cart, product];
//     //     setCart(updatedCart);

//     //     localStorage.setItem("cart", JSON.stringify(updatedCart));

//     //     alert(`${product.product_name} added to cart!`);
//     // };

//     // useEffect(() => {
//     //     axios.get("http://localhost:5000/api/products/bestselling")
//     //         .then(response => {
//     //             console.log("Fetched Products:", response.data);
//     //             const filteredProducts = response.data.filter(product =>
//     //                 product._id && product.id && product.id.startsWith("ap-")
//     //             );
//     //             setProducts(filteredProducts);
//     //         })
//     //         .catch(error => console.error("Error fetching products:", error));
//     // }, []);




//     return (
//         <div class="best-selling-section">
//             <div class="product-container">
//                 <h2>Top Products</h2>
//                 <div class="products-grid">
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-1.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price dual-price">
//                                 <span class="original-price">$50.00</span>
//                                 <span class="discounted-price">$40.00</span>
//                             </p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>

//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-2.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-3.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-4.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-5.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-6.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-7.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-8.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-9.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-10.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-11.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/p-12.png" class="product-main-image" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/sample-id">Shop Now</a>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>

//     );
// };

// export default TopProduct;


































// BestSellingProducts.jsx

// import { useEffect, useState } from "react";
// import axios from "axios";
// import "./styles/BestSelling.css";
// import { Link } from "react-router-dom";
// import addTocart from "./images/add-to-cart.png";

// const BestSellingProducts = () => {
//     const [products, setProducts] = useState([]);
//     const [cart, setCart] = useState([]);

//     // 🛒 Cart me product add karne ka function
//     const addToCart = (product) => {
//         const updatedCart = [...cart, product];
//         setCart(updatedCart);

//         // ✅ LocalStorage me bhi cart save karo
//         localStorage.setItem("cart", JSON.stringify(updatedCart));

//         alert(`${product.product_name} added to cart!`);
//     };

//     useEffect(() => {
//         axios.get("http://localhost:5000/api/products/bestselling")
//             .then(response => {
//                 const filteredProducts = response.data.filter(product =>
//                     product.id && product.id.startsWith("bsp-")
//                 );
//                 setProducts(filteredProducts);
//             })
//             .catch(error => console.error("Error fetching products:", error));
//     }, []);

//     return (
//         <div className="best-selling-section">
//             <div className="product-container">
//                 <h2>Best Selling</h2>
//                 <div className="products-grid">
//                     {products.length > 0 ? (
//                         products.map(product => {
//                             const hasDiscount = product.dis_product_price !== undefined;

//                             return (
//                                 <div key={product._id} className="product-card">
//                                     <div className="product-image-wrapper">
//                                         <img src={`/images/${product.product_image}`} className="bsp-img" alt={product.product_name} />
//                                         <img
//                                             src={addTocart}
//                                             className="add-to-cart-icon"
//                                             alt="Add to Cart"
//                                             onClick={() => addToCart(product)}
//                                         />
//                                     </div>
//                                     <div className="product-details">
//                                         <h3>{product.product_name}</h3>
//                                         {hasDiscount ? (
//                                             <p className="product-price dual-price">
//                                                 <span className="original-price">${product.product_price}</span>
//                                                 <span className="discount-price">${product.dis_product_price}</span>
//                                             </p>
//                                         ) : (
//                                             <p className="product-price">${product.product_price}</p>
//                                         )}
//                                         <Link
//                                             to={`/product/${product._id}`}
//                                             onClick={() => console.log("Redirecting to Product ID:", product._id)}
//                                         >
//                                             Shop Now
//                                         </Link>
//                                     </div>
//                                 </div>
//                             );
//                         })
//                     ) : (
//                         <p>Loading...</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default BestSellingProducts;





































// import { useEffect, useState } from "react";
// import axios from "axios";
// import "./styles/BestSelling.css";
// import { Link } from "react-router-dom";
// import addTocart from "./images/add-to-cart.png";

// const BestSellingProducts = () => {
//     const [products, setProducts] = useState([]);
//     const [cart, setCart] = useState([]);

//     // 🛒 Cart me product add karne ka function
//     const addToCart = (product) => {
//         const updatedCart = [...cart, product];
//         setCart(updatedCart);

//         // ✅ LocalStorage me bhi cart save karo
//         localStorage.setItem("cart", JSON.stringify(updatedCart));

//         alert(`${product.product_name} added to cart!`);
//     };

//     useEffect(() => {
//         axios.get("http://localhost:5000/api/products/bestselling")
//             .then(response => {
//                 const filteredProducts = response.data.filter(product =>
//                     product.id && product.id.startsWith("bsp-")
//                 );
//                 setProducts(filteredProducts);
//             })
//             .catch(error => console.error("Error fetching products:", error));
//     }, []);

//     return (
//         <div class="best-selling-section">
//             <div class="product-container">
//                 <h2>Best Selling</h2>
//                 <div class="products-grid">
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/Best-Selling-Products-image-1.png" class="bsp-img" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price dual-price">
//                                 <span class="original-price">$50.00</span>
//                                 <span class="discount-price">$40.00</span>
//                             </p>
//                             <a href="/product/67b039830825e8bd03d89289">Shop Now</a>
//                         </div>
//                     </div>

//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/Best-Selling-Products-image-2.png" class="bsp-img" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/67b039830825e8bd03d89289">Shop Now</a>
//                         </div>
//                     </div>
//                     <div class="product-card">
//                         <div class="product-image-wrapper">
//                             <img src="/images/Best-Selling-Products-image-3.png" class="bsp-img" alt="Product Name" />
//                             <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                         </div>
//                         <div class="product-details">
//                             <h3>Product Name</h3>
//                             <p class="product-price">$30.00</p>
//                             <a href="/product/67b039830825e8bd03d89289">Shop Now</a>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>

//     );
// };

// export default BestSellingProducts;

































// footer.jsx

// import React from 'react';
// import { Link } from 'react-router-dom';
// import './styles/Footer.css';


// const Footer = () => {
//     return (
//         <>
//             <div className="site-footer">
//                 <div className="footer-brand">
//                     <Link to="/">
//                         <h1>YOUR<span>W</span>EB</h1>
//                     </Link>
//                 </div>
// <div className="footer-social-media">
//     <ul>
//         <li>
//             <Link>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#74767E">
//                     <path d="M10.827 9.644v3.331a6.199 6.199 0 0 0-.478-.09c-1.599-.247-3.06.842-3.299 2.527a2.964 2.964 0 0 0 2.342 3.357c1.612.324 3.21-.855 3.4-2.527.062-.558.037-1.128.037-1.699V1.893h3.173c.34 3.085 2.002 4.77 4.998 5.094v3.24a7.673 7.673 0 0 1-2.594-.427 7.83 7.83 0 0 1-2.354-1.297v.234c0 2.333.013 4.666.013 6.999 0 2.307-.957 4.109-2.833 5.379-1.12.765-2.38 1.076-3.727.972-2.04-.155-3.638-1.114-4.771-2.864-1.75-2.735-1.07-6.455 1.498-8.4 1.31-.985 2.782-1.373 4.381-1.218.063.013.139.026.214.04Z">
//                     </path>
//                 </svg>
//             </Link>
//         </li>
//         <li>
//             <Link>
//                 <svg width="22" height="22" viewBox="0 0 20 20" fill="#74767E" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M15.1814 6.06504C15.8442 6.06504 16.3814 5.52778 16.3814 4.86504C16.3814 4.2023 15.8442 3.66504 15.1814 3.66504C14.5187 3.66504 13.9814 4.2023 13.9814 4.86504C13.9814 5.52778 14.5187 6.06504 15.1814 6.06504Z">
//                     </path>
//                     <path d="M10 15C7.2425 15 5 12.7575 5 10C5 7.2425 7.2425 5 10 5C12.7575 5 15 7.2425 15 10C15 12.7575 12.7575 15 10 15ZM10 7.5C8.62125 7.5 7.5 8.62125 7.5 10C7.5 11.3787 8.62125 12.5 10 12.5C11.3787 12.5 12.5 11.3787 12.5 10C12.5 8.62125 11.3787 7.5 10 7.5Z">
//                     </path>
//                     <path d="M15 20H5C2.43 20 0 17.57 0 15V5C0 2.43 2.43 0 5 0H15C17.57 0 20 2.43 20 5V15C20 17.57 17.57 20 15 20ZM5 2.5C3.83125 2.5 2.5 3.83125 2.5 5V15C2.5 16.1912 3.80875 17.5 5 17.5H15C16.1688 17.5 17.5 16.1688 17.5 15V5C17.5 3.83125 16.1688 2.5 15 2.5H5Z">
//                     </path>
//                 </svg>
//             </Link>
//         </li>
//         <li>
//             <Link>
//                 <svg width="24" height="24" viewBox="0 0 20 20" fill="#74767E" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M20 10.0022C20.0004 8.09104 19.4532 6.2198 18.4231 4.61003C17.393 3.00026 15.9232 1.71938 14.1877 0.919062C12.4522 0.118741 10.5237 -0.167503 8.63053 0.0942223C6.73739 0.355948 4.9589 1.15468 3.50564 2.39585C2.05237 3.63701 0.985206 5.26863 0.430495 7.0975C-0.124217 8.92636 -0.143239 10.8759 0.37568 12.7152C0.894599 14.5546 1.92973 16.2067 3.35849 17.476C4.78726 18.7453 6.54983 19.5786 8.4375 19.8772V12.8922H5.89875V10.0022H8.4375V7.79843C8.38284 7.28399 8.44199 6.76382 8.61078 6.2748C8.77957 5.78577 9.05386 5.33986 9.4142 4.96866C9.77455 4.59746 10.2121 4.31007 10.6959 4.12684C11.1797 3.94362 11.6979 3.86905 12.2137 3.90843C12.9638 3.91828 13.7121 3.98346 14.4525 4.10343V6.56718H13.1925C12.9779 6.53911 12.7597 6.55967 12.554 6.62733C12.3484 6.69498 12.1607 6.80801 12.0046 6.95804C11.8486 7.10807 11.7283 7.29127 11.6526 7.49408C11.577 7.69689 11.5479 7.91411 11.5675 8.12968V10.0047H14.3412L13.8975 12.8947H11.5625V19.8834C13.9153 19.5112 16.058 18.3114 17.6048 16.4999C19.1516 14.6884 20.001 12.3842 20 10.0022Z">
//                     </path>
//                 </svg>
//             </Link>
//         </li>
//         <li>
//             <Link>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="#74767E">
//                     <g clip-path="url(#twitter_icon_svg__a)">
//                         <path d="M11.64 8.464 18.923 0h-1.725l-6.323 7.35L5.824 0H0l7.636 11.114L0 19.99h1.726l6.676-7.761 5.334 7.76h5.824L11.64 8.465Zm-2.363 2.747-.773-1.106-6.157-8.806h2.65l4.969 7.107.774 1.106 6.458 9.238h-2.65l-5.27-7.538Z">
//                         </path>
//                     </g>
//                     <defs>
//                         <clipPath id="twitter_icon_svg__a">
//                             <path d="M0 0h19.56v20H0z">
//                             </path>
//                         </clipPath>
//                     </defs>
//                 </svg>
//             </Link>
//         </li>
//         <li>
//             <Link>
//                 <span class="material-symbols-outlined">
//                     mail
//                 </span>
//             </Link>
//         </li>
//         <li>
//             <Link>
//                 <span class="material-symbols-outlined">
//                     call
//                 </span>
//             </Link>
//         </li>
//     </ul>
// </div>
//                 <div className="hr"></div>
//                 <div className="footer-navigation">
//                     <ul className="footer-column">
//                         <h4>
//                             Wear the Trend
//                             <span className="material-symbols-outlined">
//                                 keyboard_arrow_down
//                             </span>
//                         </h4>
//                         <li><Link>Shop Now</Link></li>
//                         <li><Link>On Sale</Link></li>
//                         <li><Link>Women</Link></li>
//                         <li><Link>Men</Link></li>
//                     </ul>
//                     <ul className="footer-column">
//                         <h4>
//                             Quick Access
//                             <span className="material-symbols-outlined">
//                                 keyboard_arrow_down
//                             </span>
//                         </h4>
//                         <li><Link>Location</Link></li>
//                         <li><Link>Sign In</Link></li>
//                         <li><Link>Cart</Link></li>
//                     </ul>
//                     <ul className="footer-column">
//                         <h4>
//                             Get in Touch
//                             <span className="material-symbols-outlined">
//                                 keyboard_arrow_down
//                             </span>
//                         </h4>
//                         <li><Link>Help & Support</Link></li>
//                         <li><Link>Contact Us</Link></li>
//                         <li><Link>About Us</Link></li>
//                     </ul>
//                 </div>
//                 <div className="hr"></div>
//                 <div className="footer-copyright">
//                     &copy; {new Date().getFullYear()} YOURWEB. All Rights Reserved.
//                 </div>
//             </div>
//         </>
//     )
// }

// export default Footer;




























































// ProductView.jsx

// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "./styles/ProductView.css";
// import "./styles/BestSelling.css";

// import { Link } from "react-router-dom";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import left from "./images/left.png";
// import right from "./images/right.png";

// gsap.registerPlugin(ScrollTrigger);

// const ProductView = () => {
//     const { id } = useParams();
//     const [product, setProduct] = useState(null);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [selectedColor, setSelectedColor] = useState(null);
//     const [quantity, setQuantity] = useState(1);
//     const [proDetails, setProDetails] = useState(false);
//     const [shippingDetails, setShippingDetails] = useState(false);
//     const [randomProducts, setRandomProducts] = useState([]);

//     // const buyNowRef = useRef(null);
//     const proDetailsRef = useRef(null);
//     const detailsRef = useRef(null);

//     // const proDetailsRef = useRef(null);

//     useEffect(() => {
//         if (proDetails) {
//             gsap.fromTo(
//                 proDetailsRef.current,
//                 { x: "-100%", opacity: 0 },
//                 { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
//             );
//         } else {
//             gsap.to(proDetailsRef.current, {
//                 x: "100%",
//                 opacity: 0,
//                 duration: 0.5,
//                 ease: "power2.in",
//                 onComplete: () => {
//                     if (proDetailsRef.current) {
//                         proDetailsRef.current.style.display = "none";
//                     }
//                 },
//             });
//         }
//     }, [proDetails]);


//     useEffect(() => {
//         if (shippingDetails) {
//             gsap.fromTo(
//                 detailsRef.current,
//                 { x: "-100%", opacity: 0 },
//                 { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
//             );
//         } else {
//             gsap.to(detailsRef.current, {
//                 x: "100%",
//                 opacity: 0,
//                 duration: 0.5,
//                 ease: "power2.in",
//                 onComplete: () => {
//                     if (detailsRef.current) {
//                         detailsRef.current.style.display = "none"; // Hide after animation
//                     }
//                 },
//             });
//         }
//     }, [shippingDetails]);



//     // useEffect(() => {
//     //     if (!buyNowRef.current) return;

//     //     const buyNow = buyNowRef.current;

//     //     gsap.fromTo(
//     //         buyNow,
//     //         { y: 50, opacity: 0 },
//     //         { y: 0, opacity: 1, duration: 1, ease: "power2.out" }
//     //     );

//     //     ScrollTrigger.create({
//     //         trigger: buyNow,
//     //         start: "top bottom",
//     //         end: "top 50%",
//     //         onEnter: () => gsap.to(buyNow, { y: 0, opacity: 1, duration: 0.5 }),
//     //         onLeave: () => gsap.to(buyNow, { y: 100, opacity: 0, duration: 0.5 }),
//     //         onEnterBack: () => gsap.to(buyNow, { y: 0, opacity: 1, duration: 0.5 }),
//     //         onLeaveBack: () => gsap.to(buyNow, { y: 100, opacity: 0, duration: 0.5 }),
//     //     });

//     //     return () => ScrollTrigger.refresh();
//     // }, [product]);



//     useEffect(() => {
//         axios.get(`http://localhost:5000/api/products/${id}`)
//             .then(response => {
//                 console.log("Fetched Product Data:", response.data);
//                 const data = response.data;

//                 const saveAmount = data.product_price && data.dis_product_price
//                     ? data.product_price - data.dis_product_price
//                     : 0;

//                 const images = data.colors.map(color => ({
//                     url: data.product_image,
//                     filter: color.filter || "none",
//                     color: color
//                 }));

//                 setProduct({ ...data, images, save: saveAmount });
//                 setSelectedColor(data.colors?.[0] || null);
//             })
//             .catch(error => console.error("Error fetching product:", error));
//     }, [id]);




//     const changeImage = (index) => {
//         setCurrentIndex(index);
//         setSelectedColor(product.colors[index]);
//     };

//     const nextImage = () => {
//         const newIndex = (currentIndex + 1) % product.images.length;
//         changeImage(newIndex);
//     };

//     const prevImage = () => {
//         const newIndex = (currentIndex - 1 + product.images.length) % product.images.length;
//         changeImage(newIndex);
//     };

//     const selectImage = (index) => {
//         setCurrentIndex(index);
//     };

//     const increaseQuantity = () => {
//         setQuantity((prev) => prev + 1);
//     };

//     const decreaseQuantity = () => {
//         setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
//     };
//     const selectColor = (color, index) => {
//         setSelectedColor(color);
//         setCurrentIndex(index + 1);
//     };

//     useEffect(() => {
//         axios.get("http://localhost:5000/api/products/bestselling")
//             .then(response => {
//                 const allProducts = response.data;
//                 const filteredProducts = allProducts.filter(p => p._id !== id);
//                 const shuffled = filteredProducts.sort(() => 0.5 - Math.random());
//                 setRandomProducts(shuffled.slice(0, 6));
//             })
//             .catch(error => console.error("Error fetching products:", error));
//     }, [id]);


//     if (!product || !product.images || product.images.length === 0) {
//         return <p>Loading...</p>;
//     }

//     return (
//         <>
//             <div className="product-view-page">
//                 <div className="product-view">
//                     <div className="product-view-frame">
//                         <div className="product-images">
//                             <div className="images-frame">
//                                 <div className="left-icon-img" onClick={prevImage}>
//                                     <img src={left} className="left-icon" alt="Previous" />
//                                 </div>
//                                 <div className="right-icon-img" onClick={nextImage}>
//                                     <img src={right} className="right-icon" alt="Next" />
//                                 </div>
//                                 <img
//                                     src={`/images/${product.images[currentIndex].url}`}
//                                     className="img"
//                                     alt={product.product_name}
//                                     style={{ filter: product.images[currentIndex].filter }}
//                                 />
//                                 <div className="pi_dot">
//                                     {product.images.map((_, index) => (
//                                         <span
//                                             key={index}
//                                             className={`dot ${index === currentIndex ? "active-dot" : ""}`}
//                                             onClick={() => changeImage(index)}
//                                         ></span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="product-data">
//                             <p className="Free-Delivery"><span class="material-symbols-outlined">
//                                 local_shipping
//                             </span> Free Delivery</p>
//                             <div className="data-frame">
//                                 <h2>{product.product_name}</h2>
//                                 <p className="type"><span>Type </span>{product.p_type}</p>
//                                 <p className="des"><span>Product Description </span>{product.p_des}</p>
//                                 <div className="hr"></div>
//                                 {product.dis_product_price ? (
//                                     <div className="discount-box">
//                                         <p className="original-price">${product.product_price}</p>
//                                         <p className="price">${product.dis_product_price}</p>
//                                         <p className="save">Save {Math.round((product.save / product.product_price) * 100)}%</p>
//                                     </div>
//                                 ) : (
//                                     <div className="price-box">
//                                         <p className="price">${product.product_price}</p>
//                                     </div>
//                                 )}

//                                 {product.colors && (
//                                     <div className="color-selection">
//                                         <div className="colors">
//                                             {product.colors.map((color, index) => (
//                                                 <span
//                                                     key={index}
//                                                     className={`color-box ${selectedColor === color ? "active" : ""}`}
//                                                     style={{ backgroundColor: color.color_code }}
//                                                     onClick={() => changeImage(index)}
//                                                 ></span>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                                 <div className="quantity-addtocart">
//                                     <div className="quantity">
//                                         <button className="quantity-btn decreaseQuantity" onClick={decreaseQuantity}>-</button>
//                                         <span className="quantity-input">{quantity}</span>
//                                         <button className="quantity-btn" onClick={increaseQuantity}>+</button>
//                                     </div>
//                                     <div className="add-to-cart">
//                                         <button>Add to Cart</button>
//                                     </div>
//                                 </div>
//                                 <div className="buy_this_now">
//                                     <Link className="buy-now">Buy Now</Link>
//                                 </div>
//                                 <div className="hr"></div>
//                                 <div className={`product-details-shipping ${proDetails ? "active-border" : ""}`}
//                                     onClick={() => setProDetails(!proDetails)}
//                                 >
//                                     <div className="heading-arrow_down">
//                                         <h4>
//                                             Product Detail
//                                         </h4>
//                                         <span className="material-symbols-outlined">
//                                             keyboard_arrow_down
//                                         </span>
//                                     </div>
//                                     <div ref={proDetailsRef} className="data-shipping-product"
//                                         style={{ display: proDetails ? "block" : "none" }}
//                                     >
//                                         {proDetails && product.product_details.map((detail, index) => (
//                                             <li key={index}>{detail}</li>
//                                         ))}
//                                     </div>


//                                 </div>
//                                 <div className={`product-details-shipping shipping ${shippingDetails ? "active-border" : ""}`}
//                                     onClick={() => setShippingDetails(!shippingDetails)}
//                                 >
//                                     <div className="heading-arrow_down">
//                                         <h4>
//                                             Shipping & Returns
//                                         </h4>
//                                         <span className="material-symbols-outlined">
//                                             keyboard_arrow_down
//                                         </span>
//                                     </div>
//                                     {shippingDetails && (
//                                         <div ref={detailsRef} className={`data-shipping-product`}
//                                             style={{ display: shippingDetails ? "block" : "none" }}
//                                         >
//                                             <li>Express and fast delivery all over Pakistan (Avg. Time 1-3 days).</li>
//                                             <li>Hassle Free exchange if there is any size issue.</li>
//                                             <li>Free Delivery on orders over Rs. 2,990/-</li>
//                                         </div>
//                                     )}
//                                 </div>

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="other-products">
//                     <div className="best-selling-section">
//                         <div className="product-container">
//                             <h2>Related Products</h2>
//                             <div className="products-grid">
//                                 {randomProducts.length > 0 ? (
//                                     randomProducts.map((p) => {
//                                         const hasDiscount = p.dis_product_price !== undefined;

//                                         return (
//                                             <div key={p._id} className="product-card">
//                                                 <div className="product-image-wrapper">
//                                                     <img src={`/images/${p.product_image}`} className="bsp-img" alt={p.product_name} />
//                                                 </div>
//                                                 <div className="product-details">
//                                                     <h3>{p.product_name}</h3>
//                                                     {hasDiscount ? (
//                                                         <p className="product-price dual-price">
//                                                             <span className="original-price">${p.product_price}</span>
//                                                             <span className="discount-price">${p.dis_product_price}</span>
//                                                         </p>
//                                                     ) : (
//                                                         <p className="product-price">${p.product_price}</p>
//                                                     )}
//                                                     <Link to={`/product/${p._id}`} className="shop-now">
//                                                         Buy Now
//                                                     </Link>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })
//                                 ) : (
//                                     <p>Loading random products...</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </>
//     );
// };

// export default ProductView;

















// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "./styles/ProductView.css";
// import "./styles/BestSelling.css";

// import { Link } from "react-router-dom";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import left from "./images/left.png";
// import right from "./images/right.png";
// import addTocart from "./images/add-to-cart.png";
// import Footer from "./Footer";


// gsap.registerPlugin(ScrollTrigger);

// const ProductView = () => {
//     const { id } = useParams();
//     const [product, setProduct] = useState(null);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [selectedColor, setSelectedColor] = useState(null);
//     const [quantity, setQuantity] = useState(1);
//     const [proDetails, setProDetails] = useState(false);
//     const [shippingDetails, setShippingDetails] = useState(false);
//     const [randomProducts, setRandomProducts] = useState([]);

//     const proDetailsRef = useRef(null);
//     const detailsRef = useRef(null);
//     const [cart, setCart] = useState([]);

//     const addToCart = (product) => {
//         const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

//         // 🔹 New Cart Item me Date & Time Add Karna
//         const newCartItem = {
//             id: product._id,
//             addedAt: new Date().toISOString() // ✅ ISO format me date-time store hoga
//         };

//         const updatedCart = [...storedCart, newCartItem];
//         localStorage.setItem("cart", JSON.stringify(updatedCart));

//         alert(`Product ID: ${product._id} added to cart at ${new Date().toLocaleString()}!`);
//     };

//     useEffect(() => {
//         if (proDetails) {
//             gsap.fromTo(
//                 proDetailsRef.current,
//                 { x: "-100%", opacity: 0 },
//                 { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
//             );
//         } else {
//             gsap.to(proDetailsRef.current, {
//                 x: "100%",
//                 opacity: 0,
//                 duration: 0.5,
//                 ease: "power2.in",
//                 onComplete: () => {
//                     if (proDetailsRef.current) {
//                         proDetailsRef.current.style.display = "none";
//                     }
//                 },
//             });
//         }
//     }, [proDetails]);


//     useEffect(() => {
//         if (shippingDetails) {
//             gsap.fromTo(
//                 detailsRef.current,
//                 { x: "-100%", opacity: 0 },
//                 { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
//             );
//         } else {
//             gsap.to(detailsRef.current, {
//                 x: "100%",
//                 opacity: 0,
//                 duration: 0.5,
//                 ease: "power2.in",
//                 onComplete: () => {
//                     if (detailsRef.current) {
//                         detailsRef.current.style.display = "none"; // Hide after animation
//                     }
//                 },
//             });
//         }
//     }, [shippingDetails]);



//     // useEffect(() => {
//     //     axios.get(`http://localhost:5000/api/products/${id}`)
//     //         .then(response => {
//     //             console.log("Fetched Product Data:", response.data);
//     //             const data = response.data;

//     //             const saveAmount = data.product_price && data.dis_product_price
//     //                 ? data.product_price - data.dis_product_price
//     //                 : 0;

//     //             const images = data.colors.map(color => ({
//     //                 url: data.product_image,
//     //                 filter: color.filter || "none",
//     //                 color: color
//     //             }));

//     //             setProduct({ ...data, images, save: saveAmount });
//     //             setSelectedColor(data.colors?.[0] || null);
//     //         })
//     //         .catch(error => console.error("Error fetching product:", error));
//     // }, [id]);


//     const images = [
//         "/images/Best-Selling-Products-image-1.png",
//         "/images/Best-Selling-Products-image-2.png",
//         "/images/Best-Selling-Products-image-3.png"
//     ];



//     const prevImage = () => {
//         setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//     };

//     const nextImage = () => {
//         setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
//     };

//     const changeImage = (index) => {
//         setCurrentIndex(index);
//     };

//     const increaseQuantity = () => {
//         setQuantity((prev) => prev + 1);
//     };

//     const decreaseQuantity = () => {
//         setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
//     };
//     const selectColor = (color, index) => {
//         setSelectedColor(color);
//         setCurrentIndex(index + 1);
//     };

//     // useEffect(() => {
//     //     axios.get("http://localhost:5000/api/products/bestselling")
//     //         .then(response => {
//     //             const allProducts = response.data;
//     //             const filteredProducts = allProducts.filter(p => p._id !== id);
//     //             const shuffled = filteredProducts.sort(() => 0.5 - Math.random());
//     //             setRandomProducts(shuffled.slice(0, 6));
//     //         })
//     //         .catch(error => console.error("Error fetching products:", error));
//     // }, [id]);


//     // if (!product || !product.images || product.images.length === 0) {
//     //     return <p>Loading...</p>;
//     // }

//     return (
//         <>
//             <div className="product-view-page">
//                 <div className="product-view">
//                     <div className="product-view-frame">
//                         <div className="product-images">
//                             <div className="images-frame">
//                                 <div className="left-icon-img" onClick={prevImage}>
//                                     <img src={left} className="left-icon" alt="Previous" />
//                                 </div>
//                                 <div className="right-icon-img" onClick={nextImage}>
//                                     <img src={right} className="right-icon" alt="Next" />
//                                 </div>
//                                 <img src={images[currentIndex]} className="img" alt="Best Selling Product" />

//                                 <div className="pi_dot">
//                                     {images.map((_, index) => (
//                                         <span
//                                             key={index}
//                                             className={`dot ${index === currentIndex ? "active-dot" : ""}`}
//                                             onClick={() => changeImage(index)}
//                                         ></span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="product-data">
//                             <p className="Free-Delivery"><span class="material-symbols-outlined">
//                                 local_shipping
//                             </span> Free Delivery</p>
//                             <div className="data-frame">
//                                 <h2>Xero_xXx</h2>
//                                 <p className="type"><span>Type </span>Lorem, ipsum dolor.</p>
//                                 <p className="des"><span>Product Description </span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse error possimus harum!</p>
//                                 <div className="hr"></div>
//                                 <div className="discount-box">
//                                     <p className="original-price">$39</p>
//                                     <p className="price">$29</p>
//                                     <p className="save">Save 20%</p>
//                                 </div>

//                                 {/* {product.colors && (
//                                     <div className="color-selection">
//                                         <div className="colors">
//                                             {product.colors.map((color, index) => (
//                                                 <span
//                                                     key={index}
//                                                     className={`color-box ${selectedColor === color ? "active" : ""}`}
//                                                     style={{ backgroundColor: color.color_code }}
//                                                     onClick={() => changeImage(index)}
//                                                 ></span>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )} */}

//                                 <div className="quantity-addtocart">
//                                     <div className="quantity">
//                                         <button className="quantity-btn decreaseQuantity" onClick={decreaseQuantity}>-</button>
//                                         <span className="quantity-input">{quantity}</span>
//                                         <button className="quantity-btn" onClick={increaseQuantity}>+</button>
//                                     </div>
//                                     <div className="add-to-cart">
//                                         <button>Add to Cart</button>
//                                     </div>
//                                 </div>
//                                 <div className="buy_this_now">
//                                     <Link className="buy-now">Buy Now</Link>
//                                 </div>
//                                 <div className="hr"></div>
//                                 <div className={`product-details-shipping ${proDetails ? "active-border" : ""}`}
//                                     onClick={() => setProDetails(!proDetails)}
//                                 >
//                                     <div className="heading-arrow_down">
//                                         <h4>
//                                             Product Detail
//                                         </h4>
//                                         <span className="material-symbols-outlined">
//                                             keyboard_arrow_down
//                                         </span>
//                                     </div>
//                                     <div ref={proDetailsRef} className="data-shipping-product"
//                                         style={{ display: proDetails ? "block" : "none" }}
//                                     >
//                                         <li>Express and fast delivery all over Pakistan (Avg. Time 1-3 days).</li>
//                                         <li>Hassle Free exchange if there is any size issue.</li>
//                                         <li>Free Delivery on orders over Rs. 2,990/-</li>
//                                     </div>


//                                 </div>
//                                 <div className={`product-details-shipping shipping ${shippingDetails ? "active-border" : ""}`}
//                                     onClick={() => setShippingDetails(!shippingDetails)}
//                                 >
//                                     <div className="heading-arrow_down">
//                                         <h4>
//                                             Shipping & Returns
//                                         </h4>
//                                         <span className="material-symbols-outlined">
//                                             keyboard_arrow_down
//                                         </span>
//                                     </div>
//                                     {shippingDetails && (
//                                         <div ref={detailsRef} className={`data-shipping-product`}
//                                             style={{ display: shippingDetails ? "block" : "none" }}
//                                         >
//                                             <li>Express and fast delivery all over Pakistan (Avg. Time 1-3 days).</li>
//                                             <li>Hassle Free exchange if there is any size issue.</li>
//                                             <li>Free Delivery on orders over Rs. 2,990/-</li>
//                                         </div>
//                                     )}
//                                 </div>

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="other-products">
//                     <div class="best-selling-section">
//                         <div class="product-container">
//                             <h2>Best Selling</h2>
//                             <div class="products-grid">
//                                 <div class="product-card">
//                                     <div class="product-image-wrapper">
//                                         <img src="/images/Best-Selling-Products-image-1.png" class="bsp-img" alt="Product Name" />
//                                         <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                                     </div>
//                                     <div class="product-details">
//                                         <h3>Product Name</h3>
//                                         <p class="product-price dual-price">
//                                             <span class="original-price">$50.00</span>
//                                             <span class="discount-price">$40.00</span>
//                                         </p>
//                                         <a href="/product/sample-id">Shop Now</a>
//                                     </div>
//                                 </div>

//                                 <div class="product-card">
//                                     <div class="product-image-wrapper">
//                                         <img src="/images/Best-Selling-Products-image-2.png" class="bsp-img" alt="Product Name" />
//                                         <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                                     </div>
//                                     <div class="product-details">
//                                         <h3>Product Name</h3>
//                                         <p class="product-price">$30.00</p>
//                                         <a href="/product/sample-id">Shop Now</a>
//                                     </div>
//                                 </div>
//                                 <div class="product-card">
//                                     <div class="product-image-wrapper">
//                                         <img src="/images/Best-Selling-Products-image-3.png" class="bsp-img" alt="Product Name" />
//                                         <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                                     </div>
//                                     <div class="product-details">
//                                         <h3>Product Name</h3>
//                                         <p class="product-price">$30.00</p>
//                                         <a href="/product/sample-id">Shop Now</a>
//                                     </div>
//                                 </div>
//                                 <div class="product-card">
//                                     <div class="product-image-wrapper">
//                                         <img src="/images/Best-Selling-Products-image-1.png" class="bsp-img" alt="Product Name" />
//                                         <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                                     </div>
//                                     <div class="product-details">
//                                         <h3>Product Name</h3>
//                                         <p class="product-price dual-price">
//                                             <span class="original-price">$50.00</span>
//                                             <span class="discount-price">$40.00</span>
//                                         </p>
//                                         <a href="/product/sample-id">Shop Now</a>
//                                     </div>
//                                 </div>

//                                 <div class="product-card">
//                                     <div class="product-image-wrapper">
//                                         <img src="/images/Best-Selling-Products-image-2.png" class="bsp-img" alt="Product Name" />
//                                         <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                                     </div>
//                                     <div class="product-details">
//                                         <h3>Product Name</h3>
//                                         <p class="product-price">$30.00</p>
//                                         <a href="/product/sample-id">Shop Now</a>
//                                     </div>
//                                 </div>
//                                 <div class="product-card">
//                                     <div class="product-image-wrapper">
//                                         <img src="/images/Best-Selling-Products-image-3.png" class="bsp-img" alt="Product Name" />
//                                         <img src={addTocart} class="add-to-cart-icon" alt="Add to Cart" />
//                                     </div>
//                                     <div class="product-details">
//                                         <h3>Product Name</h3>
//                                         <p class="product-price">$30.00</p>
//                                         <a href="/product/sample-id">Shop Now</a>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//             <Footer />
//         </>
//     );
// };

// export default ProductView;








































































// cart.jsxx
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

        axios.post("http://localhost:5000/api/cart-products", { productIds })
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
                        <Link>Checkout</Link>
                    </div>
                </div>

            </div>
        </>

    );

};

export default Cart;




















// server 1st 
// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const signupRoutes = require("./routes/SignUpRoutes");
// const signinRoutes = require("./routes/signinRoutes");
// const signOutRoutes = require("./routes/signoutRoutes");
// const userRoutes = require("./routes/user");
// const verifyTokenRoutes = require("./middleware/verifyToken");
// const verifyPathRoutes = require("./middleware/verifyPath");
// const dataRoutes = require("./routes/admindataRoutes");
// const productRoutes = require("./routes/productRoutes");
// const cartRoutes = require("./routes/cartRoutes");
// // const productRoutes = require("./routes/productRoutes");



// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Update CORS Configuration
// const allowedOrigins = ["http://localhost:3000",
//     "https://your-web-gamma.vercel.app",
//     "http://192.168.10.8:3000"
// ];

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     credentials: true,
// }));

// app.use((req, res, next) => {
//     res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//     next();
// });

// app.get("/", (req, res) => {
//     res.send("Server is running!");
// });


// app.use(cookieParser());
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.warn("Connected to MongoDB"))
//     .catch((err) => console.error("MongoDB connection error: ", err));

// console.warn("MONGO_URI:", process.env.MONGO_URI);

// app.use("/images", express.static("images"));

// app.use("/api/", signupRoutes);
// app.use("/api/", signinRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api", signOutRoutes);
// app.use("/api/verifytoken", verifyTokenRoutes);
// app.use("/api/protected", verifyPathRoutes);
// app.use("/api", dataRoutes);
// app.use("/api/data", dataRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api", cartRoutes);
// // app.use("/api/products", productRoutes); // 👈 /api/products/search now works!

// app.use((err, req, res, next) => {
//     res.status(500).json({ message: "Server Error" });
// });

// app.listen(PORT, "0.0.0.0", () => console.warn(`Server running on port ${PORT}`));




























// server 2nd 
// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// // Import Routes
// const signupRoutes = require("./routes/SignUpRoutes");
// const signinRoutes = require("./routes/signinRoutes");
// const signOutRoutes = require("./routes/signoutRoutes");
// const userRoutes = require("./routes/user");
// const verifyTokenRoutes = require("./middleware/verifyToken");
// const verifyPathRoutes = require("./middleware/verifyPath");
// const dataRoutes = require("./routes/admindataRoutes");
// const productRoutes = require("./routes/productRoutes");
// const cartRoutes = require("./routes/cartRoutes");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Use middlewares in correct order
// app.use(cookieParser());
// app.use(express.json());

// // ✅ Set headers for popup/Google login compatibility
// app.use((req, res, next) => {
//     res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//     res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//     next();
// });

// // ✅ Updated CORS configuration
// const allowedOrigins = [
//     "http://localhost:3000",
//     "https://your-web-gamma.vercel.app",
//     "http://192.168.10.8:3000"
// ];

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     credentials: true
// }));

// // ✅ Test route
// app.get("/", (req, res) => {
//     res.send("Server is running!");
// });

// // ✅ Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
//     .then(() => console.log("✅ Connected to MongoDB"))
//     .catch((err) => console.error("❌ MongoDB connection error:", err));

// // ✅ Serve static files
// app.use("/images", express.static("images"));

// // ✅ Use API routes
// app.use("/api/", signupRoutes);
// app.use("/api/", signinRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api", signOutRoutes);
// app.use("/api/verifytoken", verifyTokenRoutes);
// app.use("/api/protected", verifyPathRoutes);
// app.use("/api", dataRoutes);
// app.use("/api/data", dataRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api", cartRoutes);

// // ✅ Global error handler
// app.use((err, req, res, next) => {
//     console.error("Unhandled Error:", err);
//     res.status(500).json({ message: "Server Error" });
// });

// // ✅ Start server
// app.listen(PORT, "0.0.0.0", () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });