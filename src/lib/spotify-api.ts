import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'streaming',
].join(' ');

const spotifyClient = axios.create({
  baseURL: SPOTIFY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

spotifyClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

spotifyClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await refreshAccessToken();
        
        const token = localStorage.getItem('spotify_access_token');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return spotifyClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'true',
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getTokens = async (code: string) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  });
  
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    }
  );
  
  const { access_token, refresh_token, expires_in } = response.data;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_refresh_token', refresh_token);
    localStorage.setItem('spotify_token_expiry', (Date.now() + expires_in * 1000).toString());
  }
  
  return response.data;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    }
  );
  
  const { access_token, expires_in } = response.data;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_token_expiry', (Date.now() + expires_in * 1000).toString());
  }
  
  return response.data;
};

export const spotifyApi = {
  getCurrentUser: () => spotifyClient.get('/me'),
  
  search: (query: string, types = ['track', 'artist', 'album', 'playlist']) =>
    spotifyClient.get('/search', {
      params: { q: query, type: types.join(','), limit: 20 },
    }),
  
  getArtist: (id: string) => spotifyClient.get(`/artists/${id}`),
  getArtistAlbums: (id: string) => spotifyClient.get(`/artists/${id}/albums`),
  getArtistTopTracks: (id: string, country = 'US') =>
    spotifyClient.get(`/artists/${id}/top-tracks`, { params: { country } }),
  getRelatedArtists: (id: string) => spotifyClient.get(`/artists/${id}/related-artists`),
  
  getAlbum: (id: string) => spotifyClient.get(`/albums/${id}`),
  getAlbumTracks: (id: string) => spotifyClient.get(`/albums/${id}/tracks`),
  
  getUserPlaylists: () => spotifyClient.get('/me/playlists'),
  getPlaylist: (id: string) => spotifyClient.get(`/playlists/${id}`),
  getPlaylistTracks: (id: string) => spotifyClient.get(`/playlists/${id}/tracks`),
  createPlaylist: (userId: string, name: string, isPublic = false) =>
    spotifyClient.post(`/users/${userId}/playlists`, {
      name,
      public: isPublic,
    }),
  addTracksToPlaylist: (playlistId: string, uris: string[]) =>
    spotifyClient.post(`/playlists/${playlistId}/tracks`, { uris }),
  
  getTrack: (id: string) => spotifyClient.get(`/tracks/${id}`),
  
  getUserSavedTracks: () => spotifyClient.get('/me/tracks'),
  checkUserSavedTracks: (ids: string[]) =>
    spotifyClient.get('/me/tracks/contains', { params: { ids: ids.join(',') } }),
  saveTrack: (id: string) => spotifyClient.put('/me/tracks', { ids: [id] }),
  removeTrack: (id: string) => spotifyClient.delete('/me/tracks', { params: { ids: id } }),
  
  getPlaybackState: () => spotifyClient.get('/me/player'),
  getUserDevices: () => spotifyClient.get('/me/player/devices'),
  
  getNewReleases: () => spotifyClient.get('/browse/new-releases'),
  getFeaturedPlaylists: () => spotifyClient.get('/browse/featured-playlists'),
  getCategories: () => spotifyClient.get('/browse/categories'),
  getCategoryPlaylists: (categoryId: string) =>
    spotifyClient.get(`/browse/categories/${categoryId}/playlists`),
};

export default spotifyApi;