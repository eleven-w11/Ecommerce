const mongoose = require("mongoose");

const visitorStatsSchema = new mongoose.Schema({
    date: {
        type: String,  // Format: "YYYY-MM-DD"
        required: true,
        unique: true
    },
    totalVisitors: {
        type: Number,
        default: 0
    },
    uniqueVisitors: {
        type: [String],  // Array of socket IDs or fingerprints
        default: []
    },
    ordersReceived: {
        type: Number,
        default: 0
    },
    peakVisitors: {
        type: Number,
        default: 0
    },
    hourlyStats: [{
        hour: Number,  // 0-23
        visitors: Number,
        orders: Number
    }]
}, { 
    collection: "visitor_stats",
    timestamps: true 
});

const VisitorStats = mongoose.model("VisitorStats", visitorStatsSchema);
module.exports = VisitorStats;
