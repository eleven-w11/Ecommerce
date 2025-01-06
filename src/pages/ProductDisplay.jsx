import React from 'react';
import './styles/ProductDisplay.css';
import { Link } from 'react-router-dom';

const ProductDisplay = () => {
    return (
        <>
            <div className="product-display-beinspired pd">
                <h2>Products</h2>
                <div className="products-video-data">
                    <div className="shawls">
                        <div className="shawls-img">
                            <img src="https://baroque.pk/cdn/shop/files/02_Banner182.jpg?v=1726828421&width=800" alt="" />
                        </div>
                        <h3>SHAWLS</h3>
                        <div className="button-shop-now">
                            <Link className='shopnow' to="/Products">Shop Now</Link>
                        </div>
                    </div>
                    <div className="Readytowear">
                        <div className="Readytowear-img">
                            <img src="https://baroque.pk/cdn/shop/files/02_Banner192.jpg?v=1726834863&width=600" alt="" />
                        </div>
                        <h3>READY TO WEAR</h3>
                        <div className="button-shop-now">
                            <Link className='shopnow' to="/Products">Shop Now</Link>
                        </div>
                    </div>
                    <div className="shantelle">
                        <div className="shantelle-img">
                            <img src="https://baroque.pk/cdn/shop/files/02_Banner191.jpg?v=1726830824&width=600" alt="" />
                        </div>
                        <h3>SHANTELLE</h3>
                        <div className="button-shop-now">
                            <Link className='shopnow' to="/Products">Shop Now</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductDisplay;