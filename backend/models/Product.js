const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product_image: String,
    product_name: String,
    product_price: Number,
    dis_product_price: Number,
    id: String
}, { collection: "best_selling_product" });

module.exports = mongoose.model("Product", productSchema);