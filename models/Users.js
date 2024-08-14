const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // Corrected 'require' to 'required'
        unique: true // Ensures that each username is unique
    },
    shells: {
        type: Number,
        default: 0 // Initializes the number of shells to 0
    },
    pearls: {
        type: Number,
        default: 0 // Initializes the number of pearls to 0
    },
    necklaces: {
        type: Number,
        default: 0 // Initializes the number of necklaces to 0
    },
    coins: {
        type: Number,
        default: 0 // Initializes the number of coins to 0
    },
    x: {
        type: Number,
        default: 0 // Initializes the x-coordinate to 0
    },
    y: {
        type: Number,
        default: 0 // Initializes the y-coordinate to 0
    },
    timestamp: {
        type: Date,
        default: Date.now // Automatically sets the current date and time
    }
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;