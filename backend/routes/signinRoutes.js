const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const User = require("../models/StoreUser");

// Admin emails list (primary admin + test admin for development)
const ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL,
    'testadmin@admin.com'
].filter(Boolean);

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
            // Record login history
            const currentLoginTime = dayjs().format("DD-MM-YYYY HH:mm:ss");
            existingUser.loginHistory.push(currentLoginTime);
            await existingUser.save();

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

            const isAdmin = ADMIN_EMAILS.includes(existingUser.email);

            return res.status(200).json({
                success: true,
                message: "Sign In successful!",
                token,
                user: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    image: existingUser.image,
                    isAdmin,
                },
            });
        }
    } catch (error) {
        console.error("Error in signinRoutes.js during sign in:", error);
        res.status(500).json({ success: false, message: "Failed to sign in. Please try again.", error });
    }
});

module.exports = router;
