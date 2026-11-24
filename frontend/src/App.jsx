import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import ArtistStudioLayout from './layouts/ArtistStudioLayout.jsx'
import { AudioProvider } from './context/AudioContext'
import { NotificationProvider } from './context/NotificationContext'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home'
import Search from './pages/Search'
import UploadMusic from './pages/UploadMusic.jsx'
import ArtistDashboard from './pages/ArtistDashboard.jsx'
import MyAlbums from './pages/MyAlbums.jsx'
import CreateAlbum from './pages/CreateAlbum.jsx'
import AlbumDetails from './pages/AlbumDetails.jsx'
import PublicAlbumDetails from './pages/PublicAlbumDetails.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import { ProtectedRoute, ArtistRoute, GuestRoute } from './components/RouteGuards.jsx'
import ComingSoon from './components/ComingSoon.jsx'

function Page({ title }) {
  return (
    <section>
      <h1 className="text-3xl font-bold text-zinc-50">{title}</h1>
    </section>
  )
}

export default function App() {
  return (
    <NotificationProvider>
      <AudioProvider>
        <Routes>
          {/* Guest Routes - only accessible when unauthenticated */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
          </Route>

          <Route element={<AppLayout />}>
            {/* Public Discovery Routes */}
            <Route index element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/album/:albumId" element={<PublicAlbumDetails />} />
            <Route path="/about" element={<About />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/library" element={<ComingSoon
                title="Your Library"
                description="We're building your personal music space so you can save favorite releases, organize custom collections, and pick up right where you left off."

              />} />
            </Route>

            {/* Artist Studio Routes */}
            <Route element={<ArtistRoute />}>
              <Route path="/studio" element={<ArtistStudioLayout />}>
                <Route index element={<ArtistDashboard />} />
                <Route path="upload" element={<UploadMusic />} />
                <Route path="albums" element={<MyAlbums />} />
                <Route path="create-album" element={<CreateAlbum />} />
                <Route path="albums/:albumId" element={<AlbumDetails />} />
                <Route path="settings" element={<ComingSoon
                  title="Studio Settings"
                  description="Creator customization and studio controls are being finalized. Soon you'll be able to manage your public artist profile and upload preferences right here."

                />} />
              </Route>
            </Route>

            {/* Custom 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AudioProvider>
    </NotificationProvider>
  )
}
