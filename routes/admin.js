const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//DB Models
const Admin = require('../models/Admin');
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const Requests = require('../models/Requests');

//NECESSARY CONSTANT AND FUNCTION
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup',
    [
        body('email', 'Email is not valid').isEmail(),
        body('password', 'Enter password in valid char range 5 to 10').isLength({ min: 5, max: 10 })
    ]
    , async (req, res) => {
        const { email, password } = req.body;
        try {
            // Check inputs are valid 
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return res.status(400).send({ error });
            }

            //Check user exist
            const isPresent = await Admin.findOne({ email: email });
            if (isPresent) {
                return res.status(400).send("The email already registered");
            }

            // Generate salt and encrypt password
            const salt = await bcrypt.genSalt(10);
            const encrypted_password = await bcrypt.hash(password, salt);


            // Create a User object
            const user = await Admin.create({
                email,
                password: encrypted_password
            });

            const save = await user.save();

            const data = {
                user: {
                    id: user.id
                }
            };

            // Sign a authtoken and send it to frontend
            const authToken = jwt.sign(data, JWT_SECRET);
            res.status(201).json({ authToken, save });

        }
        catch (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
    });


router.post('/login',
    [
        body('email').isEmail(),
    ]
    , async (req, res) => {
        // Check inputs are valid 
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).send({ error });
        }

        const { email, password } = req.body;
        try {
            //Check user exist
            const user = await Admin.findOne({ email: email });
            if (!user) {
                return res.status(401).send("Invalid Credentials");
            }

            //Compare input password with encrypted password
            const compare_password = await bcrypt.compare(password, user.password);
            if (!compare_password) {
                return res.status(401).send("Invalid Credentials");
            }

            const data = {
                user: {
                    id: user.id
                }
            };

            // Sign a authtoken and send it to frontend
            const authToken = jwt.sign(data, JWT_SECRET);
            res.status(200).json({ authToken,user });

        }
        catch (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
    });


router.post('/changeUserState',authenticate,async (req, res) => {
    try {
        const { userID,status } = req.body;
        const changeStatus = await User.findOneAndUpdate({ _id: userID }, { status: status });
        if (changeStatus) {
            res.status(200).send(changeStatus);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});


router.post('/deleteUser', authenticate,async (req, res) => {
    try {
        const { userID } = req.body;
        const deleted = await User.findOneAndDelete({ _id: userID });
        if (deleted) {
            res.status(200).send(deleted);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

router.get('/userData', authenticate, async(req,res) => {
    try{
        const user = await User.find({});
        const request = await Requests.find({});

        const data = [];

        for(let x of user){
            let flg=1;
            for(y of request){
                if(x.email === y.email){
                    flg=0;
                    break;
                }

            }
            if(flg===1){
                data.push(x);
            }
        }

        if(data){
            res.status(200).send(data);
        }
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post('/createAccRequest', async(req,res) =>{
    try{
        const {id,name,email} = req.body;
        const data = await Requests.create({
            user: id,
            name,
            email
        });

        const response = await data.save();
        if(response){
            res.status(200).send(response);
        }
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get('/accountRequest', authenticate, async(req,res) =>{
    try{
        const requests = await Requests.find({});
        if(requests){
            res.status(200).send(requests);
        }
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post('/activateAccount', authenticate, async(req,res)=>{
    try{
        const {id} = req.body;

        const activate = await Requests.findOneAndDelete({user: id});
        if(!activate){
            res.status(500).send(activate);
        }

        const updateAcc = await User.findOneAndUpdate({_id: id},{status: true});
        if(updateAcc){
            res.status(200).send(updateAcc);
        }
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;


