import React, { useState } from 'react';
import './styles/ShopTheLook.css';
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { Link } from 'react-router-dom';

const ShopThelook = () => {
    const [selectedDesign, setSelectedDesign] = useState('design1');
    const [hovered, setHovered] = useState(false);
    const [mainImageIndex, setMainImageIndex] = useState(0);


    const imagesData = [
        {
            mainImageURL: 'https://baroque.pk/cdn/shop/files/Shop_The_Look77.jpg?v=1725975311&width=800',
            design1ImageURL: 'https://baroque.pk/cdn/shop/files/178_fc8eea09-c1f7-4993-ae49-139fbb3f2459.jpg?v=1726814477&width=1000',
            design1HoverImageURL: 'https://baroque.pk/cdn/shop/files/180_ee43143b-f263-4253-a4d2-db41370a2ddd.jpg?v=1726814476&width=1000',
            design1ImageURLproductname: "EMBROIDERED PRINTED LAWN",
            design1ImageURLproductdis: "UF-717",
            design1ImageURLproductprice: "PKR 5,990.00",
            design2ImageURL: 'https://baroque.pk/cdn/shop/files/184_48ab0cfc-503a-4d06-81be-4969dc3eb019.jpg?v=1726814593&width=1000',
            design2HoverImageURL: 'https://baroque.pk/cdn/shop/files/187_5d219ad8-a154-4c76-b478-969e4135861b.jpg?v=1726814593&width=600',
            design2ImageURLproductname: "EMBROIDERED PRINTED LAWN",
            design2ImageURLproductdis: "UF-718",
            design2ImageURLproductprice: "PKR 5,990.00",
        },
        {
            mainImageURL: 'https://baroque.pk/cdn/shop/files/Shop_The_Look75.jpg?v=1725265568&width=800',
            design1ImageURL: 'https://baroque.pk/cdn/shop/files/133_b58ef877-3768-4a51-be77-57b70661e81e.jpg?v=1724493924&width=1000',
            design1HoverImageURL: 'https://baroque.pk/cdn/shop/files/135_5a390530-a1a5-4a49-ab55-2c82b0d79b7a.jpg?v=1724493924&width=1000',
            design1ImageURLproductname: "EMBROIDERED PRINTED LAWN",
            design1ImageURLproductdis: "UF-711",
            design1ImageURLproductprice: "PKR 8,990.00",
            design2ImageURL: 'https://baroque.pk/cdn/shop/files/125_5fe634c7-aca9-4bad-88d4-1b4e9f38337c.jpg?v=1724493875&width=1000',
            design2HoverImageURL: 'https://baroque.pk/cdn/shop/files/126_e66d99c0-df87-4c02-85ea-38918eff05f8.jpg?v=1724493875&width=1000',
            design2ImageURLproductname: "EMBROIDERED PRINTED LAWN",
            design2ImageURLproductdis: "UF-710",
            design2ImageURLproductprice: "PKR 8,990.00",
        },
        {
            mainImageURL: 'https://baroque.pk/cdn/shop/files/Shop_The_Look76.jpg?v=1725975148&width=800',
            design1ImageURL: 'https://baroque.pk/cdn/shop/files/126_0d9a3c70-1ded-4eaf-ae13-2eb1cc983a1d.jpg?v=1726813941&width=1000',
            design1HoverImageURL: 'https://baroque.pk/cdn/shop/files/129_c993a546-e2f8-4fcf-8d32-543dd5e49c7d.jpg?v=1726813941&width=1000',
            design1ImageURLproductname: "EMBROIDERED CHIFFON",
            design1ImageURLproductdis: "PR-988",
            design1ImageURLproductprice: "PKR 19,990.00",
            design2ImageURL: 'https://baroque.pk/cdn/shop/files/112_720dbe0f-5cac-490c-ba60-a3ede34c368c.jpg?v=1726814065&width=1000',
            design2HoverImageURL: 'https://baroque.pk/cdn/shop/files/118_094d7d70-0c43-4c07-8a5f-cdcd31293e04.jpg?v=1726814065&width=1000',
            design2ImageURLproductname: "EMBROIDERED CHIFFON",
            design2ImageURLproductdis: "PR-987",
            design2ImageURLproductprice: "PKR 19,990.00",
        }
    ];

    const handleDesignSelection = (design) => {
        setSelectedDesign(design);
        setHovered(false);
    };

    const handleImageNavigation = (direction) => {
        if (direction === 'next') {
            setMainImageIndex((prevIndex) => (prevIndex + 1) % imagesData.length);
        } else {
            setMainImageIndex((prevIndex) => (prevIndex - 1 + imagesData.length) % imagesData.length);
        }
    };

    const currentImages = imagesData[mainImageIndex];

    const productDetails = {
        name: selectedDesign === 'design1' ? currentImages.design1ImageURLproductname : currentImages.design2ImageURLproductname,
        description: selectedDesign === 'design1' ? currentImages.design1ImageURLproductdis : currentImages.design2ImageURLproductdis,
        price: selectedDesign === 'design1' ? currentImages.design1ImageURLproductprice : currentImages.design2ImageURLproductprice
    };

    return (
        <div className='Shopthelook'>
            <h1>Shop the look</h1>
            <button className="left-button" onClick={() => handleImageNavigation('prev')}><MdKeyboardArrowLeft className="custom-icon custom-icon-left" /></button>
            <button className="right-button" onClick={() => handleImageNavigation('next')}><MdKeyboardArrowRight className="custom-icon custom-icon-right" /></button>

            <div className="main-img-cont-img-frame-dot">
                <div className="main-img-container">
                    <img src={currentImages.mainImageURL} alt="Main" className="main-img" />

                    <div
                        className="tap-circle main-img-design-1"
                        onClick={() => handleDesignSelection('design1')}>
                        Tap 1
                    </div>

                    <div
                        className="tap-circle main-img-design-2"
                        onClick={() => handleDesignSelection('design2')}>
                        Tap 2
                    </div>
                </div>

                <div className="img-preview-frame-dot">
                    <div className="img-preview-frame">
                        <img
                            src={hovered ? (selectedDesign === 'design1' ? currentImages.design1HoverImageURL : currentImages.design2HoverImageURL) : (selectedDesign === 'design1' ? currentImages.design1ImageURL : currentImages.design2ImageURL)}
                            alt={selectedDesign === 'design1' ? "Design 1" : "Design 2"}
                            className="design-image"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        />
                        <div className="product-description">
                            <p style={{ margin: '10px o' }}>{productDetails.name}</p>
                            <p>{productDetails.description}</p>
                            <p className='price'>{productDetails.price}</p>
                            <div className="button-shop-now">
                                <Link className='shopnow' to="/Products">Shop Now</Link>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                <div
                                    className="dot"
                                    style={{
                                        backgroundColor: selectedDesign === 'design1' ? 'black' : 'gray',
                                        borderRadius: '50%',
                                        marginRight: '15px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleDesignSelection('design1')}
                                />
                                <div
                                    className="dot"
                                    style={{
                                        backgroundColor: selectedDesign === 'design2' ? 'black' : 'gray',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleDesignSelection('design2')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopThelook;