const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
// @route	GET api/users
// @desc	test route
// @access	public

router.post("/", [
    check("name", "please enter a name").not().isEmpty(),
    check("email", "please enter a valid email").isEmail(),
    check("password", "enter at least 6 digit").isLength({min : 6})
] ,
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    const {name, email, password} = req.body;

    try{
        // See if user exist
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({error : [{msg : "email already exist"}]})
        }
        // Get user gravatar
        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm"
        })
        user = new User({
            name,
            email,
            avatar,
            password
        });
        // encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
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