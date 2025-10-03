const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/StoreUser");

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ message: "User not found. Please sign up first." });
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Oops! Wrong Password. Forgot Password?" });
        }

        if (isPasswordMatch) {
            const token = jwt.sign(
                { userId: existingUser._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 3600000, // 1 hour
            });

            // 🟢 yahan admin check kar rahe hain
            const isAdmin = existingUser.email === process.env.ADMIN_EMAIL;

            return res.status(200).json({
                success: true,
                message: "Sign In successful!",
                token,
                user: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    image: existingUser.image,
                    isAdmin, // 🟢 frontend ke liye flag
                },
            });
        }
    } catch (error) {
        console.error("Error in signinRoutes.js during sign in:", error);
        res.status(500).json({ success: false, message: "Failed to sign in. Please try again.", error });
    }
});

module.exports = router;
