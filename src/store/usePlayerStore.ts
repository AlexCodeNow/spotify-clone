import { create } from 'zustand';
import { Howl } from 'howler';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  songs: Song[];
}

interface PlayerState {
  howl: Howl | null;
  playing: boolean;
  currentSong: Song | null;
  currentTime: number;
  volume: number;
  muted: boolean;
  
  queue: Song[];
  queueIndex: number;
  
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  
  minimized: boolean;
  sidebarOpen: boolean;
  
  initializePlayer: (song: Song) => void;
  playPause: () => void;
  play: () => void;
  pause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setQueue: (songs: Song[], initialIndex?: number) => void;
  addToQueue: (song: Song) => void;
  toggleMinimized: () => void;
  toggleSidebar: () => void;
  cleanup: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  howl: null,
  playing: false,
  currentSong: null,
  currentTime: 0,
  volume: 0.7,
  muted: false,
  queue: [],
  queueIndex: 0,
  repeat: 'off',
  shuffle: false,
  minimized: true,
  sidebarOpen: true,
  
  initializePlayer: (song: Song) => {
    const { howl, cleanup } = get();
    if (howl) cleanup();
    
    const newHowl = new Howl({
      src: [song.url],
      html5: true,
      volume: get().volume,
      mute: get().muted,
      onplay: () => set({ playing: true }),
      onpause: () => set({ playing: false }),
      onend: () => get().nextSong(),
      onseek: () => {},
      onload: () => {},
      onloaderror: (id, error) => console.error('Error loading audio:', error),
      onplayerror: (id, error) => console.error('Error playing audio:', error),
    });
    
    const updateIntervalId = setInterval(() => {
      const howl = get().howl;
      if (howl && get().playing) {
        const currentSeek = howl.seek();
        if (typeof currentSeek === 'number') {
          set({ currentTime: currentSeek });
        }
      }
    }, 1000);
    
    (newHowl as any)._updateIntervalId = updateIntervalId;
    
    set({
      howl: newHowl,
      currentSong: song,
      currentTime: 0,
      playing: true,
    });
    
    newHowl.play();
  },
  
  playPause: () => {
    const { howl, playing } = get();
    if (!howl) return;
    
    if (playing) {
      howl.pause();
    } else {
      howl.play();
    }
  },
  
  play: () => {
    const { howl } = get();
    if (howl && !get().playing) {
      howl.play();
    }
  },
  
  pause: () => {
    const { howl } = get();
    if (howl && get().playing) {
      howl.pause();
    }
  },
  
  nextSong: () => {
    const { queue, queueIndex, repeat, shuffle } = get();
    if (queue.length === 0) return;
    
    let nextIndex = queueIndex;
    
    if (shuffle) {
      const availableIndices = Array.from(
        { length: queue.length },
        (_, i) => i
      ).filter(i => i !== queueIndex);
      
      if (availableIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        nextIndex = availableIndices[randomIndex];
      }
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
      
      if (repeat === 'off' && nextIndex === 0) {
        get().pause();
        return;
      }
    }
    
    if (repeat === 'one') {
      get().seekTo(0);
      get().play();
      return;
    }
    
    set({ queueIndex: nextIndex });
    get().initializePlayer(queue[nextIndex]);
  },
  
  prevSong: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;
    
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }
    
    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    set({ queueIndex: prevIndex });
    get().initializePlayer(queue[prevIndex]);
  },
  
  seekTo: (time: number) => {
    const { howl } = get();
    if (!howl) return;
    
    howl.seek(time);
    set({ currentTime: time });
  },
  
  setVolume: (volume: number) => {
    const { howl } = get();
    if (howl) {
      howl.volume(volume);
    }
    set({ volume, muted: volume === 0 });
  },
  
  toggleMute: () => {
    const { howl, muted, volume } = get();
    if (!howl) return;
    
    const newMuted = !muted;
    howl.mute(newMuted);
    set({ muted: newMuted });
  },
  
  toggleRepeat: () => {
    const repeatStates: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = repeatStates.indexOf(get().repeat);
    const nextIndex = (currentIndex + 1) % repeatStates.length;
    set({ repeat: repeatStates[nextIndex] });
  },
  
  toggleShuffle: () => {
    set({ shuffle: !get().shuffle });
  },
  
  setQueue: (songs: Song[], initialIndex = 0) => {
    set({
      queue: songs,
      queueIndex: initialIndex,
    });
    
    if (songs.length > 0) {
      get().initializePlayer(songs[initialIndex]);
    }
  },
  
  addToQueue: (song: Song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
  },
  
  toggleMinimized: () => {
    set({ minimized: !get().minimized });
  },
  
  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen });
  },
  
  cleanup: () => {
    const { howl } = get();
    if (howl) {
      const customHowl = howl as any;
      if (customHowl._updateIntervalId) {
        clearInterval(customHowl._updateIntervalId);
      }
      
      howl.stop();
      howl.unload();
    }
    
    set({
      howl: null,
      playing: false,
      currentTime: 0,
    });
  },
}));