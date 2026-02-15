import React, { useState } from 'react';
import '../styles/ContactUs.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            console.log('Form submitted:', formData);
            setIsLoading(false);
            setIsSubmitted(true);

            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });

            setTimeout(() => {
                setIsSubmitted(false);
            }, 5000);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: <FaPhone />,
            title: "Phone Number",
            details: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
            color: "#3b82f6"
        },
        {
            icon: <FaEnvelope />,
            title: "Email Address",
            details: ["support@stylecart.com", "sales@stylecart.com"],
            color: "#10b981"
        },
        {
            icon: <FaMapMarkerAlt />,
            title: "Office Location",
            details: ["123 Commerce Street", "New York, NY 10001", "United States"],
            color: "#8b5cf6"
        },
        {
            icon: <FaClock />,
            title: "Working Hours",
            details: ["Mon - Fri: 9AM - 8PM", "Sat: 10AM - 6PM", "Sun: 10AM - 4PM"],
            color: "#f59e0b"
        }
    ];

    const faqs = [
        {
            question: "How long does shipping usually take?",
            answer: "Standard shipping takes 3-5 business days..."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy..."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Yes! We ship to over 50 countries worldwide..."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order ships, you'll receive a tracking number..."
        }
    ];

    return (
        <div className="contact-us">


            <section className="contact-hero">
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-badge">
                            <MdSupportAgent /> Contact Support
                        </span>
                        <h1 className="hero-title">Get in Touch With Us</h1>
                        <p className="hero-subtitle">
                            Have questions or need assistance? We're here to help.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container">

                {/* MAIN CONTENT */}
                <div className="contact-main">

                    {/* CONTACT FORM */}
                    <div className="contact-form-section">
                        <div className="form-header">
                            <h2>Send us a Message</h2>
                            <p>We'll get back to you within 24 hours</p>
                        </div>

                        {isSubmitted ? (
                            <div className="success-message">
                                <FaCheckCircle className="success-icon" />
                                <h3>Message Sent Successfully!</h3>
                                <p>Thank you for contacting us.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Subject *</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="order">Order Support</option>
                                            <option value="returns">Returns & Refunds</option>
                                            <option value="technical">Technical Support</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Your Message *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="6"
                                        required
                                    />
                                </div>

                                <button className="submit-btn" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <div className="spinner"></div> Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane /> Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* CONTACT INFO */}
                    <div className="contact-info-section">
                        <div className="info-header">
                            <h2>Contact Information</h2>
                            <p>Reach us anytime</p>
                        </div>

                        <div className="info-cards">
                            {contactInfo.map((info, index) => (
                                <div
                                    key={index}
                                    className="info-card"
                                    style={{ "--card-color": info.color }}
                                >
                                    <div
                                        className="info-icon"
                                        style={{
                                            backgroundColor: info.color + "20",
                                            color: info.color
                                        }}
                                    >
                                        {info.icon}
                                    </div>

                                    <h3 className="info-title">{info.title}</h3>

                                    <div className="info-details">
                                        {info.details.map((detail, idx) => (
                                            <p key={idx}>{detail}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* SOCIAL LINKS */}
                        <div className="social-section">
                            <h3>Follow Us</h3>
                            <div className="social-links">
                                <FaFacebook />
                                <FaTwitter />
                                <FaInstagram />
                                <FaLinkedin />
                            </div>
                        </div>

                        {/* LIVE CHAT */}
                        <div className="live-chat-card">
                            <div className="chat-icon">
                                <MdSupportAgent />
                            </div>
                            <h3>Live Chat Support</h3>
                            <p>Instant help from our experts</p>
                            <button className="chat-btn">Start Live Chat</button>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <section className="faq-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-card">
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* MAP */}
                <section className="map-section">
                    <h2>Find Our Store</h2>
                    <div className="map-container">
                        <div className="map-placeholder">
                            <div className="map-overlay">
                                <FaMapMarkerAlt />
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ContactUs;
