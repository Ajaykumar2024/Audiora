import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AudioContext } from '../context/AudioContext';
import { useNotification, NotificationBanner } from '../context/NotificationContext';
import { API_URL } from '../config.js';
import {
  ArrowLeft,
  Disc,
  Play,
  Pause,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  User,
  Music as MusicIcon,
  Search,
  X,
  UploadCloud,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

export default function AlbumDetails() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Audio Context
  const audioContext = useContext(AudioContext);
  const currentSong = audioContext?.currentSong;
  const isPlaying = audioContext?.isPlaying;
  const playSong = audioContext?.playSong;
  const togglePlay = audioContext?.togglePlay;

  // Album state
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Per-row removal loading state
  const [removingMusicId, setRemovingMusicId] = useState(null);

  // Edit Details Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [isUpdatingAlbum, setIsUpdatingAlbum] = useState(false);
  const [editError, setEditError] = useState('');
  const editFileInputRef = useRef(null);

  // Add Music Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [artistLibrary, setArtistLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedMusicIds, setSelectedMusicIds] = useState([]);
  const [isAddingMusic, setIsAddingMusic] = useState(false);

  // Remove Music from Album Confirmation Modal state
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [musicToRemove, setMusicToRemove] = useState(null);
  const [removeModalError, setRemoveModalError] = useState('');

  // Fetch album on mount and when albumId changes
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

  // Clean up object URL for cover preview
  useEffect(() => {
    return () => {
      if (editPreviewUrl) {
        URL.revokeObjectURL(editPreviewUrl);
      }
    };
  }, [editPreviewUrl]);

  // Total runtime of the album
  const totalDuration = (album?.musics || []).reduce(
    (sum, m) => sum + (Number(m.duration) || 0),
    0
  );

  // Check if a song from this album is playing
  const isSongFromThisAlbumPlaying =
    album?.musics &&
    album.musics.some((m) => m._id === currentSong?._id);

  // Play All handler
  const handlePlayAll = () => {
    if (!album?.musics || album.musics.length === 0) return;

    if (isSongFromThisAlbumPlaying) {
      togglePlay();
    } else {
      playSong(album.musics[0], album.musics, 0);
    }
  };

  // Row play handler
  const handleRowPlay = (music, index) => {
    if (currentSong?._id === music._id) {
      togglePlay();
    } else {
      playSong(music, album.musics, index);
    }
  };

  // Open Remove Music from Album Confirmation Modal
  const openRemoveModal = (e, music) => {
    e.stopPropagation();
    setMusicToRemove(music);
    setRemoveModalError('');
    setIsRemoveModalOpen(true);
  };

  // Close Remove Music Modal
  const closeRemoveModal = (force = false) => {
    if (removingMusicId && !force) return;
    setIsRemoveModalOpen(false);
    setMusicToRemove(null);
    setRemoveModalError('');
  };

  // Confirm and Remove music from album only
  const confirmRemoveMusic = async () => {
    if (!musicToRemove?._id || removingMusicId) return;

    const musicId = musicToRemove._id;
    const targetTitle = musicToRemove.title || 'this music';

    try {
      setRemovingMusicId(musicId);
      setRemoveModalError('');

      const response = await axios.delete(
        `${API_URL}/api/album/${albumId}/music/${musicId}`,
        { withCredentials: true }
      );

      // Merge update preserving artist username
      setAlbum((prev) => ({
        ...response.data.album,
        artist: prev?.artist,
      }));

      closeRemoveModal(true);
      showNotification('success', response.data?.message || `"${targetTitle}" removed from album`);
    } catch (err) {
      console.error('Failed to remove music from album:', err);
      const message =
        err.response?.data?.message ||
        'Failed to remove music from album. Please try again.';
      setRemoveModalError(message);
      showNotification('error', message);
    } finally {
      setRemovingMusicId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = () => {
    setEditTitle(album?.title || '');
    setEditCoverFile(null);
    setEditPreviewUrl(null);
    setEditError('');
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    if (isUpdatingAlbum) return;
    if (editPreviewUrl) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditPreviewUrl(null);
    setEditCoverFile(null);
    setEditTitle('');
    setEditError('');
    setIsEditModalOpen(false);
  };

  // Handle Cover File Selection for Edit
  const handleEditCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setEditError('Cover image size must be under 5MB.');
      return;
    }

    if (editPreviewUrl) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditError('');
    setEditCoverFile(file);
    setEditPreviewUrl(URL.createObjectURL(file));
  };

  // Submit Edit Album Details
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setEditError('Album title is required.');
      return;
    }

    const titleChanged = trimmedTitle !== album?.title;
    const coverChanged = Boolean(editCoverFile);

    if (!titleChanged && !coverChanged) {
      setEditError('No changes detected. Update the title or select a new cover.');
      return;
    }

    try {
      setIsUpdatingAlbum(true);
      const formData = new FormData();
      if (titleChanged) {
        formData.append('title', trimmedTitle);
      }
      if (coverChanged) {
        formData.append('coverImage', editCoverFile);
      }

      const response = await axios.patch(
        `${API_URL}/api/album/${albumId}`,
        formData,
        { withCredentials: true }
      );

      // Merge update preserving artist username
      setAlbum((prev) => ({
        ...response.data.album,
        artist: prev?.artist,
      }));

      closeEditModal();
      showNotification('success', response.data?.message || 'Album updated successfully');
    } catch (err) {
      console.error('Failed to update album details:', err);
      const message =
        err.response?.data?.message ||
        'Failed to update album details. Please try again.';
      setEditError(message);
      showNotification('error', message);
    } finally {
      setIsUpdatingAlbum(false);
    }
  };

  // Open Add Music Modal & fetch library
  const openAddMusicModal = async () => {
    setSelectedMusicIds([]);
    setLibrarySearch('');
    setLibraryError('');
    setIsAddModalOpen(true);
    setLibraryLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/music/mymusic`, {
        withCredentials: true,
      });

      const musicList = Array.isArray(response.data)
        ? response.data
        : response.data?.musics || response.data?.music || response.data?.data || [];

      setArtistLibrary(musicList);
    } catch (err) {
      console.error('Failed to fetch artist music library:', err);
      const message =
        err.response?.data?.message ||
        'Failed to load your music library. Please try again.';
      setLibraryError(message);
    } finally {
      setLibraryLoading(false);
    }
  };

  // Close Add Music Modal
  const closeAddMusicModal = () => {
    if (isAddingMusic) return;
    setIsAddModalOpen(false);
    setSelectedMusicIds([]);
    setLibrarySearch('');
    setLibraryError('');
  };

  // Toggle selection for available music in modal
  const toggleSelectMusic = (musicId) => {
    setSelectedMusicIds((prev) =>
      prev.includes(musicId)
        ? prev.filter((id) => id !== musicId)
        : [...prev, musicId]
    );
  };

  // Submit adding music to album
  const handleAddMusicSubmit = async () => {
    if (selectedMusicIds.length === 0 || isAddingMusic) return;

    try {
      setIsAddingMusic(true);
      const response = await axios.post(
        `${API_URL}/api/album/${albumId}/music`,
        { musicIds: selectedMusicIds },
        { withCredentials: true }
      );

      // Merge update preserving artist username
      setAlbum((prev) => ({
        ...response.data.album,
        artist: prev?.artist,
      }));

      closeAddMusicModal();
      showNotification('success', response.data?.message || 'Music added to album');
    } catch (err) {
      console.error('Failed to add music to album:', err);
      const message =
        err.response?.data?.message ||
        'Failed to add music to album. Please try again.';
      showNotification('error', message);
    } finally {
      setIsAddingMusic(false);
    }
  };

  // Filter library music by search
  const filteredLibrary = artistLibrary.filter((m) =>
    (m.title || '').toLowerCase().includes(librarySearch.toLowerCase().trim())
  );

  // Set of music IDs currently in the album for fast lookup
  const albumMusicIdSet = new Set((album?.musics || []).map((m) => m._id));

  // Loading View
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 text-zinc-100">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link
            to="/studio/albums"
            className="inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Albums</span>
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
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 text-zinc-100">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link
            to="/studio/albums"
            className="inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Albums</span>
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
            onClick={() => navigate('/studio/albums')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Albums</span>
          </button>
        </div>
      </div>
    );
  }

  const musicCount = album.musics?.length || 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 text-zinc-100">
      {/* Top Back Link */}
      <div>
        <Link
          to="/studio/albums"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Albums</span>
        </Link>
      </div>

      {/* Global Inline Notification Banner */}
      <NotificationBanner className="mb-4" />

      {/* =========================================================================
          ALBUM HERO HEADER SECTION
      ========================================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-zinc-950/85 p-6 sm:p-7 backdrop-blur-xl shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]">
        {/* Subtle background glow effect */}
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

          {/* Album Metadata & Actions */}
          <div className="flex-1 flex flex-col justify-end text-center md:text-left min-w-0">
            {/* Badge */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Disc className="w-3 h-3" />
                Album
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
              {album.artist?.username && (
                <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{album.artist.username}</span>
                </span>
              )}

              {album.artist?.username && <span className="text-zinc-600">•</span>}

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

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* Play All Button */}
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

              {/* Add Music Button */}
              <button
                type="button"
                onClick={openAddMusicModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-750 hover:bg-zinc-700/90 text-white font-semibold text-sm border border-zinc-700/70 hover:border-zinc-600 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Music</span>
              </button>

              {/* Edit Album Details Button */}
              <button
                type="button"
                onClick={openEditModal}
                title="Edit Album Details"
                aria-label="Edit Album Details"
                className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/90 text-zinc-300 hover:text-white border border-zinc-700/70 hover:border-zinc-600 transition shadow-sm cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ALBUM MUSIC LIST (INTERACTIVE PLAYBACK & REMOVE)
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
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl bg-zinc-800/20 border border-dashed border-zinc-800">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
              <MusicIcon className="w-7 h-7 text-zinc-500" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              No music in this album yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">
              Curate your release by selecting music from your artist library.
            </p>
            <button
              type="button"
              onClick={openAddMusicModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition shadow-lg shadow-emerald-500/15 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Music</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Table-Style Column Headers */}
            <div className="grid grid-cols-[32px_minmax(0,1fr)_75px_36px] md:grid-cols-[40px_minmax(0,1fr)_140px_90px_40px] items-center gap-3 sm:gap-4 px-3 sm:px-3.5 text-xs font-medium uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 pb-2 mb-2">
              <div className="text-center font-mono">#</div>
              <div>Title</div>
              <div className="hidden md:block">Date Added</div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="hidden sm:inline">Duration</span>
              </div>
              <div className="text-right"></div>
            </div>

            {/* Music List Rows */}
            <div className="space-y-1.5">
              {album.musics.map((music, index) => {
                const isThisCurrent = currentSong?._id === music._id;
                const isThisPlaying = isThisCurrent && isPlaying;
                const isRemovingThis = removingMusicId === music._id;

                return (
                  <div
                    key={music._id}
                    onClick={() => handleRowPlay(music, index)}
                    className={`group grid grid-cols-[32px_minmax(0,1fr)_75px_36px] md:grid-cols-[40px_minmax(0,1fr)_140px_90px_40px] items-center gap-3 sm:gap-4 px-3 sm:px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
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

                        {/* Play/Pause Button Overlay (visible on hover, always visible if playing) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowPlay(music, index);
                          }}
                          className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                            isThisPlaying
                              ? 'bg-black/60 text-emerald-400 opacity-100'
                              : 'bg-black/50 text-white opacity-0 group-hover/thumb:opacity-100'
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
                      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{formatDuration(music.duration)}</span>
                    </div>

                    {/* 5. Empty Action Column with Remove Button */}
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => openRemoveModal(e, music)}
                        disabled={removingMusicId === music._id}
                        title="Remove from album"
                        aria-label={`Remove ${music.title} from album`}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {removingMusicId === music._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Music List Footer / Summary Bar */}
            <div className="px-4 sm:px-5 py-3.5 bg-zinc-900/90 border-t border-zinc-800/80 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 mt-5 rounded-b-2xl flex items-center justify-between text-xs text-zinc-400">
              <span>
                Total Musics:{' '}
                <strong className="text-white font-semibold">{musicCount}</strong>
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{formatTotalRuntime(totalDuration)}</span>
                </span>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <span className="hidden sm:inline">Audiora Artist Studio</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          EDIT ALBUM DETAILS MODAL (TITLE & COVER ONLY)
      ========================================================================== */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeEditModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-album-modal-title"
        >
          <div
            className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl shadow-black/90 w-full max-w-lg border border-zinc-800/90 ring-1 ring-white/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="edit-album-modal-title"
                    className="text-lg font-bold text-white tracking-tight"
                  >
                    Edit Album Details
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Update your album title or replace cover artwork
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdatingAlbum}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Close edit modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {editError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{editError}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="mt-5 space-y-5">
              {/* Album Title */}
              <div>
                <label
                  htmlFor="editAlbumTitle"
                  className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                >
                  Album Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="editAlbumTitle"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter album title"
                  disabled={isUpdatingAlbum}
                  className="w-full px-3.5 py-2.5 bg-zinc-800/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm disabled:opacity-50"
                />
              </div>

              {/* Cover Artwork Selection & Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Cover Artwork
                </label>

                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  onChange={handleEditCoverChange}
                  disabled={isUpdatingAlbum}
                  className="hidden"
                  id="editCoverInput"
                />

                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  {/* Square Preview */}
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/60 shrink-0">
                    {editPreviewUrl ? (
                      <img
                        src={editPreviewUrl}
                        alt="New cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : album.coverUri ? (
                      <img
                        src={album.coverUri}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Change Button & Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <button
                      type="button"
                      onClick={() => !isUpdatingAlbum && editFileInputRef.current?.click()}
                      disabled={isUpdatingAlbum}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>{editCoverFile ? 'Choose Different File' : 'Change Cover Artwork'}</span>
                    </button>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      JPG, PNG, or WEBP under 5MB. Square ratio recommended.
                    </p>
                    {editCoverFile && (
                      <p className="text-[11px] text-emerald-400 mt-1 truncate max-w-xs font-medium">
                        Selected: {editCoverFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isUpdatingAlbum}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAlbum}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition shadow-lg shadow-emerald-500/15 disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingAlbum ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          + ADD MUSIC MODAL
      ========================================================================== */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-12 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeAddMusicModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-music-modal-title"
        >
          <div
            className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl shadow-black/90 w-full max-w-xl border border-zinc-800/90 ring-1 ring-white/[0.08] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="add-music-modal-title"
                    className="text-lg font-bold text-white tracking-tight"
                  >
                    Add Music to Album
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Select music from your uploaded library to include
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAddMusicModal}
                disabled={isAddingMusic}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Close add music modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-4">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search music by title..."
                className="w-full pl-10 pr-9 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
              {librarySearch && (
                <button
                  type="button"
                  onClick={() => setLibrarySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable Library List */}
            <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(113,113,122,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
              {libraryLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mb-2" />
                  <p className="text-xs text-zinc-400">Loading your music library...</p>
                </div>
              )}

              {!libraryLoading && libraryError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{libraryError}</span>
                  </div>
                </div>
              )}

              {!libraryLoading && !libraryError && artistLibrary.length === 0 && (
                <div className="py-12 text-center text-xs text-zinc-400">
                  <MusicIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="font-semibold text-zinc-300">No music found in your library</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Upload music to your account first.</p>
                </div>
              )}

              {!libraryLoading &&
                !libraryError &&
                artistLibrary.length > 0 &&
                filteredLibrary.length === 0 && (
                  <div className="py-12 text-center text-xs text-zinc-400">
                    No music matching "{librarySearch}"
                  </div>
                )}

              {!libraryLoading &&
                !libraryError &&
                filteredLibrary.map((music, index) => {
                  const isAlreadyAdded = albumMusicIdSet.has(music._id);
                  const isSelected = selectedMusicIds.includes(music._id);
                  const isThisCurrent = currentSong?._id === music._id;
                  const isThisPlaying = isThisCurrent && isPlaying;

                  return (
                    <div
                      key={music._id}
                      onClick={() => !isAlreadyAdded && toggleSelectMusic(music._id)}
                      className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                        isAlreadyAdded
                          ? 'bg-zinc-800/30 border-zinc-800/60 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm ring-1 ring-emerald-500/20 cursor-pointer'
                          : 'bg-zinc-800/40 border-zinc-800/80 hover:bg-zinc-800/70 hover:border-zinc-700/60 cursor-pointer'
                      }`}
                    >
                      {/* Left: Checkbox + Thumbnail with Preview Play + Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs transition-all ${
                            isAlreadyAdded
                              ? 'bg-zinc-700/50 border border-zinc-600/50 text-zinc-400'
                              : isSelected
                              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/30'
                              : 'border border-zinc-600 group-hover:border-emerald-500/60 bg-zinc-800/50'
                          }`}
                        >
                          {(isSelected || isAlreadyAdded) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Music Thumbnail with Play Preview */}
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

                          {/* Preview Play/Pause button on thumbnail */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isThisCurrent) {
                                togglePlay();
                              } else {
                                playSong(music, filteredLibrary, index);
                              }
                            }}
                            className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                              isThisPlaying
                                ? 'bg-black/60 text-emerald-400 opacity-100'
                                : 'bg-black/50 text-white opacity-0 group-hover/thumb:opacity-100'
                            }`}
                            title={isThisPlaying ? 'Pause preview' : 'Play preview'}
                            aria-label={isThisPlaying ? 'Pause preview' : 'Play preview'}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-emerald-400" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                            )}
                          </button>
                        </div>

                        {/* Title and date */}
                        <div className="min-w-0">
                          <p
                            className={`text-xs sm:text-sm font-medium truncate ${
                              isSelected ? 'text-emerald-300' : 'text-zinc-200'
                            }`}
                            title={music.title}
                          >
                            {music.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 truncate">
                            <span>{formatDate(music.createdAt)}</span>
                            {music.genre && (
                              <>
                                <span className="text-zinc-600">•</span>
                                <span className="capitalize">{music.genre}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Added badge or Duration */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isAlreadyAdded ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                            Added
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 font-mono">
                            {formatDuration(music.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/80">
              <span className="text-xs text-zinc-400">
                <span className="font-semibold text-white">{selectedMusicIds.length}</span> music selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeAddMusicModal}
                  disabled={isAddingMusic}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMusicSubmit}
                  disabled={selectedMusicIds.length === 0 || isAddingMusic}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition shadow-lg shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAddingMusic ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding to Album...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Album</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          REMOVE MUSIC FROM ALBUM CONFIRMATION MODAL
      ========================================================================== */}
      {isRemoveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-14 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => closeRemoveModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-music-modal-title"
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
                <h2 id="remove-music-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Remove from Album
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closeRemoveModal(false)}
                disabled={Boolean(removingMusicId)}
                aria-label="Close remove dialog"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {removeModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{removeModalError}</span>
              </div>
            )}

            {/* Warning Message */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              Are you sure you want to remove '
              <span className="font-semibold text-white">
                {musicToRemove?.title || 'this music'}
              </span>
              ' from this album? The music will only be removed from this album and will remain in your music library.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeRemoveModal(false)}
                disabled={Boolean(removingMusicId)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 font-medium text-sm transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveMusic}
                disabled={Boolean(removingMusicId)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/40 disabled:opacity-50"
              >
                {Boolean(removingMusicId) && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{Boolean(removingMusicId) ? 'Removing...' : 'Remove Music'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
