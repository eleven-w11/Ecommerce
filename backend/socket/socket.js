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

        // ✅ Send user list to admin
        socket.on("getUsers", async () => {
            try {
                // const users = await User.find();
                const users = await User.find({}, "name image");



                console.log("🧾 All users found from DB:", users);
                const usersWithLastMessage = [];

                for (const user of users) {
                    console.log("📦 User Image Debug:", user.name, user.image);
                    const lastMsg = await Message.findOne({
                        $or: [
                            { fromUserId: user._id },
                            { toUserId: user._id }
                        ]
                    }).sort({ timestamp: -1 });

                    if (!lastMsg) {
                        // 🚫 Skip users with no messages at all
                        continue;
                    }

                    usersWithLastMessage.push({
                        _id: user._id,
                        name: user.name,
                        image: user.image,
                        lastMessage: lastMsg.message,
                        lastMessageTime: lastMsg.timestamp || lastMsg.createdAt,
                    });
                }




                // 🧠 Sort based on lastMessageTime DESC
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

                const user = await User.findById(fromUserId).select("name image");
                response.user = user ? {
                    name: user.name,
                    image: user.image
                } : {
                    name: "New User",
                    image: null
                };

                console.log("📥 New user message received:", {
                    userId: fromUserId,
                    name: user?.name,
                    image: user?.image
                });


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