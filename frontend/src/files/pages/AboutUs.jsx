import React from 'react';
import '../styles/AboutUs.css';
import { FaTruck, FaShieldAlt, FaHeadset, FaRecycle, FaCreditCard, FaGift } from 'react-icons/fa';
import Footer from './Footer';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    const features = [
        {
            icon: <FaTruck />,
            title: "Free Delivery",
            description: "Enjoy free delivery on all orders above $50. Fast and reliable shipping to your doorstep.",
            color: "#3b82f6"
        },
        {
            icon: <FaShieldAlt />,
            title: "Secure Payment",
            description: "100% secure payment processing with SSL encryption. Your data is always protected.",
            color: "#10b981"
        },
        {
            icon: <FaHeadset />,
            title: "24/7 Support",
            description: "Our customer support team is available round the clock to assist you with any queries.",
            color: "#8b5cf6"
        },
        {
            icon: <FaRecycle />,
            title: "Easy Returns",
            description: "Not satisfied? Return your items within 30 days for a full refund, no questions asked.",
            color: "#f59e0b"
        },
        {
            icon: <FaCreditCard />,
            title: "Flexible Payment",
            description: "Multiple payment options including credit cards, PayPal, and installment plans available.",
            color: "#ef4444"
        },
        {
            icon: <FaGift />,
            title: "Rewards Program",
            description: "Earn points with every purchase and redeem them for discounts on future orders.",
            color: "#ec4899"
        }
    ];

    const stats = [
        { number: "500K+", label: "Happy Customers" },
        { number: "100+", label: "Brand Partners" },
        { number: "24/7", label: "Support Available" },
        { number: "50+", label: "Countries Served" }
    ];

    return (
        <>
            <section className="about-section">

                <div className="about-hero">
                    <div className="about-header">
                        <h1>About Us</h1>
                    </div>
                    <div className="about-hero-content-about-hero-image">
                        <div className="about-hero-content">
                            <h1 className="about-title">
                                Redefining Your <span className="highlight">Shopping Experience</span>
                            </h1>
                            <p className="about-subtitle">
                                At StyleCart, we believe shopping should be effortless, enjoyable, and accessible to everyone.
                                Our mission is to connect you with quality products while providing exceptional service.
                            </p>
                        </div>

                        <div className="about-hero-image">
                            <div className="image-placeholder">
                                <div className="floating-element el1"></div>
                                <div className="floating-element el2"></div>
                                <div className="floating-element el3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats-section">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <h3 className="stat-number">{stat.number}</h3>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="features-section">
                    <div className="section-header">
                        <h2>Why Choose Us</h2>
                        <p>We go beyond just selling products - we deliver exceptional experiences</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card"
                                style={{ "--card-color": feature.color }}
                            >
                                <div
                                    className="feature-icon"
                                    style={{
                                        backgroundColor: feature.color + "20",
                                        color: feature.color
                                    }}
                                >
                                    {feature.icon}
                                </div>

                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-hover-effect"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mission-section">
                    <div className="mission-content">
                        <h2>Our Commitment</h2>
                        <p>
                            We're committed to sustainability, ethical sourcing, and creating positive impact.
                            Every purchase you make contributes to our tree-planting initiative and supports local communities.
                        </p>

                        <div className="mission-points">
                            <div className="mission-point">
                                <div className="checkmark">✓</div>
                                <span>Carbon-neutral shipping on all orders</span>
                            </div>
                            <div className="mission-point">
                                <div className="checkmark">✓</div>
                                <span>Ethically sourced products from verified suppliers</span>
                            </div>
                            <div className="mission-point">
                                <div className="checkmark">✓</div>
                                <span>100% satisfaction guarantee or your money back</span>
                            </div>
                        </div>
                    </div>

                    <div className="mission-visual">
                        <div className="visual-circle"></div>
                    </div>
                </div>

                <div className="cta-section">
                    <h2>Ready to Experience Modern Shopping?</h2>
                    <p>Join thousands of satisfied customers who trust us for their shopping needs.</p>

                    <div className="cta-buttons">
                        {/* <button className="btn-primary">Start Shopping Now</button> */}
                        <Link to={"/"} className="btn-primary" > Start Shopping Now </Link>
                    </div>
                </div>

            </section>
            <Footer />
        </>
    );
};

export default AboutUs;
