const express = require('express');
const router = express.Router();
const authMiddlewware = require('../../middleware/auth');

const User = require('../../models/User')
// @route  GET api/Auth
// @desc   Test route
// @access Public
router.get('/',authMiddlewware, async (request,response) =>{
    try {
        const user = await User.findById(request.user.id).select('-password');
        response.json(user);

    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
})

module.exports = router;    