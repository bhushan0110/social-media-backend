const express = require('express');
const multer = require('multer');

//DB MODELS
const Post = require('../models/Post');
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');
const Friend = require('../models/Friends');

//NECESSARY CONSTANT AND FUNCTION
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const fs = require('fs');
const path = require('path');
const uploadDirectory = './uploads/';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

//Specifying storage and file name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    console.log(file);
    const prefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, prefix + '-' + file.originalname);
  }
})

const upload = multer({ storage: storage })


//Function to getfriends
const getMyFriends = async (id) => {
  try {
    const x = await Friend.find({ user1: id });
    const y = await Friend.find({ user2: id });

    const friendList = [];

    for (let item of x) {
      const tmp = await User.findById({ _id: item.user2 });
      if (tmp)
        friendList.push(tmp);
    }

    for (let item of y) {
      const tmp = await User.findById({ _id: item.user1 });
      if (tmp)
        friendList.push(tmp);
    }

    return friendList;
  }
  catch (err) {
    console.log(err);
  }
};

//get post to be displayed to user

const tmpFunction = async (id) =>{
  try{
    const data = await Post.find({ isPrivate: false });

    const friends = await getMyFriends(id);

    const privatePost = [];

    for (let a of friends) {
      try {
        const userID = a._id;
        const x = await Post.find({ user: userID, isPrivate: true });
        if (x.length > 0){
          for(let k of x){
            privatePost.push(k);
          }
        }
      }
      catch (err) {
        console.log(err);
      }
    }

    for(let y of privatePost){
      data.push(y);
    }
    return data;
  }
  catch(err){
    console.log(err.message);
  }
}

//Function to read file
const readFileAsync = (imageLocation) => {
  return new Promise((resolve, reject) => {
    fs.readFile(imageLocation, (err, data) => {
      if (err) {
        console.error(err);
        reject('Error reading media file');
      } else {
        resolve(data);
      }
    });
  });
};

router.post('/addPost', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { content, isPrivate } = req.body;
    const id = req.user.id;
    console.log(req.file.filename);
    const post = await Post.create({
      user: id,
      content: content,
      isPrivate: isPrivate,
      image: req.file.filename,
    });

    const save = await post.save();

    if (save)
      res.status(200).send(save);
  }
  catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});


router.post('/addComment', authenticate, async (req, res) => {
  try {
    const id = req.user.id;
    const { comment, postID, commentCount } = req.body;

    const user = await User.findById({ _id: id });
    const userName = user.name;
    console.log(userName);
    const add = await Post.updateOne({ _id: postID }, {
      $push: {
        comments: { $each: [{ userName, comment, id }] }
      },
      commentCount: commentCount
    });

    if (add) {
      res.status(200).send('Successfully added comment');
    }
  }
  catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

router.post('/deleteComment', authenticate, async (req, res) => {
  try {

    const { userName, comment, postID } = req.body;
    const add = await Post.updateOne({ _id: postID }, {
      $pull: {
        comments: { $each: [{ userName, comment, id }] }
      },
      commentCount: commentCount
    });

    if (add) {
      res.status(200).send('Successfully added comment');
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});


router.get('/getMyPost', authenticate, async (req, res) => {
  try {
    const postData = [];
    const id = req.user.id;
    const post = await Post.find({ user: id });

    for (let x of post) {
      const U = await User.findById({_id: x.user});
      const userName = U.name;
      const { user, like, content, commentCount, isPrivate, comments, _id } = x;
      let imageLocation = uploadDirectory + x.image;
      const fileExtension = path.extname(imageLocation).substring(1);
      try {

        const data = await readFileAsync(imageLocation);

        // Determine the MIME type based on the file extension
        const mimeType = `image/${fileExtension === 'mp4' ? 'mp4' : 'jpeg'}`;

        // Convert the media file into a data URL
        const mediaDataUrl = `data:${mimeType};base64,${data.toString('base64')}`;
        const y = {
          userName: userName,
          id: _id,
          image: mediaDataUrl,
          user,
          like,
          content,
          commentCount, isPrivate,
          comments
        };

        postData.push(y);

      }
      catch (err) {
        console.log(err);
        res.status(500).send(err.message);
      }
    }
    res.status(200).send(postData);
  }
  catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.get('/getDashboardPost', authenticate, async (req, res) => {
  try {
    const id = req.user.id;
    const postData = [];

    const data =await tmpFunction(id);
    const required = data;
    for (let x of required) {
      const U = await User.findById({_id: x.user});
      const userName = U.name;
      const { user, like, content, commentCount, isPrivate, comments, _id } = x;
      let imageLocation = uploadDirectory + x.image;
      const fileExtension = path.extname(imageLocation).substring(1);
      try {

        const data = await readFileAsync(imageLocation);

        // Determine the MIME type based on the file extension
        const mimeType = `image/${fileExtension === 'mp4' ? 'mp4' : 'jpeg'}`;

        // Convert the media file into a data URL
        const mediaDataUrl = `data:${mimeType};base64,${data.toString('base64')}`;
        const y = {
          userName: userName,
          id: _id,
          image: mediaDataUrl,
          user,
          like,
          content,
          commentCount, isPrivate,
          comments
        };

        postData.push(y);
 
      }
      catch (err) {
        console.log(err);
        res.status(500).send(err.message);
      }
    }
    res.status(200).send(postData);
  }
  catch (err) {
    console.log(err.message);
    res.send(500).send(err.message);
  }
});

const getKey = (a,b) =>{
  return a.like - b.like;
}

router.post('/trendingPost', authenticate, async(req,res)=>{
  try{
     const id = req.body.id;

     const data =await tmpFunction(id);
     const sortedData = data.sort(getKey);
     const required = sortedData;
     for (let x of required) {
      const U = await User.findById({_id: x.user});
      const userName = U.name;
      const { user, like, content, commentCount, isPrivate, comments, _id } = x;
       let imageLocation = uploadDirectory + x.image;
       const fileExtension = path.extname(imageLocation).substring(1);
       try {
 
         const data = await readFileAsync(imageLocation);
 
         // Determine the MIME type based on the file extension
         const mimeType = `image/${fileExtension === 'mp4' ? 'mp4' : 'jpeg'}`;
 
         // Convert the media file into a data URL
         const mediaDataUrl = `data:${mimeType};base64,${data.toString('base64')}`;
         const y = {
          userName: userName,
           id: _id,
           image: mediaDataUrl,
           user,
           like,
           content,
           commentCount, isPrivate,
           comments
         };
 
         postData.push(y);
  
       }
       catch (err) {
         console.log(err);
         res.status(500).send(err.message);
       }
     }
     res.status(200).send(postData);
  }
  catch(err){
      console.log(err.message);
      res.status(500).send(err.message);
  }
});


router.get('/postDataAdmin', authenticate, async (req,res) =>{
  try{
      const posts = await Post.find({});
      const postData = [];
      for (let x of posts) {
        const U = await User.findById({_id: x.user});
        const userName = U.name;
        const { user, like, content, commentCount, isPrivate, comments, _id } = x;
        let imageLocation = uploadDirectory + x.image;
        const fileExtension = path.extname(imageLocation).substring(1);
        try {
  
          const data = await readFileAsync(imageLocation);
  
          // Determine the MIME type based on the file extension
          const mimeType = `image/${fileExtension === 'mp4' ? 'mp4' : 'jpeg'}`;
  
          // Convert the media file into a data URL
          const mediaDataUrl = `data:${mimeType};base64,${data.toString('base64')}`;
          const y = {
            userName: userName,
            id: _id,
            image: mediaDataUrl,
            user,
            like,
            content,
            commentCount, isPrivate,
            comments
          };
  
          postData.push(y);
   
        }
        catch (err) {
          console.log(err);
          res.status(500).send(err.message);
        }
      }

      res.status(200).send(postData);
  }
  catch(err){
      console.log(err.message);
      res.status(500).send(err.message);
  }
});

router.post('/deletePost', authenticate, async (req, res) => {
  try {
      const { postID } = req.body;
      const postDetails = await Post.findById({_id: postID});
      const imageName = postDetails.image;
      let imageLocation = uploadDirectory + imageName;
      const success = fs.unlink(imageLocation,(err)=>{
        if(err){
          res.status(500).send(success.message);
        }
      });
      const del = await Post.findOneAndDelete({ _id: postID });
      if (del) {
          res.status(200).send(del.message);
      }
  }
  catch (err) {
      console.log(err);
      res.status(500).send(err.message);
  }
}); 

module.exports = router;