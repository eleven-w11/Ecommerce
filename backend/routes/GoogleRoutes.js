// X:\react-Web\ecommerce\backend\routes\GoogleRoutes.js

const express = require("express");
const passport = require("passport");
const router = express.Router();

// @desc   Auth with Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// @desc   Google auth callback
router.get(
    "/google/callback",
    passport.authenticate("google", {
        // successRedirect: "http://localhost:3000",
        successRedirect: "https://ecommerce-vu3m.onrender.com",
        failureRedirect: "/login/failed",
    })
);

// @desc   Logout
router.get("/logout", (req, res) => {
    req.logout(() => {
        // res.redirect("http://localhost:3000/login");
        res.redirect("https://ecommerce-vu3m.onrender.com/login");
    });
});

// @desc   Login Failed
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "Failed to login!",
    });
});

// 🧑 Get logged-in user info
router.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            user: req.user,
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Not logged in",
        });
    }
});


module.exports = router;
