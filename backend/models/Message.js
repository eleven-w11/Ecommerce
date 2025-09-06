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
        ref: 'User'
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fromAdmin: {
        type: Boolean,
        default: false
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
