"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { usePlayerStore, Song, Playlist } from "@/store/usePlayerStore";
import { formatTime } from "@/lib/utils";

const samplePlaylists: Playlist[] = [
  {
    id: "pl1",
    name: "Discover Weekly",
    description: "Tu mix semanal de música nueva y recomendaciones personalizadas",
    coverImage: "/images/discover-weekly.jpg",
    songs: []
  },
  {
    id: "pl2",
    name: "Release Radar",
    description: "Nuevos lanzamientos de artistas que sigues",
    coverImage: "/images/release-radar.jpg",
    songs: []
  },
  {
    id: "pl3",
    name: "Daily Mix 1",
    description: "Made for You. Refresh everyday",
    coverImage: "/images/daily-mix.jpg",
    songs: []
  },
  {
    id: "pl4",
    name: "Lo-Fi Beats",
    description: "Música Lo-Fi para relajarse y estudiar",
    coverImage: "/images/lofi-beats.jpg",
    songs: []
  },
  {
    id: "pl5",
    name: "Top 50 Global",
    description: "Las 50 canciones más escuchadas en todo el mundo",
    coverImage: "/images/top-50.jpg",
    songs: []
  },
  {
    id: "pl6",
    name: "Éxitos España",
    description: "Las canciones del momento en España",
    coverImage: "/images/spain-hits.jpg",
    songs: []
  }
];

const recentSongs: Song[] = [
  {
    id: "s1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    albumArt: "/images/after-hours.jpg",
    duration: 200,
    url: "https://example.com/song1.mp3"
  },
  {
    id: "s2",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    albumArt: "/images/harrys-house.jpg",
    duration: 178,
    url: "https://example.com/song2.mp3"
  },
  {
    id: "s3",
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    albumArt: "/images/dreamland.jpg",
    duration: 234,
    url: "https://example.com/song3.mp3"
  },
  {
    id: "s4",
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    album: "Stay - Single",
    albumArt: "/images/stay.jpg",
    duration: 201,
    url: "https://example.com/song4.mp3"
  },
  {
    id: "s5",
    title: "Easy On Me",
    artist: "Adele",
    album: "30",
    albumArt: "/images/30.jpg",
    duration: 224,
    url: "https://example.com/song5.mp3"
  }
];

export default function Home() {
  const { setQueue } = usePlayerStore();
  const [greeting, setGreeting] = useState("Buenos días");
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Buenos días");
    } else if (hour >= 12 && hour < 20) {
      setGreeting("Buenas tardes");
    } else {
      setGreeting("Buenas noches");
    }
  }, []);
  
  const playPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs);
    } else {
      setQueue(recentSongs);
    }
  };
  
  const playSong = (song: Song) => {
    setQueue([song]);
  };
  
  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{greeting}</h1>
        
        <div className="flex items-center gap-2">
          <button className="spotify-button-outlined">
            Actualizar
          </button>
        </div>
      </header>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Playlists recomendadas</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {samplePlaylists.map(playlist => (
            <div 
              key={playlist.id}
              className="spotify-card group relative"
            >
              <div className="aspect-square mb-4 relative overflow-hidden rounded-md">
                <Image
                  src={playlist.coverImage || "/default-playlist.png"}
                  alt={playlist.name}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
                
                <button 
                  className="absolute right-2 bottom-2 bg-[#1DB954] rounded-full p-3 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                  onClick={() => playPlaylist(playlist)}
                >
                  <Play className="w-5 h-5 text-black" fill="currentColor" />
                </button>
              </div>
              
              <Link href={`/playlist/${playlist.id}`}>
                <h3 className="font-semibold truncate mb-1">{playlist.name}</h3>
                <p className="text-sm text-[#B3B3B3] line-clamp-2">{playlist.description}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Reproducidos recientemente</h2>
        
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#282828] text-[#B3B3B3] text-left">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Título</th>
                <th className="p-4">Álbum</th>
                <th className="p-4 text-right">
                  <Clock className="w-5 h-5 inline-block" />
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSongs.map((song, index) => (
                <tr 
                  key={song.id}
                  className="hover:bg-[#282828] group"
                >
                  <td className="p-4 w-12 text-[#B3B3B3]">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <button 
                        className="hidden group-hover:block"
                        onClick={() => playSong(song)}
                      >
                        <Play className="w-4 h-4" fill="currentColor" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden">
                        <Image
                          src={song.albumArt || "/default-album.png"}
                          alt={song.title}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div>
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-[#B3B3B3] truncate">{song.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[#B3B3B3]">{song.album}</td>
                  <td className="p-4 text-right text-[#B3B3B3]">{formatTime(song.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}