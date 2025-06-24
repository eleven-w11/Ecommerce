const express = require("express");
const router = express.Router();
const Product = require("../models/Product");


router.get("/search", async (req, res) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Search query is required and must be a string"
        });
    }

    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

    try {
        const products = await Product.find({
            $or: [
                { product_name: { $regex: words.join('|'), $options: "i" } },
                { p_des: { $regex: words.join('|'), $options: "i" } },
                { tags: { $in: words.map(word => new RegExp(word, 'i')) } }
            ]
        }).lean();

        res.json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (err) {
        console.error("🔴 Search Error:", err);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});


router.get("/", async (req, res) => {
    try {
        console.log("📢 API Called: /api/products");
        const allProducts = await Product.find();
        res.json(allProducts); // ✅ Backend se poora data bhej rahe hain
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;
