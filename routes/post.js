const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//DB MODELS
const Post = require('../models/Post');
const authenticate = require('../middleware/authenticate');


//NECESSARY CONSTANT AND FUNCTION
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


router.post('/addPost',authenticate,[
    body('comment').isLength({min:2, max:150}),
], async(req,res) =>{
    try{
        const {content,isPrivate} = req.body;
        const id = req.user.id;

        const post = await Post.create({
            user: id,
            content: content,
            isPrivate: isPrivate,
        });

        const save = await post.save();

        if(save)
            res.status(200).send(save);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;