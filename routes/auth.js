const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {body,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "darkjedisith";
const fetchuser = require('../middleware/fetchuser');


// Add/Create user(/api/auth/createuser) No login req
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be min 5 characters').isLength({min:5})
], async (req,res)=>{
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors: errors.array()});
    }
    try{
        let user = await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({success,error:"User with this email already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })
        const data = {
            user:{
                id:user.id
            }
        }
        const authToken = jwt.sign(data,JWT_SECRET);
        success=true;
        res.json({success,authToken});
    }
    catch(err){
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
    // User.create({
    //     name:req.body.name,
    //     email:req.body.email,
    //     password:req.body.password
    // }).then(user=>res.json(user))
    // .catch((err)=>{
    //     console.log(err);
    //     res.json({
    //         error:"Please enter unique value",
    //         message: err.message
    //     })
    // });
});

// Authenticate user(/api/auth/login) No login req
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be empty').exists()
], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try {
        let success = false;
        const {email,password} = req.body;
        let user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({success,error:"Please login with correct credentials"});
        }
        const passwordCompare = await bcrypt.compare(password,user.password); 
        if(!passwordCompare){
            return res.status(400).json({success,error:"Please login with correct credentials"});
        }
        const data = {
            user:{
                id:user.id
            }
        }
        const authToken = jwt.sign(data,JWT_SECRET);
        success = true;
        res.json({success,authToken});
    } catch(err){
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
});

// Fetch user details(/api/auth/getuser) No login req
router.post('/getuser',fetchuser, async (req,res)=>{
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        if(!user){
            res.status(404).send({error:"User not found"});
        }
        res.send(user);
    } catch(err){
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;