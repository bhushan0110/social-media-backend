//Third party modules
const express = require('express');
require('dotenv').config();
const cors = require('cors');

//System modules
const connectToDb = require('./db');
const auth = require('./routes/auth');
const postOperation = require('./routes/postOperations');
const admin = require('./routes/admin');
const friends = require('./routes/friend');

// Required function calls
connectToDb();
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use('/auth', auth);
app.use('/postOperation', postOperation);
app.use('/admin', admin);
app.use('/friends',friends);



//ROUTES

app.get('/', (req, res) => {
    console.log("Hello from Backend");
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});