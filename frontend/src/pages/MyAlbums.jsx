import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification, NotificationBanner } from '../context/NotificationContext';
import { API_URL } from '../config.js';
import {
  Disc,
  Plus,
  RefreshCw,
  Trash2,
  Calendar,
  Music,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

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

export default function MyAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Notifications & Navigation
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Fetch albums of logged-in artist on mount
  const fetchMyAlbums = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/album/myalbums`, {
        withCredentials: true,
      });

      const albumList = Array.isArray(response.data)
        ? response.data
        : response.data?.albums || response.data?.album || response.data?.data || [];

      setAlbums(albumList);
    } catch (err) {
      console.error('Failed to fetch artist albums:', err);
      let message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Failed to load your albums.';

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
      showNotification('error', formattedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAlbums();
  }, []);

  // Open & Close Delete Modal
  const openDeleteModal = (e, album) => {
    e.stopPropagation(); // Stop propagation so card navigation is not triggered
    setAlbumToDelete(album);
    setModalError('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = (force = false) => {
    if (isDeleting && !force) return;
    setIsDeleteModalOpen(false);
    setAlbumToDelete(null);
    setModalError('');
  };

  // Confirm and perform album deletion
  const confirmDelete = async () => {
    if (!albumToDelete) return;
    const targetTitle = albumToDelete.title || 'Album';

    try {
      setIsDeleting(true);
      setModalError('');

      const response = await axios.delete(
        `${API_URL}/api/album/${albumToDelete._id}`,
        {
          withCredentials: true,
        }
      );

      // Remove the deleted album from local state without reloading
      setAlbums((prevAlbums) =>
        prevAlbums.filter((album) => album._id !== albumToDelete._id)
      );

      // Force close modal properly
      closeDeleteModal(true);

      // Trigger success notification
      showNotification(
        'success',
        response.data?.message || `"${targetTitle}" was deleted successfully.`
      );
    } catch (err) {
      console.error('Delete album error:', err);
      const apiMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to delete album. Please try again.';
      setModalError(apiMessage);
      showNotification('error', apiMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 text-zinc-100">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Disc className="w-6 h-6 text-emerald-400" />
            My Albums
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your discography, curate music listings, and publish album releases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMyAlbums}
            disabled={loading}
            title="Refresh album list"
            aria-label="Refresh album list"
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer shadow-sm ring-1 ring-white/[0.04]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <Link
            to="/studio/create-album"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Album</span>
          </Link>
        </div>
      </div>

      {/* Global Inline Notification Banner */}
      <NotificationBanner className="mb-6" />

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl ring-1 ring-white/[0.04]">
          <Loader2 className="w-9 h-9 text-emerald-400 animate-spin mb-3" />
          <p className="text-zinc-200 font-medium">Loading your albums...</p>
          <p className="text-xs text-zinc-500 mt-1">Fetching your discography from Audiora servers</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-red-300">Could not retrieve your albums</p>
              <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchMyAlbums}
            className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-900 text-red-200 text-xs font-semibold transition border border-red-700/50 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content Area */}
      {!loading && !error && (
        <>
          {albums.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl ring-1 ring-white/[0.04]">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <Disc className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                You haven't created any albums yet.
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
                Assemble your musics into cohesive albums or EPs. Custom cover art, music collections, and releases will appear here.
              </p>
              <Link
                to="/studio/create-album"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Album</span>
              </Link>
            </div>
          ) : (
            /* Album Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {albums.map((album) => {
                const trackCount = album.musics?.length || 0;

                return (
                  <div
                    key={album._id}
                    onClick={() => navigate(`/studio/albums/${album._id}`)}
                    className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 cursor-pointer ring-1 ring-white/[0.04] flex flex-col justify-between"
                  >
                    <div>
                      {/* Square Album Cover with smooth hover zoom */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-800 border border-zinc-800/80 mb-3.5">
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
                            <Disc className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="font-semibold text-white text-base truncate group-hover:text-emerald-400 transition-colors"
                        title={album.title}
                      >
                        {album.title}
                      </h3>

                      {/* Metadata Row: Track Count Badge & Created Date */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Music className="w-3.5 h-3.5" />
                          <span>{trackCount} {trackCount === 1 ? 'Music' : 'Musics'}</span>
                        </span>

                        <span className="flex items-center gap-1 text-xs text-zinc-400 truncate">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{formatDate(album.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer with Delete Button */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 truncate">
                        ID: {album._id ? album._id.slice(-6) : '—'}
                      </span>

                      {/* Delete Button (stop event propagation so it doesn't navigate) */}
                      <button
                        type="button"
                        onClick={(e) => openDeleteModal(e, album)}
                        title="Delete album"
                        aria-label={`Delete ${album.title}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition border border-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Custom Dark Tailwind Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-14 bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => closeDeleteModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-album-modal-title"
        >
          <div
            className="bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl shadow-black/80 w-full max-w-md border border-zinc-800 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h2 id="delete-album-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Delete Album
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closeDeleteModal(false)}
                disabled={isDeleting}
                aria-label="Close delete dialog"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error inside modal */}
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
                {albumToDelete?.title || 'this album'}
              </span>
              '? Musics inside this album will remain in your library.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 font-medium text-sm transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/40 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
