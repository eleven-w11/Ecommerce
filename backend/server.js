require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const signupRoutes = require("./routes/SignUpRoutes");
const signinRoutes = require("./routes/signinRoutes");
const signOutRoutes = require("./routes/signoutRoutes");
const userRoutes = require("./routes/user");
const verifyTokenRoutes = require("./middleware/verifyToken");
const verifyPathRoutes = require("./middleware/verifyPath");
const dataRoutes = require("./routes/admindataRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Update CORS Configuration
const allowedOrigins = ["http://localhost:3000",
    "https://your-web-gamma.vercel.app/",
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
}));

app.get("/", (req, res) => {
    res.send("Server is running!");
});


app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.warn("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error: ", err));

console.warn("MONGO_URI:", process.env.MONGO_URI);

app.use("/images", express.static("images"));

app.use("/api/", signupRoutes);
app.use("/api/", signinRoutes);
app.use("/api/user", userRoutes);
app.use("/api", signOutRoutes);
app.use("/api/verifytoken", verifyTokenRoutes);
app.use("/api/protected", verifyPathRoutes);
app.use("/api", dataRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/products", productRoutes);

app.use((err, req, res, next) => {
    res.status(500).json({ message: "Server Error" });
});

app.listen(PORT, "0.0.0.0", () => console.warn(`Server running on port ${PORT}`));