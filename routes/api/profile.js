const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

const User = require('../../models/User');
const Profile = require('../../models/Profile')

// @route  GET api/profile/me
// @desc   Get current users profile 
// @access Private

router.get('/me', auth, async (request,response) => {
    try {
        // Search by user id from token and populate
        const userProfile = await Profile.findOne({user: request.user.id}).populate('user',['name' , 'avatar']);
        if(!userProfile){
            return response.status(400).json([{msg:"There isn't profile for this user"}]);
        }
        
         response.json({profile: userProfile});

    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
})

module.exports = router;    