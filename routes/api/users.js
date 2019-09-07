const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator/check');

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
(request,response) => {
    // Run and check the validations, if errors is not empty return the error array
    const errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors:errors.array()});
    }
    console.log(request.body)
    response.send('User route')

})

module.exports = router;    