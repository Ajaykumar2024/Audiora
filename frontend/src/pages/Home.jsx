import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import { API_URL } from '../config.js';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Disc,
  Music,
  Sparkles,
  AlertCircle,
  Loader2,
  Mic2,
  Library,
} from 'lucide-react';

/**
 * Clean time-based greeting helper matching Audiora's standard.
 */
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Animated 3-Bar Live Equalizer Indicator.
 */
function PlayingEqualizer({ className = '' }) {
  return (
    <div className={`flex items-end gap-0.5 h-3.5 sm:h-4 shrink-0 ${className}`} aria-label="Now Playing">
      <span className="w-1 bg-emerald-400 rounded-full audiora-bar-1" />
      <span className="w-1 bg-emerald-400 rounded-full audiora-bar-2" />
      <span className="w-1 bg-emerald-400 rounded-full audiora-bar-3" />
    </div>
  );
}

/**
 * CoverArt helper with smooth hover zoom and enterprise zinc/emerald-tinted fallback.
 */
function CoverArt({ src, alt, className = '', fallbackIcon: FallbackIcon = Music }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/10 text-emerald-400/60 ${className}`}
      >
        <FallbackIcon className="w-7 h-7 sm:w-8 sm:h-8 opacity-70" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Reusable Spotify-Style Horizontal Carousel with Edge Arrows and Soft Edge Fade.
 */
function CarouselRow({ children }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [children]);

  const handleScroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount =
        direction === 'left'
          ? -containerRef.current.clientWidth * 0.75
          : containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row">
      {/* Left Edge Arrow & Fade Gradient */}
      {canScrollLeft && (
        <div className="hidden md:flex absolute left-0 top-0 bottom-3 w-16 z-20 items-center justify-start bg-gradient-to-r from-zinc-950/95 to-transparent pointer-events-none transition-opacity duration-200">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="pointer-events-auto ml-1 p-2.5 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 text-white hover:bg-zinc-800 shadow-xl opacity-0 group-hover/row:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Horizontal Scroll Container */}
      <div
        ref={containerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Right Edge Arrow & Fade Gradient */}
      {canScrollRight && (
        <div className="hidden md:flex absolute right-0 top-0 bottom-3 w-16 z-20 items-center justify-end bg-gradient-to-l from-zinc-950/95 to-transparent pointer-events-none transition-opacity duration-200">
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="pointer-events-auto mr-1 p-2.5 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 text-white hover:bg-zinc-800 shadow-xl opacity-0 group-hover/row:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong, togglePlay } = useContext(AudioContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [albums, setAlbums] = useState([]);
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [loadingAlbumPlayId, setLoadingAlbumPlayId] = useState(null);
  const [currentAlbumId, setCurrentAlbumId] = useState(null);
  const [heroImageError, setHeroImageError] = useState(false);

  // Reset active album if currentSong becomes null (e.g. stopped/logged out)
  useEffect(() => {
    if (!currentSong) {
      Promise.resolve().then(() => {
        setCurrentAlbumId(null);
      });
    }
  }, [currentSong]);

  // Concurrently fetch albums and music on mount
  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [albumsRes, musicRes] = await Promise.all([
        axios.get(`${API_URL}/api/album`, { withCredentials: true }),
        axios.get(`${API_URL}/api/music`, { withCredentials: true }),
      ]);

      setAlbums(albumsRes.data?.albums || []);
      setMusics(musicRes.data?.musics || []);
    } catch (err) {
      console.error('Failed to fetch home content:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load music content right now.';
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadInitialData = async () => {
      try {
        const [albumsRes, musicRes] = await Promise.all([
          axios.get(`${API_URL}/api/album`, { withCredentials: true }),
          axios.get(`${API_URL}/api/music`, { withCredentials: true }),
        ]);

        if (!ignore) {
          setAlbums(albumsRes.data?.albums || []);
          setMusics(musicRes.data?.musics || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch home content:', err);
          const message =
            err.response?.data?.message ||
            err.message ||
            'Unable to load music content right now.';
          setFetchError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  // Smart Quick-Play Picks: Interleaves up to 3 albums and 3 musics to eliminate duplication
  const quickPicks = useMemo(() => {
    const albumItems = (albums || []).slice(0, 3).map((a) => ({ ...a, type: 'album' }));
    const musicItems = (musics || []).slice(0, 3).map((m) => ({ ...m, type: 'music' }));

    const interleaved = [];
    const maxLen = Math.max(albumItems.length, musicItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (albumItems[i]) interleaved.push(albumItems[i]);
      if (musicItems[i]) interleaved.push(musicItems[i]);
    }

    // Fill remaining up to 6 from whichever pool has more items
    if (interleaved.length < 6) {
      const extraAlbums = (albums || []).slice(3).map((a) => ({ ...a, type: 'album' }));
      const extraMusics = (musics || []).slice(3).map((m) => ({ ...m, type: 'music' }));
      const extras = [...extraMusics, ...extraAlbums];
      for (const item of extras) {
        if (interleaved.length >= 6) break;
        interleaved.push(item);
      }
    }

    return interleaved.slice(0, 6);
  }, [albums, musics]);

  // Dynamic trending music derived by live plays count descending, tie-breaking by newest first
  const trendingMusics = useMemo(() => {
    return [...musics].sort((a, b) => {
      const playsDiff = (b.plays || 0) - (a.plays || 0);
      if (playsDiff !== 0) {
        return playsDiff;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [musics]);

  // Play button on album card or album tile
  const handleAlbumPlay = async (e, album) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Jis album pe click hua agar wahi currently active hai, toh toggle play/pause karo
    if (currentAlbumId === album._id) {
      togglePlay();
      return;
    }

    try {
      setLoadingAlbumPlayId(album._id);
      const res = await axios.get(`${API_URL}/api/album/${album._id}`, {
        withCredentials: true,
      });

      const populatedAlbum = res.data?.album;
      if (populatedAlbum?.musics && populatedAlbum.musics.length > 0) {
        setCurrentAlbumId(album._id);
        playSong(populatedAlbum.musics[0], populatedAlbum.musics, 0);
      }
    } catch (err) {
      console.error('Failed to play album:', err);
    } finally {
      setLoadingAlbumPlayId(null);
    }
  };

  // Music play / toggle handler (with guest login gate)
  const handleMusicPlay = (music, playlist = musics, index = 0) => {
    let targetQueue = playlist;
    let targetIndex = index;
    if (typeof playlist === 'number') {
      targetQueue = musics;
      targetIndex = playlist;
    }

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Individual music played: clear currentAlbumId so albums are not marked active
    setCurrentAlbumId(null);

    if (currentSong?._id === music._id) {
      togglePlay();
    } else {
      playSong(music, targetQueue, targetIndex);
    }
  };

  return (
    <div className="relative min-h-screen py-4 sm:py-6 pb-28 max-w-7xl mx-auto">
      {/* Scoped Keyframes for 3-Bar Equalizer */}
      <style>{`
        @keyframes audioraEq {
          0%, 100% { height: 3px; }
          50% { height: 14px; }
        }
        .audiora-bar-1 { animation: audioraEq 0.75s ease-in-out infinite; }
        .audiora-bar-2 { animation: audioraEq 0.75s ease-in-out infinite 0.2s; }
        .audiora-bar-3 { animation: audioraEq 0.75s ease-in-out infinite 0.4s; }
      `}</style>

      {/* 1. Ambient Top Glow for Visual Depth */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-4 h-72 bg-gradient-to-b from-emerald-500/15 via-emerald-950/10 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-8 sm:space-y-10">
        {/* =========================================================================
            1. UNIFIED DYNAMIC HERO BANNER (CONSISTENT WITH ABOUT PAGE HERO SECTION)
        ========================================================================== */}
        <section
          aria-label="Audiora hero greeting"
          className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-[#090e0d] p-6 sm:p-10 lg:p-14 shadow-2xl shadow-black/40 mb-8"
        >
          {/* Full-bleed atmospheric background image (/home-hero.png) */}
          {!heroImageError && (
            <img
              src="/home-hero.png"
              alt="Audiora music streaming atmosphere"
              onError={() => setHeroImageError(true)}
              className="absolute inset-0 w-full h-full object-cover object-[75%_center] sm:object-right md:object-right lg:object-[80%_center] opacity-65 sm:opacity-75 lg:opacity-90 transition-opacity duration-300 pointer-events-none select-none"
            />
          )}

          {/* Horizontal gradient readability mask: deep black behind text on left, transparent on right so headphones & soundwaves glow */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#090e0d] via-[#090e0d]/90 sm:via-[#090e0d]/75 lg:via-[#090e0d]/50 to-transparent pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Top & bottom subtle fade mask */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#090e0d] via-transparent to-[#090e0d]/30 pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Mobile-focused gradient overlay for crisp text readability */}
          <div
            className="sm:hidden absolute inset-0 bg-gradient-to-b from-[#090e0d]/80 via-transparent to-[#090e0d]/80 pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Single-Column Foreground Content (aligned with About hero) */}
          <div className="relative z-10 max-w-2xl lg:max-w-xl xl:max-w-2xl flex flex-col items-start space-y-4 sm:space-y-5 text-left pointer-events-auto">
            {/* Emerald Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <Sparkles size={13} className="shrink-0" />
              <span>{!user ? 'DISCOVER AUDIORA' : 'WELCOME BACK'}</span>
            </div>

            {/* Main Headline */}
            {!user ? (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Sound Unbound.{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Pure Fidelity.
                </span>
              </h1>
            ) : (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {getTimeGreeting()},{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  {user.username}
                </span>
              </h1>
            )}

            {/* Overview / Subtext */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              {!user
                ? 'Stream high-fidelity music and albums from independent artists worldwide. Log in to unlock full audio streaming.'
                : user.role === 'artist'
                  ? "Discover what's trending across Audiora or jump into Artist Studio to manage your releases."
                  : "Pick up where you left off or dive into today's trending music and curated albums."}
            </p>

            {/* Call-to-Actions (CTA) Responsive Single Line on Mobile */}
            <div className="flex flex-row items-center gap-2 sm:gap-3.5 w-full sm:w-auto pt-1">
              {!user ? (
                <>
                  {/* Primary Emerald Button */}
                  <Link
                    to="/register"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer"
                  >
                    <Sparkles size={14} className="shrink-0 sm:w-4 sm:h-4" />
                    <span>Sign Up Free</span>
                  </Link>

                  {/* Secondary Dark Button */}
                  <Link
                    to="/login"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-100 font-semibold text-xs sm:text-sm whitespace-nowrap border border-zinc-700/70 hover:border-zinc-600 transition-all cursor-pointer"
                  >
                    <span>Log In</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Primary Emerald Button: Play / Pause Trending (persistent across reload to avoid pop-in/layout shift) */}
                  {(loading || trendingMusics.length > 0) && (
                    <button
                      type="button"
                      disabled={loading || trendingMusics.length === 0}
                      onClick={() => {
                        if (trendingMusics.length > 0) {
                          handleMusicPlay(trendingMusics[0], trendingMusics, 0);
                        }
                      }}
                      className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 ${loading || trendingMusics.length === 0
                          ? 'bg-emerald-500/80 text-zinc-950/80 cursor-wait'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer'
                        }`}
                    >
                      {currentSong?._id === trendingMusics[0]?._id && isPlaying ? (
                        <>
                          <Pause size={14} className="fill-current shrink-0 sm:w-4 sm:h-4" />
                          <span>Pause Trending</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} className="fill-current shrink-0 sm:w-4 sm:h-4" />
                          <span>Play Trending</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Secondary Dark Button: Artist Studio or Library */}
                  {user.role === 'artist' ? (
                    <Link
                      to="/studio"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-100 font-semibold text-xs sm:text-sm whitespace-nowrap border border-zinc-700/70 hover:border-zinc-600 transition-all cursor-pointer"
                    >
                      <Mic2 size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                      <span>
                        <span className="hidden sm:inline">Open </span>Artist Studio
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/library"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-100 font-semibold text-xs sm:text-sm whitespace-nowrap border border-zinc-700/70 hover:border-zinc-600 transition-all cursor-pointer"
                    >
                      <Library size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                      <span>Your Library</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Global Error Notice */}
        {fetchError && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* =========================================================================
            2. SECTION 1 — TOP PICKS
        ========================================================================== */}
        <section>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Top Picks
            </h2>
          </div>

          {loading ? (
            /* Picks Grid Skeleton */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`pick-skeleton-${i}`}
                  className="flex items-center bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden animate-pulse min-w-0 ring-1 ring-white/[0.02]"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 shrink-0" />
                  <div className="px-3 sm:px-4 flex-1 space-y-1.5">
                    <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-800/60 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            quickPicks.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
                {quickPicks.map((item) => {
                  const isAlbum = item.type === 'album';
                  const isThisActive = isAlbum
                    ? currentAlbumId === item._id
                    : !currentAlbumId && currentSong?._id === item._id;
                  const isThisPlaying = isThisActive && isPlaying && !!currentSong;
                  const musicIndex = !isAlbum ? musics.findIndex((m) => m._id === item._id) : -1;

                  return (
                    <div
                      key={`quick-${item.type}-${item._id}`}
                      onClick={() => {
                        if (isAlbum) {
                          navigate(`/album/${item._id}`);
                        } else {
                          handleMusicPlay(item, musicIndex >= 0 ? musicIndex : 0);
                        }
                      }}
                      className="group relative flex items-center bg-zinc-900/70 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 min-w-0 shadow-sm hover:shadow-lg hover:shadow-black/40 ring-1 ring-white/[0.03]"
                    >
                      {/* Left square cover thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-zinc-900 relative overflow-hidden">
                        <CoverArt
                          src={isAlbum ? item.coverUri : item.coverImage}
                          alt={item.title}
                          fallbackIcon={isAlbum ? Disc : Music}
                        />
                      </div>

                      {/* Content area: Title + Equalizer or subtle Album label */}
                      <div className="px-3 sm:px-4 min-w-0 flex-1 pr-12 sm:pr-14">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`font-semibold text-xs sm:text-sm truncate transition-colors ${isThisActive ? 'text-emerald-400' : 'text-white'
                              }`}
                            title={item.title}
                          >
                            {item.title}
                          </span>
                          {isThisPlaying && <PlayingEqualizer />}
                        </div>
                        {isAlbum && (
                          <p className="text-[10px] sm:text-xs text-zinc-400 font-normal truncate mt-0.5">
                            Album
                          </p>
                        )}
                      </div>

                      {/* Floating circular emerald Play/Pause button on the right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAlbum) {
                            handleAlbumPlay(e, item);
                          } else {
                            handleMusicPlay(item, musicIndex >= 0 ? musicIndex : 0);
                          }
                        }}
                        disabled={isAlbum && loadingAlbumPlayId === item._id}
                        aria-label={
                          isAlbum
                            ? `Play ${item.title}`
                            : isThisPlaying
                              ? `Pause ${item.title}`
                              : `Play ${item.title}`
                        }
                        className={`absolute right-2 sm:right-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full p-2 sm:p-2.5 shadow-xl hover:scale-105 transition-all duration-300 z-10 cursor-pointer disabled:opacity-80 ${isThisPlaying || (isAlbum && loadingAlbumPlayId === item._id)
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                          }`}
                      >
                        {isAlbum && loadingAlbumPlayId === item._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        ) : isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-zinc-950" />
                        ) : (
                          <Play className="w-4 h-4 fill-zinc-950 translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>

        {/* =========================================================================
            3. SECTION 2 — TRENDING MUSIC
        ========================================================================== */}
        <section>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Music className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Trending Music
            </h2>
          </div>

          {loading ? (
            /* Music Card Carousel Skeleton */
            <div className="flex gap-4 sm:gap-5 overflow-x-hidden pb-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`music-card-skeleton-${i}`}
                  className="w-36 sm:w-44 md:w-48 shrink-0 bg-zinc-900/50 border border-zinc-800/70 p-3 sm:p-3.5 rounded-2xl animate-pulse flex flex-col ring-1 ring-white/[0.02]"
                >
                  <div className="aspect-square bg-zinc-800 rounded-xl mb-3" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : trendingMusics.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-zinc-400 text-sm">
              <Music className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p>No music available yet.</p>
            </div>
          ) : (
            <CarouselRow>
              {trendingMusics.map((music, index) => {
                const isThisActive = currentSong?._id === music._id;
                const isThisPlaying = isThisActive && isPlaying;

                return (
                  <div
                    key={music._id}
                    onClick={() => handleMusicPlay(music, trendingMusics, index)}
                    className="w-36 sm:w-44 md:w-48 shrink-0 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/70 hover:border-zinc-700/80 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer group flex flex-col hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5 ring-1 ring-white/[0.04]"
                  >
                    {/* Square Aspect-Ratio Cover with Live Equalizer Badge & Floating Play/Pause Button */}
                    <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-zinc-900 shadow-lg">
                      <CoverArt src={music.coverImage} alt={music.title} fallbackIcon={Music} />

                      {/* Live Animated Equalizer Badge when Playing */}
                      {isThisPlaying && (
                        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-emerald-500/30 shadow-md">
                          <PlayingEqualizer />
                        </div>
                      )}

                      {/* Bottom-right floating emerald Play/Pause button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMusicPlay(music, trendingMusics, index);
                        }}
                        aria-label={isThisPlaying ? `Pause ${music.title}` : `Play ${music.title}`}
                        className={`absolute right-2 bottom-2 p-2.5 sm:p-3 rounded-full bg-emerald-500 text-zinc-950 shadow-xl shadow-black/60 hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all duration-200 z-10 cursor-pointer ${isThisPlaying
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                          }`}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-zinc-950" />
                        ) : (
                          <Play className="w-4 h-4 fill-zinc-950 translate-x-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Bold Truncated Title & Subtle Artist Subtitle */}
                    <h3
                      className={`font-bold text-sm sm:text-base truncate transition-colors ${isThisActive ? 'text-emerald-400' : 'text-white'
                        }`}
                      title={music.title}
                    >
                      {music.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 truncate mt-1">
                      {music.artist?.username || 'Unknown Artist'}
                    </p>
                  </div>
                );
              })}
            </CarouselRow>
          )}
        </section>

        {/* =========================================================================
            4. SECTION 3 — FEATURED ALBUMS
        ========================================================================== */}
        <section>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Disc className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Albums
            </h2>
          </div>

          {loading ? (
            /* Album Card Carousel Skeleton */
            <div className="flex gap-4 sm:gap-5 overflow-x-hidden pb-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`album-card-skeleton-${i}`}
                  className="w-36 sm:w-44 md:w-48 shrink-0 bg-zinc-900/50 border border-zinc-800/70 p-3 sm:p-3.5 rounded-2xl animate-pulse flex flex-col ring-1 ring-white/[0.02]"
                >
                  <div className="aspect-square bg-zinc-800 rounded-xl mb-3" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : albums.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-zinc-400 text-sm">
              <Disc className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p>No albums available yet.</p>
            </div>
          ) : (
            <CarouselRow>
              {albums.map((album) => {
                const isThisActive = currentAlbumId === album._id;
                const isThisPlaying = isThisActive && isPlaying && !!currentSong;

                return (
                  <div
                    key={album._id}
                    onClick={() => navigate(`/album/${album._id}`)}
                    className="w-36 sm:w-44 md:w-48 shrink-0 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/70 hover:border-zinc-700/80 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer group flex flex-col hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5 ring-1 ring-white/[0.04]"
                  >
                    {/* Square Aspect-Ratio Album Cover with Bottom-Right Floating Play/Pause Button */}
                    <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-zinc-900 shadow-lg">
                      <CoverArt src={album.coverUri} alt={album.title} fallbackIcon={Disc} />

                      {/* Live Animated Equalizer Badge when Playing */}
                      {isThisPlaying && (
                        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-emerald-500/30 shadow-md">
                          <PlayingEqualizer />
                        </div>
                      )}

                      {/* Bottom-right floating emerald Play/Pause button */}
                      <button
                        type="button"
                        onClick={(e) => handleAlbumPlay(e, album)}
                        disabled={loadingAlbumPlayId === album._id}
                        aria-label={isThisPlaying ? `Pause ${album.title}` : `Play ${album.title}`}
                        className={`absolute right-2 bottom-2 p-2.5 sm:p-3 rounded-full bg-emerald-500 text-zinc-950 shadow-xl shadow-black/60 hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all duration-200 z-10 cursor-pointer disabled:opacity-80 ${isThisPlaying || loadingAlbumPlayId === album._id
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                          }`}
                      >
                        {loadingAlbumPlayId === album._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        ) : isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-zinc-950" />
                        ) : (
                          <Play className="w-4 h-4 fill-zinc-950 translate-x-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Card footer: bold truncated album.title & subtle subtitle */}
                    <h3
                      className={`font-bold text-sm sm:text-base truncate transition-colors ${isThisActive ? 'text-emerald-400' : 'text-white'
                        }`}
                      title={album.title}
                    >
                      {album.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 truncate mt-1">
                      {album.artist?.username || 'Unknown'} • {album.musics?.length || 0} music
                    </p>
                  </div>
                );
              })}
            </CarouselRow>
          )}
        </section>
      </div>
    </div>
  );
}
