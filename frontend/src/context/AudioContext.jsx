import { createContext, useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { API_URL } from '../config.js';

// AudioContext and AudioProvider are intentionally exported from the same module.
// eslint-disable-next-line react-refresh/only-export-components
export const AudioContext = createContext();

export function AudioProvider({ children }) {
  const auth = useContext(AuthContext);
  const user = auth?.user;

    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const audioRef = useRef(new Audio());
    const playSessionIdRef = useRef(0);
    const countedSessionIdRef = useRef(null);

    const stopAndClearAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }
      playSessionIdRef.current += 1;
      countedSessionIdRef.current = null;
      setCurrentSong(null);
      setIsPlaying(false);
      setQueue([]);
      setCurrentIndex(-1);
    };

    // Watch user from AuthContext: whenever user becomes null (e.g. on logout),
    // automatically pause the audio element and reset playback state.
    useEffect(() => {
    if (!user) {
      stopAndClearAudio();
    }
  }, [user]);

  const playSong = (song, songList = queue, index = currentIndex) => {
    if (!song || !song.uri) {
      console.error("Audio error: Track object has no 'uri' source to play.", song);
      return;
    }

    playSessionIdRef.current += 1;

    audioRef.current.pause();
    audioRef.current.src = song.uri;
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((e) => {
        console.error("Audio error during playback:", e);
        setIsPlaying(false);
      });

    setCurrentSong(song);
    if (songList.length > 0) setQueue(songList);
    if (index !== -1) setCurrentIndex(index);
  };

  const togglePlay = () => {
    if (currentSong) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((e) => {
            console.error("Audio error during playback resume:", e);
            setIsPlaying(false);
          });
      }
    }
  };

  // Next Song Logic
  const nextSong = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const newIndex = currentIndex + 1;
      playSong(queue[newIndex], queue, newIndex);
    }
  };

  // Previous Song Logic
  const prevSong = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      playSong(queue[newIndex], queue, newIndex);
    }
  };

  // Keep the ended listener in sync with the current queue position.
  useEffect(() => {
    const handleSongEnd = () => nextSong();
    const audio = audioRef.current;

    audio.addEventListener('ended', handleSongEnd);
    return () => audio.removeEventListener('ended', handleSongEnd);
    // The ended handler depends on the same queue/index state as nextSong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, currentIndex]);

  // Live play count tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = async () => {
      if (
        currentSong?._id &&
        countedSessionIdRef.current !== playSessionIdRef.current &&
        (audio.currentTime >= 3 || (audio.duration > 0 && audio.currentTime >= audio.duration * 0.5))
      ) {
        countedSessionIdRef.current = playSessionIdRef.current;

        try {
          const response = await axios.patch(
            `${API_URL}/api/music/${currentSong._id}/play`,
            {},
            { withCredentials: true }
          );

          if (response.data && typeof response.data.plays === 'number') {
            const updatedPlays = response.data.plays;
            setCurrentSong((prev) => (prev && prev._id === currentSong._id ? { ...prev, plays: updatedPlays } : prev));
            setQueue((prevQueue) =>
              prevQueue.map((item) => (item._id === currentSong._id ? { ...item, plays: updatedPlays } : item))
            );
          }
        } catch (error) {
          console.warn('Failed to record play count:', error?.response?.data?.message || error.message);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentSong]);

  return (
    <AudioContext.Provider value={{
      currentSong,
      isPlaying,
      playSong,
      togglePlay,
      nextSong,
      prevSong,
      audioRef,
      stopAndClearAudio,
      resetPlayer: stopAndClearAudio
    }}>
      {children}
    </AudioContext.Provider>
  );
}
