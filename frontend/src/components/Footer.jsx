import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';

/**
 * Global Footer Component for Audiora
 *
 * Fully responsive 12-column grid architecture across mobile (<640px),
 * tablet (640px–1023px), and desktop (>=1024px) viewports with
 * midnight-blueish styling and persistent BottomPlayer clearance.
 */
export default function Footer() {
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const { user } = useContext(AuthContext) || {};
  const { currentSong } = useContext(AudioContext) || {};

  // 1. Route Visibility Rules (Strictly Hide on Auth & Artist Studio)
  if (
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/studio')
  ) {
    return null;
  }

  return (
    <footer className="w-full shrink-0 overflow-hidden mt-12 sm:mt-16 border-t border-slate-800/80 bg-gradient-to-b from-[#0b1324] via-[#080e1c] to-[#050913] backdrop-blur-md text-slate-400 shadow-[0_-12px_32px_-16px_rgba(14,165,233,0.12)]">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 ${user || currentSong ? 'pb-24 sm:pb-32 lg:pb-32' : 'pb-10'
          }`}
      >
        {/* Top Grid: 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b border-slate-800/70">
          {/* Column 1 — Brand & Logo (sm:col-span-2 lg:col-span-5) */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3.5 sm:gap-4 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900/90 border-2 border-emerald-500/25 group-hover:border-emerald-400 shadow-lg shadow-emerald-950/50 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300 group-hover:scale-105">
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="Audiora Logo"
                    className="w-full h-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span
                    className="w-full h-full flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-400 select-none"
                    aria-hidden="true"
                  >
                    A
                  </span>
                )}
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Audiora<span className="text-emerald-400">.</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mt-3">
              Stream high-fidelity music and curated albums from independent artists worldwide.
            </p>
          </div>

          {/* Column 2 — Explore Navigation (sm:col-span-1 lg:col-span-4) */}
          <div className="sm:col-span-1 lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Explore
            </h3>
            <ul className="grid grid-cols-2 sm:flex sm:flex-col gap-2.5">
              <li>
                <Link
                  to="/"
                  className="inline-block py-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/library"
                  className="inline-block py-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Your Library
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="inline-block py-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  About Audiora
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Connect / Dummy Socials (sm:col-span-1 lg:col-span-3 lg:flex lg:flex-col lg:items-end) */}
          <div className="sm:col-span-1 lg:col-span-3 lg:flex lg:flex-col lg:items-end">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                Connect
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="GitHub"
                  className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="X (Twitter)"
                  className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Instagram"
                  className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="LinkedIn"
                  className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.95 0-1.72.77-1.72 1.72s.77 1.72 1.72 1.72 1.72-.77 1.72-1.72-.77-1.72-1.72-1.72M7.86 18.5v-8.37H5.07v8.37h2.79z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Responsive flex layout */}
        <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-center sm:text-left text-xs text-slate-400">
          <p>© 2026 Audiora. All rights reserved.</p>
          <p>
            Developed by{' '}
            <span className="font-semibold text-slate-200 hover:text-emerald-400 transition-colors">
              Ajay Kumar
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
