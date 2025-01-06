const jwt = require("jsonwebtoken");

const verifyPath = (req, res, next) => {
    const token = req.cookies.token;
    console.warn("verifyPath's Token", token);

    if (!token) {
        return res.status(401).json({ success: false, message: "No token found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        console.log("Decoded userId:", decoded.userId);
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports = verifyPath;