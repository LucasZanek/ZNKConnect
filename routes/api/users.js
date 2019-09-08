const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/** 
     * Generate salt and encrypt the password
     * @param password The password required for encrypt.
*/
const encryptPass = async (password) => { 
    const salt = await bcrypt.genSalt(10);
    return password = await bcrypt.hash(password,salt)
}

/** 
     * Get gravatar based on the user email 
     * * If the user don't have, return a default image.
     * @param email The email required for the search. 
*/
const getUserGravatarByEmail = async (email) => {
    //* Get the gravatar based on the email
    return await gravatar.url(email,{
        s:'200',
        r:'pg',
        d:'mm'
    })}

router.post('/',
[
    //* Check the fields recieved from the post request from users.
   
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
    const validationErrors = validationResult(request);
    if(!validationErrors.isEmpty()){
        return response.status(400).json({errors:validationErrors.array()});
    }
    try {
        //* See if user exists
        let user = await User.findOne({email});
        if(user) {
           return response.status(400).json([{msg:'User already exists'}])
        }

        //* Get users gravatar
        
        const avatar = await getUserGravatarByEmail(email);

        //* New user instance
        user = new User({
            name,
            email,
            password,
            avatar,
        })
         //* Encrypt password
        user.password = await encryptPass(password);
        
        // TODO: Return jsonwebtoken in order to verify if the user is logged in
        
        await user.save()
        console.log(user)
        response.send(`User registered`)

    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
})

module.exports = router;    