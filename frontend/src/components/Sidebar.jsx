import { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Library,
  Mic2,
  X,
  Info,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Sidebar Component (Listener App)
 *
 * Designed with enterprise-grade aesthetics matching ArtistStudioLayout:
 * - bg-zinc-900 border-r border-zinc-800/80
 * - Active pill indicator on the left
 * - Emerald active highlighting (bg-emerald-500/15 text-emerald-400)
 * - Smooth hover transitions (hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100)
 * - Brand header with icon badge
 * - Dedicated Creator Studio section for artist accounts
 * - Persistent footer status card
 * - Explicit, individual navigation links without array mapping
 */
export default function Sidebar({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {/* =========================================================================
          1. MOBILE BACKDROP (Controlled by global TopBar hamburger)
      ========================================================================== */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* =========================================================================
          2. SIDEBAR NAVIGATION
          - Desktop: Static left column, h-full, w-64, shrink-0
          - Mobile / Tablet: Slide-out drawer with z-50
      ========================================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col pb-20 sm:pb-24 md:pb-0
          bg-zinc-900 border-r border-zinc-800/80 shadow-2xl md:shadow-none
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 shrink-0 h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header (h-16 matches global Navbar height) */}
        <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 border border-emerald-500/30 group-hover:border-emerald-400 shadow-sm overflow-hidden shrink-0 transition-all duration-200">
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="Audiora Logo"
                    className="w-full h-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span
                    className="font-black text-sm text-emerald-400 select-none"
                    aria-hidden="true"
                  >
                    A
                  </span>
                )}
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Audiora<span className="text-emerald-400">.</span>
                </span>
                <p className="text-[11px] text-zinc-400">Stream & Discover</p>
              </div>
            </Link>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Menu
          </div>

          {/* 1. Home Link */}
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) => `
              group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 relative
              ${isActive
                ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                )}
                <Home
                  size={20}
                  className={`shrink-0 transition-colors duration-200 ${isActive
                    ? 'text-emerald-400'
                    : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                />
                <span className="truncate">Home</span>
              </>
            )}
          </NavLink>
          {/*  Section - About Audiora */}
          <NavLink
            to="/about"
            onClick={onClose}
            className={({ isActive }) => `
              group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 relative
              ${isActive
                ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                )}
                <Info
                  size={20}
                  className={`shrink-0 transition-colors duration-200 ${isActive
                    ? 'text-emerald-400'
                    : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                />
                <span className="truncate">About Audiora</span>
              </>
            )}
          </NavLink>


          {/* 2. Your Library Link */}
          <NavLink
            to="/library"
            onClick={onClose}
            className={({ isActive }) => `
              group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 relative
              ${isActive
                ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                )}
                <Library
                  size={20}
                  className={`shrink-0 transition-colors duration-200 ${isActive
                    ? 'text-emerald-400'
                    : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                />
                <span className="truncate">Your Library</span>
              </>
            )}
          </NavLink>

          {/* 4. Creator / Artist Studio Section (Only for users with artist role) */}
          {user?.role === 'artist' && (
            <div className="pt-4 mt-2 border-t border-zinc-800/60 space-y-1.5">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Creator
              </div>
              <NavLink
                to="/studio"
                onClick={onClose}
                className={({ isActive }) => `
                  group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative
                  ${isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active left indicator pill */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                    )}

                    <Mic2
                      size={20}
                      className={`shrink-0 transition-colors duration-200 ${isActive
                        ? 'text-emerald-400'
                        : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                    />
                    <span className="truncate flex-1">Artist Studio</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-md">
                      PRO
                    </span>
                  </>
                )}
              </NavLink>
            </div>
          )}
        </nav>


      </aside>
    </>
  );
}
