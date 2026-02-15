const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

router.get("/verifytoken", verifyToken, (req, res) => {
    res.status(200).json({ success: true, userId: req.userId });
});

module.exports = router;
