# Developers social media
### Using MERN Stack (MONGODB, EXPRESS, REACT, NODEJS)
> - jsonwebtoken
> - bcryptjs
> - mongoose
> - gravatar
> - express-validator

```
- git clone
- npm install
- Create file default.json in the config folder and add this with your secret data{
    "mongoURI":"YOUR MONGOURI",
       "jwtSecret": "mysecrettokken"
}   
- npm run server
```
----------------------------------------------------------------------------------------

## Back end at this moment:
> - [x] Endpoint for register an user working and handling the errors
> - [x] Registering an user in mongo db
> - [x] Get the user avatar or assign a default one
> - [x] Registering a secret jsonwebtoken and sending in the request response   
> - [x] Middleware for manage the protected routes 
> - [x] Checking the token if valid. Protecting the auth route based on the token
