import { useState, useContext } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import BottomPlayer from '../components/BottomPlayer.jsx'
import Footer from '../components/Footer.jsx'
import { AuthContext } from '../context/AuthContext.jsx'

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useContext(AuthContext)
  const isStudioRoute = location.pathname.startsWith('/studio')

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Top body: navigation and page content */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Main listener sidebar navigation (hidden in Studio mode so Studio's own sidebar takes over) */}
        {!isStudioRoute && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}

        {/* Main content area */}
        <main className="flex-1 flex flex-col min-w-0 relative bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.06),rgba(9,9,11,1))] overflow-hidden">
          {/* Top bar with hamburger toggle */}
          <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

          {/* Area for the active route */}
          {isStudioRoute ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden pb-20 sm:pb-24">
              <Outlet context={{ isSidebarOpen, onCloseSidebar: () => setIsSidebarOpen(false) }} />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
              <div className="flex-1 shrink-0 px-4 sm:px-6">
                <Outlet />
              </div>
              <Footer />
            </div>
          )}
        </main>
      </div>

      {/* Persistent player stays mounted across route changes only when logged in */}
      {user && <BottomPlayer />}
    </div>
  )
}
