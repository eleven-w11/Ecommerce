import React, { useState } from 'react';
// import './Cart.css';
import "./styles/animation.css";


const products = [
    {
        id: 1,
        name: 'Elegant Jacket',
        images: ['https://via.placeholder.com/300x200', 'https://via.placeholder.com/300x200?text=Alt1'],
        originalPrice: 120,
        discountPrice: 90,
        colors: ['#FF0000', '#0000FF', '#00FF00'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    },
    {
        id: 2,
        name: 'Classic Sneakers',
        images: ['https://via.placeholder.com/300x200?text=Sneaker', 'https://via.placeholder.com/300x200?text=Alt2'],
        originalPrice: 150,
        discountPrice: 110,
        colors: ['#333333', '#FFD700', '#8B0000'],
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    },
];

const Cart = () => {
    return (
        <div className="cart-container">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

const ProductCard = ({ product }) => {
    const [currentImg, setCurrentImg] = useState(0);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [quantity, setQuantity] = useState(1);

    const nextImage = () => {
        setCurrentImg((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setCurrentImg((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    const totalPrice = product.discountPrice * quantity;

    return (
        <div className="product-card">
            <div className="image-container">
                <img src={product.images[currentImg]} alt={product.name} />
                <button className="arrow left" onClick={prevImage}>&larr;</button>
                <button className="arrow right" onClick={nextImage}>&rarr;</button>
            </div>

            <div className="details">
                <h2>{product.name}</h2>
                <div className="prices">
                    <span className="original">${product.originalPrice}</span>
                    <span className="discount">${product.discountPrice}</span>
                    <span className="total">Total: ${totalPrice}</span>
                </div>

                <div className="color-section">
                    <span>Colors:</span>
                    <div className="colors">
                        {product.colors.map(color => (
                            <div
                                key={color}
                                className={`color ${selectedColor === color ? 'selected' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedColor(color)}
                            />
                        ))}
                    </div>
                </div>

                <div className="size-section">
                    <span>Sizes:</span>
                    <div className="sizes">
                        {product.sizes.map(size => (
                            <div
                                key={size}
                                className={`size ${selectedSize === size ? 'selected' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="quantity-section">
                    <label>Qty:</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                </div>

                <div className="actions">
                    <button>Edit</button>
                    <button>Remove</button>
                    <button>Description</button>
                    <button className="update">Update</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
