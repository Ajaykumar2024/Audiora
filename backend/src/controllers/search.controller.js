const userModel = require('../models/user.model');
const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');

async function search(req, res) {
    try {
        const q = (req.query.q || '').trim();

        if (!q) {
            return res.status(200).json({
                message: "Empty query",
                musics: [],
                albums: []
            });
        }

        const lowerQ = q.toLowerCase();
        const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i');

        const isMusicCategory = ['music', 'musics', 'song', 'songs', 'track', 'tracks'].includes(lowerQ);
        const isAlbumCategory = ['album', 'albums'].includes(lowerQ);
        const isArtistCategory = ['artist', 'artists'].includes(lowerQ);

        let musicsQuery;
        let albumsQuery;

        if (isArtistCategory) {
            musicsQuery = musicModel
                .find()
                .sort({ createdAt: -1 })
                .limit(12)
                .populate('artist', 'username');

            albumsQuery = albumModel
                .find()
                .select('title coverUri artist musics createdAt')
                .sort({ createdAt: -1 })
                .limit(12)
                .populate('artist', 'username');
        } else {
            const matchingArtists = await userModel
                .find({ role: 'artist', username: regex })
                .select('_id');
            const artistIds = matchingArtists.map(artist => artist._id);

            const matchFilter = {
                $or: [
                    { title: regex },
                    { artist: { $in: artistIds } }
                ]
            };

            if (isMusicCategory) {
                musicsQuery = musicModel
                    .find()
                    .sort({ createdAt: -1 })
                    .limit(12)
                    .populate('artist', 'username');

                albumsQuery = albumModel
                    .find(matchFilter)
                    .select('title coverUri artist musics createdAt')
                    .sort({ createdAt: -1 })
                    .limit(12)
                    .populate('artist', 'username');
            } else if (isAlbumCategory) {
                musicsQuery = musicModel
                    .find(matchFilter)
                    .sort({ createdAt: -1 })
                    .limit(12)
                    .populate('artist', 'username');

                albumsQuery = albumModel
                    .find()
                    .select('title coverUri artist musics createdAt')
                    .sort({ createdAt: -1 })
                    .limit(12)
                    .populate('artist', 'username');
            } else {
                musicsQuery = musicModel
                    .find(matchFilter)
                    .sort({ createdAt: -1 })
                    .limit(12)
                    .populate('artist', 'username');

                albumsQuery = albumModel
                    .find(matchFilter)
                    .select('title coverUri artist musics createdAt')
                    .sort({ createdAt: -1 })
                    .limit(12)
                    .populate('artist', 'username');
            }
        }

        const [musics, albums] = await Promise.all([
            musicsQuery,
            albumsQuery
        ]);

        return res.status(200).json({
            message: "Search results fetched successfully",
            musics,
            albums
        });
    } catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({
            message: "Failed to perform search"
        });
    }
}

module.exports = {
    search
};
