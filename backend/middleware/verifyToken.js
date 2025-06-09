const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Check both cookies and Authorization header
    const token = req.cookies.token ||
        req.headers.authorization?.split(' ')[1] ||
        req.body.token;

    console.log('Incoming cookies:', req.cookies);
    console.log('Auth header:', req.headers.authorization);

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        return res.status(200).json({ success: true, userId: decoded.userId });
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = verifyToken;