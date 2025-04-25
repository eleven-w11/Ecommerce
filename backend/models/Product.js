// product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product_name: String,
    product_price: Number,
    dis_product_price: Number,
    id: String,
    p_type: String,
    p_des: String,
    product_details: [String],
    images: [{
        pi_1: String,
        pi_2: String,
        pi_3: String,
        color_code: String,
        color: String
    }]
}, { collection: "best_selling_product" });

module.exports = mongoose.model("Product", productSchema);