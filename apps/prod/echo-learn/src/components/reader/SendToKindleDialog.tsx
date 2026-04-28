'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  X,
  Loader2,
  BookOpen,
  Smartphone,
  Tablet,
  Check,
  AlertCircle,
  Send,
  Unlink,
} from 'lucide-react';

interface SendToKindleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
  paperTitle: string;
}

interface KindleDevice {
  serialNumber: string;
  name: string;
  capabilities: Record<string, boolean>;
}

interface KindleStatus {
  connected: boolean;
  deviceName?: string;
  givenName?: string;
}

type DialogState = 'loading' | 'not_connected' | 'connecting' | 'devices' | 'sending' | 'success' | 'error';

export default function SendToKindleDialog({ isOpen, onClose, paperId, paperTitle }: SendToKindleDialogProps) {
  const [state, setState] = useState<DialogState>('loading');
  const [status, setStatus] = useState<KindleStatus | null>(null);
  const [devices, setDevices] = useState<KindleDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check connection status on open
  useEffect(() => {
    if (!isOpen) return;
    checkStatus();
  }, [isOpen]);

  const checkStatus = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const res = await fetch('/api/reader/kindle');
      const data = await res.json();
      setStatus(data);

      if (data.connected) {
        // Auto-fetch devices
        await fetchDevices();
      } else {
        setState('not_connected');
      }
    } catch {
      setState('error');
      setError('Failed to check Kindle connection');
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch('/api/reader/kindle/devices');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch devices');
      }

      setDevices(data.devices || []);
      setState('devices');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    }
  }, []);

  // Listen for postMessage from the callback popup
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== 'kindle-auth') return;

      if (event.data.success) {
        setStatus({ connected: true, givenName: event.data.givenName, deviceName: event.data.deviceName });
        fetchDevices();
      } else {
        setState('error');
        setError(event.data.error || 'Connection failed');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchDevices]);

  const startOAuth = useCallback(async () => {
    setState('connecting');
    setError(null);
    try {
      const res = await fetch('/api/reader/kindle', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start auth');
      }

      // Open Amazon sign-in in a popup — it will redirect back to
      // /reader/kindle-callback which auto-exchanges the code and
      // notifies us via postMessage
      window.open(data.signInUrl, 'kindle_auth', 'width=500,height=700');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to start Kindle auth');
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    if (!confirm('Disconnect your Amazon account from Send to Kindle?')) return;
    setState('loading');
    try {
      await fetch('/api/reader/kindle', { method: 'DELETE' });
      setStatus(null);
      setDevices([]);
      setSelectedDevices(new Set());
      setState('not_connected');
    } catch {
      setError('Failed to disconnect');
    }
  }, []);

  const toggleDevice = useCallback((serial: string) => {
    setSelectedDevices((prev) => {
      const next = new Set(prev);
      if (next.has(serial)) {
        next.delete(serial);
      } else {
        next.add(serial);
      }
      return next;
    });
  }, []);

  const handleSend = useCallback(async () => {
    if (selectedDevices.size === 0) {
      setError('Please select at least one device');
      return;
    }

    setState('sending');
    setError(null);
    try {
      const res = await fetch('/api/reader/kindle/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          deviceSerialNumbers: Array.from(selectedDevices),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      setSuccessMessage(data.message);
      setState('success');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to send to Kindle');
    }
  }, [paperId, selectedDevices]);

  const handleClose = useCallback(() => {
    if (state === 'sending') return;
    setState('loading');
    setError(null);
    setSuccessMessage(null);
    onClose();
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <BookOpen size={18} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send to Kindle</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={state === 'sending' || state === 'connecting'}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading */}
          {state === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-purple-500" />
            </div>
          )}

          {/* Not Connected */}
          {state === 'not_connected' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <BookOpen size={32} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect your Amazon account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Sign in with Amazon to send papers directly to your Kindle devices.
                </p>
              </div>
              <button
                onClick={startOAuth}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF9900] text-black font-medium rounded-lg hover:bg-[#E88B00] transition-colors"
              >
                <BookOpen size={18} />
                Sign in with Amazon
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Uses Amazon&apos;s Send-to-Kindle service. Your credentials are encrypted.
              </p>
            </div>
          )}

          {/* Connecting / Loading */}
          {state === 'connecting' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 size={32} className="animate-spin text-orange-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Connecting to Amazon...</p>
            </div>
          )}

          {/* Device Selection */}
          {state === 'devices' && (
            <div className="space-y-4">
              {/* Connected user info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Connected{status?.givenName ? ` as ${status.givenName}` : ''}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  title="Disconnect"
                >
                  <Unlink size={12} />
                  Disconnect
                </button>
              </div>

              {/* Paper being sent */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Sending</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{paperTitle}</p>
              </div>

              {/* Device list */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select device{devices.length > 1 ? 's' : ''}
                </p>
                {devices.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    No Kindle devices found on your account.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {devices.map((device) => (
                      <button
                        key={device.serialNumber}
                        onClick={() => toggleDevice(device.serialNumber)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          selectedDevices.has(device.serialNumber)
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedDevices.has(device.serialNumber)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        }`}>
                          {device.name.toLowerCase().includes('phone') || device.name.toLowerCase().includes('app') ? (
                            <Smartphone size={16} />
                          ) : (
                            <Tablet size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            selectedDevices.has(device.serialNumber)
                              ? 'text-orange-700 dark:text-orange-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {device.name}
                          </p>
                        </div>
                        {selectedDevices.has(device.serialNumber) && (
                          <Check size={16} className="text-orange-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={selectedDevices.size === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                Send to {selectedDevices.size > 0 ? `${selectedDevices.size} device${selectedDevices.size > 1 ? 's' : ''}` : 'Kindle'}
              </button>
            </div>
          )}

          {/* Sending */}
          {state === 'sending' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 size={32} className="animate-spin text-orange-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Generating EPUB & sending...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This may take a moment</p>
            </div>
          )}

          {/* Success */}
          {state === 'success' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check size={32} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sent!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {successMessage || 'Paper sent to your Kindle. It should appear shortly.'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Error (standalone) */}
          {state === 'error' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Something went wrong</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
              <button
                onClick={checkStatus}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
