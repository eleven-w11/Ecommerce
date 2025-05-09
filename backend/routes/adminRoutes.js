const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chat = require('../models/Message');
const mongoose = require('mongoose');

// In your backend routes (e.g., chatRoutes.js)
router.get('/chat/:userId', async (req, res) => {
    const userId = req.params.userId;
    const adminId = "ADMIN_ID_HERE"; // Replace with actual admin ID (maybe from req.user?)

    try {
        const messages = await Chat.find({
            $or: [
                { senderId: userId, receiverId: adminId },
                { senderId: adminId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch messages' });
    }
});

module.exports = router;
