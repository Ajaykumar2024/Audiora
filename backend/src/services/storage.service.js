const ImageKit= require('@imagekit/nodejs')
require('dotenv').config(); 

const ImagekItClient= new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY,
})
 

async function uploadMusic(buffer){
        
    const result =await ImagekItClient.files.upload({
        file:buffer.toString("base64"),
        fileName:'music_' + Date.now() + '.mp3',
        folder:"audiora/music"
    })

    return result ;
}


async function uploadCoverImage(buffer){
        
    const result =await ImagekItClient.files.upload({
        file:buffer.toString("base64"),
        fileName:'cover' + Date.now() + '.jpg',
        folder:"audiora/cover"
    })

    return result ;
}

module.exports={uploadMusic , uploadCoverImage}