const express = require("express");
const User = require("../models/user");
const verifyPath = require("../middleware/verifyPath");
const router = express.Router();

router.get("/profile", verifyPath, async (req, res) => {
    // console.log("Profile endpoint hit, UserId:", req.userId);
    try {
        const user = await User.findById(req.userId).select("name email image");
        if (!user) {
            // console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        // console.log("User data found:", user); // Debugging step
        res.json(user);
        // console.warn("user.js = user =", user);
        
    } catch (error) {
        // console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;