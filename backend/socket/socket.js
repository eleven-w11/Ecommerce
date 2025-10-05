const { Server } = require("socket.io");
const Message = require("../models/Message");
const User = require("../models/StoreUser");

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

        // ✅ Register admin or user
        socket.on("register", ({ userId, role }) => {
            socket.userId = userId;
            socket.userRole = role;
            socket.join(userId);
            console.log(`🔐 ${role} (${userId}) connected with socket ID ${socket.id}`);
        });

        // ✅ Admin fetches all users with last message
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
                    });
                }

                // Sort by recent message
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
                    timestamp: timestamp || new Date(),
                });

                const response = saved.toObject();
                const user = await User.findById(fromUserId).select("name image");
                response.user = user
                    ? { name: user.name, image: user.image }
                    : { name: "New User", image: null };

                console.log("📥 User message saved:", response);

                // 🔎 Send to connected admin
                const adminSocket = Array.from(io.sockets.sockets.values()).find(
                    (s) => s.userRole === "admin"
                );

                if (adminSocket) {
                    io.to(adminSocket.userId).emit("receiveMessage", response);
                    console.log("📤 Message sent to admin");
                } else {
                    console.log("⚠️ No admin currently connected.");
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
                    timestamp: timestamp || new Date(),
                });

                const response = saved.toObject();
                io.to(toUserId).emit("receiveMessage", response);

                console.log("📤 Admin message sent to user:", toUserId);
            } catch (err) {
                console.error("❌ adminMessage error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔴 ${socket.userRole || "Unknown"} disconnected: ${socket.id}`);
        });
    });
};

module.exports = initSocket;