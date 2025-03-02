"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { usePlayerStore } from "@/store/usePlayerStore";
import { formatTime } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat, 
  Repeat1, 
  Shuffle,
  Maximize2,
  Minimize2, 
  Heart,
  ListMusic
} from "lucide-react";

const Player = () => {
  const { 
    currentSong,
    playing,
    currentTime,
    volume,
    muted,
    repeat,
    shuffle,
    minimized,
    playPause,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleMinimized
  } = usePlayerStore();
  
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSong || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * currentSong.duration;
    
    seekTo(newTime);
  };
  
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    setVolume(Math.max(0, Math.min(1, percent)));
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };
  
  if (!currentSong) return null;
  
  const progressPercent = (currentTime / currentSong.duration) * 100;
  
  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] 
        px-4 py-3 flex items-center transition-all
        ${minimized ? "h-16" : "h-24"}
      `}
    >
      <div className="flex items-center w-1/4">
        <div className="flex-shrink-0 mr-3">
          <Image
            src={currentSong.albumArt || "/default-album.png"}
            alt={currentSong.title}
            width={minimized ? 40 : 56}
            height={minimized ? 40 : 56}
            className="rounded"
          />
        </div>
        
        <div className="mr-4 min-w-0">
          <p className="font-medium text-sm truncate">{currentSong.title}</p>
          <p className="text-xs text-[#B3B3B3] truncate">{currentSong.artist}</p>
        </div>
        
        <button 
          className={`
            player-control mr-4
            ${isLiked ? "text-[#1DB954]" : ""}
          `}
          onClick={toggleLike}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-[#1DB954]" : ""}`} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-1">
          <button 
            className={`player-control ${shuffle ? "text-[#1DB954]" : ""}`}
            onClick={toggleShuffle}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button className="player-control" onClick={prevSong}>
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            onClick={playPause}
          >
            {playing ? (
              <Pause className="w-5 h-5" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5" fill="currentColor" />
            )}
          </button>
          
          <button className="player-control" onClick={nextSong}>
            <SkipForward className="w-5 h-5" />
          </button>
          
          <button 
            className={`player-control ${repeat !== "off" ? "text-[#1DB954]" : ""}`}
            onClick={toggleRepeat}
          >
            {repeat === "one" ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {!minimized && (
          <div className="w-full flex items-center gap-2 px-4">
            <span className="text-xs text-[#B3B3B3]">
              {formatTime(currentTime)}
            </span>
            
            <div 
              className="progress-bar flex-1"
              ref={progressRef}
              onClick={handleProgressClick}
            >
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <span className="text-xs text-[#B3B3B3]">
              {formatTime(currentSong.duration)}
            </span>
          </div>
        )}
      </div>
      
      <div className="w-1/4 flex items-center justify-end gap-3">
        <button className="player-control">
          <ListMusic className="w-4 h-4" />
        </button>
        
        <div 
          className="relative"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button className="player-control" onClick={toggleMute}>
            {muted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          
          {showVolumeSlider && (
            <div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#5E5E5E] rounded-full"
              ref={volumeRef}
              onClick={handleVolumeClick}
            >
              <div 
                className="h-full bg-white rounded-full"
                style={{ width: `${volume * 100}%` }}
              >
                <div className="w-3 h-3 bg-white absolute -right-1.5 top-1/2 -translate-y-1/2 rounded-full" />
              </div>
            </div>
          )}
        </div>
        
        <button className="player-control" onClick={toggleMinimized}>
          {minimized ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Player;