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
                const data = response.data;

                // Images ka array banaya jisme filter bhi store ho raha hai
                const images = [];

                // pi_1 agar available hai, to usko add karein (without filter)
                if (data.pi_1) images.push({ url: data.pi_1, filter: "none" });

                // pi_2 agar object hai, to uska url aur filter lein
                if (data.pi_2) {
                    images.push({
                        url: typeof data.pi_2 === "object" ? data.pi_2.url : data.pi_2,
                        filter: typeof data.pi_2 === "object" ? data.pi_2.filter || "none" : "none"
                    });
                }

                // pi_3 agar object hai, to uska url aur filter lein
                if (data.pi_3) {
                    images.push({
                        url: typeof data.pi_3 === "object" ? data.pi_3.url : data.pi_3,
                        filter: typeof data.pi_3 === "object" ? data.pi_3.filter || "none" : "none"
                    });
                }

                setProduct({ ...data, images }); // Updated product state with images array
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
                        <img
                            src={`/images/${product.images[currentIndex].url}`}
                            className="img"
                            alt={product.product_name}
                            style={{ filter: product.images[currentIndex].filter }} // Yahan filter apply ho raha hai
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
                        <div className="product-details">
                            <p>Type: {product.p_type}</p>
                            <ul>Product Detail:
                                {product.product_details.map((detail, index) => (
                                    <li key={index}>{detail}</li>
                                ))}
                            </ul>
                            <p>Product Description: {product.p_des}</p>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductView;
// talhaelevenw11
// 7naISWdxkFajsrrM
// npm install mongodb
// mongodb+srv://talhaelevenw11:7naISWdxkFajsrrM@cluster0.or7qg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// mongosh "mongodb+srv://cluster0.or7qg.mongodb.net/" --apiVersion 1 --username talhaelevenw11