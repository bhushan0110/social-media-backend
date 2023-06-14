const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    dob: {
        type: Date,
        require: true,
    },
    status: {
        type: Boolean,
        default: false,
    }
});


const User = mongoose.model('User',UserSchema);
module.exports = User;