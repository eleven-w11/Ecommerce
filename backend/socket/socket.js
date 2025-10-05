const { Server } = require("socket.io");
const Message = require("../models/Message");
const User = require("../models/StoreUser");

const initSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🟢 New client connected:", socket.id);

        socket.on("register", ({ userId }) => {
            socket.join(userId);
            console.log(`🔐 Socket ${socket.id} joined room ${userId}`);
        });

        // ✅ Admin fetches users with last message
        socket.on("getUsers", async () => {
            try {
                const users = await User.find({}, "name image");
                const usersWithLastMessage = [];

                for (const user of users) {
                    const lastMsg = await Message.findOne({
                        $or: [
                            { fromUserId: user._id },
                            { toUserId: user._id }
                        ]
                    }).sort({ timestamp: -1 });

                    if (!lastMsg) continue; // 🚫 skip if no messages

                    usersWithLastMessage.push({
                        _id: user._id,
                        name: user.name,
                        image: user.image,
                        lastMessage: lastMsg.message,
                        lastMessageTime: lastMsg.timestamp,
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

        // ✅ User sends message
        socket.on("userMessage", async ({ fromUserId, message, timestamp }) => {
            try {
                const saved = await Message.create({
                    fromUserId,
                    toUserId: process.env.ADMIN_ID || "681edcb10cadbac1be3540aa", // ✅ admin ko jaa rahi hai
                    senderRole: "user",
                    message,
                    timestamp: timestamp || new Date(),
                });

                const response = saved.toObject();

                // Add user info for frontend
                const user = await User.findById(fromUserId).select("name image");
                response.user = user ? {
                    name: user.name,
                    image: user.image
                } : {
                    name: "New User",
                    image: null
                };

                console.log("📥 User message saved:", response);

                // Send to admin
                io.to(process.env.ADMIN_ID || "681edcb10cadbac1be3540aa").emit("receiveMessage", response);
            } catch (err) {
                console.error("❌ userMessage error:", err);
            }
        });

        // ✅ Admin sends message
        socket.on("adminMessage", async ({ toUserId, message, timestamp }) => {
            try {
                const adminId = process.env.ADMIN_ID || "681edcb10cadbac1be3540aa";

                const saved = await Message.create({
                    fromUserId: adminId,
                    toUserId,
                    senderRole: "admin",
                    message,
                    timestamp: timestamp || new Date(),
                });

                const response = saved.toObject();
                console.log("📤 Admin message saved:", response);

                // Send to that user
                io.to(toUserId).emit("receiveMessage", response);
            } catch (err) {
                console.error("❌ adminMessage error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });
};

module.exports = initSocket;