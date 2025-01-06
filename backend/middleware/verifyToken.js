const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.warn("verifyToken's Token", token);
    
    if (!token) {
        return res.status(401).json({ success: false, message: "No token found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        
        return res.status(200).json({ success: true, userId: decoded.userId });
        
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports = verifyToken;