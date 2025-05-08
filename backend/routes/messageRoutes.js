const express = require("express");
const router = express.Router();
const Message = require('../models/Message');

// REST API routes only (Socket.IO logic moved to server.js)
router.get("/", async (req, res) => {
    try {
        const messages = await Message.find().populate("senderId", "name");
        const formattedMessages = messages.map(msg => ({
            sender: msg.senderId.name,
            text: msg.message,
            timestamp: msg.createdAt
        }));
        res.json(formattedMessages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
});

module.exports = router;