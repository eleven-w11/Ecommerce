const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Only check header

    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
// const jwt = require("jsonwebtoken");

// const verifyToken = (req, res, next) => {
//     // Check both cookies and Authorization header
//     const token = req.cookies.token ||
//         req.headers.authorization?.split(' ')[1] ||
//         req.body.token;

//     console.log('Incoming cookies:', req.cookies);
//     console.log('Auth header:', req.headers.authorization);

//     if (!token) {
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.userId = decoded.userId;

//         res.header('Access-Control-Allow-Origin', req.headers.origin);
//         res.header('Access-Control-Allow-Credentials', 'true');
//         // res.json({ success: true });
//         return res.status(200).json({ success: true, userId: decoded.userId });
//     } catch (error) {
//         console.error('Token verification error:', error);
//         return res.status(401).json({
//             success: false,
//             message: "Invalid or expired token"
//         });
//     }
// };

// module.exports = verifyToken;