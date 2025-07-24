const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    console.log("✅ verifyToken middleware triggered");
    console.log('Cookies:', req.cookies);

    const token = req.cookies.token ||
        req.headers.authorization?.split(' ')[1] ||
        req.body.token;

    if (!token) {
        console.log("❌ Token missing");
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token verified, userId:", decoded.userId);
        req.userId = decoded.userId;
        console.warn("req.userId verifytoken", req.userId);
        next(); // ✅ Continue to the actual route
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = verifyToken;
