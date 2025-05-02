require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import Routes
const signupRoutes = require("./routes/SignUpRoutes");
const signinRoutes = require("./routes/signinRoutes");
const signOutRoutes = require("./routes/signoutRoutes");
const userRoutes = require("./routes/user");
const verifyTokenRoutes = require("./middleware/verifyToken");
const verifyPathRoutes = require("./middleware/verifyPath");
const dataRoutes = require("./routes/admindataRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Use middlewares in correct order
app.use(cookieParser());
app.use(express.json());

// ✅ Set headers for popup/Google login compatibility
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

// ✅ Updated CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "https://your-web-gamma.vercel.app",
    "http://192.168.10.8:3000"
];

const cors = require("cors");

app.use(cors({
    origin: ["http://localhost:3000", "https://yourweb-backend.onrender.com"],
    credentials: true,
}));


// ✅ Test route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Serve static files
app.use("/images", express.static("images"));

// ✅ Use API routes
app.use("/api/", signupRoutes);
app.use("/api/", signinRoutes);
app.use("/api/user", userRoutes);
app.use("/api", signOutRoutes);
app.use("/api/verifytoken", verifyTokenRoutes);
app.use("/api/protected", verifyPathRoutes);
app.use("/api", dataRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Server Error" });
});

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});