import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import { useNotification, NotificationBanner } from '../context/NotificationContext';
import { API_URL } from '../config.js';
import {
  Play,
  Pause,
  Pencil,
  Trash2,
  Plus,
  Music,
  Clock,
  Calendar,
  History,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  X,
  Headphones,
  Disc3,
  UserPen,
} from 'lucide-react';


/**
 * Helper function to convert backend duration (in seconds) to mm:ss format.
 * Examples: 230 -> 3:50, 65 -> 1:05, 0 -> 0:00
 */
const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '0:00';
  const totalSecs = Math.round(Number(seconds));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Helper function to format createdAt timestamp into readable date (e.g. Oct 24, 2026).
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

export default function ArtistDashboard() {
  const [musics, setMusics] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artistProfile, setArtistProfile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [musicToEdit, setMusicToEdit] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Action status / Notifications
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Global Notification Hook
  const { showNotification } = useNotification();

  // Global Auth Context (for graceful profile fallback while loading)
  const authContext = useContext(AuthContext);
  const contextUser = authContext?.user;

  // Resolved artist profile & avatar URL
  const currentArtist = artistProfile || contextUser;
  const rawArtistUsername = currentArtist?.username || 'Artist';
  const artistUsername =
    rawArtistUsername.charAt(0).toUpperCase() + rawArtistUsername.slice(1);
  const avatarUrl =
    currentArtist?.profileImage ||
    currentArtist?.avatar ||
    currentArtist?.profilePic ||
    currentArtist?.image;

  // Global audio player context (if mounted within AudioProvider)
  const audioContext = useContext(AudioContext);
  const currentSong = audioContext?.currentSong;
  const isPlaying = audioContext?.isPlaying;
  const playSong = audioContext?.playSong;
  const togglePlay = audioContext?.togglePlay;

  // Fetch logged-in artist tracks, albums, and /me profile concurrently on mount / refresh
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [musicsRes, albumsRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/api/music/mymusic`, { withCredentials: true }),
        axios
          .get(`${API_URL}/api/album/myalbums`, { withCredentials: true })
          .catch((err) => {
            console.warn('Albums non-critical fetch warning:', err?.message);
            return { data: { albums: [] } };
          }),
        axios
          .get(`${API_URL}/api/auth/me`, { withCredentials: true })
          .catch((err) => {
            console.warn('Profile non-critical fetch warning:', err?.message);
            return { data: { user: contextUser } };
          }),
      ]);

      // Backend returns { musics: [...] } or array directly
      const trackList = Array.isArray(musicsRes.data)
        ? musicsRes.data
        : musicsRes.data?.musics || musicsRes.data?.music || musicsRes.data?.data || [];

      // Backend returns { albums: [...] } or array directly
      const albumList = Array.isArray(albumsRes.data)
        ? albumsRes.data
        : albumsRes.data?.albums || albumsRes.data?.album || albumsRes.data?.data || [];

      // Backend returns { user: {...} }
      const profileData = profileRes.data?.user || profileRes.data || null;

      setMusics(trackList);
      setAlbums(albumList);
      if (profileData) {
        setArtistProfile(profileData);
        setAvatarError(false);
      }
    } catch (err) {
      console.error('Failed to fetch artist dashboard data:', err);
      let message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Failed to load your musics and albums.';

      if (err.response?.status === 401) {
        message = 'You are not logged in. Please log in with an artist account.';
      } else if (err.response?.status === 403) {
        message = 'Access forbidden: Your account does not have the "artist" role.';
      } else if (err.code === 'ERR_NETWORK') {
        message =
          'Cannot connect to backend server. Please verify your backend is running on port 3000.';
      }

      const formattedError = typeof message === 'string' ? message : JSON.stringify(message);
      setError(formattedError);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMusics = fetchDashboardData;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Live KPI metrics
  const totalStreams = useMemo(() => {
    return musics.reduce((sum, m) => {
      const plays =
        currentSong?._id === m._id && typeof currentSong.plays === 'number'
          ? Math.max(m.plays || 0, currentSong.plays)
          : m.plays || 0;
      return sum + plays;
    }, 0);
  }, [musics, currentSong?._id, currentSong?.plays]);

  const totalMusics = musics.length;
  const totalAlbums = albums.length;

  const topMusic = useMemo(() => {
    if (!musics || musics.length === 0) return null;
    let highest = null;
    let maxPlays = 0;
    for (const m of musics) {
      const plays =
        currentSong?._id === m._id && typeof currentSong.plays === 'number'
          ? Math.max(m.plays || 0, currentSong.plays)
          : m.plays || 0;
      if (plays > 0 && plays > maxPlays) {
        maxPlays = plays;
        highest = { ...m, plays };
      }
    }
    return highest;
  }, [musics, currentSong?._id, currentSong?.plays]);

  // Spotlight Mini-Card: Artist's highest-played music (from the fetched musics list)
  const spotlightMusic = useMemo(() => {
    if (!musics || musics.length === 0) return null;
    let highest = musics[0];
    let maxPlays =
      currentSong?._id === highest._id && typeof currentSong.plays === 'number'
        ? Math.max(highest.plays || 0, currentSong.plays)
        : highest.plays || 0;

    for (let i = 1; i < musics.length; i++) {
      const m = musics[i];
      const p =
        currentSong?._id === m._id && typeof currentSong.plays === 'number'
          ? Math.max(m.plays || 0, currentSong.plays)
          : m.plays || 0;
      if (p > maxPlays) {
        maxPlays = p;
        highest = m;
      }
    }
    return highest;
  }, [musics, currentSong?._id, currentSong?.plays]);

  const spotlightPlays = useMemo(() => {
    if (!spotlightMusic) return 0;
    return (
      (currentSong?._id === spotlightMusic._id && typeof currentSong.plays === 'number'
        ? Math.max(spotlightMusic.plays || 0, currentSong.plays)
        : spotlightMusic.plays) || 0
    );
  }, [spotlightMusic, currentSong?._id, currentSong?.plays]);

  const isSpotlightPlaying =
    spotlightMusic && currentSong?._id === spotlightMusic._id && isPlaying;

  // Handle Play / Pause track
  const handlePlayToggle = (track, index) => {
    if (!playSong) {
      console.error('AudioContext playSong function is not available.');
      return;
    }

    const audioUrl = track.uri || track.url || track.musicUrl;
    if (!audioUrl) {
      console.warn("Track is missing audio URL ('uri'):", track);
      showNotification(
        'error',
        `Cannot play "${track.title}": Audio URL (uri) is missing. Make sure your backend does not exclude '-uri' in getMyAllMusics.`
      );
      return;
    }

    if (currentSong?._id === track._id) {
      togglePlay();
    } else {
      playSong({ ...track, uri: audioUrl }, musics, index);
    }
  };

  // Open & Close Delete Modal (with force parameter to fix closing after async action)
  const openDeleteModal = (track) => {
    setMusicToDelete(track);
    setModalError('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = (force = false) => {
    if (isSubmitting && !force) return;
    setIsDeleteModalOpen(false);
    setMusicToDelete(null);
    setModalError('');
  };

  // Perform Delete Action
  const confirmDelete = async () => {
    if (!musicToDelete) return;
    const targetTitle = musicToDelete.title || 'Music';

    try {
      setIsSubmitting(true);
      setModalError('');
      const response = await axios.delete(
        `${API_URL}/api/music/${musicToDelete._id}`,
        {
          withCredentials: true,
        }
      );

      // Remove the deleted track from local state without reloading the page
      setMusics((prevMusics) =>
        prevMusics.filter((item) => item._id !== musicToDelete._id)
      );

      // Force close modal and display inline success notification
      closeDeleteModal(true);
      showNotification(
        'success',
        response.data?.message || `"${targetTitle}" was deleted successfully.`
      );
    } catch (err) {
      console.error('Delete error:', err);
      const apiMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to delete music. Please ensure you are authorized and try again.';
      setModalError(apiMessage);
      showNotification('error', apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open & Close Edit Modal (with force parameter to fix closing after async action)
  const openEditModal = (track) => {
    setMusicToEdit(track);
    setNewTitle(track.title || '');
    setModalError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = (force = false) => {
    if (isSubmitting && !force) return;
    setIsEditModalOpen(false);
    setMusicToEdit(null);
    setNewTitle('');
    setModalError('');
  };

  // Perform Edit Action
  const confirmEdit = async (e) => {
    if (e) e.preventDefault();
    if (!musicToEdit) return;

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setModalError('Music title cannot be empty.');
      return;
    }

    if (trimmedTitle === musicToEdit.title) {
      closeEditModal();
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError('');
      const response = await axios.patch(
        `${API_URL}/api/music/${musicToEdit._id}`,
        { title: trimmedTitle },
        { withCredentials: true }
      );

      const updatedTimestamp = response.data?.music?.updatedAt || new Date().toISOString();

      // Dynamically update the track title and updatedAt in local state
      setMusics((prevMusics) =>
        prevMusics.map((item) =>
          item._id === musicToEdit._id
            ? { ...item, title: trimmedTitle, updatedAt: updatedTimestamp }
            : item
        )
      );

      // Force close modal and display inline success notification
      closeEditModal(true);
      showNotification(
        'success',
        response.data?.message ||
        `Music title updated to "${trimmedTitle}" successfully.`
      );
    } catch (err) {
      console.error('Update title error:', err);
      const apiMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to update music title. Please try again.';
      setModalError(apiMessage);
      showNotification('error', apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 text-white">
      {/* Enterprise Artist Profile Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/95 via-[#0c1614] to-emerald-950/50 border border-zinc-800/90 shadow-xl shadow-black/30 p-6 sm:p-7 lg:p-8 mb-6">
        {/* Subtle Ambient Emerald Glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden="true"
        />

        {/* Inner Content Container */}
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 lg:gap-8">
          {/* Left — Artist Identity & Controls */}
          <div className="flex items-center gap-5 sm:gap-7 lg:gap-8 min-w-0">
            {/* Larger Circular profile avatar with onError / missing fallback */}
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt={artistUsername}
                className="h-28 w-28 sm:h-36 sm:w-36 lg:h-40 lg:w-40 rounded-full shrink-0 ring-2 sm:ring-4 ring-emerald-500/35 ring-offset-2 sm:ring-offset-4 ring-offset-zinc-950 bg-zinc-800/80 object-cover shadow-2xl"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="h-28 w-28 sm:h-36 sm:w-36 lg:h-40 lg:w-40 rounded-full shrink-0 ring-2 sm:ring-4 ring-emerald-500/35 ring-offset-2 sm:ring-offset-4 ring-offset-zinc-950 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-zinc-950 font-bold text-4xl sm:text-5xl lg:text-6xl shadow-2xl select-none">
                {(artistUsername.charAt(0) || 'A').toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex flex-col justify-center">
              {/* Subtle emerald VERIFIED ARTIST pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase self-start">
                <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Verified Artist</span>
              </div>

              {/* Artist username heading */}
              <h1
                className="mt-2 text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight truncate capitalize leading-tight sm:leading-none py-0.5"
                title={artistUsername}
              >
                {artistUsername}
              </h1>

              {/* Compact action row */}
              <div className="mt-4 flex items-center flex-wrap gap-2.5 sm:gap-3">
                <Link
                  to="/studio/settings"
                  title="Edit profile settings"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 font-medium text-xs sm:text-sm transition cursor-pointer shadow-sm ring-1 ring-white/[0.02]"
                >
                  <UserPen className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Edit Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  title="Refresh dashboard data"
                  className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition disabled:opacity-50 cursor-pointer shadow-sm ring-1 ring-white/[0.02]"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                </button>

                <Link
                  to="/studio/upload"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Music</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right — Top Music Spotlight Mini-Card */}
          <div className="bg-zinc-950/70 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3.5 xl:w-84 shrink-0 shadow-lg ring-1 ring-white/[0.03]">
            {spotlightMusic ? (
              <>
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Square cover thumbnail */}
                  <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800 shadow-sm">
                    {spotlightMusic.coverImage ? (
                      <img
                        src={spotlightMusic.coverImage}
                        alt={spotlightMusic.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <Music className="w-5 h-5 text-emerald-400/70" />
                      </div>
                    )}
                  </div>

                  {/* Micro-label, truncated title, live play count */}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block truncate">
                      Top Performing Music
                    </span>
                    <h4
                      className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5"
                      title={spotlightMusic.title}
                    >
                      {spotlightMusic.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono tabular-nums">
                      {spotlightPlays.toLocaleString()} {spotlightPlays === 1 ? 'play' : 'plays'}
                    </p>
                  </div>
                </div>

                {/* Compact Play Button */}
                <button
                  type="button"
                  onClick={() => {
                    const idx = musics.findIndex((m) => m._id === spotlightMusic._id);
                    handlePlayToggle(spotlightMusic, idx >= 0 ? idx : 0);
                  }}
                  title={isSpotlightPlaying ? `Pause ${spotlightMusic.title}` : `Play ${spotlightMusic.title}`}
                  aria-label={isSpotlightPlaying ? `Pause ${spotlightMusic.title}` : `Play ${spotlightMusic.title}`}
                  className={`p-2.5 rounded-full transition cursor-pointer shadow-md shrink-0 ${isSpotlightPlaying
                    ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/30'
                    : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 shadow-black/40'
                    }`}
                >
                  {isSpotlightPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full gap-3.5">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-13 w-13 sm:h-14 sm:w-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                    <Music className="w-5 h-5 text-emerald-400/60" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block truncate">
                      Top Performing Music
                    </span>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      Upload your first music
                    </p>
                  </div>
                </div>
                <Link
                  to="/studio/upload"
                  title="Upload music"
                  className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 transition shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          GLOBAL INLINE NOTIFICATION BANNER (Full-width, matching design)
      ========================================================================== */}
      <NotificationBanner className="mb-6" />

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl ring-1 ring-white/[0.04]">
          <Loader2 className="w-9 h-9 text-emerald-400 animate-spin mb-3" />
          <p className="text-zinc-200 font-medium">Loading your music catalog...</p>
          <p className="text-xs text-zinc-500 mt-1">Fetching your musics from Audiora servers</p>
        </div>
      )}

      {/* Fetch Error State */}
      {!loading && error && (
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-red-300">Could not retrieve your music</p>
              <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchMyMusics}
            className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-900 text-red-200 text-xs font-semibold transition border border-red-700/50 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content Area */}
      {!loading && !error && (
        <>
          {/* Compact 4-Card KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {/* 1. Total Streams */}
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between shadow-sm ring-1 ring-white/[0.02] min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Total Streams
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {totalStreams.toLocaleString()}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">Across all catalog music</p>
              </div>
            </div>

            {/* 2. Total Music */}
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between shadow-sm ring-1 ring-white/[0.02] min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Total Music
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shrink-0">
                  <Music className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {totalMusics.toLocaleString()}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">Uploaded music catalog</p>
              </div>
            </div>

            {/* 3. Total Albums */}
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between shadow-sm ring-1 ring-white/[0.02] min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Total Albums
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shrink-0">
                  <Disc3 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {totalAlbums.toLocaleString()}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">Created studio collections</p>
              </div>
            </div>

            {/* 4. Top Music */}
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between shadow-sm ring-1 ring-white/[0.02] min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Top Music
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="min-w-0">
                {topMusic ? (
                  <>
                    <div
                      className="text-base sm:text-lg font-bold text-white tracking-tight truncate"
                      title={topMusic.title}
                    >
                      {topMusic.title}
                    </div>
                    <p className="text-[11px] text-emerald-400 font-medium mt-0.5 truncate">
                      {(topMusic.plays || 0).toLocaleString()} {(topMusic.plays || 0) === 1 ? 'play' : 'plays'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-base sm:text-lg font-semibold text-zinc-400 tracking-tight truncate">
                      No streams yet
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                      0 plays recorded
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {musics.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl ring-1 ring-white/[0.04]">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <Music className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                You haven't uploaded any musics yet.
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
                Release your singles, EPs, or full albums to Audiora. Your uploaded music will show
                up right here where you can manage and play it.
              </p>
              <Link
                to="/studio/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Music</span>
              </Link>
            </div>
          ) : (
            /* Modern Tracks Grid / Row Container */
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]">
              {/* Horizontal Scroll Wrapper to prevent any column overlapping */}
              <div className="overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(113,113,122,0.4)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 pb-2">
                <div className="min-w-[1120px]">
                  {/* Table-Style Column Headers */}
                  <div className="grid grid-cols-[40px_minmax(320px,1fr)_95px_95px_110px_110px_235px] items-center gap-4 px-3 sm:px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 mb-2 border-x border-transparent">
                    <div className="text-center font-mono">#</div>
                    <div>Music</div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Duration</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-zinc-500 shrink-0" size={14} />
                      <span>Plays</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Created</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Updated</span>
                    </div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* Music List Rows */}
                  <div className="space-y-1.5">
                    {musics.map((music, index) => {
                      const isThisPlaying = currentSong?._id === music._id && isPlaying;
                      const livePlays =
                        currentSong?._id === music._id && typeof currentSong.plays === 'number'
                          ? Math.max(music.plays || 0, currentSong.plays)
                          : music.plays || 0;

                      return (
                        <div
                          key={music._id || index}
                          onClick={() => handlePlayToggle(music, index)}
                          className={`group grid grid-cols-[40px_minmax(320px,1fr)_95px_95px_110px_110px_235px] items-center gap-4 px-3 sm:px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${isThisPlaying
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20'
                            : 'bg-zinc-900/40 border-zinc-800/70 hover:bg-zinc-800/50 hover:border-zinc-700/70 shadow-sm'
                            }`}
                        >
                          {/* 1. Index (#) */}
                          <div className="flex items-center justify-center font-mono text-xs sm:text-sm">
                            <span
                              className={
                                isThisPlaying
                                  ? 'text-emerald-400 font-bold'
                                  : 'text-zinc-500 group-hover:text-zinc-300 font-medium'
                              }
                            >
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          {/* 2. Track (Cover + Title + ID) */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Music Thumbnail with Play/Pause Overlay */}
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-zinc-700/60 shadow-sm group/thumb">
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
                                  <Music className="w-4 h-4" />
                                </div>
                              )}

                              {/* Play/Pause Button Overlay (visible on hover, always visible if playing) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayToggle(music, index);
                                }}
                                className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${isThisPlaying
                                  ? 'bg-black/60 text-emerald-400 opacity-100'
                                  : 'bg-black/50 text-white opacity-0 group-hover/thumb:opacity-100'
                                  }`}
                                title={isThisPlaying ? 'Pause music' : 'Play music'}
                                aria-label={isThisPlaying ? `Pause ${music.title}` : `Play ${music.title}`}
                              >
                                {isThisPlaying ? (
                                  <Pause className="w-4 h-4 fill-emerald-400" />
                                ) : (
                                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                                )}
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3
                                className={`text-sm font-semibold truncate ${isThisPlaying ? 'text-emerald-400' : 'text-zinc-200 group-hover:text-white'
                                  }`}
                                title={music.title}
                              >
                                {music.title}
                              </h3>
                              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                ID: {music._id ? music._id.slice(-6) : '—'}
                              </p>
                            </div>
                          </div>

                          {/* 3. Duration */}
                          <div className="flex items-center gap-1.5 text-zinc-300 font-mono tabular-nums text-xs whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span>{formatDuration(music.duration)}</span>
                          </div>

                          {/* 4. Plays */}
                          <div className="flex items-center gap-1.5 text-zinc-300 font-mono tabular-nums text-xs whitespace-nowrap">
                            <Headphones className="w-3.5 h-3.5 text-zinc-500 shrink-0" size={14} />
                            <span>{livePlays.toLocaleString()}</span>
                          </div>

                          {/* 5. Created Date */}
                          <div className="text-zinc-400 text-xs whitespace-nowrap">
                            {formatDate(music.createdAt)}
                          </div>

                          {/* 6. Updated Date */}
                          <div className="text-zinc-400 text-xs whitespace-nowrap">
                            {formatDate(music.updatedAt || music.createdAt)}
                          </div>

                          {/* 7. Actions (Play, Edit, Delete) */}
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {/* Play / Pause Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayToggle(music, index);
                              }}
                              title={isThisPlaying ? 'Pause music' : 'Play music'}
                              aria-label={isThisPlaying ? 'Pause music' : 'Play music'}
                              className={`inline-flex items-center justify-center gap-1 w-[72px] py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${isThisPlaying
                                ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-md'
                                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950'
                                }`}
                            >
                              {isThisPlaying ? (
                                <>
                                  <Pause className="w-3.5 h-3.5" fill="currentColor" />
                                  <span>Pause</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" fill="currentColor" />
                                  <span>Play</span>
                                </>
                              )}
                            </button>

                            {/* Edit Button -> Opens Edit Modal */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(music);
                              }}
                              title="Edit music title"
                              aria-label={`Edit ${music.title}`}
                              className="inline-flex items-center justify-center gap-1 w-[64px] py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition border border-zinc-700/60 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button -> Opens Delete Modal */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(music);
                              }}
                              title="Delete music"
                              aria-label={`Delete ${music.title}`}
                              className="inline-flex items-center justify-center gap-1 w-[76px] py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition border border-rose-500/20 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Table Footer / Summary Bar */}
              <div className="px-4 sm:px-5 py-3.5 bg-zinc-900/90 border-t border-zinc-800/80 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 mt-5 rounded-b-2xl flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Total Musics: <strong className="text-white font-semibold">{musics.length}</strong>
                </span>
                <span>Audiora Artist Studio</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          DELETE MODAL (Custom Tailwind Popup replacing window.confirm)
      ========================================================================== */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-14 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => closeDeleteModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl shadow-black/80 w-full max-w-md border border-zinc-800 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title & Close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h2 id="delete-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Delete Music
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closeDeleteModal(false)}
                disabled={isSubmitting}
                aria-label="Close delete dialog"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Error Alert inside modal */}
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Warning Message */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              Are you sure you want to delete '
              <span className="font-semibold text-white">
                {musicToDelete?.title || 'this music'}
              </span>
              '? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeDeleteModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 font-medium text-sm transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/40 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSubmitting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT MODAL (Custom Tailwind Popup replacing window.prompt)
      ========================================================================== */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-14 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => closeEditModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl shadow-black/80 w-full max-w-md border border-zinc-800 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title & Close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <h2 id="edit-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Edit Music Title
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closeEditModal(false)}
                disabled={isSubmitting}
                aria-label="Close edit dialog"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Error Alert inside modal */}
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={confirmEdit}>
              <div className="mb-6">
                <label
                  htmlFor="editTrackTitleInput"
                  className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
                >
                  Music Title
                </label>
                <input
                  id="editTrackTitleInput"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-zinc-800/90 text-white border border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm disabled:opacity-50 placeholder:text-zinc-500"
                  placeholder="Enter music title"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => closeEditModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 font-medium text-sm transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
