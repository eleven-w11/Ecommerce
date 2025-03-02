const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product_name: String,
    product_price: Number,
    dis_product_price: Number,
    id: String,
    pi_1: String,
    pi_2: {
        url: String,
        filter: String
    },
    pi_3: {
        url: String,
        filter: String
    },
    p_type: String,
    p_des: String,
    product_details: [String] // Array of Strings
}, { collection: "best_selling_product" });

module.exports = mongoose.model("Product", productSchema);