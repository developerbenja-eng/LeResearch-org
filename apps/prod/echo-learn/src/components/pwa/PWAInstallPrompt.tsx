'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Download, X } from 'lucide-react';
import { BRAND } from '@/lib/brand/constants';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type AppType = 'tales' | 'learn' | 'home';

const APP_BRANDING: Record<AppType, {
  name: string;
  tagline: string;
  gradient: string;
  buttonColor: string;
}> = {
  tales: {
    name: BRAND.hubs.tales.name,
    tagline: 'Install for quick access to stories and creative tools!',
    gradient: 'from-purple-600 to-pink-600',
    buttonColor: 'text-purple-600',
  },
  learn: {
    name: BRAND.hubs.learn.name,
    tagline: 'Install for quick access to learning tools!',
    gradient: 'from-blue-600 to-indigo-600',
    buttonColor: 'text-blue-600',
  },
  home: {
    name: BRAND.name,
    tagline: 'Install for quick access to all Echo features!',
    gradient: 'from-purple-600 to-pink-600',
    buttonColor: 'text-purple-600',
  },
};

function getAppFromPath(pathname: string): AppType {
  if (pathname.startsWith('/tales') || pathname.startsWith('/play') ||
      pathname.startsWith('/music') || pathname.startsWith('/characters') ||
      pathname.startsWith('/community')) {
    return 'tales';
  }
  if (pathname.startsWith('/learn') || pathname.startsWith('/lingua') ||
      pathname.startsWith('/reader') || pathname.startsWith('/sophia') ||
      pathname.startsWith('/research')) {
    return 'learn';
  }
  return 'home';
}

export function PWAInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const app = getAppFromPath(pathname);
  const branding = APP_BRANDING[app];
  const dismissKey = `pwa-install-dismissed-${app}`;

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        const dismissed = localStorage.getItem(dismissKey);
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully!');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissKey]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the install prompt`);

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(dismissKey, Date.now().toString());

    // Show again in 7 days
    setTimeout(() => {
      localStorage.removeItem(dismissKey);
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative bg-[#1a1035]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Subtle gradient accent along top */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${branding.gradient} opacity-50`} />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-white/40" />
        </button>

        <div className="p-4 pr-10">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${branding.gradient} rounded-xl flex items-center justify-center flex-shrink-0 opacity-80`}>
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-0.5">Install {branding.name}</h3>
              <p className="text-white/40 text-xs mb-3 leading-relaxed">
                {branding.tagline}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  variant="secondary"
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-white/90 text-xs px-3 py-1.5 h-auto"
                >
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white/40 hover:text-white/60 hover:bg-white/5 text-xs px-3 py-1.5 h-auto"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
