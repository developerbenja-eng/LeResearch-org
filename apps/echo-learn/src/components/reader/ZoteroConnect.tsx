'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen,
  Link2,
  Unlink,
  RefreshCw,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  XCircle,
  Pause,
} from 'lucide-react';

interface SyncProgress {
  jobId: string;
  status: 'pending' | 'fetching' | 'processing' | 'completed' | 'failed' | 'cancelled';
  phase: string;
  progress: {
    total: number;
    processed: number;
    failed: number;
    skipped: number;
    percentage: number;
  };
  currentItem: string | null;
  lastError: string | null;
  startedAt: string | null;
  isComplete: boolean;
}

interface LibraryStats {
  totalZoteroItems: number;
  linkedToEcho: number;
  importedToEcho: number;
  zoteroOnly: number;
  echoOnly: number;
  collections: number;
}

interface ZoteroStatus {
  connected: boolean;
  username?: string;
  lastSync?: string;
  status: string;
  itemCount: number;
  syncJob?: SyncProgress | null;
  libraryStats?: LibraryStats;
}

export default function ZoteroConnect() {
  const [status, setStatus] = useState<ZoteroStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Polling ref for sync progress
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  // Check if currently syncing
  const isSyncing = status?.syncJob &&
    ['pending', 'fetching', 'processing'].includes(status.syncJob.status);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/reader/zotero');
      const data = await response.json();
      setStatus(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch Zotero status:', err);
      return null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus().finally(() => setLoading(false));
  }, [fetchStatus]);

  // Poll for sync progress when syncing
  useEffect(() => {
    if (isSyncing && !pollIntervalRef.current) {
      // Start polling
      pollIntervalRef.current = setInterval(async () => {
        const newStatus = await fetchStatus();

        // If sync is still in progress, continue processing
        if (newStatus?.syncJob &&
            ['pending', 'fetching', 'processing'].includes(newStatus.syncJob.status) &&
            !isSyncingRef.current) {
          isSyncingRef.current = true;
          await continueSync();
          isSyncingRef.current = false;
        }

        // Stop polling when complete
        if (!newStatus?.syncJob ||
            ['completed', 'failed', 'cancelled'].includes(newStatus.syncJob.status)) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isSyncing, fetchStatus]);

  // Continue sync (process next chunk)
  const continueSync = async () => {
    try {
      const response = await fetch('/api/reader/zotero/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto' }),
      });

      const data = await response.json();

      if (data.isComplete) {
        setSyncMessage(`Sync complete! Processed ${data.job?.progress?.processed || 0} papers.`);
        await fetchStatus();
      }
    } catch (err) {
      console.error('Sync chunk failed:', err);
    }
  };

  // Start sync - uses metadata sync for fast incremental update
  const handleSync = async () => {
    setError(null);
    setSyncMessage('Syncing...');
    isSyncingRef.current = true;

    try {
      const response = await fetch('/api/reader/zotero/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'metadata' }),
      });

      const data = await response.json();

      if (response.ok) {
        const stats = data.stats;
        if (stats.totalItems > 0) {
          setSyncMessage(
            `Synced ${stats.totalItems} items` +
            (stats.linkedToExisting > 0 ? ` (${stats.linkedToExisting} linked)` : '')
          );
        } else {
          setSyncMessage('Library is up to date');
        }
        await fetchStatus();
      } else {
        setError(data.error || 'Sync failed');
        setSyncMessage(null);
      }
    } catch (err) {
      setError('Failed to sync');
      setSyncMessage(null);
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Cancel sync
  const handleCancelSync = async () => {
    try {
      await fetch('/api/reader/zotero/sync', { method: 'DELETE' });
      await fetchStatus();
      setSyncMessage('Sync cancelled');
    } catch (err) {
      console.error('Failed to cancel sync:', err);
    }
  };

  // Connect
  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Zotero API key');
      return;
    }

    setConnecting(true);
    setError(null);

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
        await fetchStatus();

        // Show sync stats from immediate sync
        if (data.syncStats) {
          const stats = data.syncStats;
          setSyncMessage(
            `Connected! Synced ${stats.totalItems} items from Zotero` +
            (stats.linkedToExisting > 0 ? ` (${stats.linkedToExisting} linked to existing papers)` : '')
          );
        } else if (data.message) {
          setSyncMessage(data.message);
        }
      } else {
        setError(data.error || 'Failed to connect');
      }
    } catch (err) {
      setError('Failed to connect to Zotero');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Zotero? Your synced papers will remain in your library.')) {
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/reader/zotero', { method: 'DELETE' });
      await fetchStatus();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen size={18} />
          Zotero Library
        </h3>
      </div>

      <div className="p-4">
        {status?.connected ? (
          <div className="space-y-4">
            {/* Connected status */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Connected as <strong className="text-gray-900 dark:text-white">{status.username}</strong>
              </span>
            </div>

            {/* Library Stats */}
            {status.libraryStats ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-red-600">{status.libraryStats.totalZoteroItems}</p>
                  <p className="text-xs text-gray-500">In Zotero</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-purple-600">{status.libraryStats.linkedToEcho + status.libraryStats.importedToEcho}</p>
                  <p className="text-xs text-gray-500">In Echo</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-blue-600">{status.libraryStats.linkedToEcho}</p>
                  <p className="text-xs text-gray-500">Linked</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-2xl font-bold text-purple-600">{status.itemCount}</p>
                  <p className="text-xs text-gray-500">Papers synced</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {isSyncing ? 'Syncing' : status.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {status.lastSync
                      ? `Last: ${new Date(status.lastSync).toLocaleDateString()}`
                      : 'Never synced'}
                  </p>
                </div>
              </div>
            )}

            {/* Last sync info */}
            <div className="text-xs text-gray-500 text-center">
              {status.lastSync
                ? `Last synced: ${new Date(status.lastSync).toLocaleString()}`
                : 'Never synced'}
            </div>

            {/* Sync Progress */}
            {isSyncing && status.syncJob && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700 dark:text-purple-300 font-medium">
                    {status.syncJob.phase === 'fetching_items' && 'Fetching from Zotero...'}
                    {status.syncJob.phase === 'fetching_collections' && 'Fetching collections...'}
                    {status.syncJob.phase === 'processing_items' && 'Processing papers...'}
                    {status.syncJob.phase === 'idle' && 'Preparing...'}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {status.syncJob.progress.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${status.syncJob.progress.percentage}%` }}
                  />
                </div>

                {/* Current item */}
                {status.syncJob.currentItem && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 truncate">
                    {status.syncJob.currentItem}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{status.syncJob.progress.processed} processed</span>
                  {status.syncJob.progress.failed > 0 && (
                    <span className="text-red-500">{status.syncJob.progress.failed} failed</span>
                  )}
                  <span>{status.syncJob.progress.total - status.syncJob.progress.processed - status.syncJob.progress.failed - status.syncJob.progress.skipped} remaining</span>
                </div>
              </div>
            )}

            {/* Sync message */}
            {syncMessage && !isSyncing && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <Check size={16} />
                {syncMessage}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Last sync error */}
            {status.syncJob?.status === 'failed' && status.syncJob.lastError && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <XCircle size={16} />
                Last sync failed: {status.syncJob.lastError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {isSyncing ? (
                <button
                  onClick={handleCancelSync}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Pause size={16} />
                  Cancel Sync
                </button>
              ) : (
                <button
                  onClick={handleSync}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  Sync Now
                </button>
              )}
              <button
                onClick={handleDisconnect}
                disabled={!!isSyncing}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                title="Disconnect Zotero"
              >
                <Unlink size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your Zotero library to import papers and keep them in sync.
            </p>

            {showApiKeyInput ? (
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {connecting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Link2 size={16} />
                    )}
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                  <button
                    onClick={() => {
                      setShowApiKeyInput(false);
                      setApiKey('');
                      setError(null);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Link2 size={16} />
                Connect Zotero
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
