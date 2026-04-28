'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Link2,
  Headphones,
  Palette,
  User,
  BookOpen,
  Mic,
  Gauge,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Monitor,
  Grid,
  List,
  Check,
  AlertCircle,
  Loader2,
  Unlink,
  RefreshCw,
  ExternalLink,
  Settings,
  Key,
} from 'lucide-react';

type TabId = 'connections' | 'reading' | 'display' | 'account';
type Theme = 'light' | 'dark' | 'system';
type TTSProvider = 'edge' | 'gemini';

interface ZoteroStatus {
  connected: boolean;
  username?: string;
  lastSync?: string;
  status: string;
  itemCount: number;
}

// Voice options
const EDGE_VOICES = [
  { id: 'en-US-AriaNeural', name: 'Aria', style: 'Formal', gender: 'Female' },
  { id: 'en-US-JennyNeural', name: 'Jenny', style: 'Conversational', gender: 'Female' },
  { id: 'en-US-GuyNeural', name: 'Guy', style: 'Conversational', gender: 'Male' },
  { id: 'en-US-DavisNeural', name: 'Davis', style: 'Formal', gender: 'Male' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', style: 'Academic', gender: 'Female' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', style: 'Academic', gender: 'Male' },
];

const GEMINI_VOICES = [
  { id: 'Charon', name: 'Charon', style: 'Informative', description: 'Clear and informative' },
  { id: 'Kore', name: 'Kore', style: 'Firm', description: 'Authoritative tone' },
  { id: 'Puck', name: 'Puck', style: 'Upbeat', description: 'Energetic and engaging' },
  { id: 'Aoede', name: 'Aoede', style: 'Breezy', description: 'Light and friendly' },
  { id: 'Fenrir', name: 'Fenrir', style: 'Excitable', description: 'Dynamic and expressive' },
  { id: 'Iapetus', name: 'Iapetus', style: 'Clear', description: 'Articulate narration' },
];

const tabs: { id: TabId; label: string; icon: typeof Link2 }[] = [
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'reading', label: 'Reading', icon: Headphones },
  { id: 'display', label: 'Display', icon: Palette },
  { id: 'account', label: 'Account', icon: User },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('connections');

  // Kindle state
  const [kindleConnected, setKindleConnected] = useState(false);
  const [kindleGivenName, setKindleGivenName] = useState<string | null>(null);
  const [kindleLoading, setKindleLoading] = useState(true);
  const [kindleConnecting, setKindleConnecting] = useState(false);
  const [kindleError, setKindleError] = useState<string | null>(null);
  const [kindleSuccess, setKindleSuccess] = useState<string | null>(null);

  // Zotero state
  const [zoteroStatus, setZoteroStatus] = useState<ZoteroStatus | null>(null);
  const [zoteroLoading, setZoteroLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [zoteroError, setZoteroError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [zoteroSuccess, setZoteroSuccess] = useState<string | null>(null);

  // Reading settings (stored in localStorage)
  const [ttsProvider, setTtsProvider] = useState<TTSProvider>('edge');
  const [ttsVoice, setTtsVoice] = useState('en-US-AriaNeural');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Display settings
  const [theme, setTheme] = useState<Theme>('system');
  const [defaultView, setDefaultView] = useState<'grid' | 'list'>('grid');

  // Load settings from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('reader_tts_provider') as TTSProvider;
    const savedVoice = localStorage.getItem('reader_tts_voice');
    const savedSpeed = localStorage.getItem('reader_tts_speed');
    const savedAutoPlay = localStorage.getItem('reader_auto_play');
    const savedAutoAdvance = localStorage.getItem('reader_auto_advance');
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedView = localStorage.getItem('reader_default_view') as 'grid' | 'list';

    if (savedProvider) setTtsProvider(savedProvider);
    if (savedVoice) setTtsVoice(savedVoice);
    if (savedSpeed) setTtsSpeed(parseFloat(savedSpeed));
    if (savedAutoPlay) setAutoPlay(savedAutoPlay === 'true');
    if (savedAutoAdvance !== null) setAutoAdvance(savedAutoAdvance !== 'false');
    if (savedTheme) setTheme(savedTheme);
    if (savedView) setDefaultView(savedView);
  }, []);

  // Save reading settings
  useEffect(() => {
    localStorage.setItem('reader_tts_provider', ttsProvider);
    localStorage.setItem('reader_tts_voice', ttsVoice);
    localStorage.setItem('reader_tts_speed', ttsSpeed.toString());
    localStorage.setItem('reader_auto_play', autoPlay.toString());
    localStorage.setItem('reader_auto_advance', autoAdvance.toString());
  }, [ttsProvider, ttsVoice, ttsSpeed, autoPlay, autoAdvance]);

  // Save display settings
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('reader_default_view', defaultView);

    // Apply theme
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, defaultView]);

  // Zotero functions
  const fetchZoteroStatus = async () => {
    try {
      const response = await fetch('/api/reader/zotero');
      const data = await response.json();
      setZoteroStatus(data);
    } catch (err) {
      console.error('Failed to fetch Zotero status:', err);
    } finally {
      setZoteroLoading(false);
    }
  };

  useEffect(() => {
    fetchZoteroStatus();
  }, []);

  // Handle OAuth callback URL parameters
  useEffect(() => {
    const zoteroResult = searchParams.get('zotero');
    const username = searchParams.get('username');
    const message = searchParams.get('message');

    if (zoteroResult === 'success') {
      setZoteroSuccess(`Successfully connected to Zotero${username ? ` as ${username}` : ''}!`);
      // Clear URL params without refresh
      window.history.replaceState({}, '', '/reader/settings');
      // Refresh status
      fetchZoteroStatus();
    } else if (zoteroResult === 'denied') {
      setZoteroError('Zotero authorization was denied. Please try again.');
      window.history.replaceState({}, '', '/reader/settings');
    } else if (zoteroResult === 'expired') {
      setZoteroError('OAuth session expired. Please try again.');
      window.history.replaceState({}, '', '/reader/settings');
    } else if (zoteroResult === 'error') {
      setZoteroError(`Failed to connect: ${message || 'Unknown error'}`);
      window.history.replaceState({}, '', '/reader/settings');
    }
  }, [searchParams]);

  // OAuth-based connect
  const handleZoteroOAuthConnect = async () => {
    setConnecting(true);
    setZoteroError(null);
    setZoteroSuccess(null);

    try {
      const response = await fetch('/api/reader/zotero/oauth/authorize');
      const data = await response.json();

      if (response.ok && data.authUrl) {
        // Redirect to Zotero for authorization
        window.location.href = data.authUrl;
      } else {
        setZoteroError(data.error || 'Failed to start OAuth flow');
        setConnecting(false);
      }
    } catch (err) {
      setZoteroError('Failed to connect to Zotero');
      setConnecting(false);
    }
  };

  // Manual API key connect (fallback)
  const handleZoteroApiKeyConnect = async () => {
    if (!apiKey.trim()) {
      setZoteroError('Please enter your Zotero API key');
      return;
    }

    setConnecting(true);
    setZoteroError(null);

    try {
      const response = await fetch('/api/reader/zotero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiKey('');
        setShowApiKeyInput(false);
        setZoteroSuccess('Successfully connected to Zotero!');
        await fetchZoteroStatus();
      } else {
        setZoteroError(data.error || 'Failed to connect');
      }
    } catch (err) {
      setZoteroError('Failed to connect to Zotero');
    } finally {
      setConnecting(false);
    }
  };

  const handleZoteroDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Zotero? Your synced papers will remain in your library.')) {
      return;
    }

    setZoteroLoading(true);
    try {
      await fetch('/api/reader/zotero', { method: 'DELETE' });
      await fetchZoteroStatus();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setZoteroLoading(false);
    }
  };

  const handleZoteroSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setZoteroError(null);

    try {
      const response = await fetch('/api/reader/zotero/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSyncMessage(data.message);
        await fetchZoteroStatus();
      } else {
        setZoteroError(data.error || 'Sync failed');
      }
    } catch (err) {
      setZoteroError('Failed to sync library');
    } finally {
      setSyncing(false);
    }
  };

  // Kindle functions
  const fetchKindleStatus = async () => {
    try {
      const response = await fetch('/api/reader/kindle');
      const data = await response.json();
      setKindleConnected(data.connected);
      setKindleGivenName(data.givenName || null);
    } catch {
      console.error('Failed to fetch Kindle status');
    } finally {
      setKindleLoading(false);
    }
  };

  useEffect(() => {
    fetchKindleStatus();
  }, []);

  // Handle Kindle OAuth callback params
  useEffect(() => {
    const kindleResult = searchParams.get('kindle');
    if (kindleResult === 'success') {
      setKindleSuccess('Successfully connected to Amazon!');
      setKindleConnected(true);
      window.history.replaceState({}, '', '/reader/settings');
      fetchKindleStatus();
    } else if (kindleResult === 'error') {
      setKindleError(searchParams.get('message') || 'Failed to connect');
      window.history.replaceState({}, '', '/reader/settings');
    }
  }, [searchParams]);

  // Listen for postMessage from Kindle OAuth popup
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== 'kindle-auth') return;
      if (event.data.success) {
        setKindleSuccess(`Connected${event.data.givenName ? ` as ${event.data.givenName}` : ''}!`);
        setKindleConnected(true);
        setKindleGivenName(event.data.givenName || null);
        setKindleConnecting(false);
      } else {
        setKindleError(event.data.error || 'Connection failed');
        setKindleConnecting(false);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleKindleConnect = async () => {
    setKindleConnecting(true);
    setKindleError(null);
    setKindleSuccess(null);
    try {
      const response = await fetch('/api/reader/kindle', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.signInUrl) {
        window.open(data.signInUrl, 'kindle_auth', 'width=500,height=700');
      } else {
        setKindleError(data.error || 'Failed to start connection');
        setKindleConnecting(false);
      }
    } catch {
      setKindleError('Failed to connect');
      setKindleConnecting(false);
    }
  };

  const handleKindleDisconnect = async () => {
    if (!confirm('Disconnect your Amazon account from Send to Kindle?')) return;
    setKindleLoading(true);
    try {
      await fetch('/api/reader/kindle', { method: 'DELETE' });
      setKindleConnected(false);
      setKindleGivenName(null);
      setKindleSuccess(null);
    } catch {
      console.error('Failed to disconnect Kindle');
    } finally {
      setKindleLoading(false);
    }
  };

  const handleProviderChange = (provider: TTSProvider) => {
    setTtsProvider(provider);
    // Reset voice when switching providers
    const defaultVoice = provider === 'gemini' ? 'Charon' : 'en-US-AriaNeural';
    setTtsVoice(defaultVoice);
  };

  const currentVoices = ttsProvider === 'gemini' ? GEMINI_VOICES : EDGE_VOICES;
  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/reader/library"
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure Echo Reader</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab Navigation - Mobile friendly horizontal scroll */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
              {/* Zotero Section */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={18} />
                    Zotero Library
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Sync your Zotero library to import papers automatically
                  </p>
                </div>

                <div className="p-4">
                  {zoteroLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : zoteroStatus?.connected ? (
                    <div className="space-y-4">
                      {/* Connected status */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Connected as <strong className="text-gray-900 dark:text-white">{zoteroStatus.username}</strong>
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-2xl font-bold text-purple-600">{zoteroStatus.itemCount}</p>
                          <p className="text-xs text-gray-500">Papers synced</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {zoteroStatus.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {zoteroStatus.lastSync
                              ? `Last: ${new Date(zoteroStatus.lastSync).toLocaleDateString()}`
                              : 'Never synced'}
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      {(syncMessage || zoteroSuccess) && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <Check size={16} />
                          {syncMessage || zoteroSuccess}
                        </div>
                      )}
                      {zoteroError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                          <AlertCircle size={16} />
                          {zoteroError}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleZoteroSync}
                          disabled={syncing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                          {syncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <button
                          onClick={handleZoteroDisconnect}
                          className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Disconnect Zotero"
                        >
                          <Unlink size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Success message */}
                      {zoteroSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <Check size={16} />
                          {zoteroSuccess}
                        </div>
                      )}

                      {/* Error message */}
                      {zoteroError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                          <AlertCircle size={16} />
                          {zoteroError}
                        </div>
                      )}

                      {showApiKeyInput ? (
                        /* Manual API Key Input (fallback) */
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Zotero API Key
                            </label>
                            <input
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="Enter your API key"
                              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleZoteroApiKeyConnect}
                              disabled={connecting}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                              {connecting ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                              {connecting ? 'Connecting...' : 'Connect with API Key'}
                            </button>
                            <button
                              onClick={() => {
                                setShowApiKeyInput(false);
                                setApiKey('');
                                setZoteroError(null);
                              }}
                              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>

                          <a
                            href="https://www.zotero.org/settings/keys/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                          >
                            Get your API key from Zotero
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      ) : (
                        /* OAuth Login (primary method) */
                        <div className="space-y-3">
                          <button
                            onClick={handleZoteroOAuthConnect}
                            disabled={connecting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#CC2936] text-white rounded-lg hover:bg-[#AA222C] transition-colors disabled:opacity-50"
                          >
                            {connecting ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <BookOpen size={18} />
                            )}
                            {connecting ? 'Redirecting to Zotero...' : 'Sign in with Zotero'}
                          </button>

                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                            <span>or</span>
                            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                          </div>

                          <button
                            onClick={() => setShowApiKeyInput(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Key size={16} />
                            Connect with API Key
                          </button>

                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Signing in with Zotero is the recommended method. API key is available as a fallback.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Kindle Section */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={18} />
                    Send to Kindle
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Send papers directly to your Kindle devices
                  </p>
                </div>

                <div className="p-4">
                  {kindleLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : kindleConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Connected{kindleGivenName ? <> as <strong className="text-gray-900 dark:text-white">{kindleGivenName}</strong></> : ''}
                        </span>
                      </div>

                      {kindleSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <Check size={16} />
                          {kindleSuccess}
                        </div>
                      )}

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        You can send papers to your Kindle from the paper reading page using the &quot;Send to Kindle&quot; button in the sidebar.
                      </p>

                      <button
                        onClick={handleKindleDisconnect}
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Unlink size={16} />
                        Disconnect Amazon
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {kindleSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <Check size={16} />
                          {kindleSuccess}
                        </div>
                      )}

                      {kindleError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                          <AlertCircle size={16} />
                          {kindleError}
                        </div>
                      )}

                      <button
                        onClick={handleKindleConnect}
                        disabled={kindleConnecting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF9900] text-black font-medium rounded-lg hover:bg-[#E88B00] transition-colors disabled:opacity-50"
                      >
                        {kindleConnecting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <BookOpen size={18} />
                        )}
                        {kindleConnecting ? 'Opening sign-in...' : 'Sign in with Amazon'}
                      </button>

                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Sign in with your Amazon account to send papers to your Kindle. Your credentials are encrypted.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Future integrations placeholder */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">More Integrations Coming Soon</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mendeley, EndNote, and Google Scholar integrations are planned for future updates.
                </p>
              </div>
            </div>
          )}

          {/* Reading Tab */}
          {activeTab === 'reading' && (
            <div className="space-y-6">
              {/* TTS Engine */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles size={18} />
                  Text-to-Speech Engine
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleProviderChange('edge')}
                    className={`px-4 py-4 rounded-xl text-left transition-all border-2 ${
                      ttsProvider === 'edge'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={20} className={ttsProvider === 'edge' ? 'text-purple-500' : 'text-gray-400'} />
                      <span className={`font-medium ${ttsProvider === 'edge' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        Edge TTS
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Free, fast, and reliable. Great for everyday use.
                    </p>
                  </button>

                  <button
                    onClick={() => handleProviderChange('gemini')}
                    className={`px-4 py-4 rounded-xl text-left transition-all border-2 ${
                      ttsProvider === 'gemini'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={20} className={ttsProvider === 'gemini' ? 'text-purple-500' : 'text-gray-400'} />
                      <span className={`font-medium ${ttsProvider === 'gemini' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        Gemini 2.5
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                        Premium
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Natural, expressive voices with superior quality.
                    </p>
                  </button>
                </div>
              </div>

              {/* Voice Selection */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mic size={18} />
                  Voice
                  {ttsProvider === 'gemini' && <span className="text-xs text-purple-500">(Gemini)</span>}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentVoices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setTtsVoice(voice.id)}
                      className={`px-3 py-3 rounded-lg text-left transition-colors ${
                        ttsVoice === voice.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className={`text-xs ${ttsVoice === voice.id ? 'text-purple-200' : 'text-gray-500'}`}>
                        {voice.style}
                        {'gender' in voice && ` · ${voice.gender}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Speed */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Gauge size={18} />
                  Playback Speed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setTtsSpeed(speed)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        ttsSpeed === speed
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-play Options */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Playback Behavior</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Auto-play next section</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Automatically continue to the next section</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Auto-play on load</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start playing when opening a paper</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Theme */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette size={18} />
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Sun size={24} className={theme === 'light' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Light
                    </span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Moon size={24} className={theme === 'dark' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Dark
                    </span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Monitor size={24} className={theme === 'system' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${theme === 'system' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      System
                    </span>
                  </button>
                </div>
              </div>

              {/* Default View */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Default Library View</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDefaultView('grid')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      defaultView === 'grid'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Grid size={20} className={defaultView === 'grid' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className={`font-medium ${defaultView === 'grid' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Grid
                    </span>
                  </button>
                  <button
                    onClick={() => setDefaultView('list')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      defaultView === 'list'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <List size={20} className={defaultView === 'list' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className={`font-medium ${defaultView === 'list' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      List
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User size={18} />
                  Account Information
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Account management features coming soon. You&apos;ll be able to view your usage, manage your subscription, and export your data.
                </p>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Play/Pause</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Space</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Previous section</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">←</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Next section</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">→</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Seek back 15s</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Shift + ←</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Seek forward 15s</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Shift + →</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Voice Agent</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Alt + V</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
