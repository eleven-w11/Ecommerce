const { Server } = require("socket.io");
const Message = require("../models/Message");

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

        socket.on("userMessage", async ({ fromUserId, message, timestamp }) => {
            try {
                const saved = await Message.create({
                    fromUserId,
                    toUserId: null,
                    fromAdmin: false,
                    message
                });

                const response = saved.toObject();
                response.timestamp = timestamp || saved.timestamp;

                const adminId = "681edcb10cadbac1be3540aa";
                io.to(adminId).emit("receiveMessage", response);
            } catch (err) {
                console.error("❌ userMessage error:", err);
            }
        });

        socket.on("adminMessage", async ({ toUserId, message, timestamp }) => {
            try {
                const saved = await Message.create({
                    fromUserId: null,
                    toUserId,
                    fromAdmin: true,
                    message
                });

                const response = saved.toObject();
                response.timestamp = timestamp || saved.timestamp;

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
