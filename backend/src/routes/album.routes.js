const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/auth.middleware');
const albumController = require('../controllers/album.controller');

const upload = multer({ storage: multer.memoryStorage() });

// API for creating album (only artist)
router.post('/create', authMiddleware.authArtist, upload.single('coverImage'), albumController.createAlbum);

// API to get all albums of logged in artist (placed before /:albumId so "myalbums" is not parsed as an ID)
router.get('/myalbums', authMiddleware.authArtist, albumController.getMyAllAlbums);


// API to get all albums (for listener/artist both)
router.get('/', albumController.getAllAlbums);

// Get specific album by ID  
router.get('/:albumId', albumController.getAlbumById);


// Delete album by logged in artist
router.delete('/:albumId', authMiddleware.authArtist, albumController.deleteAlbum);

// Update album details (title, coverImage)
router.patch('/:albumId', authMiddleware.authArtist, upload.single('coverImage'), albumController.updateAlbumDetails);

// Add tracks to album
router.post('/:albumId/music', authMiddleware.authArtist, albumController.addMusicToAlbum);

// Remove track from album
router.delete('/:albumId/music/:musicId', authMiddleware.authArtist, albumController.removeMusicFromAlbum);




module.exports = router;
