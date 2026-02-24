const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    color: {
        type: String
    },
    size: {
        type: String
    },
    image: {
        type: String
    }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: "Pakistan" }
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [orderItemSchema],
        shippingAddress: shippingAddressSchema,
        paymentMethod: {
            type: String,
            enum: ['credit-card', 'cash-on-delivery', 'bank-transfer'],
            required: true
        },
        paymentDetails: {
            cardLastFour: String,
            transactionId: String
        },
        subtotal: {
            type: Number,
            required: true
        },
        shippingCost: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        checkoutType: {
            type: String,
            enum: ['single', 'cart'],
            default: 'single'
        },
        notes: {
            type: String
        }
    },
    { 
        collection: "orders",
        timestamps: true 
    }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
