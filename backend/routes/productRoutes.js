const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/search", async (req, res) => {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
        return res.status(400).json({
            success: false,
            message: "Search query is required and must be a string"
        });
    }

    try {
        const results = await Product.aggregate([
            {
                $search: {
                    index: "productSearch",
                    autocomplete: {
                        query: query,
                        path: "for_search",     // ✅ single field at a time
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 1
                        }
                    }
                }

            }
        ]);

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



// 🟢 All Products
router.get("/", async (req, res) => {
    try {
        console.log("📢 API Called: /api/products");
        const allProducts = await Product.find();
        res.json(allProducts);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 🟢 Single Product by ID
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
