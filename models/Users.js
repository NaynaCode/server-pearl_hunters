const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    shells: {
        type: Number,
        default: 0 
    },
    pearls: {
        type: Number,
        default: 0 
    },
    necklaces: {
        type: Number,
        default: 0 
    },
    coins: {
        type: Number,
        default: 0 
    },
    timestamp: {
        type: Date,
        default: Date.now 
    }
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;