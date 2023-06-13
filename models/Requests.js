const mongoose = require('mongoose');

const RequestsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
});

const Requests = mongoose.model('Reguests',RequestsSchema);
module.exports = Requests;