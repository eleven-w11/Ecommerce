require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);

// Models
const Message = require("./models/Message");
const Chat = require("./models/Chat");
const User = require("./models/StoreUser");

// ✅ Allowed origins
const allowedOrigins = [
    "https://ecommerce-vu3m.onrender.com",
    "http://localhost:3000",
    "https://aaa48806-5355-4f41-a0f0-54d03ee1a5a4.preview.emergentagent.com",
    process.env.APP_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
            callback(null, true);
        } else {
            console.log("Origin received:", origin);
            callback(null, true); // Allow all for development
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Socket.IO Setup - using /api/socket.io path for Kubernetes ingress compatibility
const io = new Server(server, {
    path: '/api/socket.io/',
    cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    },
    transports: ['websocket', 'polling']
});

// Online users tracking
const onlineUsers = new Map(); // Map<userId, Set<socketId>>
const socketToUser = new Map(); // Map<socketId, userId>

// Get admin ID
const getAdminId = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const admin = await User.findOne({ email: adminEmail });
    return admin ? admin._id.toString() : null;
};

// Socket.IO Events
io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // User registers with their ID
    socket.on("register", async ({ userId, token }) => {
        try {
            // Verify token
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.userId !== userId) {
                    console.log("❌ Token mismatch");
                    return;
                }
            }

            // Add to online users
            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }
            onlineUsers.get(userId).add(socket.id);
            socketToUser.set(socket.id, userId);

            // Join personal room
            socket.join(userId);
            console.log(`🔐 User ${userId} registered with socket ${socket.id}`);

            // Broadcast online status
            io.emit("userOnline", { userId, online: true });

            // Send online users list to the newly connected user
            const onlineUserIds = Array.from(onlineUsers.keys());
            socket.emit("onlineUsers", onlineUserIds);

            // Mark pending messages as delivered
            const adminId = await getAdminId();
            if (adminId) {
                await Message.updateMany(
                    { receiverId: userId, status: "sent" },
                    { status: "delivered" }
                );
                
                // Notify senders about delivery
                const pendingMessages = await Message.find({
                    receiverId: userId,
                    senderId: adminId
                }).select("_id senderId");
                
                pendingMessages.forEach(msg => {
                    io.to(msg.senderId.toString()).emit("messageDelivered", { messageId: msg._id });
                });
            }
        } catch (error) {
            console.error("❌ Register error:", error);
        }
    });

    // Send message
    socket.on("sendMessage", async (data) => {
        try {
            const { senderId, receiverId, message, messageType, fileUrl, fileName, tempId } = data;

            // Create message in database
            const newMessage = await Message.create({
                senderId,
                receiverId,
                message: message || "",
                messageType: messageType || "text",
                fileUrl,
                fileName,
                status: onlineUsers.has(receiverId) ? "delivered" : "sent"
            });

            // Update chat
            let chat = await Chat.findOne({
                participants: { $all: [senderId, receiverId] }
            });

            if (!chat) {
                chat = await Chat.create({
                    participants: [senderId, receiverId],
                    unreadCount: new Map()
                });
            }

            const unreadCount = chat.unreadCount || new Map();
            const currentCount = unreadCount.get(receiverId) || 0;
            unreadCount.set(receiverId, currentCount + 1);

            await Chat.findByIdAndUpdate(chat._id, {
                lastMessage: newMessage._id,
                lastMessageTime: new Date(),
                unreadCount
            });

            // Populate message
            const populatedMessage = await Message.findById(newMessage._id)
                .populate("senderId", "name email image")
                .populate("receiverId", "name email image");

            const messageResponse = {
                ...populatedMessage.toObject(),
                _id: populatedMessage._id.toString(),
                tempId
            };

            // Send to receiver
            io.to(receiverId).emit("newMessage", messageResponse);
            
            // Confirm to sender
            socket.emit("messageSent", messageResponse);

            console.log(`📨 Message from ${senderId} to ${receiverId}`);
        } catch (error) {
            console.error("❌ sendMessage error:", error);
            socket.emit("messageError", { error: error.message });
        }
    });

    // Typing indicator
    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
        io.to(receiverId).emit("userTyping", { userId: senderId, isTyping });
    });

    // Mark messages as seen
    socket.on("markSeen", async ({ senderId, receiverId }) => {
        try {
            const result = await Message.updateMany(
                {
                    senderId,
                    receiverId,
                    status: { $in: ["sent", "delivered"] }
                },
                { status: "seen" }
            );

            if (result.modifiedCount > 0) {
                // Notify sender that messages were seen
                io.to(senderId).emit("messagesSeen", { by: receiverId });

                // Update unread count
                await Chat.updateOne(
                    { participants: { $all: [senderId, receiverId] } },
                    { $set: { [`unreadCount.${receiverId}`]: 0 } }
                );
            }
        } catch (error) {
            console.error("❌ markSeen error:", error);
        }
    });

    // Notify about new message (for file uploads - no duplicate creation)
    socket.on("notifyNewMessage", async ({ messageId, receiverId }) => {
        try {
            const message = await Message.findById(messageId)
                .populate("senderId", "name email image")
                .populate("receiverId", "name email image");
            
            if (message) {
                io.to(receiverId).emit("newMessage", message);
            }
        } catch (error) {
            console.error("❌ notifyNewMessage error:", error);
        }
    });

    // Get online status
    socket.on("checkOnline", ({ userIds }) => {
        const statuses = {};
        userIds.forEach(userId => {
            statuses[userId] = onlineUsers.has(userId);
        });
        socket.emit("onlineStatuses", statuses);
    });

    // Disconnect
    socket.on("disconnect", () => {
        const userId = socketToUser.get(socket.id);
        if (userId) {
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    // Broadcast offline status
                    io.emit("userOnline", { userId, online: false });
                }
            }
            socketToUser.delete(socket.id);
        }
        console.log("🔴 Client disconnected:", socket.id);
    });
});

// 🛣️ Route imports
const signupRoutes = require("./routes/SignUpRoutes");
const signinRoutes = require("./routes/signinRoutes");
const signOutRoutes = require("./routes/signoutRoutes");
const userRoutes = require("./routes/UserProRoutes");
const verifyTokenRoutes = require("./middleware/verifyToken");
const verifyPathRoutes = require("./middleware/verifyPath");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const GoogleRoutes = require("./routes/GoogleRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/api", signupRoutes);
app.use("/api", signinRoutes);
app.use("/api", signOutRoutes);
app.use("/api/user", userRoutes);
app.use("/api/verifytoken", verifyTokenRoutes);
app.use("/api/protected", verifyPathRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", verifyRoutes);
app.use("/api", GoogleRoutes);
app.use("/api/chat", chatRoutes);

// Static files for uploads
app.use("/api/chat/uploads", express.static(path.join(__dirname, "uploads/chat")));

app.use(express.static(path.join(__dirname, "../build")));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// ✅ Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Global error:", err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
