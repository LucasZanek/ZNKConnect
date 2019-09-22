const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../../middleware/auth')
const {check,validationResult} = require('express-validator');
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
        return response.status(500).send('Server error');
    }
})

// @route  POST api/profile/
// @desc   Create or update user profile
// @access Private

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
]], 
async (request,response) => {
    // Checking validation && errors 
    const errors = validationResult(request);
    if(!errors.isEmpty()){
         response.status(400).json({errors:errors.array()})
    }

    //  Desconstruct the request body
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = request.body

    const profileFields = {};
    // Checking if the properties comming before insert
    profileFields.user = request.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    // Skills - Spilt into array
   if(skills) {
       profileFields.skills = skills.split(',').map(skill => skill.trim())
   }

    // Checking and Build the Social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

   try {
   /** 
     ** Search profile user by id
     ** If the profile exist => update the data.
     ** If the profile doesn't exist => create new and save.
    */
       let profile = await Profile.findOne({user:request.user.id})
       
       if(profile) {
        profile = await Profile.findOneAndUpdate({user:request.user.id},        {$set:profileFields}, {new:true}
        );
        console.log('Profile Updated');
        return response.json(profile);
       }

       profile = new Profile(profileFields);
       await profile.save();
       console.log('Profile Created');
       response.json(profile);

    } catch (error) {
        console.error(error.message);
        return response.status(500).send('Server error');
   }
});

// @route  GET api/profile
// @desc   Get all profiles
// @access Public

router.get('/', async (request,response) => {
    try {
        const profiles = await Profile.find().populate('user',['name','avatar']);
        response.json(profiles);
    } catch (error) {
        console.error(error.message);
        return response.status(500).send('Server error');
    }
});

// @route  GET api/profile/user/:user_id
// @desc   Get all profile by user id
// @access Public

router.get('/user/:user_id', async (request,response) => {
    try {
        const profile = await Profile.findOne({user: request.params.user_id}).populate('user',['name','avatar']);
        if(!profile) {
            return response.status(400).json({msg: 'Profile not found'})
        }
        
        response.json(profile);

    } catch (error) {
        if(error.kind == 'ObjectId'){
            return response.status(400).json({msg: 'Profile not found'})
        }
        console.error(error.message);
        return response.status(500).send('Server error');
    }
});


// @route  DELETE api/profile/user/:user_id
// @desc   Delete user by id
// @access Private

router.delete('/', auth, async (request,response) => {
    /**
    * *Delete User, Profile and User's posts.
    */
    try {
        // TODO: Remove users posts.

        //*! Remove profile 
        await Profile.findOneAndDelete({user: request.user.id});

        //*! Remove user 
        await User.findOneAndDelete({_id: request.user.id});
        response.json({msg:"User deleted"});
         
    } catch (error) {
        if(error.kind == 'ObjectId'){
            return response.status(400).json({msg: 'Profile not found'})
        }
        console.error(error.message);
        return response.status(500).send('Server error');
    }
});

// @route  PUT api/profile/experience
// @desc   Add profile experience
// @access Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From is required').not().isEmpty()
]] ,async (request,response) => {
    /**
    * *Add expierence and edit experiences
    */
    const errors = validationResult(request);
    if(!errors.isEmpty()){
        return response(400).json({errors:error.array()})
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = request.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        // TODO: Add update experience logic
        const profile = await Profile.findOne({user:request.user.id});
        profile.experience.unshift(newExp);
        await profile.save();
        response.json(profile);
    } catch (error) {
        console.log(error);
        return response.status(500).send('Server error'); 
    }
});

// @route  DELETE api/profile/experiende/:_id
// @desc   Delete profile experience
// @access Private

router.delete('/experience/:exp_id', auth, async (request,response) => {
    /**
    * *Delete User experience
    */
    try {
      const profile = await Profile.findOne({user:request.user.id});

      // Get remove index 
      const removeIndex = profile.experience.map(item => item.id).indexOf(request.params._id);
      profile.experience.splice(removeIndex, 1);

      await profile.save();
      console.log('Experience deleted');
      response.json(profile);

    } catch (error) {
        console.error(error.message);
        return response.status(500).send('Server error');
    }
});

module.exports = router;    