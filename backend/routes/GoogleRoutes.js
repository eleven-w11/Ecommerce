const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const dayjs = require("dayjs"); // ⏰ Imported
const User = require("../models/StoreUser");

const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

// 🔐 JWT Token
function createToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

// 🍪 Set Cookie
function setAuthCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000 // 1 hour
    });
}

// 👤 Google SignUp / Login Route
router.post("/signup/google", async (req, res) => {
    try {
        const { id_token } = req.body;

        if (!id_token) {
            return res.status(400).json({ success: false, message: "ID token missing" });
        }

        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.REACT_APP_GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, sub: googleId, name, picture } = payload;

        if (!email || !googleId) {
            return res.status(401).json({ success: false, message: "Invalid token payload" });
        }

        let user = await User.findOne({ email });

        const currentLoginTime = dayjs().format("DD-MM-YYYY HH:mm:ss");

        if (!user) {
            // ✅ First time login
            user = await User.create({
                name: name || "Google User",
                email,
                password: googleId,
                image: picture,
                googleId,
                loginHistory: [currentLoginTime]
            });
        } else {
            // ✅ Existing user: update login history
            user.loginHistory.push(currentLoginTime);
            await user.save();
        }

        const token = createToken(user._id);
        setAuthCookie(res, token);

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image
            }
        });

    } catch (err) {
        console.error("❌ Google Signup Error:", err.message);
        return res.status(500).json({ success: false, message: "Google signup failed" });
    }
});

module.exports = router;