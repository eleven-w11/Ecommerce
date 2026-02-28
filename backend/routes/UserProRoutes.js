const express = require("express");
const User = require("../models/StoreUser");
const verifyPath = require("../middleware/verifyPath");
const router = express.Router();

// Admin emails list (primary admin + test admin for development)
const ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL,
    'testadmin@admin.com'
].filter(Boolean);

router.get("/profile", verifyPath, async (req, res) => {
    try {
        console.log("✅ /profile route hit");
        res.set('Cache-Control', 'no-store');

        const user = await User.findById(req.userId).select("name email image role");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is admin
        const isAdmin = ADMIN_EMAILS.includes(user.email);

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            isAdmin
        });


    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;


// Ye route /profile pe logged-in user ka name, email, aur image database
// se nikal ke return karta hai — sirf agar token valid ho.