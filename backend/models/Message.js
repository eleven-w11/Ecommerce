const mongoose = require('mongoose');

function getFormattedDate() {
    const now = new Date();
    return now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

const messageSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false   // ← 🔥 ye line change ki gayi (pehle true tha)
    },
    senderRole: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { collection: "chat_box" });

module.exports = mongoose.model("Message", messageSchema);