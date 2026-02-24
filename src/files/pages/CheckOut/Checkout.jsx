import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/CheckOut/Checkout.css";
import CheckoutCartReview from "./CheckoutCartReview";
import CheckoutShipping from "./CheckoutShipping";
import CheckoutPayment from "./CheckoutPayment";
import SignInPopup from "./SignInPopup";
import Footer from "../Footer";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [checkoutType, setCheckoutType] = useState("single");
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [checkoutData, setCheckoutData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showSignInPopup, setShowSignInPopup] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Pakistan",
        paymentMethod: "credit-card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        nameOnCard: ""
    });

    const [errors, setErrors] = useState({});
    const [shippingValidated, setShippingValidated] = useState(false);

    // --------------------------
    // 👉 Check Authentication
    // --------------------------
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/verifytoken`,
                    { withCredentials: true }
                );

                if (response.data && response.data.success && response.data.userId) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setShowSignInPopup(true);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setShowSignInPopup(true);
            } finally {
                setAuthChecked(true);
            }
        };
        checkAuth();
    }, []);

    // Handle successful sign in from popup
    const handleSignInSuccess = (user) => {
        setIsAuthenticated(true);
        setShowSignInPopup(false);
    };

    // Handle popup close
    const handlePopupClose = () => {
        setShowSignInPopup(false);
        // If user closes popup without signing in, they can still browse but can't complete order
    };

    // --------------------------
    // 👉 Responsive Screens
    // --------------------------
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 750);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 750);

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // --------------------------
    // Checkout initial load
    // --------------------------
    useEffect(() => {
        const initializeCheckout = async () => {
            const itemFromState = location.state?.checkoutItem;
            const cartFromState = location.state?.checkoutData;

            const itemFromStorage = JSON.parse(localStorage.getItem("checkoutItem"));
            const cartFromStorage = JSON.parse(localStorage.getItem("checkoutData"));

            if (itemFromState || itemFromStorage) {
                const singleItem = itemFromState || itemFromStorage;
                setCheckoutType("single");
                if (checkoutItems.length === 0) setCheckoutItems([singleItem]);
                setLoading(false);
            } else if (cartFromState || cartFromStorage) {
                const cartData = cartFromState || cartFromStorage;
                setCheckoutType("cart");
                if (checkoutItems.length === 0) setCheckoutItems(cartData.items || []);
                setCheckoutData(cartData);
                setLoading(false);
            } else {
                setLoading(false);
                navigate("/");
            }
        };

        initializeCheckout();
    }, [location, navigate, checkoutItems.length]);

    // --------------------------
    // Step Handlers
    // --------------------------
    const handleProceedToShipping = () => setCurrentStep(2);
    const handleProceedToPayment = () => {
        setShippingValidated(true);
        setCurrentStep(3);
    };

    const handleOrderComplete = async () => {
        // Check if user is authenticated before completing order
        if (!isAuthenticated) {
            setShowSignInPopup(true);
            return;
        }

        try {
            setIsProcessing(true);

            // Prepare order data for API
            const orderData = {
                items: checkoutItems.map(item => ({
                    id: item.id || item.productId || item._id,
                    productId: item.id || item.productId || item._id,
                    productName: item.productName,
                    price: item.price,
                    originalPrice: item.originalPrice || item.price,
                    quantity: item.quantity,
                    color: item.color,
                    size: item.size,
                    image: item.image
                })),
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    apartment: formData.apartment,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country
                },
                paymentMethod: formData.paymentMethod,
                paymentDetails: formData.paymentMethod === 'credit-card' ? {
                    cardLastFour: formData.cardNumber.slice(-4)
                } : {},
                subtotal: calculateSubtotal(),
                shippingCost: 0,
                discount: 0,
                totalAmount: calculateTotal(),
                checkoutType: checkoutType
            };

            // Save order to MongoDB
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/orders/create`,
                orderData,
                { withCredentials: true }
            );

            if (response.data.success) {
                const order = {
                    orderId: response.data.order.orderId,
                    items: checkoutItems,
                    customerInfo: formData,
                    subtotal: calculateSubtotal(),
                    shipping: 0,
                    totalAmount: calculateTotal(),
                    orderDate: new Date().toISOString(),
                    status: "pending",
                    paymentMethod: formData.paymentMethod,
                    checkoutType: checkoutType
                };

                // Also save to localStorage for confirmation page
                const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
                localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));

                // Clear checkout data
                localStorage.removeItem("checkoutItem");
                localStorage.removeItem("checkoutData");
                if (checkoutType === "cart") {
                    localStorage.removeItem("cart");
                    window.dispatchEvent(new Event("cartUpdated"));
                }

                navigate("/order-confirmation", {
                    state: { order, orderId: response.data.order.orderId }
                });
            } else {
                throw new Error(response.data.message || "Failed to create order");
            }
        } catch (error) {
            console.error("Order processing error:", error);
            if (error.response?.status === 401) {
                setShowSignInPopup(true);
            } else {
                alert(error.response?.data?.message || "There was an error processing your order. Please try again.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateSubtotal = () =>
        checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const calculateTotal = () => calculateSubtotal();

    // --------------------------------------------------
    // ⭐ RETURN UI STARTS HERE
    // --------------------------------------------------

    return (
        <>
            {/* Sign In Popup */}
            <SignInPopup 
                isOpen={showSignInPopup} 
                onClose={handlePopupClose}
                onSignInSuccess={handleSignInSuccess}
            />

            <div className="modern_checkout">
                <h1>Review Your Order</h1>

                {loading && (
                    <div className="checkout-loader-wrapperdel">
                        <div className="loaderdel">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* ====================================
                           ⭐ DESKTOP — SHOW ALL 3 COLUMNS
                           ==================================== */}
                        {isDesktop ? (
                            <div className="checkout-desktop-layout">
                                <div className="CheckoutCartReview">
                                    <CheckoutCartReview
                                        checkoutItems={checkoutItems}
                                        setCheckoutItems={setCheckoutItems}
                                        checkoutType={checkoutType}
                                        setCheckoutType={setCheckoutType}
                                        onProceedToShipping={handleProceedToShipping}
                                    />
                                </div>

                                <div className="desktop-CheckoutShipping-CheckoutPayment">

                                    <div className="CheckoutShipping">
                                        <CheckoutShipping
                                            checkoutItems={checkoutItems}
                                            formData={formData}
                                            setFormData={setFormData}
                                            errors={errors}
                                            setErrors={setErrors}
                                            onProceedToPayment={handleProceedToPayment}
                                        />
                                    </div>

                                    {shippingValidated && (
                                        <div className="CheckoutPayment">
                                            <CheckoutPayment
                                                checkoutItems={checkoutItems}
                                                formData={formData}
                                                setFormData={setFormData}
                                                errors={errors}
                                                setErrors={setErrors}
                                                isProcessing={isProcessing}
                                                setIsProcessing={setIsProcessing}
                                                onOrderComplete={handleOrderComplete}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ====================================
                                   ⭐ MOBILE — ONE BY ONE SCREENS
                                   ==================================== */}
                                <div className="checkout-MOBILE-layout">
                                    {currentStep === 1 && (
                                        <div className="MOBILECheckoutCartReview">
                                            <CheckoutCartReview
                                                checkoutItems={checkoutItems}
                                                setCheckoutItems={setCheckoutItems}
                                                checkoutType={checkoutType}
                                                setCheckoutType={setCheckoutType}
                                                onProceedToShipping={handleProceedToShipping}
                                            />
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="MOBILECheckoutShipping">
                                            <CheckoutShipping
                                                checkoutItems={checkoutItems}
                                                formData={formData}
                                                setFormData={setFormData}
                                                errors={errors}
                                                setErrors={setErrors}
                                                onProceedToPayment={handleProceedToPayment}
                                            />
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="MOBILECheckoutPayment">
                                            <CheckoutPayment
                                                checkoutItems={checkoutItems}
                                                formData={formData}
                                                setFormData={setFormData}
                                                errors={errors}
                                                setErrors={setErrors}
                                                isProcessing={isProcessing}
                                                setIsProcessing={setIsProcessing}
                                                onOrderComplete={handleOrderComplete}
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </>
    );
};

export default Checkout;
