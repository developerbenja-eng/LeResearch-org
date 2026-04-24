'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Music, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SpotifyStatus {
  connected: boolean;
  is_premium?: boolean;
  spotify_user_id?: string;
  is_expired?: boolean;
}

interface SpotifyConnectButtonProps {
  onStatusChange?: (status: SpotifyStatus) => void;
}

export function SpotifyConnectButton({ onStatusChange }: SpotifyConnectButtonProps) {
  const [status, setStatus] = useState<SpotifyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  // Check URL params for OAuth result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spotifyConnected = params.get('spotify');
    const spotifyError = params.get('error');

    if (spotifyConnected === 'connected') {
      // Refresh status after successful connection
      checkSpotifyStatus();
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('spotify');
      url.searchParams.delete('premium');
      window.history.replaceState({}, '', url.toString());
    }

    if (spotifyError) {
      setError(decodeURIComponent(params.get('message') || spotifyError));
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lingua/music/spotify/refresh', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data: SpotifyStatus = await response.json();
        setStatus(data);
        onStatusChange?.(data);
      } else {
        setStatus({ connected: false });
        onStatusChange?.({ connected: false });
      }
    } catch (err) {
      console.error('Error checking Spotify status:', err);
      setStatus({ connected: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to Spotify OAuth
    window.location.href = '/api/lingua/music/spotify/auth';
  };

  const handleDisconnect = async () => {
    // TODO: Implement disconnect endpoint
    // For now, just show that we need to implement this
    alert('Disconnect functionality coming soon. For now, you can revoke access in your Spotify account settings.');
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking Spotify...
      </Button>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
        <Button onClick={handleConnect} className="gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white">
          <SpotifyIcon className="w-5 h-5" />
          Try Again
        </Button>
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center">
            <SpotifyIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-800">Spotify Connected</span>
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-green-600">
              {status.is_premium ? 'Premium account - Full playback available' : 'Free account - 30-second previews'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-gray-500">
          Disconnect Spotify
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Connect Spotify</h3>
            <p className="text-sm text-gray-600 mt-1">
              Listen to music and learn from song lyrics. Premium users get full playback, free users get 30-second previews.
            </p>
          </div>
        </div>
      </div>
      <Button onClick={handleConnect} className="gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white">
        <SpotifyIcon className="w-5 h-5" />
        Connect with Spotify
      </Button>
    </div>
  );
}

// Spotify logo icon
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}
