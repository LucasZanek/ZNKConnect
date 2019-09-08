const jsonwebtoken = require('jsonwebtoken');
const config = require('config');

module.exports = (request,response,next) =>  {
    // Get the token from the header
    const token = request.header('x-auth-token');

    // Check if no token, and if the route is protected with this middleware return the unauth
    if(!token){
        return response.status(401).json({msg:"No token, authorization denied!"})
    }
    // Verify the token
    try {
        const decoded = jsonwebtoken.verify(token,config.get('jwtSecret'));
        request.user = decoded.user;
        next();
    } catch (error) {
        // If the token isn't valid
        response.status(401).json({msg:'Token is not valid'});
    }
}

