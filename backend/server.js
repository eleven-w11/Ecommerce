require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const Message = require('./models/Message');  // ✅ Correct (same directory level)
// const Message = require("./models/Message");
// Routes
const signupRoutes = require("./routes/SignUpRoutes");
const signinRoutes = require("./routes/signinRoutes");
const signOutRoutes = require("./routes/signoutRoutes");
const userRoutes = require("./routes/UserProRoutes");
const verifyTokenRoutes = require("./middleware/verifyToken");
const verifyPathRoutes = require("./middleware/verifyPath");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://your-web-gamma.vercel.app",
            "https://yourweb-backend.onrender.com/auth/google/callback",
            "http://192.168.10.8:3000"
        ],
        credentials: true,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS setup
const allowedOrigins = [
    "http://localhost:3000",
    "https://your-web-gamma.vercel.app",
    "https://yourweb-backend.onrender.com/auth/google/callback",
    "http://192.168.10.8:3000"
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
}));

// Security headers for Google login
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Static files
app.use("/images", express.static("images"));

// Routes
app.use("/api/", signupRoutes);
app.use("/api/", signinRoutes);
app.use("/api/user", userRoutes);
app.use("/api", signOutRoutes);
app.use("/api/verifytoken", verifyTokenRoutes);
app.use("/api/protected", verifyPathRoutes);
app.use("/api/chat", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use('/api/messages', messageRoutes);


// Test route
app.get("/", (req, res) => {
    res.send("Server is running with Socket.IO!");
});



// const ADMIN_ID = "660123abc456def789000000"; // ← replace this with actual admin MongoDB ObjectId

// In your server.js (Socket.IO section)
io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // Immediate message history send
    try {
        const messages = await Message.find()
            .sort({ createdAt: 1 })
            .populate("senderId", "name email");

        console.log("Found messages in DB:", messages.length);

        socket.emit("message_history", messages.map(msg => ({
            id: msg._id.toString(),
            sender: msg.senderId?.name || "Unknown",
            senderId: msg.senderId?._id.toString(),
            text: msg.message,
            timestamp: msg.createdAt
        })));
    } catch (err) {
        console.error("Message history error:", err);
    }

    // Message handling
    socket.on("send_message", async (data) => {
        try {
            const newMessage = new Message({
                senderId: data.senderId,
                message: data.text
            });

            const savedMessage = await newMessage.save();
            const populated = await Message.populate(savedMessage, {
                path: 'senderId',
                select: 'name email'
            });

            io.emit("receive_message", {
                id: populated._id.toString(),
                sender: populated.senderId.name,
                senderId: populated.senderId._id.toString(),
                text: populated.message,
                timestamp: populated.createdAt
            });
        } catch (err) {
            console.error("Message save error:", err);
        }
    });
});



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
