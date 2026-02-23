const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            default: ""
        },
        messageType: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text"
        },
        fileUrl: {
            type: String,
            default: null
        },
        fileName: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent"
        }
    },
    { 
        timestamps: true,
        collection: "messages" 
    }
);

// Index for efficient querying
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
