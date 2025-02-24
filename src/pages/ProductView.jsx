import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductView = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/products/${id}`)
            .then(response => {
                console.log("Fetched Product Data:", response.data); // Debugging
                setProduct(response.data);
            })
            .catch(error => console.error("Error fetching product:", error));
    }, [id]);

    if (!product) {
        return <p>Loading...</p>;
    }

    return (
        <div className="product-view">
            <h2>{product.product_name}</h2>
            <p>Price: ${product.product_price}</p>
            {product.dis_product_price && <p>Discount Price: ${product.dis_product_price}</p>}

            {/* 🛠 Debug Image Path */}
            <p>Image URL: {product.product_image}</p>

            {/* 🛠 Check if Image Path is Valid */}
            {product.product_image ? (
                <img src={`/images/${product.product_image}`} alt={product.product_name} />
            ) : (
                <p>Image not available</p>
            )}
        </div>
    );
};

export default ProductView;
