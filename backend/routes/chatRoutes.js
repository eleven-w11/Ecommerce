const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/StoreUser");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "../uploads/chat");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Invalid file type"));
    }
});

// Get admin user ID
const getAdminId = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const admin = await User.findOne({ email: adminEmail });
    return admin ? admin._id : null;
};

// Get or create chat between user and admin
const getOrCreateChat = async (userId, adminId) => {
    let chat = await Chat.findOne({
        participants: { $all: [userId, adminId] }
    });

    if (!chat) {
        chat = await Chat.create({
            participants: [userId, adminId],
            unreadCount: { [userId.toString()]: 0, [adminId.toString()]: 0 }
        });
    }

    return chat;
};

// Send a message
router.post("/send", verifyToken, upload.single("file"), async (req, res) => {
    try {
        const senderId = req.userId;
        const { receiverId, message, messageType = "text" } = req.body;

        if (!receiverId) {
            return res.status(400).json({ success: false, message: "Receiver ID required" });
        }

        const messageData = {
            senderId,
            receiverId,
            message: message || "",
            messageType,
            status: "sent"
        };

        // Handle file upload
        if (req.file) {
            messageData.fileUrl = `/api/chat/uploads/${req.file.filename}`;
            messageData.fileName = req.file.originalname;
            messageData.messageType = req.file.mimetype.startsWith("image/") ? "image" : "file";
        }

        const newMessage = await Message.create(messageData);

        // Update or create chat
        const chat = await getOrCreateChat(senderId, receiverId);
        
        // Update last message and increment unread count
        const unreadCount = chat.unreadCount || new Map();
        const currentCount = unreadCount.get(receiverId.toString()) || 0;
        unreadCount.set(receiverId.toString(), currentCount + 1);

        await Chat.findByIdAndUpdate(chat._id, {
            lastMessage: newMessage._id,
            lastMessageTime: new Date(),
            unreadCount
        });

        // Populate sender info
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "name email image");

        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
    }
});

// Get messages between two users
router.get("/messages/:otherUserId", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { otherUserId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        })
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("senderId", "name email image")
            .populate("receiverId", "name email image");

        res.json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
});

// Get admin ID for user
router.get("/admin", verifyToken, async (req, res) => {
    try {
        const adminId = await getAdminId();
        if (!adminId) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const admin = await User.findById(adminId).select("name email image");
        res.json({ success: true, admin });
    } catch (error) {
        console.error("Error fetching admin:", error);
        res.status(500).json({ success: false, message: "Failed to fetch admin" });
    }
});

// Get all users with chats (for admin)
router.get("/users", verifyToken, async (req, res) => {
    try {
        const adminId = await getAdminId();
        const currentUserId = req.userId;

        // Check if current user is admin
        const currentUser = await User.findById(currentUserId);
        if (currentUser.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        // Get all chats where admin is a participant
        const chats = await Chat.find({
            participants: adminId
        })
            .populate({
                path: "participants",
                select: "name email image"
            })
            .populate({
                path: "lastMessage",
                select: "message messageType createdAt status"
            })
            .sort({ lastMessageTime: -1 });

        // Format response
        const users = chats.map(chat => {
            const otherUser = chat.participants.find(
                p => p._id.toString() !== adminId.toString()
            );
            if (!otherUser) return null;

            return {
                _id: otherUser._id,
                name: otherUser.name,
                email: otherUser.email,
                image: otherUser.image,
                lastMessage: chat.lastMessage,
                lastMessageTime: chat.lastMessageTime,
                unreadCount: chat.unreadCount?.get(adminId.toString()) || 0
            };
        }).filter(Boolean);

        res.json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
});

// Mark messages as delivered
router.put("/delivered/:senderId", verifyToken, async (req, res) => {
    try {
        const receiverId = req.userId;
        const { senderId } = req.params;

        await Message.updateMany(
            {
                senderId,
                receiverId,
                status: "sent"
            },
            { status: "delivered" }
        );

        res.json({ success: true, message: "Messages marked as delivered" });
    } catch (error) {
        console.error("Error marking delivered:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
});

// Mark messages as seen
router.put("/seen/:senderId", verifyToken, async (req, res) => {
    try {
        const receiverId = req.userId;
        const { senderId } = req.params;

        await Message.updateMany(
            {
                senderId,
                receiverId,
                status: { $in: ["sent", "delivered"] }
            },
            { status: "seen" }
        );

        // Reset unread count in chat
        const adminId = await getAdminId();
        await Chat.updateOne(
            { participants: { $all: [senderId, receiverId] } },
            { $set: { [`unreadCount.${receiverId}`]: 0 } }
        );

        res.json({ success: true, message: "Messages marked as seen" });
    } catch (error) {
        console.error("Error marking seen:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
});

// Check if user is admin
router.get("/is-admin", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const isAdmin = user && user.email === process.env.ADMIN_EMAIL;
        res.json({ success: true, isAdmin });
    } catch (error) {
        console.error("Error checking admin:", error);
        res.status(500).json({ success: false, message: "Failed to check admin status" });
    }
});

// Serve uploaded files
router.get("/uploads/:filename", (req, res) => {
    const { filename } = req.params;
    const filepath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).json({ success: false, message: "File not found" });
    }
});

module.exports = router;
