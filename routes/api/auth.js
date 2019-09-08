const express = require('express');
const router = express.Router();
const authMiddlewware = require('../../middleware/auth');
const config = require('config');
const jsonwebtoken = require('jsonwebtoken');
const {check,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../../models/User')
/**  
 * @route  GET api/Auth
 * @desc   Test route
 * @access Public
 */
router.get('/',authMiddlewware, async (request,response) =>{
    try {
        const user = await User.findById(request.user.id).select('-password');
        response.json(user);

    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
});

/** 
     * Generate salt and encrypt the password
     * @param password The password required for encrypt.
*/

/**  
 * @route  POST api/Auth
 * @desc   Authenticate user and get token
 * @access Public
 */
router.post('/',
[
    check('email','Please include a valid email').isEmail(),
    check('password','Password is required').exists()
],

async (request,response) => {
    // Run and check the validations, if errors is not empty return the error array
    const {email,password} = request.body;
    const validationErrors = validationResult(request);
    if(!validationErrors.isEmpty()){
        return response.status(400).json({errors:validationErrors.array()});
    }
    try {
        //* See if user exists
        let user = await User.findOne({email});
        if(!user) {
           return response.status(400).json([{msg:'Invalid credentials'}])
        }

        // Compare the user database password and the request password
        const passwordMatch = await bcrypt.compare(password,user.password);
    
        if(!passwordMatch) {
            return response.status(400).json([{msg:'Invalid credentials'}])
        }

        const payload = {
            user:{ 
                id:user.id
            }
        }

        // *Sign in the token, passing the secret and the payload, set the default expires and response with the token or an error.
        jsonwebtoken.sign(
            payload,
            config.get('jwtSecret'),
            // Todo change expires to an hour in prod.
            {expiresIn:360000},
            (err, token) => {
                if(err) throw err;
                return response.json({token});
            })

    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
})

module.exports = router;    