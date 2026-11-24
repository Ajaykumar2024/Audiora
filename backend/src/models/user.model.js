const mongoose =require('mongoose')


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase: true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    role:{
        type:String,
        enum:['listener','artist'],
        default:'listener'
    },
    profileImage:{
        type:String,
        default:'https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg'
    }
})

const userModel=mongoose.model('user',userSchema)

module.exports=userModel