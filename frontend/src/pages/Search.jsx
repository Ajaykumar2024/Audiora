/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import { API_URL } from '../config.js';
import {
  Play,
  Pause,
  Disc,
  Music,
  Search as SearchIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';

/**
 * Animated 3-Bar Live Equalizer Indicator matching Home.jsx.
 */
function PlayingEqualizer({ className = '' }) {
  return (
    <div
      className={`flex items-end gap-0.5 h-3.5 sm:h-4 shrink-0 ${className}`}
      aria-label="Now Playing"
    >
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

export default function Search() {
  const { user } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong, togglePlay } = useContext(AudioContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const rawQuery = searchParams.get('q') || '';
  const trimmedQuery = rawQuery.trim();

  const [musics, setMusics] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'music' | 'albums'
  const [loadingAlbumPlayId, setLoadingAlbumPlayId] = useState(null);
  const [currentAlbumId, setCurrentAlbumId] = useState(null);

  // Reset active album if currentSong becomes null
  useEffect(() => {
    if (!currentSong) {
      setCurrentAlbumId(null);
    }
  }, [currentSong]);

  // Debounced search with AbortController
  useEffect(() => {
    if (!trimmedQuery) {
      setMusics([]);
      setAlbums([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            withCredentials: true,
            signal: controller.signal,
          }
        );
        setMusics(res.data?.musics || []);
        setAlbums(res.data?.albums || []);
      } catch (err) {
        if (
          axios.isCancel(err) ||
          err.name === 'CanceledError' ||
          err.name === 'AbortError'
        ) {
          // Ignore aborted / canceled requests
          return;
        }
        console.error('Failed to perform search:', err);
        setError('Failed to load search results.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  // Handle Music play / toggle
  const handleMusicPlay = (music, index) => {
    if (!user) {
      navigate('/login', {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    setCurrentAlbumId(null);

    if (currentSong?._id === music._id) {
      togglePlay();
    } else {
      playSong(music, musics, index);
    }
  };

  // Handle Album play button click
  const handleAlbumPlay = async (e, album) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login', {
        state: { from: location.pathname + location.search },
      });
      return;
    }

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

  const showMusic = activeFilter === 'all' || activeFilter === 'music';
  const showAlbums = activeFilter === 'all' || activeFilter === 'albums';
  const hasNoResults =
    !loading &&
    Boolean(trimmedQuery) &&
    musics.length === 0 &&
    albums.length === 0;

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

      {/* Ambient Top Glow for Visual Depth */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-4 h-72 bg-gradient-to-b from-emerald-500/15 via-emerald-950/10 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* =========================================================================
            STATE 1: EMPTY STATE (!trimmedQuery)
        ========================================================================== */}
        {!trimmedQuery && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="p-4 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-500 mb-4 shadow-inner ring-1 ring-white/[0.04]">
              <SearchIcon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500/60" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5 tracking-tight">
              Search for music, albums, or artists using the top bar.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm">
              Discover your favorite songs, explore trending albums, or find
              talented artists across Audiora.
            </p>
          </div>
        )}

        {/* =========================================================================
            STATE 2: LOADING STATE
        ========================================================================== */}
        {loading && Boolean(trimmedQuery) && (
          <div className="space-y-6 animate-fadeIn">
            {/* Skeleton Header & Tabs */}
            <div className="space-y-3">
              <div className="h-7 bg-zinc-800 rounded-lg w-64 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-14 bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-8 w-18 bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Skeleton Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={`search-skeleton-${i}`}
                  className="bg-zinc-900/50 border border-zinc-800/70 p-3 sm:p-3.5 rounded-2xl animate-pulse flex flex-col ring-1 ring-white/[0.02]"
                >
                  <div className="aspect-square bg-zinc-800 rounded-xl mb-3" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: NO RESULTS STATE
        ========================================================================== */}
        {hasNoResults && (
          <div className="flex flex-col items-center justify-center min-h-[45vh] text-center px-4 animate-fadeIn">
            <div className="p-4 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-500 mb-4 shadow-inner ring-1 ring-white/[0.04]">
              <SearchIcon className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
              No results found for &ldquo;{trimmedQuery}&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6">
              Please check your spelling, or try searching with a different artist,
              album, or music title.
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-md border border-zinc-700/80 cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Error notification if request fails */}
        {error && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================================
            STATE 4: RESULTS VIEW
        ========================================================================== */}
        {!loading && Boolean(trimmedQuery) && !hasNoResults && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header & Filter Pills */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
                Search results for &ldquo;{trimmedQuery}&rdquo;
              </h1>

              {/* Instant Client-Side Filter Pills (switching does NOT trigger API) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-emerald-500 text-gray-950 font-semibold shadow-md shadow-emerald-500/20'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('music')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'music'
                      ? 'bg-emerald-500 text-gray-950 font-semibold shadow-md shadow-emerald-500/20'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Music
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('albums')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all cursor-pointer ${
                    activeFilter === 'albums'
                      ? 'bg-emerald-500 text-gray-950 font-semibold shadow-md shadow-emerald-500/20'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Albums
                </button>
              </div>
            </div>

            {/* --- MUSIC SECTION --- */}
            {showMusic && musics.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Music className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Music
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {musics.map((music, index) => {
                    const isThisActive = currentSong?._id === music._id;
                    const isThisPlaying = isThisActive && isPlaying;

                    return (
                      <div
                        key={music._id}
                        onClick={() => handleMusicPlay(music, index)}
                        className="bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/70 hover:border-zinc-700/80 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer group flex flex-col hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5 ring-1 ring-white/[0.04]"
                      >
                        {/* Artwork with live equalizer & floating Play/Pause button */}
                        <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-zinc-900 shadow-lg">
                          <CoverArt
                            src={music.coverImage}
                            alt={music.title}
                            fallbackIcon={Music}
                          />

                          {/* Live Animated Equalizer Badge when Playing */}
                          {isThisPlaying && (
                            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-emerald-500/30 shadow-md">
                              <PlayingEqualizer />
                            </div>
                          )}

                          {/* Floating emerald Play/Pause button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMusicPlay(music, index);
                            }}
                            aria-label={
                              isThisPlaying
                                ? `Pause ${music.title}`
                                : `Play ${music.title}`
                            }
                            className={`absolute right-2 bottom-2 p-2.5 sm:p-3 rounded-full bg-emerald-500 text-zinc-950 shadow-xl shadow-black/60 hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all duration-200 z-10 cursor-pointer ${
                              isThisPlaying
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

                        {/* Title & Artist */}
                        <h3
                          className={`font-bold text-sm sm:text-base truncate transition-colors ${
                            isThisActive ? 'text-emerald-400' : 'text-white'
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
                </div>
              </section>
            )}

            {/* Empty state when filtering exclusively for Music and none exist */}
            {activeFilter === 'music' && musics.length === 0 && (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-zinc-400 text-sm">
                <Music className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p>No music found for &ldquo;{trimmedQuery}&rdquo;</p>
              </div>
            )}

            {/* --- ALBUMS SECTION --- */}
            {showAlbums && albums.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Disc className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Albums
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {albums.map((album) => {
                    const isThisActive = currentAlbumId === album._id;
                    const isThisPlaying =
                      isThisActive && isPlaying && Boolean(currentSong);

                    return (
                      <div
                        key={album._id}
                        onClick={() => navigate(`/album/${album._id}`)}
                        className="bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/70 hover:border-zinc-700/80 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer group flex flex-col hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5 ring-1 ring-white/[0.04]"
                      >
                        {/* Album Cover & Floating Play/Pause Button */}
                        <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-zinc-900 shadow-lg">
                          <CoverArt
                            src={album.coverUri}
                            alt={album.title}
                            fallbackIcon={Disc}
                          />

                          {/* Live Animated Equalizer Badge when Playing */}
                          {isThisPlaying && (
                            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-emerald-500/30 shadow-md">
                              <PlayingEqualizer />
                            </div>
                          )}

                          {/* Floating emerald Play/Pause button */}
                          <button
                            type="button"
                            onClick={(e) => handleAlbumPlay(e, album)}
                            disabled={loadingAlbumPlayId === album._id}
                            aria-label={
                              isThisPlaying
                                ? `Pause ${album.title}`
                                : `Play ${album.title}`
                            }
                            className={`absolute right-2 bottom-2 p-2.5 sm:p-3 rounded-full bg-emerald-500 text-zinc-950 shadow-xl shadow-black/60 hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all duration-200 z-10 cursor-pointer disabled:opacity-80 ${
                              isThisPlaying || loadingAlbumPlayId === album._id
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

                        {/* Title & Artist / Musics count */}
                        <h3
                          className={`font-bold text-sm sm:text-base truncate transition-colors ${
                            isThisActive ? 'text-emerald-400' : 'text-white'
                          }`}
                          title={album.title}
                        >
                          {album.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 truncate mt-1">
                          {album.artist?.username || 'Unknown'} •{' '}
                          {album.musics?.length || 0} music
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty state when filtering exclusively for Albums and none exist */}
            {activeFilter === 'albums' && albums.length === 0 && (
              <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-zinc-400 text-sm">
                <Disc className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p>No albums found for &ldquo;{trimmedQuery}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
