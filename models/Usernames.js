const mongoose = require("mongoose")

const UsernameSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }
})

const UsernameModel = mongoose.model('usernames', UsernameSchema)

module.exports = UsernameModel