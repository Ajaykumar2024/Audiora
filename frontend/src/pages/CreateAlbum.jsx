import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AudioContext } from '../context/AudioContext';
import { useNotification, NotificationBanner } from '../context/NotificationContext';
import { API_URL } from '../config.js';
import {
  Disc,
  Plus,
  PlusCircle,
  ArrowLeft,
  UploadCloud,
  X,
  Search,
  Music,
  Clock,
  Loader2,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Format track duration in seconds to mm:ss format.
 */
const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '0:00';
  const totalSecs = Math.round(Number(seconds));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Format upload timestamp into readable date (e.g. Oct 24, 2026).
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

export default function CreateAlbum() {
  const [title, setTitle] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Music selection state
  const [artistTracks, setArtistTracks] = useState([]);
  const [selectedMusicIds, setSelectedMusicIds] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Audio Context for preview playback
  const audioContext = useContext(AudioContext);
  const currentSong = audioContext?.currentSong;
  const isPlaying = audioContext?.isPlaying;
  const playSong = audioContext?.playSong;
  const togglePlay = audioContext?.togglePlay;

  // Clean up object URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Fetch logged-in artist music on mount
  const fetchArtistTracks = async () => {
    setTracksLoading(true);
    setTracksError('');

    try {
      const response = await axios.get(`${API_URL}/api/music/mymusic`, {
        withCredentials: true,
      });

      const tracksList = Array.isArray(response.data)
        ? response.data
        : response.data?.musics || response.data?.music || response.data?.data || [];

      setArtistTracks(tracksList);
    } catch (err) {
      console.error('Failed to fetch artist music:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Could not load your uploaded music.';
      setTracksError(message);
    } finally {
      setTracksLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistTracks();
  }, []);

  // Validate and apply selected cover image
  const processCoverImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showNotification('error', 'Cover image size must be under 5MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCoverImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Handle Cover File Selection via Input Dialog
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processCoverImage(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isSubmitting) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCoverImage(file);
    }
  };

  // Remove Selected Cover Image
  const handleRemoveCover = (e) => {
    if (e) e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCoverImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle music selection preserving click order
  const toggleMusic = (musicId) => {
    setSelectedMusicIds((prev) =>
      prev.includes(musicId)
        ? prev.filter((id) => id !== musicId)
        : [...prev, musicId]
    );
  };

  // Client-side filtering of music items
  const filteredTracks = artistTracks.filter((track) =>
    (track.title || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Are all filtered music items currently selected?
  const areAllFilteredSelected =
    filteredTracks.length > 0 &&
    filteredTracks.every((track) => selectedMusicIds.includes(track._id));

  // Select all filtered music preserving existing order and appending the rest
  const handleSelectAll = () => {
    setSelectedMusicIds((prev) => {
      const newIds = [...prev];
      filteredTracks.forEach((track) => {
        if (!newIds.includes(track._id)) {
          newIds.push(track._id);
        }
      });
      return newIds;
    });
  };

  // Total runtime calculation for selected music
  const totalSelectedDuration = artistTracks
    .filter((music) => selectedMusicIds.includes(music._id))
    .reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);

  // Preview Play / Pause audio handler
  const handlePlayPreview = (e, music, index) => {
    e.stopPropagation(); // Prevents selection toggle

    if (!playSong) {
      console.error('AudioContext playSong function is unavailable.');
      return;
    }

    const audioUrl = music.uri || music.url || music.musicUrl;
    if (!audioUrl) {
      showNotification(
        'error',
        `Cannot play "${music.title}": Audio URL is missing.`
      );
      return;
    }

    if (currentSong?._id === music._id) {
      togglePlay();
    } else {
      playSong({ ...music, uri: audioUrl }, artistTracks, index);
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      showNotification('error', 'Please enter an album title.');
      return;
    }

    if (!coverImageFile) {
      showNotification('error', 'Please upload a cover image for the album.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('coverImage', coverImageFile);
      formData.append('musics', JSON.stringify(selectedMusicIds));

      const response = await axios.post(`${API_URL}/api/album/create`, formData, {
        withCredentials: true,
      });

      showNotification(
        'success',
        response.data?.message || 'Album created successfully!'
      );

      navigate('/studio/albums');
    } catch (err) {
      console.error('Create album error:', err);
      const apiMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to create album. Please try again.';
      showNotification('error', apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 text-zinc-100">
      {/* Top Header */}
      <div>
        <Link
          to="/studio/albums"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Albums</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
            <Disc className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Create New Album
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Curate your music into an album release with custom square artwork.
            </p>
          </div>
        </div>
      </div>

      {/* Global Inline Notification Banner */}
      <NotificationBanner className="mb-6" />

      {/* Main Creation Form - Cohesive Neutral Outer Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl ring-1 ring-white/[0.04]"
      >
        {/* Responsive Equal-Height 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* =========================================================================
              LEFT COLUMN: Album Details (Cover Image + Title)
          ========================================================================== */}
          <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg h-auto lg:h-[430px] flex flex-col justify-between ring-1 ring-white/[0.04]">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Album Details
              </h2>

              {/* 1. Album Title Input (Required) */}
              <div>
                <label
                  htmlFor="albumTitleInput"
                  className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                >
                  Album Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="albumTitleInput"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Echoes of Midnight"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-zinc-800/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm disabled:opacity-50"
                />
              </div>

              {/* 2. Full-Width Rectangular Cover Image Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Cover Artwork <span className="text-emerald-400">*</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleCoverChange}
                  disabled={isSubmitting}
                  className="hidden"
                  id="albumCoverInput"
                />

                <div
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full h-48 sm:h-52 rounded-2xl border-2 border-dashed transition overflow-hidden cursor-pointer group/cover ${isDragging
                      ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                      : previewUrl
                        ? 'border-emerald-500/50 bg-zinc-800/80 shadow-inner'
                        : 'border-zinc-700 bg-zinc-800/40 hover:border-emerald-500/50 hover:bg-zinc-800/60'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Album cover preview"
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay controls on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                        <p className="text-xs font-semibold text-white bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-sm mb-1.5 shadow-sm">
                          Change Artwork
                        </p>
                        <span className="text-[11px] text-zinc-300 truncate max-w-[220px] px-2">
                          {coverImageFile?.name}
                        </span>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        disabled={isSubmitting}
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-zinc-200 hover:text-white transition shadow-lg cursor-pointer"
                        title="Remove cover image"
                        aria-label="Remove cover image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-5 space-y-2 text-center">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400 group-hover/cover:scale-105 transition-transform shadow-inner">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-emerald-400 group-hover/cover:underline">
                          Upload Cover Artwork
                        </span>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Click to browse or drag & drop
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          JPG, PNG, or WEBP (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Select Music (Optional)
          ========================================================================== */}
          <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg h-auto lg:h-[430px] flex flex-col ring-1 ring-white/[0.04]">
            {/* Header with Title and Selected count + Select All & Clear actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 pb-3 border-b border-zinc-800/80 mb-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Select Music</span>
                  <span className="text-xs font-normal text-zinc-400">(Optional)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pick music from your library to add to this album.
                </p>
              </div>

              {/* Action Buttons: Select All & Clear */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Compact Select All Toggle */}
                {filteredTracks.length > 0 && (
                  <button
                    type="button"
                    onClick={areAllFilteredSelected ? () => setSelectedMusicIds([]) : handleSelectAll}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition cursor-pointer"
                    title={areAllFilteredSelected ? 'Deselect all music' : 'Select all filtered music'}
                  >
                    {areAllFilteredSelected ? 'Clear All' : 'Select All'}
                  </button>
                )}

                {/* Separate Clear Action when items are selected and not all filtered are selected */}
                {!areAllFilteredSelected && selectedMusicIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedMusicIds([])}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition cursor-pointer"
                    title="Clear selected music"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Small Search Bar (100% width, shrink-0) */}
            <div className="relative shrink-0 mb-3">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter music by title..."
                disabled={isSubmitting || tracksLoading}
                className="w-full pl-9 pr-8 py-2 bg-zinc-800/70 border border-zinc-700/70 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable Music List - flex-1 min-h-0 with subtle custom dark scrollbar */}
            <div className="flex-1 min-h-0 max-h-72 lg:max-h-none overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(113,113,122,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
              {/* Music Loading State */}
              {tracksLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mb-2" />
                  <p className="text-xs text-zinc-400">Loading your uploaded music...</p>
                </div>
              )}

              {/* Music Fetch Error State */}
              {!tracksLoading && tracksError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{tracksError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchArtistTracks}
                    className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-900 text-red-200 font-medium transition cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty Music List (Artist has no uploads yet) */}
              {!tracksLoading && !tracksError && artistTracks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-zinc-800/30 border border-zinc-800">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-3">
                    <Music className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    No music uploaded yet
                  </p>
                  <p className="text-xs text-zinc-400 max-w-xs mb-4 leading-relaxed">
                    You can still create an album now, or upload music to include in this release.
                  </p>
                  <Link
                    to="/studio/upload"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Music</span>
                  </Link>
                </div>
              )}

              {/* Filtered Search Empty State */}
              {!tracksLoading &&
                !tracksError &&
                artistTracks.length > 0 &&
                filteredTracks.length === 0 && (
                  <div className="py-12 text-center text-xs text-zinc-400">
                    No music found matching "{searchQuery}"
                  </div>
                )}

              {/* Render Filtered Music Rows */}
              {!tracksLoading &&
                !tracksError &&
                filteredTracks.map((music, index) => {
                  const isSelected = selectedMusicIds.includes(music._id);
                  const orderNumber = isSelected ? selectedMusicIds.indexOf(music._id) + 1 : null;
                  const isThisPlaying = currentSong?._id === music._id && isPlaying;

                  return (
                    <div
                      key={music._id}
                      onClick={() => !isSubmitting && toggleMusic(music._id)}
                      className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm ring-1 ring-emerald-500/20'
                          : 'bg-zinc-800/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/70 hover:border-zinc-700/60'
                        }`}
                    >
                      {/* Left: Clean Square/Order Badge + Thumbnail with Play Overlay + Title & Upload Date */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Selection Indicator: Clean Empty Square -> Solid Emerald Order Number */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${isSelected
                              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/40 scale-105'
                              : 'border border-zinc-600 group-hover:border-emerald-500/50 bg-zinc-800/50'
                            }`}
                          title={isSelected ? `Music #${orderNumber} in album` : 'Click to select music'}
                        >
                          {isSelected ? orderNumber : null}
                        </div>

                        {/* Music Thumbnail with Play/Pause Preview Overlay */}
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
                              <Music className="w-4 h-4" />
                            </div>
                          )}

                          {/* Play/Pause Button Overlay (visible on hover, always visible if playing) */}
                          <button
                            type="button"
                            onClick={(e) => handlePlayPreview(e, music, index)}
                            className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${isThisPlaying
                                ? 'bg-black/60 text-emerald-400 opacity-100'
                                : 'bg-black/50 text-white opacity-0 group-hover/thumb:opacity-100'
                              }`}
                            title={isThisPlaying ? 'Pause preview' : 'Play preview'}
                            aria-label={isThisPlaying ? 'Pause preview' : 'Play preview'}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 fill-emerald-400" />
                            ) : (
                              <Play className="w-4 h-4 fill-white translate-x-0.5" />
                            )}
                          </button>
                        </div>

                        {/* Music Title and Clean Metadata (No Technical IDs) */}
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${isSelected ? 'text-emerald-300' : 'text-zinc-200'
                              }`}
                            title={music.title}
                          >
                            {music.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate mt-0.5">
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

                      {/* Right: Duration */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0 font-mono">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{formatDuration(music.duration)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Total Runtime Strip (shrink-0) */}
            <div className="shrink-0 pt-3 mt-auto border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 font-medium">
                <span className={selectedMusicIds.length > 0 ? 'text-white' : 'text-zinc-400'}>
                  {selectedMusicIds.length} music selected
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Total runtime {formatDuration(totalSelectedDuration)}</span>
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Audiora Studio
              </span>
            </div>
          </div>
        </div>

        {/* Right-Aligned Action Bar (Border-t divider + consistent buttons) */}
        <div className="border-t border-zinc-800/80 pt-4 mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/studio/albums')}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 font-medium text-sm transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
