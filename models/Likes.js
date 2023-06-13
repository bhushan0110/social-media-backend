const mongoose = require('mongoose');

const LikesSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        require: true,
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
});

const Likes = mongoose.model('Likes', LikesSchema);
module.exports = Likes;