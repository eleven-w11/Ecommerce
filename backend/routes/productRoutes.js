const express = require("express");
const router = express.Router();
const Product = require("../models/product");
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
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product" });
    }
});

module.exports = router;



// best_selling_product

// {
//     "_id": {
//       "$oid": "67a8dd90edbbfc60eae6c4da"
//     },
//     "product_image": "/images/Best-Selling-Products-image-1.png",
//     "product_name": "Product Name",
//     "product_price": 49,
//     "id": "bsp-1"
//   }

// ecom +
//         admin +
//         config +
//         local +

// ecom
//     admin
//     config
//     ecom
//         best_selling_product
//     local