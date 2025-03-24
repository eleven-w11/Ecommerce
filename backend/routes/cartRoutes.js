const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.post("/cart-products", async (req, res) => {
    try {
        const { productIds } = req.body;
        const products = await Product.find({ _id: { $in: productIds } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error fetching cart products" });
    }
});

module.exports = router;
