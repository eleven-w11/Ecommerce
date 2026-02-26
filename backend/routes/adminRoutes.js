const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ChatModel = require("../models/Message");
const User = require("../models/StoreUser");
const Order = require("../models/Order");
const Product = require("../models/Product");
const VisitorStats = require("../models/VisitorStats");

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || user.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        req.userId = decoded.userId;
        req.isAdmin = true;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// ==================== USERS ====================

// Get all users with login history
router.get("/users", verifyAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select("name email image loginHistory googleId createdAt")
            .sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            users: users.map(user => ({
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image,
                loginHistory: user.loginHistory || [],
                isGoogleUser: !!user.googleId,
                createdAt: user.createdAt
            }))
        });
    } catch (err) {
        console.error("❌ Error fetching users:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get single user details
router.get("/users/:id", verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ 
            success: true, 
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image,
                loginHistory: user.loginHistory || [],
                isGoogleUser: !!user.googleId,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error("❌ Error fetching user:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== ORDERS ====================

// Get all orders with user details
router.get("/orders", verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name email image")
            .sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            orders: orders.map(order => ({
                ...order.toObject(),
                _id: order._id.toString(),
                userId: order.userId ? {
                    _id: order.userId._id.toString(),
                    name: order.userId.name,
                    email: order.userId.email,
                    image: order.userId.image
                } : null
            }))
        });
    } catch (err) {
        console.error("❌ Error fetching orders:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update order status
router.put("/orders/:orderId/status", verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error("❌ Error updating order:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== PRODUCTS ====================

// Get all products
router.get("/products", verifyAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 });
        res.json({ 
            success: true, 
            products: products.map(p => ({
                ...p.toObject(),
                _id: p._id.toString()
            }))
        });
    } catch (err) {
        console.error("❌ Error fetching products:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Add new product
router.post("/products", verifyAdmin, async (req, res) => {
    try {
        const { product_name, product_price, dis_product_price, p_type, p_des, product_details, images } = req.body;

        if (!product_name || !product_price) {
            return res.status(400).json({ success: false, message: "Product name and price are required" });
        }

        const productId = `P-${Date.now()}`;

        const newProduct = new Product({
            id: productId,
            product_name,
            product_price,
            dis_product_price: dis_product_price || product_price,
            p_type: p_type || "general",
            p_des: p_des || "",
            product_details: product_details || [],
            images: images || []
        });

        await newProduct.save();

        res.status(201).json({ 
            success: true, 
            message: "Product created successfully",
            product: {
                ...newProduct.toObject(),
                _id: newProduct._id.toString()
            }
        });
    } catch (err) {
        console.error("❌ Error creating product:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update product
router.put("/products/:id", verifyAdmin, async (req, res) => {
    try {
        const { product_name, product_price, dis_product_price, p_type, p_des, product_details, images } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                product_name,
                product_price,
                dis_product_price,
                p_type,
                p_des,
                product_details,
                images
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ 
            success: true, 
            message: "Product updated successfully",
            product: {
                ...product.toObject(),
                _id: product._id.toString()
            }
        });
    } catch (err) {
        console.error("❌ Error updating product:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Delete product
router.delete("/products/:id", verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting product:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== VISITOR STATS ====================

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

// Record visitor (called from socket events)
router.post("/visitor/record", async (req, res) => {
    try {
        const { visitorId } = req.body;
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

        // Increment total visitors
        stats.totalVisitors += 1;

        // Add unique visitor if not already present
        if (visitorId && !stats.uniqueVisitors.includes(visitorId)) {
            stats.uniqueVisitors.push(visitorId);
        }

        // Update hourly stats
        const hourIndex = stats.hourlyStats.findIndex(h => h.hour === currentHour);
        if (hourIndex !== -1) {
            stats.hourlyStats[hourIndex].visitors += 1;
        }

        await stats.save();

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error recording visitor:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update peak visitors
router.post("/visitor/peak", async (req, res) => {
    try {
        const { count } = req.body;
        const today = getTodayDate();

        await VisitorStats.findOneAndUpdate(
            { date: today },
            { $max: { peakVisitors: count } },
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error updating peak:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Increment order count
router.post("/visitor/order", async (req, res) => {
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

        // Update hourly stats
        const hourIndex = stats.hourlyStats.findIndex(h => h.hour === currentHour);
        if (hourIndex !== -1) {
            stats.hourlyStats[hourIndex].orders += 1;
        }

        await stats.save();

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error recording order:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get visitor stats (today + history)
router.get("/visitor-stats", verifyAdmin, async (req, res) => {
    try {
        const today = getTodayDate();
        
        // Get today's stats
        let todayStats = await VisitorStats.findOne({ date: today });
        
        if (!todayStats) {
            todayStats = {
                date: today,
                totalVisitors: 0,
                uniqueVisitors: [],
                ordersReceived: 0,
                peakVisitors: 0,
                hourlyStats: []
            };
        }

        // Get historical stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];

        const historicalStats = await VisitorStats.find({
            date: { $gte: startDate, $lt: today }
        }).sort({ date: -1 });

        // Calculate totals
        const allTimeStats = await VisitorStats.aggregate([
            {
                $group: {
                    _id: null,
                    totalVisitors: { $sum: "$totalVisitors" },
                    totalOrders: { $sum: "$ordersReceived" },
                    totalUniqueVisitors: { $sum: { $size: "$uniqueVisitors" } },
                    maxPeakVisitors: { $max: "$peakVisitors" }
                }
            }
        ]);

        res.json({ 
            success: true,
            today: {
                date: todayStats.date,
                totalVisitors: todayStats.totalVisitors,
                uniqueVisitors: todayStats.uniqueVisitors?.length || 0,
                ordersReceived: todayStats.ordersReceived,
                peakVisitors: todayStats.peakVisitors,
                hourlyStats: todayStats.hourlyStats || []
            },
            history: historicalStats.map(stat => ({
                date: stat.date,
                totalVisitors: stat.totalVisitors,
                uniqueVisitors: stat.uniqueVisitors?.length || 0,
                ordersReceived: stat.ordersReceived,
                peakVisitors: stat.peakVisitors
            })),
            allTime: allTimeStats[0] || {
                totalVisitors: 0,
                totalOrders: 0,
                totalUniqueVisitors: 0,
                maxPeakVisitors: 0
            }
        });
    } catch (err) {
        console.error("❌ Error fetching visitor stats:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== EXISTING CHAT ROUTES ====================

// Get all chats (unique users who messaged)
router.get("/all-chats", async (req, res) => {
    try {
        const messages = await ChatModel.find();

        const userIds = [
            ...new Set(
                messages
                    .filter(msg => msg.senderRole === "user")
                    .map(msg => msg.fromUserId?.toString())
                    .filter(Boolean)
            )
        ];

        const users = await User.find({ _id: { $in: userIds } })
            .select("_id name email image");

        res.json({ success: true, users });
    } catch (err) {
        console.error("❌ Error fetching all chats:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get user by ID
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("_id name image");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("❌ Error fetching user by ID:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// GET chat by user ID
router.get("/chat/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const messages = await ChatModel.find({
            $or: [
                { fromUserId: userId },
                { toUserId: userId }
            ]
        }).sort({ timestamp: 1 });

        res.json({ success: true, messages });
    } catch (err) {
        console.error("❌ Error fetching chat for user:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Admin sends a message to a user
router.post("/chat/reply", async (req, res) => {
    try {
        const { toUserId, message } = req.body;

        if (!toUserId || !message) {
            return res.status(400).json({ success: false, message: "User ID and message are required." });
        }

        const adminId = process.env.ADMIN_ID || "681edcb10cadbac1be3540aa";

        const newMessage = new ChatModel({
            fromUserId: adminId,
            toUserId,
            senderRole: "admin",
            message,
            timestamp: new Date(),
        });

        await newMessage.save();

        res.json({ success: true, message: "Message sent successfully." });
    } catch (err) {
        console.error("❌ Error sending admin message:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
