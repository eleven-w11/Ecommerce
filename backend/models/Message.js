const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "Chat-box", // ✅ Yeh ab apply hoga
    }
);


module.exports = mongoose.model("Message", messageSchema);