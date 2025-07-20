const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: function () { return !this.googleId; } // Required only for local auth
        },
        image: {
            type: String,
            required: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true // Allows null values but enforces uniqueness for non-null
        },
        loginHistory: {
            type: [String],
            default: [],
        }
    },
    { collection: "log" }
);

const User = mongoose.model("User", userSchema);
module.exports = User;