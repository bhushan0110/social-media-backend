const mongoose = require('mongoose');

const RequestsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    }
});

const Requests = mongoose.model('Requests',RequestsSchema);
module.exports = Requests;