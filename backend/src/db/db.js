const mongoose=require('mongoose')

const dotenv=require('dotenv')
dotenv.config()

async function connectDB(){
    if (!process.env.MONGO_URL) {
        throw new Error('MONGO_URL is not configured.')
    }

    await mongoose.connect(process.env.MONGO_URL)
}

module.exports=connectDB


