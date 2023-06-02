const mongoose = require('mongoose');

const url = process.env.DATABASE;

const connectToDb = () => {
    mongoose.connect(url)
        .then(()=>{
            console.log('Connected to DB Success');
        })
        .catch((err)=>{
            console.log(err.message);
        })
};

module.exports = connectToDb;