const express = require("express");
const router = express.Router();
const ChatModel = require("../models/Message");
const User = require("../models/StoreUser");

// Get all chats (unique users who messaged)
router.get("/all-chats", async (req, res) => {
    try {
        const messages = await ChatModel.find();

        // Extract unique user IDs (ignore admin IDs)
        const userIds = [
            ...new Set(
                messages
                    .filter(msg => msg.senderRole === "user") // sirf users ke messages
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

// GET chat by user ID (both user and admin messages)
router.get("/chat/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const messages = await ChatModel.find({
            $or: [
                { fromUserId: userId },      // user ke messages
                { toUserId: userId }         // admin ke messages
            ]
        }).sort({ timestamp: 1 });

        res.json({ success: true, messages });
    } catch (err) {
        console.error("❌ Error fetching chat for user:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Admin sends a message to a user
// Admin sends a message to a user
router.post("/chat/reply", async (req, res) => {
    try {
        const { toUserId, message } = req.body;

        if (!toUserId || !message) {
            return res.status(400).json({ success: false, message: "User ID and message are required." });
        }

        // yahan admin ka ek fixed ID ya env variable use kar lo
        const adminId = process.env.ADMIN_ID || "681edcb10cadbac1be3540aa";

        const newMessage = new ChatModel({
            fromUserId: adminId,   // ✅ required
            toUserId,
            senderRole: "admin",   // ✅ required
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