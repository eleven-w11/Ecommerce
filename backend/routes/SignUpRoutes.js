const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/StoreUser");

// const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Regular email/password signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

            if (isPasswordMatch && existingUser.name === name) {
                const token = createToken(existingUser._id);
                setAuthCookie(res, token);
                return res.status(200).json({
                    message: "Login successful",
                    token,
                    user: existingUser
                });
            }

            return res.status(400).json({
                message: "Email already exists" +
                    (existingUser.name !== name ? " with different name" : "")
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            image: '/user.png'
        });

        const savedUser = await newUser.save();
        const token = createToken(savedUser._id);
        setAuthCookie(res, token);

        return res.status(201).json({
            message: "Signup successful",
            token,
            user: savedUser
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Error saving user", error: error.message });
    }
});

// Google signup endpoint


router.post("/signup/google", async (req, res) => {
    try {
        const { email, name, picture, googleId } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = new User({
                name,
                email,
                password: googleId, // Using Google ID as password
                image: picture,
                googleId
            });
            await user.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            success: true,
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image
            }
        });

    } catch (error) {
        console.error("Google Signup Error:", error);
        res.status(500).json({
            success: false,
            message: "Google authentication failed",
            error: error.message
        });
    }
});

// Helper functions
function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

// function setAuthCookie(res, token) {
//     res.cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'none', // Must be 'none' for cross-site cookies
//         domain: process.env.NODE_ENV === 'production'
//             ? 'yourweb-backend.onrender.com' // Explicit domain
//             : undefined, // Local development
//         path: '/',
//         maxAge: 3600000 // 1 hour
//     });
// }
function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Force HTTPS in production
        sameSite: 'none', // Required for cross-origin
        domain: '.onrender.com', // Match your backend domain
        path: '/',
        maxAge: 3600000
    });
}
// res.cookie("token", token, {
//     httpOnly: true,
//     secure: true, // REQUIRED for HTTPS
//     sameSite: "none", // REQUIRED for cross-origin
//     domain: ".onrender.com", // Match your backend domain
//     path: "/",
//     maxAge: 3600000,
// });


module.exports = router;