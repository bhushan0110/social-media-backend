//THIRD PARTY MODULES
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


//DB MODELS
const User = require('../models/User');
const Admin = require('../models/Admin');
const authenticate = require('../middleware/authenticate');
const sendMail = require('./email');

//NECESSARY CONSTANT AND FUNCTION
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;




router.post('/signup', 
    [
        body('email','Email is not valid').isEmail(),
        body('name').isLength({min: 2}),
        body('password', 'Enter password in valid char range 5 to 10').isLength({min:5,max:10})
    ]
    ,async (req,res)=>{
        const {name,email,password,dob} = req.body;
        try{
            // Check inputs are valid 
            const error = validationResult(req);
            if(!error.isEmpty()){
                return res.status(400).send({error});
            }

            //Check user exist
            const isPresent = await User.findOne({email:email});
            if(isPresent){
                console.log(isPresent);
                return res.status(400).send("The email already registered");
            }

            // Generate salt and encrypt password
            const salt = await bcrypt.genSalt(10);
            const encrypted_password = await bcrypt.hash(password,salt);


            // Create a User object
            const user = await User.create({
                name,
                email,
                dob,
                password: encrypted_password
            });

            const save = await user.save();
            
            const data = {
                user: {
                    id : user.id
                }
            };

            // Sign a authtoken and send it to frontend
            const authToken = jwt.sign(data,JWT_SECRET);
            res.status(201).json({authToken,save});

        }
        catch(err){
            console.log(err.message);
            res.status(500).send(err.message);
        }
});


router.post('/login',
    [
        body('email').isEmail(),
    ] 
    ,async (req,res)=>{
        // Check inputs are valid 
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).send({error});
        }
        const {email,password} = req.body;
        try{
            //Check user exist
            const user = await User.findOne({email:email});
            if(!user){
                return res.status(401).send("Invalid Credentials");
            }
            if(user.status===false){
                return res.status(401).send('Unauthorized User Contact admin');
            }

            //Compare input password with encrypted password
            const compare_password = await bcrypt.compare(password,user.password);
            if(!compare_password){
                return res.status(401).send("Invalid Credentials");
            }

            const data = {
                user: {
                    id: user.id
                }
            };

            // Sign a authtoken and send it to frontend
            const authToken = jwt.sign(data,JWT_SECRET);
            res.status(200).json({authToken,user});

        } 
        catch(err){
            console.log(err.message);
            res.status(500).send(err.message);
        }
});

router.post('/resetPassword', authenticate ,
    [
        body('password').isLength({min:5})
    ],
    async(req,res)=>{
        // Check inputs are valid
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).send({error});
        }

        try{
            const salt = await bcrypt.genSalt(10);
            const encryptedPass = await bcrypt.hash(req.body.password,salt);
            const reset = await User.findOneAndUpdate({_id: req.user.id}, {password: encryptedPass});

            if(!reset){
                return res.status(500).send(reset.message);
            }

            res.status(200).send(reset);
        }
        catch(error){
            console.log(error);
            res.status(500).send(error.message);
        }
    }
);

router.post('/forgotPassword',
    [
        body('email','Email is not Valid').isEmail()
    ],
    async(req,res)=>{
        try{
            const {email} = req.body;
            const user = await User.findOne({email:email});
            if(!user){
                return res.status(400).json({ error: 'Email not registered' });
            }
            const newPass = `${Math.floor(Math.random()*10000)}Afour`;
            const success = await sendMail({email,newPass});
            if(!success){
                return res.status(500).send("Internal server error");
            }
            const salt = await bcrypt.genSalt(10);
            const encryptedPass = await bcrypt.hash(newPass,salt);
            const reset = await User.findOneAndUpdate({email: email}, {password: encryptedPass});
            
            return res.status(200).json({reset});
        }
        catch(err){
            console.log(err);
            res.status(500).send(err.message);
        }
    }
);

router.get('/getUserDetails', authenticate, async(req,res)=>{
    try{
        const id = req.user.id;
        const user = await User.findById({_id:id});
        const admin = await Admin.findById({_id:id});

        if(user){
            res.status(200).send(user);
        }
        if(admin){
            res.status(200).send(admin);
        }
    }
    catch(err){ 
        console.log(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;