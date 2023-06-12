const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    like: {
        type: Number,
        default: 0
    },
    content: {
        type: String,
        require: true
    },
    commentCount: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        require: true
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    comments: {
        type: [{}],
        default: [],
    },
    date: {
        type: Date,
        default: new Date
    }
});


const Post = mongoose.model('Post',PostSchema);
module.exports = Post;