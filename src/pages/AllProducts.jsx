import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import addTocart from "./images/add-to-cart.png";

const AllProducts = () => {
    const location = useLocation();
    const { category, type } = location.state || {};

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const addToCart = (product) => {
        console.log("Added to cart:", product.product_name);
    };

    useEffect(() => {
        const fetchAndFilterProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`);
                const allProducts = response.data;

                const matched = allProducts.filter(product => {
                    const pageValues = product.for_page?.map(obj => Object.values(obj)[0].toLowerCase()) || [];

                    return (
                        pageValues.includes(category?.toLowerCase()) ||
                        pageValues.includes(type?.toLowerCase()) ||
                        pageValues.includes(`${category?.toLowerCase()} ${type?.toLowerCase()}`)
                    );
                });


                setProducts(matched);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        if (category || type) {
            fetchAndFilterProducts();
        } else {
            setLoading(false);
        }
    }, [category, type]);

    return (
        <div className="best-selling-section top-product-section">
            <div className="product-container">
                <h2 className='category_type'>{category} {type}</h2>
                <div className={products.length > 0 ? "products-grid" : "products-flex"}>
                    {loading ? (
                        <div className="loader-container">
                            <div className="loader">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    ) : (
                        products.length > 0 ? (
                            products.map(product => {
                                const hasDiscount = product.dis_product_price !== undefined;
                                const firstImage = product.images?.[0]?.pi_1 || "default.jpg";

                                return (
                                    <div key={product._id} className="product-card">
                                        <div className="product-image-wrapper">
                                            <img src={`/images/${firstImage}`}
                                                {...(product.width ? { style: { width: product.width } } : {})}

                                                className="tp-img" alt={product.product_name} />
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
                                            {/* <p>{product.id}</p> */}
                                            <Link to={`/product/${product._id}`}>
                                                Shop Now
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-products-wrapper">
                                <div className="no-products-animation">
                                    <span>😕</span>
                                    <h3>No Products Found</h3>
                                    <p>
                                        We couldn't find anything for
                                        <strong> "{category}"</strong> or
                                        <strong> "{type}"</strong>.
                                    </p>
                                </div>
                            </div>

                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllProducts;