import React from "react";

export default function EcommerceLanding() {
    return (
        <div className="app-container">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="logo">ShopNow</div>
                <ul className="nav-links">
                    <li>Home</li>
                    <li>Shop</li>
                    <li>Categories</li>
                    <li>About</li>
                    <li>Contact</li>
                </ul>
                <div className="nav-icons">
                    <span>🔍</span>
                    <span>🛒</span>
                    <span>👤</span>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Discover the Latest Trends</h1>
                    <p>Shop the newest arrivals in fashion, electronics, home & more.</p>
                    <button className="cta-btn">Shop Now</button>
                </div>
            </section>

            {/* FEATURED CATEGORIES */}
            <section className="categories-section">
                <h2>Featured Categories</h2>
                <div className="categories-grid">
                    <div className="category-card">Fashion</div>
                    <div className="category-card">Electronics</div>
                    <div className="category-card">Home</div>
                    <div className="category-card">Beauty</div>
                </div>
            </section>

            {/* BEST SELLING */}
            <section className="best-selling-section">
                <h2>Best Selling Products</h2>
                <div className="products-grid">
                    <div className="product-card">
                        <div className="img-placeholder" />
                        <h3>Smart Watch</h3>
                        <p>$120</p>
                        <button>Add to Cart</button>
                    </div>
                    <div className="product-card">
                        <div className="img-placeholder" />
                        <h3>Headphones</h3>
                        <p>$60</p>
                        <button>Add to Cart</button>
                    </div>
                    <div className="product-card">
                        <div className="img-placeholder" />
                        <h3>Running Shoes</h3>
                        <p>$90</p>
                        <button>Add to Cart</button>
                    </div>
                    <div className="product-card">
                        <div className="img-placeholder" />
                        <h3>Perfume</h3>
                        <p>$40</p>
                        <button>Add to Cart</button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <p>© 2025 ShopNow. All rights reserved.</p>
            </footer>

            {/* CSS */}
            <style>{`
        .app-container {
          font-family: Arial, sans-serif;
          color: #333;
        }

        /* NAVBAR */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-links {
          display: flex;
          gap: 20px;
          list-style: none;
        }
        .nav-icons span {
          margin-left: 15px;
          cursor: pointer;
          font-size: 18px;
        }

        /* HERO */
        .hero-section {
          height: 70vh;
          background: linear-gradient(to right, #0d6efd, #6610f2);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
        }
        .cta-btn {
          margin-top: 20px;
          padding: 12px 30px;
          font-size: 16px;
          background: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        /* CATEGORIES */
        .categories-section {
          padding: 60px 20px;
          text-align: center;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .category-card {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 10px;
          font-size: 18px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        /* PRODUCTS */
        .best-selling-section {
          padding: 60px 20px;
          text-align: center;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 25px;
          margin-top: 30px;
        }
        .product-card {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .img-placeholder {
          height: 150px;
          background: #e9ecef;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        button {
          padding: 10px 20px;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        /* FOOTER */
        .footer {
          padding: 20px;
          background: #111;
          color: white;
          text-align: center;
          margin-top: 40px;
        }
      `}</style>
        </div>
    );
}
