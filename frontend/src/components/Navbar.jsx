/* eslint-disable react-hooks/set-state-in-effect */
import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Music,
  Search,
  X,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext.jsx'
import { API_URL } from '../config.js'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const lastNonSearchPathRef = useRef('/')
  const dropdownRef = useRef(null)
  const desktopInputRef = useRef(null)
  const mobileInputRef = useRef(null)

  const isStudio = location.pathname.startsWith('/studio')

  // Sync search input with URL query param on /search, and track last non-search path
  useEffect(() => {
    if (location.pathname === '/search') {
      const urlQ = new URLSearchParams(location.search).get('q') || ''
      setSearchInput((prev) => (prev !== urlQ ? urlQ : prev))
    } else {
      lastNonSearchPathRef.current = location.pathname + location.search
      setSearchInput('')
      setIsMobileSearchOpen(false)
    }
  }, [location.pathname, location.search])

  // Focus mobile input automatically when mobile search is expanded
  useEffect(() => {
    if (isMobileSearchOpen) {
      mobileInputRef.current?.focus()
    }
  }, [isMobileSearchOpen])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchChange(e) {
    const value = e.target.value
    setSearchInput(value)

    const isOnSearch = location.pathname === '/search'

    if (!isOnSearch) {
      if (value.trim().length > 0) {
        navigate(`/search?q=${encodeURIComponent(value)}`)
      }
    } else {
      if (value.trim().length === 0) {
        navigate(lastNonSearchPathRef.current || '/', { replace: true })
      } else {
        navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true })
      }
    }
  }

  function handleClear(inputRef) {
    setSearchInput('')
    if (location.pathname === '/search') {
      navigate(lastNonSearchPathRef.current || '/', { replace: true })
    }
    inputRef?.current?.focus()
  }

  function handleKeyDown(e, inputRef) {
    if (e.key === 'Escape') {
      inputRef?.current?.blur()
      if (isMobileSearchOpen) {
        setIsMobileSearchOpen(false)
      }
    }
  }

  async function handleLogout() {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true })
      logout()
      navigate('/')
    } catch (error) {
      console.error('Unable to log out.', error)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between px-3 sm:px-6 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/40 md:border-b-0 md:bg-transparent">
      {/* Mobile Expanded Search Bar (toggled when tapping mobile search icon on non-studio routes) */}
      {!isStudio && isMobileSearchOpen ? (
        <div className="flex md:hidden w-full items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            aria-label="Close search"
            className="flex items-center justify-center p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 focus-within:border-emerald-500/60 text-white transition-colors shadow-inner">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={(e) => handleKeyDown(e, mobileInputRef)}
              placeholder="Search music, albums, or artists..."
              autoFocus
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => handleClear(mobileInputRef)}
                aria-label="Clear search"
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Standard Navbar Layout: hidden on mobile when mobile search is open, always visible on desktop */}
      <div
        className={`w-full items-center justify-between gap-2 ${!isStudio && isMobileSearchOpen ? 'hidden md:flex' : 'flex'
          }`}
      >
        {/* Left section: Hamburger button & mobile logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 md:hidden transition-colors shrink-0"
          >
            <Menu size={22} />
          </button>

          <Link
            to="/"
            aria-label="Audiora Home"
            className="flex items-center gap-2 sm:gap-2.5 md:hidden group min-w-0"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-900/90 border border-emerald-500/30 group-hover:border-emerald-400 shadow-sm overflow-hidden shrink-0 transition-all duration-200">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="Audiora Logo"
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span
                  className="font-black text-xs text-emerald-400 select-none"
                  aria-hidden="true"
                >
                  A
                </span>
              )}
            </div>
            <span className="hidden min-[360px]:inline text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors truncate">
              Audiora
            </span>
          </Link>
        </div>

        {/* Center section: Desktop Centered Search Container with Home button and Pill Search Bar */}
        {!isStudio && (
          <div className="hidden md:flex flex-1 max-w-lg mx-4 items-center gap-2.5">
            <Link
              to="/"
              onClick={() => {
                if (location.pathname === '/search') {
                  setSearchInput('')
                }
              }}
              aria-label="Home"
              title="Home"
              className={`h-10 w-10 rounded-full shrink-0 flex items-center justify-center border transition-all ${location.pathname === '/'
                ? 'bg-zinc-800 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:scale-105'
                }`}
            >
              <Home size={19} />
            </Link>

            <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 focus-within:border-emerald-500/60 text-white transition-colors shadow-inner">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={desktopInputRef}
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={(e) => handleKeyDown(e, desktopInputRef)}
                placeholder="Search music, albums, or artists..."
                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => handleClear(desktopInputRef)}
                  aria-label="Clear search"
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Right section: Mobile Search Trigger + Profile dropdown / Auth buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {!isStudio && (
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search"
              className="flex md:hidden items-center justify-center p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              <Search size={20} />
            </button>
          )}

          {user ? (
            <div ref={dropdownRef} className="relative">
              {/* Header layout stays unchanged and consistent */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                className={`flex items-center gap-2 rounded-full border border-zinc-800/80 p-1 pr-2.5 sm:pr-3 transition-all hover:bg-zinc-800/80 shadow-sm ring-1 ring-white/[0.05] cursor-pointer ${isDropdownOpen ? 'bg-zinc-800' : 'bg-zinc-900/90'
                  }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs sm:text-sm font-bold text-zinc-950 shadow-sm shadow-emerald-500/20">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white max-w-[100px] sm:max-w-[160px] truncate">
                  {user.username}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-zinc-400 ${isDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Consistent Dropdown Menu matching design */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 sm:w-56 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/90 ring-1 ring-white/[0.08] p-1.5 space-y-0.5">
                  {user.role === 'artist' && (
                    <>
                      {isStudio ? (
                        <Link
                          to="/"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/70 hover:text-white"
                        >
                          <Music size={17} className="text-zinc-400" />
                          <span>Back to Audiora</span>
                        </Link>
                      ) : (
                        <Link
                          to="/studio"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/70 hover:text-white"
                        >
                          <LayoutGrid size={17} className="text-zinc-400" />
                          <span>Go to Artist Studio</span>
                        </Link>
                      )}
                      <div className="my-1 border-t border-zinc-800/80" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
                  >
                    <LogOut size={17} className="text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-full bg-white px-3.5 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-zinc-950 shadow-sm transition hover:bg-zinc-100 hover:scale-105 active:scale-95"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
