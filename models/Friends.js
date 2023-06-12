const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },

    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    }
});


const Friend = mongoose.model('Friend',FriendSchema);
module.exports = Friend;