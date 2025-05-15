const express = require("express");
const router = express.Router();
const ChatModel = require("../models/Message");
const User = require("../models/StoreUser");

router.get("/all-chats", async (req, res) => {
    try {
        const messages = await ChatModel.find();
        const userIds = [...new Set(messages.map(msg => msg.fromUserId).filter(Boolean))];

        const users = await User.find({ _id: { $in: userIds } })
            .select("_id name email image");

        res.json({ success: true, users });
    } catch (err) {
        console.error("❌ Error fetching all chats:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// GET chat by user ID
// router.get("/chat/:userId", async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const messages = await ChatModel.find({ fromUserId: userId }).sort({ timestamp: 1 }); // oldest first
//         res.json({ success: true, messages });
//     } catch (err) {
//         console.error("❌ Error fetching chat for user:", err.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// GET chat by user ID (both user and admin messages)
router.get("/chat/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const messages = await ChatModel.find({
            $or: [
                { fromUserId: userId },                 // messages sent by user
                { toUserId: userId, fromAdmin: true }   // messages sent by admin to this user
            ]
        }).sort({ timestamp: 1 }); // oldest first

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

        const newMessage = new ChatModel({
            fromAdmin: true,
            toUserId,
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
