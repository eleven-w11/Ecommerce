const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

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
