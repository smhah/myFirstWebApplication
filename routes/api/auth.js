const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require('express-validator');

// @route	GET api/auth
// @desc	Test route
// @access	public

router.get("/", auth ,async (req, res) =>{
    try{
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    }
    catch (err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// @route	POST api/users
// @desc	authenticate user and get token
// @access	public
router.post("/", [
    check("email", "please enter a valid email").isEmail(),
    check("password", "password is required").exists()
] ,
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    const {email, password} = req.body;

    try{
        // See if user exist
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error : [{msg : "invalide credentials"}]})
        }
        // check if password match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({error : [{msg : "invalide credentials"}]})
        }
        // return jsonwebtoken
        const payload = {
            user: {
                id : user.id,
                email
            }
        }
        jwt.sign(
            payload,
            config.get("jwtToken"),
            {expiresIn: 36000},
            (err, token) => {
                if (err) throw err;
                res.json({token});
            });
        //res.send("User registred");
    } catch (err){
        console.error(err.message);
        res.status(500).send("Server error");
    }

    //console.log(req.body);
});

module.exports = router;