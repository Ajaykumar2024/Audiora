For a complete Spotify-like music application with User and Artist roles, you should build approximately 20 to 24 REST API endpoints divided across five core modules. This structure covers authentication, music uploads, album organization, user discovery, and personal playlists.

1. Authentication & Profile APIs (4 Endpoints)

These routes handle account creation and session security for both roles.
• POST /api/auth/register: Creates a new account and accepts a role field ("user" or "artist").
• POST /api/auth/login: Verifies credentials and sets the JWT in an HTTP-only cookie.
• POST /api/auth/logout: Clears the authentication cookie to log the user out.
• GET /api/auth/me: Returns the currently logged-in user's profile details and role.

2. Music Management APIs — Artist Only (4 Endpoints)

These endpoints allow artists to upload and maintain their audio tracks.
• POST /api/music/upload: Accepts an audio file (via multer + Cloudinary/AWS S3) and metadata (title, genre, coverImage) to create a track.
• GET /api/music/my-tracks: Fetches all songs uploaded by the currently logged-in artist.
• PATCH /api/music/:id: Updates track details like the title or cover art, verifying the requester owns the track.
• DELETE /api/music/:id: Deletes a track from the database and removes its audio file from cloud storage.

3. Album Management APIs — Artist Only (5 Endpoints)

These routes let artists group their tracks into albums (expanding on the createAlbum controller you shared).
• POST /api/albums: Creates a new album with a title, coverImage, and an array of musics IDs.
• PATCH /api/albums/:id/add-music: Pushes a new track ID into an existing album's musics array.
• PATCH /api/albums/:id/remove-music: Removes a specific track ID from an album without deleting the song itself.
• PATCH /api/albums/:id: Edits album metadata such as the title or release description.
• DELETE /api/albums/:id: Deletes the album document while keeping the individual songs intact.

4. Music Discovery & Streaming APIs — Both Roles (5 Endpoints)

These are the core playback and browsing routes accessible to any authenticated user.
• GET /api/music: Fetches a paginated list of all available tracks, supporting query filters like ?search=, ?genre=, or ?artist=.
• GET /api/music/:id: Retrieves full metadata for a single song and populates the artist's name.
• GET /api/music/:id/stream: Streams the audio file in chunks using HTTP Range headers so users can seek forward and backward smoothly.
• GET /api/albums: Lists all published albums with cover art and artist names.
• GET /api/albums/:id: Fetches a single album and uses .populate('musics') to return the complete tracklist.

5. User Engagement & Playlists APIs — Both Roles (5 Endpoints)

These endpoints give the application its interactive, Spotify-like experience.
• POST /api/music/:id/like: Toggles a song in or out of the user's likedSongs array.
• GET /api/users/liked-songs: Returns all songs the logged-in user has liked.
• POST /api/playlists: Creates a custom user playlist with a name and optional description.
• PATCH /api/playlists/:id/tracks: Adds or removes a song ID from a user's custom playlist.
• GET /api/playlists/my-playlists: Fetches all custom playlists created by the logged-in user.

Recommended Architecture Tip

Instead of repeating JWT verification and role checks inside every controller function, create two reusable Express middlewares:
1. verifyToken: Checks req.cookies.token and attaches req.user = decoded.
2. isArtist: Checks if req.user.role === 'artist' and passes control with next(), returning a 403 Forbidden otherwise.
Would you like to design the Mongoose schemas (User, Music, Album, Playlist) next, or see how to set up file uploads with multer and Cloudinary for the song upload API?
