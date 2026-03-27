import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/OrderConfirmation.css";
import Footer from "./Footer";

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeOrder = async () => {
            // First check if order came from navigation state
            if (location.state?.order) {
                setOrder(location.state.order);
                setLoading(false);
                return;
            }

            // Check localStorage for recent order
            const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
            if (storedOrders.length > 0) {
                // Get the most recent order
                const latestOrder = storedOrders[storedOrders.length - 1];
                setOrder(latestOrder);
                setLoading(false);
                return;
            }

            // Try to fetch from API if user is authenticated
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/orders/my-orders`,
                    { withCredentials: true }
                );

                if (response.data.success && response.data.orders.length > 0) {
                    // Get most recent pending order
                    const pendingOrder = response.data.orders.find(o => o.status === 'pending');
                    if (pendingOrder) {
                        setOrder(pendingOrder);
                    } else {
                        setOrder(response.data.orders[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }

            setLoading(false);
        };

        initializeOrder();
    }, [location]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case 'credit-card':
                return 'Credit/Debit Card';
            case 'cash-on-delivery':
                return 'Cash on Delivery';
            case 'bank-transfer':
                return 'Bank Transfer';
            default:
                return method;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-pending';
            case 'confirmed':
                return 'status-confirmed';
            case 'processing':
                return 'status-processing';
            case 'shipped':
                return 'status-shipped';
            case 'delivered':
                return 'status-delivered';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <div className="order-confirmation-page">
                <div className="order-confirmation-loader">
                    <div className="loader">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-confirmation-page">
                <div className="order-confirmation-container">
                    <div className="no-order-found">
                        <div className="no-order-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2>No Order Found</h2>
                        <p>You don't have any recent orders to display.</p>
                        <Link to="/" className="back-to-shop-btn">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="order-confirmation-page">
                <div className="order-confirmation-container">
                    {/* Success Header */}
                    <div className="order-success-header">
                        <div className="success-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h1>Order Confirmed!</h1>
                        <p>Thank you for your order. We've received your order and will begin processing it soon.</p>
                    </div>

                    {/* Order ID & Status */}
                    <div className="order-id-section">
                        <div className="order-id-box">
                            <span className="label">Order ID</span>
                            <span className="value">{order.orderId}</span>
                        </div>
                        <div className="order-status-box">
                            <span className="label">Status</span>
                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                        </div>
                        <div className="order-date-box">
                            <span className="label">Order Date</span>
                            <span className="value">{formatDate(order.orderDate || order.createdAt)}</span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-section">
                        <h2 className="section-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            Order Items
                        </h2>
                        <div className="order-items-list">
                            {order.items?.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="item-image">
                                        <img
                                            src={`/images/${item.image}`}
                                            alt={item.productName}
                                            onError={(e) => { e.target.src = '/images/default.jpg'; }}
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.productName}</h3>
                                        <div className="item-meta">
                                            {item.color && (
                                                <span className="meta-item">
                                                    <span className="meta-label">Color:</span>
                                                    <span 
                                                        className="color-dot" 
                                                        style={{ backgroundColor: item.color }}
                                                    ></span>
                                                </span>
                                            )}
                                            {item.size && (
                                                <span className="meta-item">
                                                    <span className="meta-label">Size:</span>
                                                    <span className="meta-value">{item.size}</span>
                                                </span>
                                            )}
                                            <span className="meta-item">
                                                <span className="meta-label">Qty:</span>
                                                <span className="meta-value">{item.quantity}</span>
                                            </span>
                                        </div>
                                        <div className="item-price">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {order.customerInfo && (
                        <div className="order-section">
                            <h2 className="section-title">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Shipping Information
                            </h2>
                            <div className="shipping-details">
                                <div className="detail-row">
                                    <span className="detail-label">Name</span>
                                    <span className="detail-value">
                                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{order.customerInfo.email}</span>
                                </div>
                                {order.customerInfo.phone && (
                                    <div className="detail-row">
                                        <span className="detail-label">Phone</span>
                                        <span className="detail-value">{order.customerInfo.phone}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Address</span>
                                    <span className="detail-value">
                                        {order.customerInfo.address}
                                        {order.customerInfo.apartment && `, ${order.customerInfo.apartment}`}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">City</span>
                                    <span className="detail-value">
                                        {order.customerInfo.city}
                                        {order.customerInfo.state && `, ${order.customerInfo.state}`}
                                        {order.customerInfo.zipCode && ` ${order.customerInfo.zipCode}`}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Country</span>
                                    <span className="detail-value">{order.customerInfo.country}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping from API response */}
                    {order.shippingAddress && !order.customerInfo && (
                        <div className="order-section">
                            <h2 className="section-title">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Shipping Information
                            </h2>
                            <div className="shipping-details">
                                <div className="detail-row">
                                    <span className="detail-label">Name</span>
                                    <span className="detail-value">
                                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{order.shippingAddress.email}</span>
                                </div>
                                {order.shippingAddress.phone && (
                                    <div className="detail-row">
                                        <span className="detail-label">Phone</span>
                                        <span className="detail-value">{order.shippingAddress.phone}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Address</span>
                                    <span className="detail-value">
                                        {order.shippingAddress.address}
                                        {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">City</span>
                                    <span className="detail-value">
                                        {order.shippingAddress.city}
                                        {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                                        {order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Country</span>
                                    <span className="detail-value">{order.shippingAddress.country}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div className="order-section">
                        <h2 className="section-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            Payment Information
                        </h2>
                        <div className="payment-details">
                            <div className="detail-row">
                                <span className="detail-label">Payment Method</span>
                                <span className="detail-value payment-method">
                                    {getPaymentMethodLabel(order.paymentMethod)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-section order-summary-section">
                        <h2 className="section-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Order Summary
                        </h2>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${(order.subtotal || order.totalAmount).toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="free-shipping">FREE</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="summary-row discount">
                                    <span>Discount</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="order-actions">
                        <Link to="/" className="action-btn primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Continue Shopping
                        </Link>
                        <button className="action-btn secondary" onClick={() => window.print()}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Print Order
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderConfirmation;
