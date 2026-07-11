import { useState, useEffect } from 'react';

interface Game {
  id: number;
  name: string;
  background_image: string;
  rating: number;
}

// Popular Steam games with direct CDN URLs (no API needed)
const STEAM_GAMES: Game[] = [
  {
    id: 730,
    name: 'Counter-Strike 2',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
    rating: 4.5
  },
  {
    id: 570,
    name: 'Dota 2',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
    rating: 4.3
  },
  {
    id: 1172470,
    name: 'Apex Legends',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg',
    rating: 4.4
  },
  {
    id: 578080,
    name: 'PUBG',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg',
    rating: 4.2
  },
  {
    id: 1091500,
    name: 'Cyberpunk 2077',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
    rating: 4.1
  },
  {
    id: 1245620,
    name: 'Elden Ring',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
    rating: 4.8
  },
  {
    id: 271590,
    name: 'GTA V',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
    rating: 4.6
  },
  {
    id: 1172380,
    name: 'Star Wars Jedi',
    background_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172380/header.jpg',
    rating: 4.4
  }
];

export function useGames(limit = 6) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use direct CDN URLs to avoid CORS issues
    setGames(STEAM_GAMES.slice(0, limit));
    setLoading(false);
  }, [limit]);

  return { games, loading, error };
}
