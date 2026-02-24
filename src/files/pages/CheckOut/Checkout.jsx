import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/CheckOut/Checkout.css";
import CheckoutCartReview from "./CheckoutCartReview";
import CheckoutShipping from "./CheckoutShipping";
import CheckoutPayment from "./CheckoutPayment";
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
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const order = {
                orderId: `ORD-${Date.now()}`,
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

            const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
            localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));

            localStorage.removeItem("checkoutItem");
            localStorage.removeItem("checkoutData");
            if (checkoutType === "cart") {
                localStorage.removeItem("cart");
                window.dispatchEvent(new Event("cartUpdated"));
            }

            navigate("/order-confirmation", {
                state: { order, orderId: order.orderId }
            });
        } catch (error) {
            console.error("Order processing error:", error);
            alert("There was an error processing your order. Please try again.");
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
