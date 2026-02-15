const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        lastMessageTime: {
            type: Date,
            default: Date.now
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    { 
        timestamps: true,
        collection: "chats" 
    }
);

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageTime: -1 });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
