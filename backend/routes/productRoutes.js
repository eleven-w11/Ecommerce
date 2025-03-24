const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const mongoose = require("mongoose");


router.get("/bestselling", async (req, res) => {
    try {
        console.log("📢 API Called: /api/products/bestselling"); // ✅ Debugging
        const bestSellingProducts = await Product.find();
        // console.log("📢 Fetched Products:", bestSellingProducts);
        res.json(bestSellingProducts);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Ensure product.images exists and contains URLs
        const images = [
            { url: product.pi_1, filter: "" },
            product.pi_2 ? product.pi_2 : null,
            product.pi_3 ? product.pi_3 : null
        ].filter(Boolean); // Remove null values

        res.json({ ...product.toObject(), images });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product" });
    }
});



module.exports = router;