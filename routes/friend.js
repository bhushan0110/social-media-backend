const express = require('express');

//
const User = require('../models/User');
const Friend = require('../models/Friends');
const authenticate = require('../middleware/authenticate');
const FriendRequest = require('../models/FriendRequests');

//
const router = express.Router();

const getMyFriends = async (id) =>{
    try{
        const x = await Friend.find({user1: id});
        const y = await Friend.find({user2: id});

        const friendList = [];
        for( let item of x){
            const tmp = await User.findById({_id:item.user2});
            if(tmp && tmp.status === true)
                friendList.push(tmp);
        }

        for(let item of y){
            const tmp = await User.findById({_id: item.user1});
            if(tmp && tmp.status === true)
                friendList.push(tmp);
        }

        return friendList;
    }
    catch(err){
        console.log(err);
    }
};


router.get('/getMyFriends', authenticate, async(req,res) =>{
    try{
        const id = req.user.id;

        const friendList =await getMyFriends(id);
        
        res.status(200).send(friendList);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});


router.post('/searchFriend', authenticate, async(req,res)=>{
    try{
        const id = req.user.id;
        const { userName } = req.body;

        const data = await User.find({ name: { $regex: new RegExp(userName, 'i') }, status: true });

        const friendList =await getMyFriends(id);

        const searchResult = [];

        for(let a of data){
            let flg = true;
            let b;
            for(b of friendList){
                let j = a._id.toString();
                let k = b._id.toString();
                if(j===k){
                    flg=false;
                    break;
                }
            }

            if(flg){
                searchResult.push(a);
            }
        }

        if(data){
            res.status(200).send(searchResult);
        }
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post('/addFriend', authenticate, async(req,res)=>{
    try{
        const id = req.user.id;
        const { friendID } = req.body;
        const request = await FriendRequest.create({
            requestBy: id,
            to: friendID,
        });

        const success = await request.save();
        if(success){
            res.status(200).send(success);
        }
    }
    catch(err){
        console.log(err);
        res.status(200).send(err.message);
    }
});

router.post('/removeFriend', authenticate, async(req,res) =>{
    try{
        const id = req.user.id;
        const { friendID } = req.body;
        const x = await Friend.findOneAndDelete({user1: id, user2: friendID});
        const y = await Friend.findOneAndDelete({user2: id, user1: friendID});
        if(x||y)
            res.status(200).send("Success");
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});


router.post('/acceptRequest', authenticate, async(req,res)=>{
    try{
        const id = req.user.id;
        const {friendID} = req.body;

        const y = await Friend.create({
            user1: id,
            user2: friendID
        });

        const success = await y.save();

        const delReq = await FriendRequest.findOneAndDelete({to:id, requestBy: friendID});
        if(delReq){
            res.status(200).send(success);
        }
    }
    catch(err){
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get('/friendRequests', authenticate, async (req,res) =>{
    try{
        const id = req.user.id;
        const requests = await FriendRequest.find({to: id});
        const data = [];

        for(let x of requests){
            const friendID = x.requestBy;
            const user = await User.findById({_id: friendID});
            data.push(user);
        }

        if(data){
            res.status(200).send(data);
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;