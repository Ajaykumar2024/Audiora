import { memo, useContext, useEffect, useState } from 'react';
import { AudioContext } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const BottomPlayer = memo(function BottomPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, audioRef } = useContext(AudioContext);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef]);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolume = (e) => {
    const newVolume = e.target.value;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  return (
    <footer className="fixed bottom-0 inset-x-0 w-full h-20 sm:h-24 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-3 sm:px-6 md:px-8 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.04]">
      <div className="flex h-full w-full items-center justify-between gap-3 sm:gap-6">

        {/* 1. Left: Current track details or Placeholder */}
        <div className="w-1/3 sm:w-1/4 md:w-[30%] flex items-center gap-2.5 sm:gap-3.5 overflow-hidden min-w-0">
          {currentSong ? (
            <>
              <img
                src={currentSong.coverImage}
                alt={currentSong.title}
                className="h-11 w-11 sm:h-14 sm:w-14 rounded-xl object-cover shadow-md shadow-black/50 border border-white/5 shrink-0"
              />
              <div className="truncate min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-zinc-100 truncate tracking-tight">{currentSong.title}</p>
                <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">{currentSong.artist?.username || currentSong.artistName}</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-xl bg-zinc-900 border border-zinc-800/80 shrink-0" />
              <div className="truncate hidden sm:block">
                <p className="text-sm font-medium text-zinc-200">Nothing playing</p>
                <p className="text-xs text-zinc-500">Choose a track to get started</p>
              </div>
            </>
          )}
        </div>

        {/* 2. Center: Playback controls & Full Width Progress Bar */}
        <div className="flex-1 sm:w-2/4 md:w-[40%] max-w-2xl flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-zinc-300 min-w-0 px-1 sm:px-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={prevSong}
              aria-label="Previous track"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play/Pause"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-zinc-950 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-white/10 cursor-pointer"
            >
              {isPlaying ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextSong}
              aria-label="Next track"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full">
            <span className="text-[11px] sm:text-xs font-mono tabular-nums text-zinc-400 w-8 sm:w-10 text-right shrink-0">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 w-full h-1 bg-zinc-700/60 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none min-w-0 transition-all"
              disabled={!currentSong}
            />
            <span className="text-[11px] sm:text-xs font-mono tabular-nums text-zinc-400 w-8 sm:w-10 shrink-0">{formatTime(duration)}</span>
          </div>
        </div>

        {/* 3. Right: Volume controls (Desktop/Tablet) */}
        <div className="w-auto sm:w-1/4 md:w-[30%] hidden sm:flex justify-end items-center gap-2.5 shrink-0 pr-1">
          <Volume2 size={19} className="text-zinc-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="w-16 sm:w-24 md:w-28 h-1 bg-zinc-700/60 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none transition-all"
          />
        </div>
      </div>
    </footer>
  );
});

export default BottomPlayer;
