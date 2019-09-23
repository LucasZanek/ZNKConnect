const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const config = require('config');
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

    const newExperience = {
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
        profile.experience.unshift(newExperience);
        await profile.save();
        response.json(profile);
    } catch (error) {
        console.error(error.message);
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
      const removeIndex = profile.experience.map(item => item.id).indexOf(request.params.exp_id);
      profile.experience.splice(removeIndex, 1);

      await profile.save();
      console.log('Experience deleted');
      response.json(profile);

    } catch (error) {
        console.log(error.message);
        return response.status(500).send('Server error');
    }
});


// @route  PUT api/profile/education
// @desc   Add profile education
// @access Private

router.post('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of study is required').not().isEmpty(),
    check('from','From is required').not().isEmpty()
]] ,async (request,response) => {
    /**
    * *Add and edit Education
    */

    const errors = await validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors:errors.array()})
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = request.body;

    const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        // TODO: Add update education logic

        const profile = await Profile.findOne({user:request.user.id});
        profile.education.unshift(newEducation);
        await profile.save();
        response.json(profile);
    } catch (error) {
        console.error(error.message);
        return response.status(500).send('Server error'); 
    }
});

router.delete('/education/:edu_id', auth, async (request,response) => {
    /**
    * *Delete User education by id
    */
    try {
      const profile = await Profile.findOne({user:request.user.id});

      // Get remove index 
      const removeIndex = profile.education.map(item => item.id).indexOf(request.params.edu_id);
      profile.education.splice(removeIndex, 1);

      await profile.save();
      console.log('Education deleted');
      response.json(profile);

    } catch (error) {
        console.log(error.message);
        return response.status(500).send('Server error');
    }
});


// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public

router.get('/github/:username',(req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('gitHubClientId')}&
            client_secret=${config.get('gitHubSecret')}`,
            method:'GET',
            headers:{'user-agent':'nodejs'}
        };

        request(options, (error,response,body) => {
            if(error) console.error(error)
            if(response.statusCode !== 200){
                return res.status(404).json({msg:'No github profile found'});
            }
            res.json(JSON.parse(body));
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server error');
    }
});

  module.exports = router;
  

module.exports = router;    