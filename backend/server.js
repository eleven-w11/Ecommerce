require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
// Route imports
const signupRoutes = require("./routes/SignUpRoutes");
const signinRoutes = require("./routes/signinRoutes");
const signOutRoutes = require("./routes/signoutRoutes");
const userRoutes = require("./routes/UserProRoutes");
const verifyTokenRoutes = require("./middleware/verifyToken");
const verifyPathRoutes = require("./middleware/verifyPath");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Express & server setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // Use the same allowed origins
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
});

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS Config
const allowedOrigins = [
    "http://localhost:3000",
    "https://your-web-gamma.vercel.app",
    "https://your-web-git-main-elevens-projects-0c000431.vercel.app",
    "https://yourweb-backend.onrender.com",
    "http://192.168.10.8:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches any allowed origin or subdomain pattern
        if (allowedOrigins.some(allowed => {
            // Exact match
            if (origin === allowed) return true;
            // Wildcard match (for Vercel preview URLs)
            if (allowed.includes('*')) {
                const regex = new RegExp(allowed.replace('*', '.*'));
                return regex.test(origin);
            }
            return false;
        })) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Security headers
// Replace your current security headers with:
app.use((req, res, next) => {
    // Remove COOP/COEP headers that were causing issues
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Cross-Origin-Embedder-Policy");

    // Set security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');

    // Important for credentials/cookies
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});


// Static files
app.use("/images", express.static("images"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/", signupRoutes);
app.use("/api/", signinRoutes);
app.use("/api/user", userRoutes);
app.use("/api", signOutRoutes);
app.use("/api/verifytoken", verifyTokenRoutes);
app.use("/api/protected", verifyPathRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use("/api/messages", messageRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// 🔌 --- Socket.IO Real-Time Chat Logic --- 🔌
io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("register", ({ userId }) => {
        socket.join(userId);
        console.log(`🔐 Socket ${socket.id} joined room ${userId}`);
    });

    // 🟡 User sends message to admin
    socket.on("userMessage", async ({ fromUserId, message, timestamp }) => {
        try {
            const saved = await Message.create({
                fromUserId,
                toUserId: null,
                fromAdmin: false,
                message
            });

            // Include the original timestamp in the response
            const response = saved.toObject();
            response.timestamp = timestamp || saved.timestamp;

            // Emit to admin only (don't echo back to sender)
            const adminId = "681edcb10cadbac1be3540aa";
            io.to(adminId).emit("receiveMessage", response);
        } catch (err) {
            console.error("❌ userMessage error:", err);
        }
    });

    // 🔵 Admin sends message to user
    socket.on("adminMessage", async ({ toUserId, message, timestamp }) => {
        try {
            const saved = await Message.create({
                fromUserId: null,
                toUserId,
                fromAdmin: true,
                message
            });

            // Include the original timestamp in the response
            const response = saved.toObject();
            response.timestamp = timestamp || saved.timestamp;

            // Emit to target user only (don't echo back to admin)
            io.to(toUserId).emit("receiveMessage", response);
        } catch (err) {
            console.error("❌ adminMessage error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// deepseek