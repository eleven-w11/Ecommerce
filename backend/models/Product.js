const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    pi_1: String,
    product_name: String,
    product_price: Number,
    dis_product_price: Number,
    id: String,
    pi_2: String,
    pi_3: String,

}, { collection: "best_selling_product" });

module.exports = mongoose.model("Product", productSchema);