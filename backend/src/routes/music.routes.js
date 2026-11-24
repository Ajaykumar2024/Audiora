const express = require('express')

const router= express.Router()
const musicController=require('../controllers/music.controller')
const multer = require('multer');
const authMiddleware=require('../middlewares/auth.middleware')


const upload=multer({storage:multer.memoryStorage()})


//API for uploading music (only artist)
router.post('/upload',
    upload.fields([
        { name: 'music', maxCount: 1 }, 
        { name: 'coverImage', maxCount: 1 }
    ])
    , musicController.createMusic
)

//fetch all music uloaded by loggedin artist
router.get("/mymusic",authMiddleware.authArtist,musicController.getMyAllMusics)

//PATCH : record play count (authenticated directly in controller)
router.patch('/:musicId/play', musicController.playMusic)

//PATCH : update music title(or cover page in future): only artist
router.patch('/:musicId',authMiddleware.authArtist,musicController.updateMusic)


//Deletes a music from the database and removes its audio file from cloud storage.
router.delete("/:musicId",authMiddleware.authArtist,musicController.deleteMusic)






//API for get all musics(for normal 'user')
router.get('/',musicController.getAllMusics)


module.exports=router
