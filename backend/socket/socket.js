const { Server } = require("socket.io");
const Message = require("../models/Message");
const User = require("../models/StoreUser");

// Track online users: { oduserId: socketId }
const onlineUsers = new Map();

const initSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        },
    });

    io.on("connection", (socket) => {
        console.log("🟢 New client connected:", socket.id);

        // ✅ Register user or admin
        socket.on("register", ({ userId, role }) => {
            socket.userId = userId;
            socket.userRole = role;
            socket.join(userId);
            
            // Track online status
            onlineUsers.set(userId, { socketId: socket.id, role });
            
            // Broadcast online status to all clients
            io.emit("userOnline", { userId, role });
            
            console.log(`🔐 ${role} (${userId}) connected with socket ID ${socket.id}`);
        });

        // ✅ Check if admin is online (for user chat page)
        socket.on("getAdminStatus", () => {
            let adminOnline = false;
            for (const [uid, data] of onlineUsers) {
                if (data.role === "admin") {
                    adminOnline = true;
                    break;
                }
            }
            socket.emit("adminStatus", { isOnline: adminOnline });
        });

        // ✅ Check if a specific user is online
        socket.on("checkUserOnline", (userId) => {
            const isOnline = onlineUsers.has(userId);
            socket.emit("userOnlineStatus", { userId, isOnline });
        });

        // ✅ Admin fetch users with last message
        socket.on("getUsers", async () => {
            try {
                const users = await User.find({}, "name image");
                const usersWithLastMessage = [];

                for (const user of users) {
                    const lastMsg = await Message.findOne({
                        $or: [{ fromUserId: user._id }, { toUserId: user._id }],
                    }).sort({ timestamp: -1 });

                    if (!lastMsg) continue;

                    usersWithLastMessage.push({
                        _id: user._id,
                        name: user.name,
                        image: user.image,
                        lastMessage: lastMsg.message,
                        lastMessageTime: lastMsg.timestamp,
                        isOnline: onlineUsers.has(user._id.toString()),
                    });
                }

                usersWithLastMessage.sort((a, b) => {
                    const dateA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                    const dateB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                    return dateB - dateA;
                });

                socket.emit("usersList", usersWithLastMessage);
            } catch (err) {
                console.error("❌ Error in getUsers:", err.message);
            }
        });

        // ✅ When user sends message to admin
        socket.on("userMessage", async ({ fromUserId, message, timestamp }) => {
            try {
                const adminId = process.env.ADMIN_ID || "681edcb10cadbac1be3540aa";

                const saved = await Message.create({
                    fromUserId,
                    toUserId: adminId,
                    senderRole: "user",
                    message,
                    status: "sent",
                    timestamp: timestamp || new Date(),
                });

                const response = saved.toObject();
                const user = await User.findById(fromUserId).select("name image");
                response.user = user
                    ? { name: user.name, image: user.image }
                    : { name: "New User", image: null };

                // ✅ Acknowledge message sent (single tick)
                socket.emit("messageSentAck", saved._id);

                // 🔎 Send message to admin if connected
                const adminSocket = Array.from(io.sockets.sockets.values()).find(
                    (s) => s.userRole === "admin"
                );

                if (adminSocket) {
                    io.to(adminSocket.userId).emit("receiveMessage", response);

                    // ✅ Update status → delivered
                    await Message.findByIdAndUpdate(saved._id, { status: "delivered" });
                    io.to(fromUserId).emit("messageDelivered", saved._id);
                    console.log("📤 Message delivered to admin");
                } else {
                    console.log("⚠️ No admin connected");
                }
            } catch (err) {
                console.error("❌ userMessage error:", err);
            }
        });

        // ✅ When admin sends message to user
        socket.on("adminMessage", async ({ toUserId, message, timestamp }) => {
            try {
                const adminId = socket.userId || process.env.ADMIN_ID || "681edcb10cadbac1be3540aa";

                const saved = await Message.create({
                    fromUserId: adminId,
                    toUserId,
                    senderRole: "admin",
                    message,
                    status: "sent",
                    timestamp: timestamp || new Date(),
                });

                const response = saved.toObject();

                // ✅ Admin gets confirmation (single tick)
                socket.emit("messageSentAck", saved._id);

                // 📤 Send to user if connected
                const userSocket = Array.from(io.sockets.sockets.values()).find(
                    (s) => s.userId === toUserId
                );

                if (userSocket) {
                    io.to(toUserId).emit("receiveMessage", response);

                    // ✅ Mark as delivered
                    await Message.findByIdAndUpdate(saved._id, { status: "delivered" });
                    io.to(adminId).emit("messageDelivered", saved._id);
                    console.log("📤 Message delivered to user:", toUserId);
                } else {
                    console.log("⚠️ User not online:", toUserId);
                }
            } catch (err) {
                console.error("❌ adminMessage error:", err);
            }
        });

        // ✅ When message delivered acknowledgment received from client
        socket.on("deliveredAck", async (msgId) => {
            try {
                await Message.findByIdAndUpdate(msgId, { status: "delivered" });
                io.emit("messageDelivered", msgId);
                console.log("📬 Delivered acknowledgment:", msgId);
            } catch (err) {
                console.error("❌ deliveredAck error:", err);
            }
        });

        // ✅ When message seen acknowledgment received from client
        socket.on("seenAck", async (msgId) => {
            try {
                await Message.findByIdAndUpdate(msgId, { status: "seen" });
                io.emit("messageSeen", msgId);
                console.log("👁️ Seen acknowledgment:", msgId);
            } catch (err) {
                console.error("❌ seenAck error:", err);
            }
        });

        socket.on("disconnect", () => {
            const userId = socket.userId;
            const role = socket.userRole;
            
            // Remove from online users
            if (userId) {
                onlineUsers.delete(userId);
                // Broadcast offline status
                io.emit("userOffline", { userId, role });
            }
            
            console.log(`🔴 ${role || "Unknown"} disconnected: ${socket.id}`);
        });
    });
};

module.exports = initSocket;
