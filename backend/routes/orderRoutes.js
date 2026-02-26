const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const User = require("../models/StoreUser");
const VisitorStats = require("../models/VisitorStats");

// Helper to get today's date
const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

// Helper to record order stat
const recordOrderStat = async () => {
    try {
        const today = getTodayDate();
        const currentHour = new Date().getHours();

        let stats = await VisitorStats.findOne({ date: today });

        if (!stats) {
            stats = new VisitorStats({
                date: today,
                totalVisitors: 0,
                uniqueVisitors: [],
                ordersReceived: 0,
                peakVisitors: 0,
                hourlyStats: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    visitors: 0,
                    orders: 0
                }))
            });
        }

        stats.ordersReceived += 1;

        const hourIndex = stats.hourlyStats.findIndex(h => h.hour === currentHour);
        if (hourIndex !== -1) {
            stats.hourlyStats[hourIndex].orders += 1;
        }

        await stats.save();
    } catch (error) {
        console.error("Error recording order stat:", error);
    }
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// Create new order
router.post("/create", verifyToken, async (req, res) => {
    try {
        const { 
            items, 
            shippingAddress, 
            paymentMethod, 
            paymentDetails,
            subtotal, 
            shippingCost, 
            discount,
            totalAmount, 
            checkoutType,
            notes 
        } = req.body;

        // Validate required fields
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "No items in order" });
        }

        if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.address) {
            return res.status(400).json({ success: false, message: "Shipping address is required" });
        }

        if (!paymentMethod) {
            return res.status(400).json({ success: false, message: "Payment method is required" });
        }

        // Generate unique order ID
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Format items for database
        const orderItems = items.map(item => ({
            productId: item.id || item.productId || item._id,
            productName: item.productName || item.product_name,
            price: item.price,
            originalPrice: item.originalPrice || item.price,
            quantity: item.quantity,
            color: item.color || null,
            size: item.size || null,
            image: item.image
        }));

        // Create order
        const newOrder = new Order({
            orderId,
            userId: req.userId,
            items: orderItems,
            shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                address: shippingAddress.address,
                apartment: shippingAddress.apartment,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country || "Pakistan"
            },
            paymentMethod,
            paymentDetails: paymentDetails || {},
            subtotal: subtotal || totalAmount,
            shippingCost: shippingCost || 0,
            discount: discount || 0,
            totalAmount,
            checkoutType: checkoutType || "single",
            notes: notes || "",
            status: "pending"
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: {
                orderId: newOrder.orderId,
                _id: newOrder._id.toString(),
                totalAmount: newOrder.totalAmount,
                status: newOrder.status,
                createdAt: newOrder.createdAt
            }
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create order", 
            error: error.message 
        });
    }
});

// Get user's orders
router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({
            success: true,
            orders: orders.map(order => ({
                ...order.toObject(),
                _id: order._id.toString()
            }))
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
});

// Get single order by orderId
router.get("/:orderId", verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({ 
            orderId: req.params.orderId,
            userId: req.userId 
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            order: {
                ...order.toObject(),
                _id: order._id.toString()
            }
        });

    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ success: false, message: "Failed to fetch order" });
    }
});

module.exports = router;
