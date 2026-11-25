# Audiora

**Audiora** is a full-stack, role-based music streaming web application built with the MERN stack. It delivers a dual experience tailored for both **Listeners** and **Artists** — listeners can discover releases, search tracks and albums, and stream music seamlessly through a persistent bottom audio player, while artists gain access to a dedicated **Artist Studio** to upload audio tracks, publish albums, manage artwork, and monitor live stream counts.

---

## Live Demo & Screenshots

> [!NOTE]
> Replace the placeholders below with your deployed URLs and application screenshots.

- **Live App (Frontend):** https://audiora.dpdns.org/
- **API Base URL (Backend):** https://audiora-g3k2.onrender.com

| Listener Home & Discovery | Artist Studio Dashboard |
| :---: | :---: |
| ![Listener Home Screenshot](https://placehold.co/600x340/09090b/10b981?text=Audiora+Home+Discovery) | ![Artist Studio Screenshot](https://placehold.co/600x340/09090b/10b981?text=Audiora+Artist+Studio) |

---

## Tech Stack

### Frontend
- **React (`^19.3.1`)** — Component-based UI with Context API (`AuthContext`, `AudioContext`, `NotificationContext`)
- **Vite (`^8.3.6`)** — Fast development server and production bundler
- **Tailwind CSS (`^4.3.5`)** — Utility-first styling via `@tailwindcss/vite`
- **React Router (`^7.18.5`)** — Client-side routing (`react-router-dom`) with role-based route guards
- **Axios (`^1.21.1`)** — Cookie-authenticated HTTP client (`withCredentials: true`)
- **Lucide React** — Crisp UI iconography

### Backend
- **Node.js & Express (`^5.3.0`)** — RESTful API server with modular routes, controllers, and middlewares
- **MongoDB & Mongoose (`^9.11.4`)** — Document database schemas for Users, Music tracks, and Albums
- **Multer (`^2.5.0`)** — Memory-storage multipart file handling for audio and artwork uploads
- **`music-metadata` (`^12.5.0`)** — Automatic server-side extraction of audio track duration

### Authentication
- **JWT (`jsonwebtoken`) with HTTP-only Cookies** — Stateless authentication signed with 7-day expiry, hashed passwords via `bcryptjs`, `cookie-parser`, and role-based access control (`listener` and `artist`)

### Media Storage
- **ImageKit (`@imagekit/nodejs`)** — Cloud media storage and CDN delivery for uploaded `.mp3` audio files (`audiora/music`) and cover artwork (`audiora/cover`)

---

## Key Features

- **Role-Based Authentication (`listener` & `artist`):**
  - Register, log in (via email or username), log out, and validate active sessions (`/api/auth/me`) using HTTP-only JWT cookies.
- **Protected & Guest Route Guards:**
  - `GuestRoute` prevents authenticated users from accessing `/login`, `/signup`, or `/register`.
  - `ProtectedRoute` guards authenticated routes such as `/library`.
  - `ArtistRoute` restricts `/studio/*` routes exclusively to users with the `artist` role.
- **Music Streaming & Persistent Bottom Audio Player:**
  - Global `AudioContext` + `BottomPlayer` stays mounted across pages with play/pause, next/previous track queue navigation, interactive seekbar, volume slider, and automatic playback reset upon logout.
- **Live Play-Count Tracking:**
  - Automatically records a stream via `PATCH /api/music/:musicId/play` once a user listens for 3 seconds (or 50% of the track duration), updating play counts in real time.
- **Search & Discovery:**
  - Browse releases and tracks on the Home feed (`/`), inspect full album tracklists on `/album/:albumId`, and search tracks, albums, and artists with debounced queries and category filters on `/search`.
- **Artist Studio Dashboard:**
  - Dedicated `/studio` creator workspace (`ArtistStudioLayout`) featuring:
    - **Dashboard (`/studio`):** Overview of uploaded tracks, albums, stream statistics, inline title editing, and track deletion.
    - **Upload Music (`/studio/upload`):** Upload audio files and cover artwork directly to ImageKit with automatic track duration parsing.
    - **Album Management (`/studio/albums`, `/studio/create-album`, `/studio/albums/:albumId`):** Create albums, update album titles/artwork, and add or remove tracks.

---

## Project Structure

```text
audiora/
├── backend/
│   ├── server.js                         # Entry point: DB connection & Express server startup
│   ├── package.json
│   ├── .env.example
│   ├── apiList.md
│   └── src/
│       ├── app.js                        # Express app, CORS, cookie-parser & API route mounting
│       ├── db/
│       │   └── db.js                     # MongoDB connection helper (MONGO_URL)
│       ├── middlewares/
│       │   └── auth.middleware.js        # Role-based JWT cookie guards (authUser, authArtist)
│       ├── models/
│       │   ├── user.model.js             # User schema (username, email, password, role, profileImage)
│       │   ├── music.model.js            # Music schema (uri, title, artist, coverImage, duration, plays)
│       │   └── album.model.js            # Album schema (title, coverUri, musics, artist)
│       ├── controllers/
│       │   ├── auth.controller.js        # Register, login, logout, and session lookup
│       │   ├── music.controller.js       # Upload, list, update, delete tracks & record play counts
│       │   ├── album.controller.js       # Create, list, fetch, update, delete albums & manage tracks
│       │   └── search.controller.js      # Public search across tracks, albums, and artists
│       ├── routes/
│       │   ├── auth.routes.js            # /api/auth routes
│       │   ├── music.routes.js           # /api/music routes
│       │   ├── album.routes.js           # /api/album routes
│       │   └── search.routes.js          # /api/search routes
│       └── services/
│           └── storage.service.js        # ImageKit upload helpers (uploadMusic, uploadCoverImage)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── vercel.json                       # SPA rewrite rules for Vercel deployment
│   ├── .env.example
│   ├── public/
│   │   ├── logo.png
│   │   ├── home-hero.png
│   │   └── about-hero.png
│   └── src/
│       ├── main.jsx                      # App root with BrowserRouter & AuthProvider
│       ├── App.jsx                       # Application routes & role-based RouteGuards
│       ├── config.js                     # API_URL resolved from VITE_API_URL
│       ├── index.css                     # Tailwind CSS setup & global styles
│       ├── components/
│       │   ├── BottomPlayer.jsx          # Persistent bottom audio player bar
│       │   ├── ComingSoon.jsx            # Placeholder view for upcoming pages
│       │   ├── Footer.jsx                # Application footer
│       │   ├── Navbar.jsx                # Top navigation & search bar
│       │   ├── RouteGuards.jsx           # GuestRoute, ProtectedRoute, ArtistRoute
│       │   └── Sidebar.jsx               # Main listener navigation sidebar
│       ├── context/
│       │   ├── AudioContext.jsx          # Global audio playback, queue & play-count tracking
│       │   ├── AuthContext.jsx           # Session state & /api/auth/me bootstrap
│       │   └── NotificationContext.jsx   # Global toast/banner notifications
│       ├── layouts/
│       │   ├── AppLayout.jsx             # Main shell (Sidebar, Navbar, Content, Footer, BottomPlayer)
│       │   └── ArtistStudioLayout.jsx    # Creator sidebar & scrollable Studio workspace
│       └── pages/
│           ├── Home.jsx                  # Public discovery feed
│           ├── Search.jsx                # Real-time search & category filtering
│           ├── PublicAlbumDetails.jsx    # Public album tracklist & playback page
│           ├── About.jsx                 # About Audiora page
│           ├── Login.jsx                 # User login page
│           ├── Signup.jsx                # Listener / Artist registration page
│           ├── Library.jsx               # Listener library page (route currently shows ComingSoon)
│           ├── ArtistDashboard.jsx       # Artist Studio analytics & track management
│           ├── UploadMusic.jsx           # Track & cover artwork upload form
│           ├── MyAlbums.jsx              # Artist's albums overview
│           ├── CreateAlbum.jsx           # New album creation form
│           ├── AlbumDetails.jsx          # Artist album editor (metadata & tracks)
│           └── NotFound.jsx              # 404 fallback page
│
└── README.md
```

---

## API Endpoints

All endpoints are mounted under `/api` in [`backend/src/app.js`](backend/src/app.js).

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new `listener` or `artist` account and set an HTTP-only JWT cookie |
| `POST` | `/api/auth/login` | Public | Log in using `email` or `username` and `password`, setting an HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear the `token` HTTP-only authentication cookie |
| `GET` | `/api/auth/me` | Protected (Authenticated) | Verify JWT cookie and return the logged-in user's profile |

### Music (`/api/music`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/music` | Public | Fetch paginated tracks (`?page=1&limit=12`, max `50`) populated with artist username |
| `POST` | `/api/music/upload` | Artist | Upload `music` (audio) and `coverImage` files to ImageKit, extract duration, and save track |
| `GET` | `/api/music/mymusic` | Artist | Fetch all tracks uploaded by the currently logged-in artist |
| `PATCH` | `/api/music/:musicId/play` | Protected (Authenticated) | Increment the play count (`plays`) for a track |
| `PATCH` | `/api/music/:musicId` | Artist (Owner) | Update a track's title |
| `DELETE` | `/api/music/:musicId` | Artist (Owner) | Delete a track and remove its reference from any albums |

### Albums (`/api/album`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/album` | Public | Fetch all albums populated with artist username |
| `GET` | `/api/album/:albumId` | Public | Fetch a specific album by ID with populated tracks and artist details |
| `POST` | `/api/album/create` | Artist | Create a new album with a `coverImage`, `title`, and optional owned `musics` IDs |
| `GET` | `/api/album/myalbums` | Artist | Fetch all albums created by the currently logged-in artist |
| `PATCH` | `/api/album/:albumId` | Artist (Owner) | Update an album's `title` and/or `coverImage` |
| `DELETE` | `/api/album/:albumId` | Artist (Owner) | Delete an album owned by the logged-in artist |
| `POST` | `/api/album/:albumId/music` | Artist (Owner) | Add an array of owned `musicIds` to an album |
| `DELETE` | `/api/album/:albumId/music/:musicId` | Artist (Owner) | Remove a specific track from an album |

### Search (`/api/search`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/search?q=<query>` | Public | Search tracks, albums, and artists (supports category keywords like `music`, `album`, `artist`) |

---

## Local Setup & Installation

### Prerequisites
- **Node.js** (v18+ recommended) & **npm**
- **MongoDB** instance (local or MongoDB Atlas)
- **ImageKit** account for audio and cover art storage

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd audiora
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following variables (using your own credentials):

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

> [!TIP]
> Ensure your database variable is named `MONGO_URL` as expected by `backend/src/db/db.js`. In production deployments (`NODE_ENV=production`), cookies are automatically configured with `secure: true` and `sameSite: 'none'`.

Start the backend development server:

```bash
npm run dev
```

The API server will run at `http://localhost:3000` (or the port specified in `PORT`).

### 3. Frontend Setup

Open a new terminal in the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` (refer to `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:3000
```

Start the Vite development server:

```bash
npm run dev
```

The frontend app will be available at `http://localhost:5173`.

---

## Upcoming Enhancements

- **Liked Music (`❤️`):** Save favorite tracks for quick access across sessions.
- **Your Library Collections:** Full personal library view (`/library`) to organize saved songs and albums.
- **Custom Playlists:** Create, reorder, and share user-curated playlists.
- **Expanded Album & Artist Detail Pages:** Richer artist profile pages, discographies, and Studio Settings (`/studio/settings`).
- **Player Queue, Shuffle & Repeat Controls:** Interactive queue drawer, shuffle playback, and single/all repeat modes in the bottom player.

---

## Author

**Ajay Kumar**
