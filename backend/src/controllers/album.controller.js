const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const albumModel = require('../models/album.model')
const musicModel = require('../models/music.model')
const { uploadCoverImage } = require('../services/storage.service')

//CREATE ALBUM by artist
async function createAlbum(req, res) {


    try {

        const artistId = req.user?.id

        if (!artistId) {
            return res.status(401).json({ message: "Unauthorized access" });
        }
        console.log(req.body)
        const { title, musics } = req.body
        if (!title) {
            return res.status(400).json({ message: "Title is required" })
        }

        const coverImage = req.file
        console.log(coverImage)
        if (!coverImage) {
            return res.status(400).json({ message: "Please upload album coverImage" })
        }



        let parsedMusics = [];
        if (musics) {
            if (typeof musics === "string") {
                try {
                    const parsed = JSON.parse(musics);  //convert into javascript format
                    parsedMusics = Array.isArray(parsed) ? parsed : [String(parsed)];
                } catch {
                    // Handles case where a single ID string was sent instead of JSON array
                    parsedMusics = [musics];
                }
            } else if (Array.isArray(musics)) {
                parsedMusics = musics;
            }
        }

        // Security Check: Verify that all provided tracks exist and belong to the requesting artist
        if (parsedMusics.length > 0) {
            const isValidIds = parsedMusics.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!isValidIds) {
                return res.status(400).json({ message: "Invalid music ID in musics" });
            }

            const uniqueParsedMusics = [...new Set(parsedMusics)];
            const validTracks = await musicModel.find({
                _id: { $in: uniqueParsedMusics },
                artist: artistId
            });

            if (validTracks.length !== uniqueParsedMusics.length) {
                return res.status(400).json({
                    message: "One or more tracks do not exist or do not belong to you"
                });
            }

            parsedMusics = validTracks.map(music => music._id);
        }

        const uploadedCover = await uploadCoverImage(coverImage.buffer)

        const album = await albumModel.create({
            title: title,
            coverUri: uploadedCover.url,
            musics: parsedMusics,
            artist: artistId
        })

        res.status(201).json({
            message: "album created successfully",
            album: {
                id: album._id,
                title: album.title,
                coverUri: album.coverUri,
                artist: album.artist,
                musics: album.musics
            }
        })


    } catch (err) {
        console.error("Create Album Error:", err);
        return res.status(500).json({
            message: "Failed to create Album !"
        })

    }

}

//Get all albums of logged in artist only
async function getMyAllAlbums(req, res) {

    try {
        const artistId = req.user?.id
        if (!artistId) {
            return res.status(401).json({ message: "Unauthorized access" })
        }

        const albums = await albumModel
            .find({ artist: artistId })
            .sort({ createdAt: -1 })// Latest album sabse upar dikhenge

        res.status(200).json({
            message: "Album fetch successfully",
            albums: albums
        })
    }
    catch (err) {
        console.log("failed to fetch albums", err)
        return res.status(500).json({
            message: "failed to fetch Albums"
        })
    }
}


//get specific album with its all musics
async function getAlbumById(req, res) {



    const albumId = req.params.albumId

    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
        return res.status(400).json({ message: "Invalid Album Id" })
    }
    try {

        const album = await albumModel
            .findById(albumId)
            .populate("musics")
            .populate("artist", "username ")

        if (!album) {
            return res.status(404).json({ message: "Album Not Found" })
        }

        res.status(200).json({
            message: "album fetch successfully ",
            album: album
        })
    } catch (err) {
        console.error("Get Album Error:", err);

        return res.status(500).json({ message: "faild to fetch this album" })
    }
}


//delete album by artist
async function deleteAlbum(req, res) {
    try {

        const artistId = req.user?.id
        const { albumId } = req.params


        if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
            return res.status(404).json({ message: "Invalid Album Id" })
        }
        const album = await albumModel.findById(albumId)
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        if (artistId !== album.artist.toString()) {
            return res.status(403).json({ message: "you can delete only own album" })
        }

        const deletedAlbum = await albumModel.findByIdAndDelete(albumId)

        res.status(200).json({
            message: "album deleted successfully",
            album: deletedAlbum
        })
    } catch (err) {
        console.error("Delete Album Error:", err)
        return res.status(500).json({ message: "faild to delete album" })
    }

}

// UPDATE ALBUM DETAILS (PATCH /api/album/:albumId)
async function updateAlbumDetails(req, res) {
    try {
        const { albumId } = req.params;

        if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
            return res.status(400).json({ message: "Invalid Album Id" });
        }

        const album = await albumModel.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        if (album.artist.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: You can update only your own album" });
        }

        const title = req.body?.title?.trim();
        const coverFile = req.file

        if (!title && !coverFile) {
            return res.status(400).json({ message: "Provide a title or cover image to update" });
        }

        if (title) {
            album.title = title
        }

        if (coverFile) {
            const uploadedCover = await uploadCoverImage(coverFile.buffer);
            album.coverUri = uploadedCover.url;
        }

        await album.save();
        await album.populate("musics");

        return res.status(200).json({
            message: "Album updated successfully",
            album
        });
    } catch (err) {
        console.error("Update Album Error:", err);
        return res.status(500).json({ message: "Failed to update album" });
    }
}

// ADD MUSIC TO ALBUM (POST /api/album/:albumId/music)
async function addMusicToAlbum(req, res) {
    try {
        const { albumId } = req.params;
        const { musicIds } = req.body;
        const artistId = req.user.id

        if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
            return res.status(400).json({ message: "Invalid Album Id" });
        }

        if (!Array.isArray(musicIds) || musicIds.length === 0) {
            return res.status(400).json({ message: "musicIds must be a non-empty array" });
        }

        const isValidMusicIds = musicIds.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!isValidMusicIds) {
            return res.status(400).json({ message: "Invalid music ID in musicIds" });
        }

        const album = await albumModel.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        if (album.artist.toString() !== artistId) {
            return res.status(403).json({ message: "Forbidden: You can add musics only to your own album" });
        }

        // Security Check: Ensure all musics exist, are not deleted, and belong to the requesting artist
        const uniqueMusicIds = [...new Set(musicIds)];
        const validMusics = await musicModel.find({
            _id: { $in: uniqueMusicIds },
            artist: artistId
        });

        if (validMusics.length !== uniqueMusicIds.length) {
            return res.status(400).json({
                message: "One or more musics do not exist or do not belong to you"
            });
        }

        const validMusicIds = validMusics.map(music => music._id);

        const updatedAlbum = await albumModel.findByIdAndUpdate(
            albumId,
            { $addToSet: { musics: { $each: validMusicIds } } },
            { returnDocument: 'after' }
        ).populate("musics");

        return res.status(200).json({
            message: "Musics added to album",
            album: updatedAlbum
        });
    } catch (err) {
        console.error("Add Music To Album Error:", err);
        return res.status(500).json({ message: "Failed to add musics to album" });
    }
}

// REMOVE MUSIC FROM ALBUM (DELETE /api/album/:albumId/music/:musicId)
async function removeMusicFromAlbum(req, res) {
    try {
        const { albumId, musicId } = req.params;

        if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
            return res.status(400).json({ message: "Invalid Album Id" });
        }

        if (!musicId || !mongoose.Types.ObjectId.isValid(musicId)) {
            return res.status(400).json({ message: "Invalid Music Id" });
        }

        const album = await albumModel.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        const artistId = req.user.id
        if (album.artist.toString() !== artistId) {
            return res.status(403).json({ message: "Forbidden: You can remove musics only from your own album" });
        }

        const updatedAlbum = await albumModel.findByIdAndUpdate(
            albumId,
            { $pull: { musics: musicId } },
            { returnDocument: 'after' }
        ).populate("musics");

        return res.status(200).json({
            message: "Music removed from album",
            album: updatedAlbum
        });
    } catch (err) {
        console.error("Remove Music From Album Error:", err);
        return res.status(500).json({ message: "Failed to remove music from album" });
    }
}



//GET ALL ALBUMS (FOR NORMAL USER) 
async function getAllAlbums(req, res) {



    try {
        const albums = await albumModel
            .find()
            .select("title coverUri artist musics createdAt")
            .populate("artist", "username ")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "album fetch successfully",
            albums: albums
        });
    } catch (err) {
        console.error("Get All Albums Error:", err);
        return res.status(500).json({ message: "Failed to fetch albums" });
    }
}

module.exports = {
    createAlbum,
    getAllAlbums,
    getAlbumById,
    deleteAlbum,
    getMyAllAlbums,
    updateAlbumDetails,
    addMusicToAlbum,
    removeMusicFromAlbum
}




