const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route  GET api/users
// @desc   Register user 
// @access Public

router.post('/',
[
    //Check the fields recieved from the post request from users.
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please include a password with 6 or more characters').isLength({
        min:6,
        max:15
    })
],
async (request,response) => {
    // Run and check the validations, if errors is not empty return the error array
    const {name,email,password} = request.body;
    const errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors:errors.array()});
    }
    try {
       
        // See if user exists
        let user = await User.findOne({email});
        if(user) {
            response.status(400).json([{msg:'User already exists'}])
        }

        // Get users gravatar
        const avatar = await gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        });

        user = new User({
            name,
            email,
            password,
            avatar,
        })

         // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt)
        // Return jsonwebtoken
       
        await user.save()
        console.log(user)
        response.send(`User registered`)

    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
})

module.exports = router;    