'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';

/**
 * Kindle OAuth Callback Page
 *
 * Amazon redirects here after the user signs in. This page:
 * 1. Extracts the authorization code from the URL
 * 2. Sends it to our API to complete the connection
 * 3. Notifies the parent window via postMessage
 * 4. Auto-closes the popup
 */

type CallbackState = 'processing' | 'success' | 'error';

function KindleCallbackContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>('processing');
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('openid.oa2.authorization_code');

    if (!code) {
      setState('error');
      setError('No authorization code found. Amazon may have denied the request.');
      // Notify parent of failure
      window.opener?.postMessage({ type: 'kindle-auth', success: false, error: 'No authorization code' }, '*');
      return;
    }

    // Exchange the code for credentials
    async function exchangeCode() {
      try {
        const res = await fetch('/api/reader/kindle/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to connect');
        }

        setName(data.givenName || null);
        setState('success');

        // Notify parent window
        window.opener?.postMessage({
          type: 'kindle-auth',
          success: true,
          givenName: data.givenName,
          deviceName: data.deviceName,
        }, '*');

        // Auto-close after a short delay so the user sees the success state
        setTimeout(() => {
          window.close();
        }, 1500);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Connection failed';
        setState('error');
        setError(msg);

        // Notify parent of failure
        window.opener?.postMessage({ type: 'kindle-auth', success: false, error: msg }, '*');
      }
    }

    exchangeCode();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        {state === 'processing' && (
          <div className="space-y-4">
            <Loader2 size={48} className="mx-auto animate-spin text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Connecting to Amazon...
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Setting up your Kindle connection. This will only take a moment.
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check size={32} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Connected!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {name ? `Welcome, ${name}!` : 'Your Kindle is now connected.'}
              {' '}This window will close automatically.
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Connection Failed
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
            <button
              onClick={() => window.close()}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KindleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <KindleCallbackContent />
    </Suspense>
  );
}
