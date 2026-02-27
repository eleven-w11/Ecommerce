import { useState, useEffect } from "react";
import "../../styles/CheckOut/CheckoutShipping.css";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const CheckoutShipping = ({
    checkoutItems,
    formData,
    setFormData,
    errors,
    setErrors,
    onProceedToPayment
}) => {

    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 600);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 600);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // BUTTON VISIBILITY + LOADER STATUS
    const [buttonHidden, setButtonHidden] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("idle");
    // idle | loading | success | error

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

    const validateShippingForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setButtonHidden(true);
        setLoadingStatus("loading");

        await new Promise(resolve => setTimeout(resolve, 1200)); // loader time

        if (validateShippingForm()) {
            setLoadingStatus("success"); // show tick

            // 1.5 sec tick dikhana → hide → proceed
            setTimeout(() => {
                setLoadingStatus("idle"); // loader hide
                onProceedToPayment();     // go to payment step
            }, 1700);

        } else {
            setLoadingStatus("error");

            setTimeout(() => {
                setButtonHidden(false);
                setLoadingStatus("idle");
            }, 3000);
        }
    };



    const calculateSubtotal = () =>
        checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const calculateTotal = () => calculateSubtotal();

    return (
        <>

            <div className="Shipping-form-container">
                <form
                    onSubmit={handleSubmit}
                    className="modern-form"
                >

                    <div className="checkout-section-heading">
                        <h3>Shipping Information</h3>
                    </div>

                    {loadingStatus !== "idle" && (
                        <div className="Shipping-loader-container">

                            {loadingStatus === "loading" && (
                                <div className="loader">
                                    <span></span><span></span><span></span>
                                </div>
                            )}

                            {loadingStatus === "success" && (
                                <div className="Shipping-loader-success">
                                    {/* <div className="status-icon success">✓</div> */}
                                    <div style={{ width: "100px", height: "100px" }}>
                                        <DotLottieReact
                                            src="https://lottie.host/3ee76484-e611-4959-b5c9-7b941222af2d/wLNSYhX51e.lottie"
                                            loop
                                            autoplay
                                        />
                                    </div>
                                </div>
                            )}

                            {loadingStatus === "error" && (
                                <div style={{ width: "100px", height: "100px" }}>
                                    <DotLottieReact
                                        src="https://lottie.host/01bdcbb3-a41e-4c48-9d97-3eb645f7ccc2/dqSQ8QxaWk.lottie"
                                        autoplay
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- FORM FIELDS --- */}
                    <div className="form-section">

                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={errors.firstName ? "error" : ""}
                                    placeholder="Enter your first name"
                                />
                                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className={errors.lastName ? "error" : ""}
                                    placeholder="Enter your last name"
                                />
                                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? "error" : ""}
                                    placeholder="your@email.com"
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={errors.phone ? "error" : ""}
                                    placeholder="+92 XXX XXXXXX"
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Street Address *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className={errors.address ? "error" : ""}
                                placeholder="House #, Street, Area"
                            />
                            {errors.address && <span className="error-message">{errors.address}</span>}
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className={errors.city ? "error" : ""}
                                    placeholder="Enter your city"
                                />
                                {errors.city && <span className="error-message">{errors.city}</span>}
                            </div>

                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className={errors.state ? "error" : ""}
                                    placeholder="Enter your state"
                                />
                                {errors.state && <span className="error-message">{errors.state}</span>}
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>ZIP Code *</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    className={errors.zipCode ? "error" : ""}
                                    placeholder="XXXXX"
                                />
                                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                            </div>

                            <div className="form-group">
                                <label>Country</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                >
                                    <option value="Pakistan">Pakistan</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    {/* BUTTON */}
                    {!buttonHidden && (
                        <button
                            type="submit"
                            className="place-order-btn modern-btn primary large"
                        >
                            Continue to Payment - ${calculateTotal().toFixed(2)}

                        </button>
                    )}

                </form>

            </div>
        </>
    );
};

export default CheckoutShipping;
