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

    // 🔁 Function to get unique users who sent messages
    const getUniqueUsersWithMessages = async () => {
        const messages = await Message.find({ fromAdmin: false })
            .sort({ timestamp: -1 }) // Latest messages first
            .populate("fromUserId", "name profileImage");

        const userMap = new Map();

        messages.forEach(msg => {
            const user = msg.fromUserId;
            if (user && !userMap.has(user._id.toString())) {
                userMap.set(user._id.toString(), {
                    userId: user._id,
                    name: user.name,
                    profileImage: user.profileImage,
                    lastMessage: msg.message,
                    timestamp: msg.timestamp
                });
            }
        });

        return Array.from(userMap.values());
    };

    io.on("connection", (socket) => {
        console.log("🟢 New client connected:", socket.id);

        socket.on("register", ({ userId }) => {
            socket.join(userId);
            console.log(`🔐 Socket ${socket.id} joined room ${userId}`);
        });

        // ✅ Send user list to admin
        socket.on("getUsers", async () => {
            try {
                // 🟢 Get all users who have messaged (even offline)
                const messages = await Message.find({ fromAdmin: false })
                    .sort({ createdAt: -1 });

                // 🟢 Extract unique user IDs
                // const uniqueUserIds = [...new Set(messages.map(msg => msg.sender))];
                const uniqueUserIds = [...new Set(messages.map(msg => msg.fromUserId.toString()))];


                // 🟢 Fetch user details + last message
                const usersWithLastMessage = await Promise.all(uniqueUserIds.map(async userId => {
                    const user = await User.findById(userId);
                    const lastMsg = await Message.findOne({ sender: userId })
                        .sort({ createdAt: -1 });

                    return {
                        _id: user._id,
                        name: user.name,
                        image: user.image,
                        lastMessage: lastMsg?.text || "",
                        lastMessageTime: lastMsg?.createdAt || "",
                    };
                }));

                // 🟢 Send to admin
                socket.emit("usersList", usersWithLastMessage);

            } catch (err) {
                console.error("Error fetching users for Admin:", err.message);
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

                const user = await User.findById(fromUserId).select("name profileImage");
                response.user = user ? {
                    name: user.name,
                    profileImage: user.profileImage
                } : {
                    name: "New User",
                    profileImage: null
                };

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