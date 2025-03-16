const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product_name: String,
    product_price: Number,
    dis_product_price: Number,
    id: String,
    product_image: String,
    colors: [{
        color_code: String,
        filter: String
    }],
    p_type: String,
    p_des: String,
    product_details: [String]
}, { collection: "best_selling_product" });

module.exports = mongoose.model("Product", productSchema);
