const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Helper function to generate and set auth token
const generateAuthToken = (res, userId, expiresIn = "1h") => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? 'your-web-gamma.vercel.app' : 'localhost',
        path: '/',
        maxAge: 3600000 // 1 hour
    });

    return token;
};

// Regular email/password signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

            if (isPasswordMatch) {
                if (existingUser.name === name) {
                    const token = generateAuthToken(res, existingUser._id);
                    return res.status(200).json({
                        message: "Login successful",
                        token,
                        user: {
                            id: existingUser._id,
                            name: existingUser.name,
                            email: existingUser.email,
                            image: existingUser.image
                        }
                    });
                }
                return res.status(400).json({ message: "Name doesn't match our records" });
            }
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Check if password is weak
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            image: '/user.png'
        });

        const savedUser = await newUser.save();
        const token = generateAuthToken(res, savedUser._id);

        return res.status(201).json({
            message: "Signup successful",
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                image: savedUser.image
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error during signup" });
    }
});

// Google OAuth signup
router.post("/signup/google", async (req, res) => {
    try {
        const { name, email, password, image } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields from Google auth" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // For Google users, we don't need to check password since it's auto-generated
            const token = generateAuthToken(res, existingUser._id);

            return res.status(200).json({
                message: "Google login successful",
                token,
                user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    image: existingUser.image || image // Use existing image or fallback to new one
                }
            });
        }

        // Create new user for Google signup
        const newUser = new User({
            name,
            email,
            password: await bcrypt.hash(password, 10), // Still hash the auto-generated password
            image: image || '/user.png',
            provider: 'google' // Mark as Google-authenticated user
        });

        const savedUser = await newUser.save();
        const token = generateAuthToken(res, savedUser._id);

        res.status(201).json({
            message: "Google signup successful",
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                image: savedUser.image
            }
        });

    } catch (error) {
        console.error("Google Signup Error:", error);
        res.status(500).json({
            message: "Server error during Google signup",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;