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
const VisitorStats = require("./models/VisitorStats");

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

// Active site visitors tracking (all visitors, not just logged in)
let activeVisitors = new Set(); // Set of socket IDs where page is VISIBLE
let connectedSockets = new Set(); // Set of all connected socket IDs

// Heartbeat tracking - to detect browser close without proper disconnect
const lastHeartbeat = new Map(); // Map<socketId, timestamp>
const HEARTBEAT_TIMEOUT = 10000; // 10 seconds - if no heartbeat, consider inactive

// Helper function to get today's date
const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

// Helper function to record visitor stat
const recordVisitorStat = async (socketId) => {
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

        // Increment total visitors
        stats.totalVisitors += 1;

        // Add unique visitor
        if (socketId && !stats.uniqueVisitors.includes(socketId)) {
            stats.uniqueVisitors.push(socketId);
        }

        // Update hourly stats
        const hourIndex = stats.hourlyStats.findIndex(h => h.hour === currentHour);
        if (hourIndex !== -1) {
            stats.hourlyStats[hourIndex].visitors += 1;
        }

        await stats.save();
    } catch (error) {
        console.error("Error recording visitor stat:", error);
    }
};

// Helper function to update peak visitors
const updatePeakVisitors = async (count) => {
    try {
        const today = getTodayDate();
        await VisitorStats.findOneAndUpdate(
            { date: today },
            { $max: { peakVisitors: count } },
            { upsert: true, setDefaultsOnInsert: true }
        );
    } catch (error) {
        console.error("Error updating peak visitors:", error);
    }
};

// Cleanup stale connections every 5 seconds
setInterval(() => {
    const now = Date.now();
    let removed = false;
    
    lastHeartbeat.forEach((timestamp, socketId) => {
        if (now - timestamp > HEARTBEAT_TIMEOUT) {
            // No heartbeat received, remove from active visitors
            activeVisitors.delete(socketId);
            lastHeartbeat.delete(socketId);
            removed = true;
            console.log(`⏰ Heartbeat timeout for socket ${socketId}`);
        }
    });
    
    if (removed) {
        io.emit("visitorCount", { count: activeVisitors.size });
    }
}, 5000);

// Get admin ID
const getAdminId = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const admin = await User.findOne({ email: adminEmail });
    return admin ? admin._id.toString() : null;
};

// Socket.IO Events
io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);
    
    // Track connected socket (but not active yet until visibility confirmed)
    connectedSockets.add(socket.id);
    
    // Initialize heartbeat
    lastHeartbeat.set(socket.id, Date.now());

    // Handle visibility change from client
    socket.on("visibilityChange", ({ isVisible }) => {
        if (isVisible) {
            activeVisitors.add(socket.id);
            lastHeartbeat.set(socket.id, Date.now());
            console.log(`👁️ Socket ${socket.id} is now VISIBLE`);
        } else {
            activeVisitors.delete(socket.id);
            console.log(`👁️ Socket ${socket.id} is now HIDDEN`);
        }
        // Broadcast updated count
        io.emit("visitorCount", { count: activeVisitors.size });
    });

    // Heartbeat to detect browser close
    socket.on("heartbeat", () => {
        lastHeartbeat.set(socket.id, Date.now());
        // If page is visible, ensure they're in active visitors
        if (!activeVisitors.has(socket.id)) {
            // They might have sent heartbeat before visibility event
            // Don't add automatically - wait for explicit visibilityChange
        }
    });

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

            // Mark pending messages as delivered and notify senders
            const pendingMessages = await Message.find({
                receiverId: userId,
                status: "sent"
            }).select("_id senderId");

            if (pendingMessages.length > 0) {
                // Update all to delivered
                await Message.updateMany(
                    { receiverId: userId, status: "sent" },
                    { status: "delivered" }
                );

                // Notify each sender about delivery
                const senderIds = [...new Set(pendingMessages.map(m => m.senderId.toString()))];
                senderIds.forEach(senderId => {
                    const messageIds = pendingMessages
                        .filter(m => m.senderId.toString() === senderId)
                        .map(m => m._id.toString());
                    io.to(senderId).emit("messagesDelivered", {
                        messageIds,
                        recipientId: userId
                    });
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

            // Create message in database - always start with "sent" status
            const newMessage = await Message.create({
                senderId,
                receiverId,
                message: message || "",
                messageType: messageType || "text",
                fileUrl,
                fileName,
                status: "sent"  // Always start as sent
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

            // Confirm to sender first (with "sent" status)
            socket.emit("messageSent", messageResponse);

            // If receiver is online, send message and mark as delivered
            if (onlineUsers.has(receiverId)) {
                // Send to receiver
                io.to(receiverId).emit("newMessage", messageResponse);

                // Update status to delivered in DB
                await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });

                // Notify sender that message was delivered
                socket.emit("messageDelivered", {
                    messageId: newMessage._id.toString(),
                    tempId
                });
            }

            console.log(`📨 Message from ${senderId} to ${receiverId}, receiver online: ${onlineUsers.has(receiverId)}`);
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

    // Get current visitor count (for admin panel)
    socket.on("getVisitorCount", () => {
        socket.emit("visitorCount", { count: activeVisitors.size });
    });

    // Disconnect
    socket.on("disconnect", () => {
        // Remove from all tracking sets
        activeVisitors.delete(socket.id);
        connectedSockets.delete(socket.id);
        lastHeartbeat.delete(socket.id);
        
        // Broadcast updated visitor count
        io.emit("visitorCount", { count: activeVisitors.size });
        
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
const orderRoutes = require("./routes/orderRoutes");

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
app.use("/api/orders", orderRoutes);

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