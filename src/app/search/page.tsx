"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Play } from "lucide-react";
import { usePlayerStore, Song } from "@/store/usePlayerStore";
import { formatTime } from "@/lib/utils";

const searchCategories = [
  { id: "all", name: "Todo" },
  { id: "songs", name: "Canciones" },
  { id: "artists", name: "Artistas" },
  { id: "albums", name: "Álbumes" },
  { id: "playlists", name: "Playlists" },
];

const sampleSongs: Song[] = [
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
  }
];

interface Artist {
  id: string;
  name: string;
  image: string;
  followers: number;
}

const sampleArtists: Artist[] = [
  {
    id: "a1",
    name: "The Weeknd",
    image: "/images/the-weeknd.jpg",
    followers: 85600000
  },
  {
    id: "a2",
    name: "Taylor Swift",
    image: "/images/taylor-swift.jpg",
    followers: 92300000
  },
  {
    id: "a3",
    name: "Bad Bunny",
    image: "/images/bad-bunny.jpg",
    followers: 58700000
  }
];

interface Album {
  id: string;
  title: string;
  artist: string;
  image: string;
  year: number;
}

const sampleAlbums: Album[] = [
  {
    id: "al1",
    title: "After Hours",
    artist: "The Weeknd",
    image: "/images/after-hours.jpg",
    year: 2020
  },
  {
    id: "al2",
    title: "Harry's House",
    artist: "Harry Styles",
    image: "/images/harrys-house.jpg",
    year: 2022
  },
  {
    id: "al3",
    title: "Un Verano Sin Ti",
    artist: "Bad Bunny",
    image: "/images/un-verano-sin-ti.jpg",
    year: 2022
  }
];

export default function SearchPage() {
  const { setQueue } = usePlayerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  
  const [results, setResults] = useState({
    songs: [] as Song[],
    artists: [] as Artist[],
    albums: [] as Album[]
  });
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults({
        songs: [],
        artists: [],
        albums: []
      });
      return;
    }
    
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      const filteredSongs = sampleSongs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const filteredArtists = sampleArtists.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const filteredAlbums = sampleAlbums.filter(album => 
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setResults({
        songs: filteredSongs,
        artists: filteredArtists,
        albums: filteredAlbums
      });
      
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const playSong = (song: Song) => {
    setQueue([song]);
  };
  
  const playAllSongs = () => {
    if (results.songs.length > 0) {
      setQueue(results.songs);
    }
  };
  
  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#B3B3B3]">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="¿Qué quieres escuchar?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#242424] text-white py-3 pl-12 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
        </div>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {searchCategories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap 
              ${activeCategory === category.id
                ? "bg-white text-black"
                : "bg-[#2A2A2A] text-white hover:bg-[#333333]"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>
      
      {searchTerm.trim() === "" && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Busca tus canciones, artistas y álbumes favoritos</h2>
          <p className="text-[#B3B3B3]">Introduce un término de búsqueda para empezar</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {!isLoading && searchTerm.trim() !== "" && 
        results.songs.length === 0 && 
        results.artists.length === 0 && 
        results.albums.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No se encontraron resultados para "{searchTerm}"</h2>
          <p className="text-[#B3B3B3]">Prueba con otro término de búsqueda</p>
        </div>
      )}
      
      {!isLoading && searchTerm.trim() !== "" && (
        <div className="space-y-8">
          {(activeCategory === "all" || activeCategory === "songs") && 
           results.songs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Canciones</h2>
                {results.songs.length > 0 && (
                  <button 
                    className="text-[#B3B3B3] hover:text-white transition-colors"
                    onClick={playAllSongs}
                  >
                    Reproducir todo
                  </button>
                )}
              </div>
              
              <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#282828] text-[#B3B3B3] text-left">
                      <th className="p-4 w-12">#</th>
                      <th className="p-4">Título</th>
                      <th className="p-4">Álbum</th>
                      <th className="p-4 text-right">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.songs.map((song, index) => (
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
          )}
          
          {(activeCategory === "all" || activeCategory === "artists") && 
           results.artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Artistas</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.artists.map(artist => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="spotify-card group"
                  >
                    <div className="relative mb-4">
                      <div className="aspect-square rounded-full overflow-hidden">
                        <Image
                          src={artist.image || "/default-artist.png"}
                          alt={artist.name}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    
                    <h3 className="font-semibold truncate mb-1">{artist.name}</h3>
                    <p className="text-sm text-[#B3B3B3]">Artista</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          
          {(activeCategory === "all" || activeCategory === "albums") && 
           results.albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Álbumes</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.albums.map(album => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className="spotify-card group"
                  >
                    <div className="aspect-square mb-4 relative overflow-hidden rounded-md">
                      <Image
                        src={album.image || "/default-album.png"}
                        alt={album.title}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    
                    <h3 className="font-semibold truncate mb-1">{album.title}</h3>
                    <p className="text-sm text-[#B3B3B3] truncate">
                      {album.year} • {album.artist}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}