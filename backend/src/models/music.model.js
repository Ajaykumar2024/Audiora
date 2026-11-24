const mongoose=require('mongoose')

const musicSchema= new mongoose.Schema({
    uri:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    artist:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    coverImage: { 
        type: String, 
        required: true // Artwork URL
  },
  duration: { 
    type: Number, 
    required: true // Duration in seconds (e.g., 210 = 3:30)
  },
  plays: { 
    type: Number, 
    default: 0 
},
},{ timestamps: true })


const musicModel= mongoose.model('music',musicSchema)

module.exports=musicModel