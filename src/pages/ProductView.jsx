import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./styles/ProductView.css";
import left from "./images/left.png";
import right from "./images/right.png";

const ProductView = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/products/${id}`)
            .then(response => {
                console.log("Fetched Product Data:", response.data);
                setProduct(response.data);
            })
            .catch(error => console.error("Error fetching product:", error));
    }, [id]);

    if (!product || !product.images || product.images.length === 0) {
        return <p>Loading...</p>;
    }

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % product.images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
    };

    const selectImage = (index) => {
        setCurrentIndex(index);
    };

    const increaseQuantity = () => {
        setQuantity((prev) => prev + 1);
    };

    const decreaseQuantity = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    return (
        <div className="product-view">
            <div className="product-view-frame">
                <div className="product-images">
                    <div className="images-frame">
                        <div className="left-icon-img" onClick={prevImage}>
                            <img src={left} className="left-icon" alt="Previous" />
                        </div>
                        <div className="right-icon-img" onClick={nextImage}>
                            <img src={right} className="right-icon" alt="Next" />
                        </div>

                        {/* Image rendering with filter */}
                        <img
                            src={`/images/${product.images[currentIndex].url}`}
                            className="img"
                            alt={product.product_name}
                            style={{ filter: product.images[currentIndex].filter }}
                        />

                        <div className="pi_dot">
                            {product.images.map((_, index) => (
                                <span
                                    key={index}
                                    className={`dot ${index === currentIndex ? "active-dot" : ""}`}
                                    onClick={() => selectImage(index)}
                                ></span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="product-data">
                    <div className="data-frame">
                        <h2>{product.product_name}</h2>

                        {!product.dis_product_price && (
                            <p className="price">${product.product_price}</p>
                        )}

                        {product.dis_product_price && (
                            <div className="discount-box">
                                <p className="original-price">${product.product_price}</p>
                                <p className="price">${product.dis_product_price}</p>
                            </div>
                        )}
                        <div className="quantity-addtocart">
                            <div className="quantity">
                                <button className="quantity-btn decreaseQuantity" onClick={decreaseQuantity}>-</button>
                                <span className="quantity-input">{quantity}</span>
                                <button className="quantity-btn" onClick={increaseQuantity}>+</button>
                            </div>
                            <div className="add-to-cart">
                                <button>Add to Cart</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductView;