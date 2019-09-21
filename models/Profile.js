const mongoose = require('mongoose');

const ProfileShema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    company: {
        type:String
    },
    website:{
        type:String
    },
    location:{
        type:String
    },
    status:{
        type:String,
        required:true
    },
    skills:{
        type:[String],
        required:true
    },
    bio:{
        type:String
    },
    githubUsername:{
        type:String
    },
    experience:[
        {
            title:{
                type:String,
                required:true
            },
            company:{
                type:String,
                required:true
            },
            location:{
                type: String
            },
            from:{
                type:Data,
                requried:true
            },
            to:{
                type:Date
            },
            current:{
                type:Boolean,
                default:false
            },
            description:{
                type:String
            }

        
        }
    ]

})

module.exports = Profile = mongoose.model('profile', ProfileShema);

