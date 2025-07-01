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

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                // domain: 'webverse',
                path: '/',
                expires: new Date(Date.now() + 3600000),
            });
            console.log("Set Cookie: ", req.cookies);
            console.log("Generated JWT Token:", token);
            return res.status(200).json({
                success: true,
                message: "Sign In successful.911",
                token,
                cookie: req.cookies
            });
        }

    } catch (error) {
        console.error("Error in signinRoutes.js during sign in:", error);
        res.status(500).json({ success: false, message: "Failed to sign in. Please try again.", error });
    }
});

module.exports = router;