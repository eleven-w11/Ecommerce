const express = require("express");
const router = express.Router();

router.delete("/signout", (req, res) => {
    try {
        // Check if token is present in cookies
        // console.log("Token from cookie:", req.cookies.token);

        // Clear the cookie
        res.clearCookie("token", { httpOnly: true, sameSite: "lax" });

        return res.status(200).json({ success: true, message: "User signed out successfully" });
    } catch (error) {
        // console.warn("Error while signing out", error);
        return res.status(500).json({ success: false, message: "Failed to sign out" });
    }
});

module.exports = router;