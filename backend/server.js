require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const session = require("express-session");
const passport = require("passport");
// i think not in use
const jwt = require("jsonwebtoken");
// i think not in use

// const { Server } = require("socket.io");

// 🔁 Passport config
// require("./passport");

// const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins — use string list only
const allowedOrigins = [
    "https://ecommerce-vu3m.onrender.com",
    "http://localhost:3000"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("❌ CORS Blocked Origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🛣️ Route imports
const signupRoutes = require("./routes/SignUpRoutes");
const signinRoutes = require("./routes/signinRoutes");
const signOutRoutes = require("./routes/signoutRoutes");
const userRoutes = require("./routes/UserProRoutes");
const verifyTokenRoutes = require("./middleware/verifyToken");
const verifyPathRoutes = require("./middleware/verifyPath");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const GoogleRoutes = require("./routes/GoogleRoutes");
const verifyRoutes = require("./routes/verifyRoutes");


app.use("/api", signupRoutes);
app.use("/api", signinRoutes);
app.use("/api", signOutRoutes);
app.use("/api/user", userRoutes);
app.use("/api/verifytoken", verifyTokenRoutes);
app.use("/api/protected", verifyPathRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", verifyRoutes);
app.use("/api", GoogleRoutes);



app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
});



app.get("/", (req, res) => {
    res.send("✅ Server is running!");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Global error:", err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});






// app.set("trust proxy", 1);

// app.use(session({
//     secret: "yourSecret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: true,
//         sameSite: "none",
//         maxAge: 60 * 60 * 1000 
//     }
// }));


// app.use(passport.initialize());
// app.use(passport.session());



// app.use("/images", express.static("images"));

// const io = new Server(server, {
//     cors: {
//         origin: allowedOrigins,
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
//     }
// });

// io.on("connection", (socket) => {
//     console.log("🟢 New client connected:", socket.id);

//     socket.on("register", ({ userId }) => {
//         socket.join(userId);
//         console.log(`🔐 Socket ${socket.id} joined room ${userId}`);
//     });

//     socket.on("userMessage", async ({ fromUserId, message, timestamp }) => {
//         try {
//             const saved = await Message.create({
//                 fromUserId,
//                 toUserId: null,
//                 fromAdmin: false,
//                 message
//             });

//             const response = saved.toObject();
//             response.timestamp = timestamp || saved.timestamp;

//             const adminId = "681edcb10cadbac1be3540aa";
//             io.to(adminId).emit("receiveMessage", response);
//         } catch (err) {
//             console.error("❌ userMessage error:", err);
//         }
//     });

//     socket.on("adminMessage", async ({ toUserId, message, timestamp }) => {
//         try {
//             const saved = await Message.create({
//                 fromUserId: null,
//                 toUserId,
//                 fromAdmin: true,
//                 message
//             });

//             const response = saved.toObject();
//             response.timestamp = timestamp || saved.timestamp;

//             io.to(toUserId).emit("receiveMessage", response);
//         } catch (err) {
//             console.error("❌ adminMessage error:", err);
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("🔴 Client disconnected:", socket.id);
//     });
// });

