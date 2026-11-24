const mongoose = require('mongoose')
const musicModel = require('../models/music.model')
const jwt = require('jsonwebtoken')
const { uploadMusic, uploadCoverImage } = require('../services/storage.service')
const albumModel = require('../models/album.model')
const mm = require("music-metadata"); // Duration nikalne ke liye



//CREATE MUSIC
async function createMusic(req, res) {

    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ message: "unauthorized user" })
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token!" })
    }
    if (decoded.role !== 'artist') {
        return res.status(403).json({ message: "you don't have acess to create an music" })
    }

    try {
        const { title } = req.body

        if (!title) {
            return res.status(400).json("Title is required")
        }

        const musicFile = req.files?.music?.[0]
        const coverFile = req.files?.coverImage?.[0]
        console.log(musicFile)
        console.log(coverFile)

        if (!musicFile || !coverFile) {
            return res.status(400).json({ message: "Please upload a music file and cover Image Both" });
        }

        //Schema ke liye duration nikalna zaroori hai
        const metadata = await mm.parseBuffer(musicFile.buffer, musicFile.mimetype);
        const durationInSeconds = Math.round(metadata.format.duration);

        const musicUrl = (await uploadMusic(musicFile.buffer)).url
        const coverUrl = (await uploadCoverImage(coverFile.buffer)).url


        const music = await musicModel.create({
            uri: musicUrl,
            title: title,
            artist: decoded.id,
            coverImage: coverUrl,
            duration: durationInSeconds

        })

        return res.status(201).json({
            message: "music uploaded successfully ",
            music: {
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist,
                coverImage: music.coverImage,
                duration: music.duration

            }

        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to create Music !" })
    }

}


//GET all music of logged in artist
async function getMyAllMusics(req, res) {

    try {
        const artistId = req.user.id

        const musics = await musicModel
            .find({ artist: artistId })
            .sort({ createdAt: -1 }); // Latest gaane sabse upar dikhenge

        res.status(200).json({
            message: "musics fetch successfully",
            totalMusics: musics.length,
            musics: musics
        })
    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch artist musics",
        });

    }



}

//update music title of logged in artist
async function updateMusic(req, res) {

    try {
        const artistId = req.user.id
        const musicId = req.params.musicId

        const { title } = req.body
        if (!title) {
            return res.status(400).json("title is required")
        }

        const music = await musicModel.findById(musicId)

        if (!music) {
            return res.status(404).json({ message: "Track not found" });
        }

        if (artistId !== music.artist.toString()) {
            return res.status(403).json({ message: "you can edit only own musics" })
        }



        const updatedMusic = await musicModel.findByIdAndUpdate(
            musicId,
            { $set: { title: title } },
            { returnDocument: 'after' }
        )

        res.status(200).json({
            message: "music updated successfully",
            music: {
                id: updatedMusic._id,
                title: updatedMusic.title,
                artist: updatedMusic.artist,
                updatedAt: updatedMusic.updatedAt
            }
        })


    } catch (err) {
        return res.status(500).json({
            message: "failed to update music"
        })
    }

}


//Delete a music (only artist)
async function deleteMusic(req, res) {

    try {
        const { musicId } = req.params
        const artistId = req.user.id

        const music = await musicModel.findById(musicId)
        if (!music) {
            return res.status(404).json({ message: "music not found" })
        }

        if (artistId !== music.artist.toString()) {
            return res.status(403).json({ message: "you can delete only own music" })
        }

        // Remove this track ID from any albums that contain it
        await albumModel.updateMany(
            { musics: musicId },
            { $pull: { musics: musicId } }
        );

        const deletedMusic = await musicModel.findByIdAndDelete(musicId)

        res.status(200).json({
            message: "music deleted successfully",
            music: deletedMusic
        })

    } catch (err) {
        console.error("Error deleting music:", err); // Debugging ke liye
        return res.status(500).json({ message: "failed to delete" })
    }


}






//GET ALL MUSICS(NORMAL USER)
async function getAllMusics(req, res) {

    try {

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
        const skip = (page - 1) * limit;
        const musics = await musicModel
            .find()
            .skip(skip)
            .limit(limit)
            .populate("artist", "username ")
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: "all musics fetch successfully !",
            musics: musics

        })

    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch musics",
        })


    }

}





// Track live play count for music
async function playMusic(req, res) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (decoded.role !== 'user' && decoded.role !== 'artist') {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
        const { musicId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(musicId)) {
            return res.status(400).json({ message: "Invalid music ID" });
        }

        const updatedMusic = await musicModel.findByIdAndUpdate(
            musicId,
            { $inc: { plays: 1 } },
            { new: true }
        ).select('_id plays');

        if (!updatedMusic) {
            return res.status(404).json({ message: "Music not found" });
        }

        return res.status(200).json({
            message: "Play count updated",
            musicId: updatedMusic._id,
            plays: updatedMusic.plays
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to update play count"
        });
    }
}

module.exports = { createMusic, getAllMusics, getMyAllMusics, updateMusic, deleteMusic, playMusic, trackPlayCount: playMusic }