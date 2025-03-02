"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Heart, 
  LogIn,
  ChevronRight,
  ChevronLeft,
  Music,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface PlaylistItem {
  id: string;
  name: string;
  image?: string;
}

const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = usePlayerStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    setIsLoggedIn(!!token);
    
    if (token) {
      setPlaylists([
        { id: '1', name: 'Liked Songs', image: '/images/liked-songs.png' },
        { id: '2', name: 'Discover Weekly' },
        { id: '3', name: 'Release Radar' },
        { id: '4', name: 'Daily Mix 1' },
        { id: '5', name: 'Daily Mix 2' },
      ]);
    }
  }, []);
  
  const mainNavItems: NavItem[] = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="w-6 h-6" />,
    },
    {
      name: "Search",
      href: "/search",
      icon: <Search className="w-6 h-6" />,
    },
  ];
  
  const libraryNavItems: NavItem[] = [
    {
      name: "Your Library",
      href: "/library",
      icon: <Library className="w-6 h-6" />,
    },
  ];
  
  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-md transition-colors
          ${isActive 
            ? "bg-[#282828] text-white" 
            : "text-[#B3B3B3] hover:text-white"
          }
        `}
      >
        {item.icon}
        {sidebarOpen && <span className="font-medium">{item.name}</span>}
      </Link>
    );
  };
  
  return (
    <aside 
      className={`
        flex flex-col h-full bg-[#121212] text-white transition-all duration-300
        ${sidebarOpen ? "w-64" : "w-20"}
      `}
    >
      <div className="flex justify-between items-center pt-6 px-4">
        {sidebarOpen ? (
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/spotify-logo.svg"
              alt="Spotify"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">Spotify</span>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <Image
              src="/spotify-logo.svg"
              alt="Spotify"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
        )}
        
        <button
          onClick={toggleSidebar}
          className="text-[#B3B3B3] hover:text-white transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <nav className="mt-6 px-2">
        {mainNavItems.map(renderNavItem)}
      </nav>
      
      <div className="mt-6 px-2">
        <div className="flex items-center justify-between px-2">
          {libraryNavItems.map((item) => (
            <div key={item.href} className="flex items-center gap-3">
              {item.icon}
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </div>
          ))}
          
          {sidebarOpen && (
            <button className="text-[#B3B3B3] hover:text-white">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {sidebarOpen && (
          <div className="flex gap-2 mt-4 px-2 overflow-x-auto">
            <button className="px-3 py-1 text-sm bg-[#242424] rounded-full hover:bg-[#2A2A2A]">
              Playlists
            </button>
            <button className="px-3 py-1 text-sm bg-[#242424] rounded-full hover:bg-[#2A2A2A]">
              Artists
            </button>
            <button className="px-3 py-1 text-sm bg-[#242424] rounded-full hover:bg-[#2A2A2A]">
              Albums
            </button>
          </div>
        )}
        
        {sidebarOpen && (
          <div className="flex items-center gap-2 mt-4 px-2">
            <Search className="w-4 h-4 text-[#B3B3B3]" />
            <input
              type="text"
              placeholder="Search in Your Library"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto mt-4 px-2">
        {isLoggedIn ? (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#282828] transition-colors"
              >
                {playlist.image ? (
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={playlist.image}
                      alt={playlist.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center">
                    <Music className="w-6 h-6 text-[#B3B3B3]" />
                  </div>
                )}
                
                {sidebarOpen && (
                  <div>
                    <p className="font-medium truncate">{playlist.name}</p>
                    <p className="text-sm text-[#B3B3B3]">Playlist</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 py-4">
            {sidebarOpen && (
              <>
                <h3 className="font-bold mb-2">Create your first playlist</h3>
                <p className="text-sm text-[#B3B3B3] mb-4">It's easy, we'll help you</p>
                <button className="spotify-button">
                  Create playlist
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-auto p-4">
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#535353] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {sidebarOpen && <span className="font-medium">User Name</span>}
          </div>
        ) : (
          <Link
            href="/login"
            className={`
              flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors
              ${!sidebarOpen && "justify-center"}
            `}
          >
            <LogIn className="w-5 h-5" />
            {sidebarOpen && <span>Log in</span>}
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;