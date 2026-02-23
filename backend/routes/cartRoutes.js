const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.post("/cart-products", async (req, res) => {
    try {
        // console.log("Received product IDs:", req.body.productIds); // ✅ Debugging
        const products = await Product.find({ _id: { $in: req.body.productIds } });
        // console.warn("cartroutes.js", products);
        
        if (!products.length) {
            return res.status(404).json({ error: "No products found" });
        }

        res.json(products);
    } catch (error) {
        console.error("Error fetching cart products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
