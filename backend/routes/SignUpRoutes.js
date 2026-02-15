const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/StoreUser");

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

                // check if this user is admin
                const isAdmin = existingUser.email === process.env.ADMIN_EMAIL;

                setAuthCookie(res, token);
                return res.status(200).json({
                    message: "Login successful",
                    token,
                    user: {
                        ...existingUser._doc, // send user fields
                        isAdmin              // add isAdmin flag
                    }
                });
            }

            return res.status(400).json({
                message: "Email already exists" +
                    (existingUser.name !== name ? " with different name" : "")
            });
        }

        // New user signup
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            image: '/user.png'
        });

        const savedUser = await newUser.save();
        const token = createToken(savedUser._id);

        // check if new user is admin
        const isAdmin = savedUser.email === process.env.ADMIN_EMAIL;

        setAuthCookie(res, token);

        return res.status(201).json({
            message: "Signup successful",
            token,
            user: {
                ...savedUser._doc, // all user data
                isAdmin            // extra field
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Error saving user", error: error.message });
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

function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600000
    });
}

module.exports = router;