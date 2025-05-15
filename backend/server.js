require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
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

// Allowed origins configuration
const allowedOrigins = [
    "http://localhost:3000",
    "https://your-web-gamma.vercel.app",
    "https://your-web-git-main-elevens-projects-0c000431.vercel.app",
    "https://yourweb-backend.onrender.com",
    "http://192.168.10.8:3000"
];

// CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.some(allowed => {
            if (origin === allowed) return true;
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

// Socket.IO Configuration
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
});

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Security headers
app.use((req, res, next) => {
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
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

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
        ? "https://yourweb-backend.onrender.com/auth/google/callback"
        : "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Here you would typically find or create a user in your database
        // For now, we'll just return the profile
        return done(null, profile);
    } catch (err) {
        return done(err, null);
    }
}));

// Generate JWT Token function
const generateJWT = (user) => {
    return jwt.sign(
        { id: user.id, email: user.emails[0].value },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Google Auth Routes
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: false
    }),
    (req, res) => {
        const token = generateJWT(req.user);
        const frontendUrl = process.env.NODE_ENV === 'production'
            ? 'https://your-web-gamma.vercel.app'
            : 'http://localhost:3000';

        res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
    }
);

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

// Google Signup Endpoint
app.post("/api/signup/google", async (req, res) => {
    try {
        const { token } = req.body;

        // Here you would verify the Google token and create/authenticate user
        // This is a simplified version - implement proper validation

        const user = {
            id: "google_" + Date.now(),
            email: "user@example.com",
            name: "Google User"
        };

        const jwtToken = generateJWT(user);

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({ success: true, token: jwtToken });
    } catch (err) {
        console.error("Google signup error:", err);
        res.status(500).json({ success: false, message: "Google authentication failed" });
    }
});

// Test route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Socket.IO Logic
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});