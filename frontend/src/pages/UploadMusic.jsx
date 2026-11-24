import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNotification, NotificationBanner } from '../context/NotificationContext';
import { API_URL } from '../config.js';
import {
  UploadCloud,
  Music,
  Image as ImageIcon,
  X,
  Loader2,
} from 'lucide-react';

export default function UploadMusic() {
  const [title, setTitle] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const musicInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Handle Cover Image Selection
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Music File Selection
  const handleMusicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMusicFile(file);
    }
  };

  // Remove Selected Image
  const handleRemoveCover = (e) => {
    e.stopPropagation();
    setCoverImageFile(null);
    setImagePreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Remove Selected Audio
  const handleRemoveMusic = (e) => {
    e.stopPropagation();
    setMusicFile(null);
    if (musicInputRef.current) musicInputRef.current.value = '';
  };

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setMusicFile(null);
    setCoverImageFile(null);
    setImagePreview(null);
    if (musicInputRef.current) musicInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showNotification('error', 'Please enter a music title.');
      return;
    }
    if (!musicFile) {
      showNotification('error', 'Please upload an audio file.');
      return;
    }
    if (!coverImageFile) {
      showNotification('error', 'Please upload a cover image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('coverImage', coverImageFile);
    formData.append('music', musicFile);

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/music/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      showNotification(
        'success',
        response.data?.message || 'Music uploaded successfully to your studio!'
      );
      resetForm();
    } catch (error) {
      console.error('Music upload failed:', error);
      const apiMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string'
          ? error.response.data
          : null) ||
        'Failed to upload music. Please verify your connection or login status.';
      showNotification('error', apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 pb-10 sm:pb-12 text-zinc-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <UploadCloud className="w-8 h-8 text-emerald-400" />
          Upload New Music
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Share your music with listeners worldwide. Upload your audio file and album artwork.
        </p>
      </div>

      {/* Notifications (Global Banner Component matching design) */}
      <NotificationBanner className="mb-6" />

      {/* Upload Form Card - Neutral Charcoal Gray (No Blue Tint) */}
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Music Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-200 mb-2"
          >
            Music Title <span className="text-emerald-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midnight Reverie (feat. Nova)"
            disabled={loading}
            className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Dual Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Cover Artwork <span className="text-emerald-400">*</span>
            </label>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              onChange={handleCoverChange}
              disabled={loading}
              className="hidden"
              id="coverImageInput"
            />

            <div
              onClick={() => !loading && coverInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[190px] overflow-hidden ${coverImageFile
                ? 'border-emerald-500/50 bg-zinc-800/60'
                : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/50'
                } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg shadow-md border border-zinc-700"
                  />
                  <div className="text-left max-w-[140px] sm:max-w-[170px] truncate">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {coverImageFile?.name}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {(coverImageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <span className="inline-block mt-2 text-xs font-semibold text-emerald-400">
                      Click to change
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    disabled={loading}
                    className="absolute top-0 right-0 p-1.5 bg-zinc-900/80 hover:bg-red-600 text-zinc-300 hover:text-white rounded-full transition"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-emerald-400 hover:underline">
                      Upload cover artwork
                    </span>
                    <p className="text-xs text-zinc-400 mt-1">
                      PNG, JPG, or WEBP (Square recommended)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audio File Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Audio File <span className="text-emerald-400">*</span>
            </label>
            <input
              type="file"
              ref={musicInputRef}
              accept="audio/*"
              onChange={handleMusicChange}
              disabled={loading}
              className="hidden"
              id="musicFileInput"
            />

            <div
              onClick={() => !loading && musicInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[190px] ${musicFile
                ? 'border-emerald-500/50 bg-zinc-800/60'
                : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/50'
                } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {musicFile ? (
                <div className="relative w-full flex items-center justify-between p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-lg">
                  <div className="flex items-center gap-3 overflow-hidden text-left">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-zinc-200 truncate max-w-[170px] sm:max-w-[210px]">
                        {musicFile.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {(musicFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMusic}
                    disabled={loading}
                    className="p-1.5 hover:bg-red-600/80 text-zinc-400 hover:text-white rounded-lg transition shrink-0 ml-2"
                    title="Remove audio"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-emerald-400 hover:underline">
                      Upload audio file
                    </span>
                    <p className="text-xs text-zinc-400 mt-1">
                      MP3, WAV, FLAC, or AAC
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-white shadow-lg transition flex items-center justify-center gap-2 ${loading
              ? 'bg-emerald-600/60 cursor-not-allowed opacity-80'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] cursor-pointer'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                <span>Upload Music</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
