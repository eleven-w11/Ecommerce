import { useState } from "react";
// import "../styles/Checkout.css";
// import "../../styles/CheckOut/Checkout.css";
import "../../styles/CheckOut/CheckoutPayment.css";


const CheckoutPayment = ({
    checkoutItems,
    formData,
    setFormData,
    errors,
    setErrors,
    isProcessing,
    setIsProcessing,
    onOrderComplete
}) => {
    const [bankDetails] = useState({
        bankName: "UBL Digital Bank",
        accountNumber: "1234-5678-9012-3456",
        accountName: "WebVerse",
        phoneNumber: "+92 300 1234567",
        iban: "PK36UNIL0109000200001234",
        branchCode: "0123",
        amount: "0.00"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validatePaymentForm = () => {
        const newErrors = {};

        if (formData.paymentMethod === "credit-card") {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
            if (!formData.expiryDate.trim()) newErrors.expiryDate = "Expiry date is required";
            if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
            if (!formData.nameOnCard.trim()) newErrors.nameOnCard = "Name on card is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePaymentForm()) {
            return;
        }

        setIsProcessing(true);
        await onOrderComplete();
        setIsProcessing(false);
    };

    const calculateSubtotal = () => {
        return checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal();
    };

    const calculateTotalItems = () => {
        return checkoutItems.reduce((total, item) => total + item.quantity, 0);
    };

    const generateQRCodeData = () => {
        const qrData = {
            bank: bankDetails.bankName,
            account: bankDetails.accountNumber,
            name: bankDetails.accountName,
            amount: calculateTotal().toFixed(2),
            reference: `WEBVERSE-${Date.now()}`
        };
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`;
    };

    return (

        <div className="checkout-Payment-form-container">
            <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-section">
                    <div className="checkout-section-heading">
                        <h3>Payment Method</h3>
                    </div>
                    
                    <div className="payment-options">
                        <label className={`payment-card ${formData.paymentMethod === 'credit-card' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="credit-card"
                                checked={formData.paymentMethod === 'credit-card'}
                                onChange={handleInputChange}
                            />
                            <div className="payment-content">
                                <span className="payment-icon">💳</span>
                                <div className="payment-info">
                                    <span className="payment-title">Credit/Debit Card</span>
                                    <span className="payment-desc">Pay with Visa, MasterCard</span>
                                </div>
                            </div>
                        </label>
                        
                        <label className={`payment-card ${formData.paymentMethod === 'cash-on-delivery' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cash-on-delivery"
                                checked={formData.paymentMethod === 'cash-on-delivery'}
                                onChange={handleInputChange}
                            />
                            <div className="payment-content">
                                <span className="payment-icon">💰</span>
                                <div className="payment-info">
                                    <span className="payment-title">Cash on Delivery</span>
                                    <span className="payment-desc">Pay when you receive</span>
                                </div>
                            </div>
                        </label>

                        <label className={`payment-card ${formData.paymentMethod === 'bank-transfer' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bank-transfer"
                                checked={formData.paymentMethod === 'bank-transfer'}
                                onChange={handleInputChange}
                            />
                            <div className="payment-content">
                                <span className="payment-icon">🏦</span>
                                <div className="payment-info">
                                    <span className="payment-title">Bank Transfer</span>
                                    <span className="payment-desc">Direct bank transfer</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    {formData.paymentMethod === 'credit-card' && (
                        <div className="card-form">
                            <div className="form-group">
                                <label>Card Number *</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    className={errors.cardNumber ? "error" : ""}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                />
                                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Expiry Date *</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        className={errors.expiryDate ? "error" : ""}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                    {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>CVV *</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        className={errors.cvv ? "error" : ""}
                                        placeholder="123"
                                        maxLength="3"
                                    />
                                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Name on Card *</label>
                                <input
                                    type="text"
                                    name="nameOnCard"
                                    value={formData.nameOnCard}
                                    onChange={handleInputChange}
                                    className={errors.nameOnCard ? "error" : ""}
                                    placeholder="As shown on card"
                                />
                                {errors.nameOnCard && <span className="error-message">{errors.nameOnCard}</span>}
                            </div>
                            <div className="security-badges">
                                <div className="badge">
                                    <span className="icon">🔒</span>
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="badge">
                                    <span className="icon">✓</span>
                                    <span>SSL Encrypted</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.paymentMethod === 'bank-transfer' && (
                        <div className="bank-transfer-details">
                            <div className="bank-transfer-header">
                                <h3>Bank Transfer Instructions</h3>
                                <p>Please transfer the exact amount to the following account details:</p>
                            </div>

                            <div className="bank-details-grid">
                                <div className="qr-code-section">
                                    <div className="qr-code">
                                        <img
                                            src={generateQRCodeData()}
                                            alt="Bank Transfer QR Code"
                                            onError={(e) => { e.target.src = '/images/qr-placeholder.jpg'; }}
                                        />
                                    </div>
                                    <p className="qr-note">Scan QR code for quick transfer</p>
                                </div>

                                <div className="bank-info-section">
                                    <div className="bank-detail-item">
                                        <span className="bank-label">Bank Name:</span>
                                        <span className="bank-value">{bankDetails.bankName}</span>
                                    </div>
                                    <div className="bank-detail-item">
                                        <span className="bank-label">Account No:</span>
                                        <span className="bank-value">{bankDetails.accountNumber}</span>
                                    </div>
                                    <div className="bank-detail-item">
                                        <span className="bank-label">Account Name:</span>
                                        <span className="bank-value">{bankDetails.accountName}</span>
                                    </div>
                                    <div className="bank-detail-item">
                                        <span className="bank-label">IBAN:</span>
                                        <span className="bank-value">{bankDetails.iban}</span>
                                    </div>
                                    <div className="bank-detail-item">
                                        <span className="bank-label">Branch Code:</span>
                                        <span className="bank-value">{bankDetails.branchCode}</span>
                                    </div>
                                    <div className="bank-detail-item">
                                        <span className="bank-label">Phone Number:</span>
                                        <span className="bank-value">{bankDetails.phoneNumber}</span>
                                    </div>
                                    <div className="bank-detail-item total-amount">
                                        <span className="bank-label">Transfer Amount:</span>
                                        <span className="bank-value">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="transfer-instructions">
                                <h4>Important Instructions:</h4>
                                <ul>
                                    <li>Transfer the exact amount of <strong>${calculateTotal().toFixed(2)}</strong></li>
                                    <li>Send the payment receipt to <strong>{bankDetails.phoneNumber}</strong> via WhatsApp</li>
                                    <li>Your order will be processed once payment is confirmed</li>
                                    <li>Confirmation may take 2-4 hours during business hours</li>
                                </ul>
                            </div>

                            <div className="bank-security-note">
                                <div className="security-badge">
                                    <span className="icon">🔒</span>
                                    <span>Secure Bank Transfer</span>
                                </div>
                                <p>Your transaction is protected by bank-level security</p>
                            </div>
                            
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="place-order-btn modern-btn primary large"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <div className="btn-spinner"></div>
                            Processing Your Order...
                        </>
                    ) : (
                        `Complete Order - $${calculateTotal().toFixed(2)}`
                    )}
                </button>
            </form>
        </div>
    );
};

export default CheckoutPayment;