const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    requestBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
});

const FriendRequest = mongoose.model('FriendRequest',FriendRequestSchema);
module.exports = FriendRequest;