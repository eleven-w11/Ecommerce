// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const ChatModel = require("../models/Message");

// GET chat history for logged-in user
router.get("/chat/history/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const messages = await ChatModel.find({
            $or: [
                { fromUserId: userId },
                { toUserId: userId, fromAdmin: true }
            ]
        }).sort({ timestamp: 1 });

        res.json({ success: true, messages });
    } catch (err) {
        console.error("❌ Error fetching chat history:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
