import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import { API_URL } from '../config.js';
import {
  ArrowLeft,
  Disc,
  Play,
  Pause,
  Clock,
  Calendar,
  User,
  Music as MusicIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';

/**
 * Format music duration in seconds to mm:ss format.
 */
const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '0:00';
  const totalSecs = Math.round(Number(seconds));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Format total runtime into human-friendly format (e.g. 1 hr 12 min or 42 min 10 sec).
 */
const formatTotalRuntime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0 min';
  const totalSecs = Math.round(Number(seconds));
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  if (mins > 0) {
    return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
  }
  return `${secs} sec`;
};

/**
 * Format timestamp into readable date (e.g. Oct 24, 2026).
 */
const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function PublicAlbumDetails() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong, togglePlay } = useContext(AudioContext);

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Fetch album on mount and whenever albumId changes
  useEffect(() => {
    let isMounted = true;

    const fetchAlbum = async () => {
      if (!albumId) return;
      setLoading(true);
      setFetchError('');

      try {
        const response = await axios.get(`${API_URL}/api/album/${albumId}`, {
          withCredentials: true,
        });

        if (isMounted) {
          setAlbum(response.data?.album || null);
        }
      } catch (err) {
        console.error('Failed to fetch album details:', err);
        if (isMounted) {
          const message =
            err.response?.data?.message ||
            err.message ||
            'Could not find the requested album.';
          setFetchError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAlbum();

    return () => {
      isMounted = false;
    };
  }, [albumId]);

  // Total runtime of the album
  const totalDuration = (album?.musics || []).reduce(
    (sum, m) => sum + (Number(m.duration) || 0),
    0
  );

  const musicCount = album?.musics?.length || 0;

  // Check if a song from this album is actively in player
  const isSongFromThisAlbumPlaying =
    album?.musics &&
    album.musics.some((m) => m._id === currentSong?._id);

  // Play All handler with guest login gate
  const handlePlayAll = () => {
    if (!album?.musics || album.musics.length === 0) return;

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isSongFromThisAlbumPlaying) {
      togglePlay();
    } else {
      playSong(album.musics[0], album.musics, 0);
    }
  };

  // Individual row play handler with guest login gate
  const handleRowPlay = (music, index) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (currentSong?._id === music._id) {
      togglePlay();
    } else {
      playSong(music, album.musics, index);
    }
  };

  // Loading view
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 py-4 sm:py-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-xl ring-1 ring-white/[0.04]">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
          <p className="text-zinc-200 font-medium">Loading album details...</p>
          <p className="text-xs text-zinc-500 mt-1">Retrieving music and release info</p>
        </div>
      </div>
    );
  }

  // Not Found / Error Fallback View
  if (fetchError || !album) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 py-4 sm:py-6 text-zinc-100">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-xl ring-1 ring-white/[0.04]">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Album Not Found
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
            {fetchError || "The album you're looking for doesn't exist or has been removed."}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 py-4 sm:py-6 text-zinc-100">
      {/* Top Back Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* =========================================================================
          2. READ-ONLY ALBUM HERO HEADER SECTION
      ========================================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-zinc-950/85 p-6 sm:p-7 backdrop-blur-xl shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]">
        {/* Subtle background glow effects */}
        <div className="absolute -top-28 -right-28 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
          {/* Square Album Cover */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/60 shrink-0 shadow-2xl shadow-black/50 ring-1 ring-white/10 group">
            {album.coverUri ? (
              <img
                src={album.coverUri}
                alt={album.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Disc className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Album Metadata & Play All */}
          <div className="flex-1 flex flex-col justify-end text-center md:text-left min-w-0">
            {/* Emerald Badge */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Disc className="w-3 h-3" />
                ALBUM
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight break-words mb-2"
              title={album.title}
            >
              {album.title}
            </h1>

            {/* Artist, Music Count, Runtime & Date */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-1.5 gap-x-3 text-xs sm:text-sm text-zinc-400 mb-5">
              <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>by {album.artist?.username || 'Unknown Artist'}</span>
              </span>

              <span className="text-zinc-600">•</span>

              <span className="flex items-center gap-1.5">
                <MusicIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>{musicCount} music</span>
              </span>

              <span className="text-zinc-600">•</span>

              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{formatTotalRuntime(totalDuration)}</span>
              </span>

              <span className="text-zinc-600">•</span>

              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{formatDate(album.createdAt)}</span>
              </span>
            </div>

            {/* Action Buttons: Single Primary Emerald Pill Button (Play All) */}
            <div className="flex items-center justify-center md:justify-start">
              <button
                type="button"
                onClick={handlePlayAll}
                disabled={musicCount === 0}
                className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg cursor-pointer ${
                  musicCount === 0
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none'
                    : isSongFromThisAlbumPlaying && isPlaying
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                }`}
              >
                {isSongFromThisAlbumPlaying && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-zinc-950" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-zinc-950 translate-x-0.5" />
                    <span>Play All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. NUMBERED MUSIC LIST (INTERACTIVE PLAYBACK & LOGIN GATE)
      ========================================================================== */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <MusicIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Album Music
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {musicCount} {musicCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {musicCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500 mb-3">
              <MusicIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              No music in this album yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              This album does not have any music released yet.
            </p>
          </div>
        ) : (
          <div>
            {/* Table-Style Column Headers */}
            <div className="grid grid-cols-[32px_minmax(0,1fr)_75px] md:grid-cols-[40px_minmax(0,1fr)_140px_90px] items-center gap-3 sm:gap-4 px-3 sm:px-3.5 text-xs font-medium uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 pb-2 mb-2">
              <div className="text-center font-mono">#</div>
              <div>TITLE</div>
              <div className="hidden md:block">DATE ADDED</div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="hidden sm:inline">DURATION</span>
              </div>
            </div>

            {/* Music List Rows */}
            <div className="space-y-1.5">
              {album.musics.map((music, index) => {
                const isThisCurrent = currentSong?._id === music._id;
                const isThisPlaying = isThisCurrent && isPlaying;

                return (
                  <div
                    key={music._id}
                    onClick={() => handleRowPlay(music, index)}
                    className={`group grid grid-cols-[32px_minmax(0,1fr)_75px] md:grid-cols-[40px_minmax(0,1fr)_140px_90px] items-center gap-3 sm:gap-4 px-3 sm:px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      isThisCurrent
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-zinc-900/40 border-zinc-800/70 hover:bg-zinc-800/50 hover:border-zinc-700/70 shadow-sm'
                    }`}
                  >
                    {/* 1. Left-Side Numbering (01, 02, 03...) */}
                    <div className="flex items-center justify-center font-mono text-xs sm:text-sm">
                      <span
                        className={
                          isThisCurrent
                            ? 'text-emerald-400 font-bold'
                            : 'text-zinc-500 group-hover:text-zinc-300 font-medium'
                        }
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* 2. Title Column (Thumbnail with Play/Pause Overlay + Title & Subtitle) */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Music Thumbnail with Play/Pause Overlay */}
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-zinc-700/60 group/thumb">
                        {music.coverImage ? (
                          <img
                            src={music.coverImage}
                            alt={music.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <MusicIcon className="w-4 h-4" />
                          </div>
                        )}

                        {/* Play/Pause Button Overlay (visible on mobile, hover on desktop, always visible if playing) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowPlay(music, index);
                          }}
                          className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                            isThisPlaying
                              ? 'bg-black/60 text-emerald-400 opacity-100'
                              : 'bg-black/50 text-white opacity-90 sm:opacity-0 sm:group-hover/thumb:opacity-100'
                          }`}
                          title={isThisPlaying ? 'Pause' : 'Play'}
                          aria-label={isThisPlaying ? 'Pause' : 'Play'}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-emerald-400" />
                          ) : (
                            <Play className="w-4 h-4 fill-white translate-x-0.5" />
                          )}
                        </button>
                      </div>

                      {/* Music Title & Mobile Subtitle */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isThisCurrent ? 'text-emerald-400' : 'text-zinc-200 group-hover:text-white'
                          }`}
                          title={music.title}
                        >
                          {music.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate mt-0.5 md:hidden">
                          <span>{formatDate(music.createdAt)}</span>
                          {music.genre && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="capitalize">{music.genre}</span>
                            </>
                          )}
                        </div>
                        {music.genre && (
                          <p className="text-[11px] text-zinc-500 truncate capitalize hidden md:block">
                            {music.genre}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 3. Date Added (Hidden on Mobile) */}
                    <div className="hidden md:block text-xs text-zinc-400 truncate">
                      {formatDate(music.createdAt)}
                    </div>

                    {/* 4. Duration */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0 hidden sm:inline" />
                      <span>{formatDuration(music.duration)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
