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
const cors = require("cors");

app.use(cors({
    origin: "*", // ✅ Allow all origins
    credentials: true, // ✅ Allow credentials (cookies, authorization headers, etc.)
}));


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

app.listen(PORT, () => console.warn(`Server running on port ${PORT}`));