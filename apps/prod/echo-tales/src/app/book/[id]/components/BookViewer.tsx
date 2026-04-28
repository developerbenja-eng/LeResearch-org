'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { jsPDF as JsPDFType } from 'jspdf';
import { BookWithPages } from '@/types';
import { formatTime } from '@/lib/utils/time';

// ============================================
// TYPES & INTERFACES
// ============================================

interface BookViewerProps {
  book: BookWithPages;
}

type ViewMode = 'read' | 'autoplay';
type FontSize = 'small' | 'medium' | 'large';

interface ReaderSettings {
  fontSize: FontSize;
  autoRead: boolean;
  pageWidth: number;
  pageHeight: number;
  animationSpeed: number;
  showShadow: boolean;
  shadowOpacity: number;
}

interface QualityCheckResult {
  overallQuality: 'excellent' | 'good' | 'needs_work' | 'poor';
  summary: string;
  pagesToRegenerate: Array<{
    pageNumber: number;
    issues: string[];
  }>;
  coverIssues?: {
    hasProblems: boolean;
    issues: string[];
  };
}

interface VideoGenerationStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number;
  videoUrl?: string;
  error?: string;
}

// ============================================
// SETTINGS STORAGE
// ============================================

const SETTINGS_KEY = 'echocraft-reader-settings';

const defaultSettings: ReaderSettings = {
  fontSize: 'medium',
  autoRead: false,
  pageWidth: 600,
  pageHeight: 800,
  animationSpeed: 500,
  showShadow: true,
  shadowOpacity: 0.5,
};

function loadSettings(): ReaderSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore errors
  }
  return defaultSettings;
}

function saveSettings(settings: ReaderSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore errors
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function BookViewer({ book }: BookViewerProps) {
  // Core state
  const [currentPage, setCurrentPage] = useState(0);
  const [mode, setMode] = useState<ViewMode>('read');
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityCheck, setShowQualityCheck] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoReadEnabled, setAutoReadEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play state
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const autoPlayActiveRef = useRef(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const [autoPlayCurrentTime, setAutoPlayCurrentTime] = useState(0);
  const [autoPlayTotalDuration, setAutoPlayTotalDuration] = useState(0);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pageAudioRef = useRef<HTMLAudioElement | null>(null);

  // Quality check state
  const [qualityCheckLoading, setQualityCheckLoading] = useState(false);
  const [qualityCheckResult, setQualityCheckResult] = useState<QualityCheckResult | null>(null);

  // Video generation state
  const [videoGenStatus, setVideoGenStatus] = useState<VideoGenerationStatus | null>(null);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // PDF export state
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  const pages = book.pages;
  const totalPages = pages.length;

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setAutoReadEnabled(loaded.autoRead);

    // Calculate total duration for auto-play
    const totalDuration = pages.reduce((acc, page) => {
      return acc + (page.audio_duration || 4);
    }, 0);
    setAutoPlayTotalDuration(totalDuration);
  }, [pages]);

  // ============================================
  // NAVIGATION
  // ============================================

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        setCurrentPage(pageIndex);
        stopAudio();

        // Auto-read if enabled (in read mode)
        if (autoReadEnabled && mode === 'read') {
          setTimeout(() => playPageAudio(pageIndex), 300);
        }
      }
    },
    [totalPages, autoReadEnabled, mode]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if settings modal is open
      if (showSettings || showQualityCheck) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (mode === 'read') nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (mode === 'read') prevPage();
      } else if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (showQualityCheck) setShowQualityCheck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, showSettings, showQualityCheck, mode]);

  // Touch swipe navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mode !== 'read') return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = Math.abs(startY - endY);

      if (Math.abs(diffX) > 50 && diffY < 100) {
        if (diffX > 0) nextPage();
        else prevPage();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextPage, prevPage, mode]);

  // ============================================
  // AUDIO FUNCTIONS
  // ============================================

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const playPageAudio = useCallback(async (pageIndex?: number) => {
    const idx = pageIndex ?? currentPage;
    const page = pages[idx];

    if (!page.audio_url) {
      // Fallback to speech synthesis
      if ('speechSynthesis' in window && page.text) {
        const utterance = new SpeechSynthesisUtterance(page.text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onend = () => {
          setIsPlaying(false);
          // Auto-advance if auto-read is enabled
          if (autoReadEnabled && idx < totalPages - 1) {
            setTimeout(() => goToPage(idx + 1), 500);
          }
        };
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
      return;
    }

    try {
      stopAudio();

      const audio = new Audio(page.audio_url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        // Auto-advance if auto-read is enabled
        if (autoReadEnabled && idx < totalPages - 1) {
          setTimeout(() => goToPage(idx + 1), 500);
        }
      };

      audio.onerror = () => {
        setIsPlaying(false);
        // Fallback to speech synthesis
        if ('speechSynthesis' in window && page.text) {
          const utterance = new SpeechSynthesisUtterance(page.text);
          utterance.rate = 0.9;
          utterance.onend = () => setIsPlaying(false);
          speechSynthesis.speak(utterance);
        }
      };

      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [currentPage, pages, totalPages, autoReadEnabled, goToPage, stopAudio]);

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playPageAudio();
    }
  }, [isPlaying, stopAudio, playPageAudio]);

  // ============================================
  // AUTO-PLAY MODE
  // ============================================

  const playTransitionSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // Ignore errors
    }
  }, []);

  const stopAutoPlay = useCallback(() => {
    setAutoPlayActive(false);
    autoPlayActiveRef.current = false;
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    if (pageAudioRef.current) {
      pageAudioRef.current.pause();
      pageAudioRef.current = null;
    }
    stopAudio();
  }, [stopAudio]);

  const playAutoPlayPage = useCallback((pageIndex: number) => {
    if (pageIndex >= totalPages) {
      // Loop back to start
      setCurrentPage(0);
      setAutoPlayCurrentTime(0);
      playAutoPlayPage(0);
      return;
    }

    setCurrentPage(pageIndex);
    const page = pages[pageIndex];
    const duration = page.audio_duration || 4;

    // Play page audio if available
    if (page.audio_url) {
      if (pageAudioRef.current) {
        pageAudioRef.current.pause();
      }

      const audio = new Audio(page.audio_url);
      pageAudioRef.current = audio;

      audio.onended = () => {
        playTransitionSound();
        setTimeout(() => {
          if (autoPlayActiveRef.current) {
            playAutoPlayPage(pageIndex + 1);
          }
        }, 400);
      };

      audio.onerror = () => {
        // Skip to next page after default duration
        setTimeout(() => {
          playTransitionSound();
          setTimeout(() => {
            if (autoPlayActiveRef.current) {
              playAutoPlayPage(pageIndex + 1);
            }
          }, 400);
        }, duration * 1000);
      };

      audio.play().catch(() => {
        // Fallback timing
        setTimeout(() => {
          playTransitionSound();
          setTimeout(() => {
            if (autoPlayActiveRef.current) {
              playAutoPlayPage(pageIndex + 1);
            }
          }, 400);
        }, duration * 1000);
      });
    } else {
      // No audio - use default duration
      setTimeout(() => {
        playTransitionSound();
        setTimeout(() => {
          if (autoPlayActiveRef.current) {
            playAutoPlayPage(pageIndex + 1);
          }
        }, 400);
      }, duration * 1000);
    }
  }, [pages, totalPages, playTransitionSound]);

  const startAutoPlay = useCallback(() => {
    setAutoPlayActive(true);
    autoPlayActiveRef.current = true;
    playAutoPlayPage(currentPage);

    // Update time display
    autoPlayIntervalRef.current = setInterval(() => {
      setAutoPlayCurrentTime(prev => {
        const newTime = prev + 0.1;
        setAutoPlayProgress((newTime / autoPlayTotalDuration) * 100);
        return newTime;
      });
    }, 100);
  }, [currentPage, autoPlayTotalDuration, playAutoPlayPage]);

  const toggleAutoPlay = useCallback(() => {
    if (autoPlayActive) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [autoPlayActive, stopAutoPlay, startAutoPlay]);

  // Switch mode
  const switchMode = useCallback((newMode: ViewMode) => {
    if (mode === newMode) return;

    stopAudio();
    stopAutoPlay();
    setMode(newMode);

    if (newMode === 'autoplay') {
      // Auto-start playback
      setTimeout(() => startAutoPlay(), 500);
    }
  }, [mode, stopAudio, stopAutoPlay, startAutoPlay]);

  // ============================================
  // SETTINGS FUNCTIONS
  // ============================================

  const updateSettings = useCallback((newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const toggleAutoRead = useCallback(() => {
    const newValue = !autoReadEnabled;
    setAutoReadEnabled(newValue);
    updateSettings({ autoRead: newValue });

    if (!newValue) {
      stopAudio();
    }
  }, [autoReadEnabled, updateSettings, stopAudio]);

  // ============================================
  // QUALITY CHECK
  // ============================================

  const runQualityCheck = useCallback(async (autoFix = false) => {
    setQualityCheckLoading(true);
    setQualityCheckResult(null);

    try {
      const response = await fetch('/api/books/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookId: book.id,
          autoRegenerate: autoFix,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Quality check failed');
      }

      setQualityCheckResult(result.qualityCheck?.qualityReport || null);
    } catch (error) {
      console.error('Quality check error:', error);
      setQualityCheckResult({
        overallQuality: 'poor',
        summary: error instanceof Error ? error.message : 'Failed to run quality check',
        pagesToRegenerate: [],
      });
    } finally {
      setQualityCheckLoading(false);
    }
  }, [book.id]);

  // ============================================
  // VIDEO GENERATION
  // ============================================

  const generateVideo = useCallback(async () => {
    setVideoGenerating(true);
    setVideoGenStatus(null);

    try {
      const response = await fetch('/api/books/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookId: book.id,
          options: {
            resolution: '1080p',
            transitionStyle: 'fade',
            includeAudio: true,
            includeNarration: true,
            backgroundMusic: 'gentle',
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to start video generation');
      }

      setVideoGenStatus({
        jobId: result.data.jobId,
        status: result.data.status,
        progress: result.data.progress || 0,
      });

      // Start polling for status
      pollVideoStatus(result.data.jobId);
    } catch (error) {
      console.error('Video generation error:', error);
      setVideoGenStatus({
        jobId: '',
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Failed to generate video',
      });
    } finally {
      setVideoGenerating(false);
    }
  }, [book.id]);

  const pollVideoStatus = useCallback(async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/books/generate-video?jobId=${jobId}`, {
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success && result.data) {
          setVideoGenStatus({
            jobId: result.data.jobId,
            status: result.data.status,
            progress: result.data.progress || 0,
            videoUrl: result.data.videoUrl,
            error: result.data.error,
          });

          // Continue polling if still processing
          if (result.data.status === 'queued' || result.data.status === 'processing') {
            setTimeout(checkStatus, 3000);
          }
        }
      } catch (error) {
        console.error('Error polling video status:', error);
      }
    };

    checkStatus();
  }, []);

  const cancelVideoGeneration = useCallback(async () => {
    if (!videoGenStatus?.jobId) return;

    try {
      await fetch(`/api/books/generate-video?jobId=${videoGenStatus.jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      setVideoGenStatus(null);
    } catch (error) {
      console.error('Error cancelling video generation:', error);
    }
  }, [videoGenStatus]);

  // Check for existing video on mount
  useEffect(() => {
    if (book.premium_video_urls) {
      try {
        const urls = JSON.parse(book.premium_video_urls);
        setVideoGenStatus({
          jobId: '',
          status: 'complete',
          progress: 100,
          videoUrl: urls[0] || book.premium_video_urls,
        });
      } catch {
        setVideoGenStatus({
          jobId: '',
          status: 'complete',
          progress: 100,
          videoUrl: book.premium_video_urls,
        });
      }
    }
  }, [book.premium_video_urls]);

  // ============================================
  // PDF EXPORT
  // ============================================

  const exportToPdf = useCallback(async () => {
    if (pdfExporting) return;
    setPdfExporting(true);
    setPdfProgress('Preparing PDF...');

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Helper: load image as data URL
      const loadImageAsDataUrl = async (url: string): Promise<string | null> => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      };

      // Cover page
      setPdfProgress('Generating cover...');
      const coverPage = pages.find(p => p.page_number === 0) || pages[0];

      // Title
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(book.title, contentWidth);
      pdf.text(titleLines, pageWidth / 2, 40, { align: 'center' });

      // Cover image
      const coverImgUrl = book.cover_image_url || coverPage?.image_url;
      if (coverImgUrl) {
        const imgData = await loadImageAsDataUrl(coverImgUrl);
        if (imgData) {
          const imgWidth = contentWidth * 0.8;
          const imgHeight = imgWidth * 0.75;
          const imgX = (pageWidth - imgWidth) / 2;
          pdf.addImage(imgData, 'JPEG', imgX, 70, imgWidth, imgHeight);
        }
      }

      // Subtitle/description
      if (book.description) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const descLines = pdf.splitTextToSize(book.description, contentWidth * 0.7);
        pdf.text(descLines, pageWidth / 2, 220, { align: 'center' });
      }

      // Footer
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Created with Echo Tales', pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.setTextColor(0, 0, 0);

      // Story pages
      const storyPages = pages.filter(p => p.page_number > 0).sort((a, b) => a.page_number - b.page_number);

      for (let i = 0; i < storyPages.length; i++) {
        const page = storyPages[i];
        setPdfProgress(`Page ${i + 1} of ${storyPages.length}...`);
        pdf.addPage();

        let yPos = margin;

        // Page number header
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${page.page_number}`, pageWidth / 2, yPos + 5, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
        yPos += 12;

        // Page image
        if (page.image_url) {
          const imgData = await loadImageAsDataUrl(page.image_url);
          if (imgData) {
            const imgWidth = contentWidth;
            const imgHeight = imgWidth * 0.667; // 3:2 aspect ratio
            pdf.addImage(imgData, 'JPEG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 8;
          }
        }

        // Page text
        if (page.text) {
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'normal');
          const textLines = pdf.splitTextToSize(page.text, contentWidth);

          // Check if text would overflow the page
          const textHeight = textLines.length * 6;
          if (yPos + textHeight > pageHeight - margin) {
            yPos = pageHeight - margin - textHeight;
            if (yPos < margin) yPos = margin;
          }

          pdf.text(textLines, pageWidth / 2, yPos, { align: 'center' });
        }

        // Page footer
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${page.page_number}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
      }

      // Save
      setPdfProgress('Saving...');
      const filename = `${book.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')}.pdf`;
      pdf.save(filename);
      setPdfProgress('');
    } catch (error) {
      console.error('PDF export error:', error);
      setPdfProgress('Export failed');
      setTimeout(() => setPdfProgress(''), 3000);
    } finally {
      setPdfExporting(false);
    }
  }, [book, pages, pdfExporting]);

  // ============================================
  // HELPERS
  // ============================================

  const getFontSizeClass = (size: FontSize) => {
    switch (size) {
      case 'small': return 'text-base sm:text-lg';
      case 'large': return 'text-xl sm:text-2xl';
      default: return 'text-lg sm:text-xl';
    }
  };

  const currentPageData = pages[currentPage];

  if (!currentPageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <p className="text-white/70">No pages available</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md safe-area-top">
        <div className="container mx-auto px-4 py-3">
          {/* Top row: Back, Title, Settings */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors touch-feedback min-h-[44px] min-w-[44px] justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>

            <h1 className="text-white font-semibold text-base sm:text-lg truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h1>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-white/80 hover:text-white transition-colors touch-feedback min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => switchMode('read')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all touch-feedback min-h-[44px] ${
                mode === 'read'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span>📖</span>
              <span className="hidden sm:inline">Read</span>
            </button>
            <button
              onClick={() => switchMode('autoplay')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all touch-feedback min-h-[44px] ${
                mode === 'autoplay'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span>▶️</span>
              <span className="hidden sm:inline">Auto-Play</span>
            </button>
          </div>

          {/* Read Mode Controls */}
          {mode === 'read' && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2">
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all touch-feedback min-h-[44px] ${
                  isPlaying
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {isPlaying ? '⏸️' : '🔊'}
                <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Read'}</span>
              </button>

              <button
                onClick={toggleAutoRead}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg transition-all touch-feedback min-h-[44px] ${
                  autoReadEnabled
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Auto-Read</span>
                <div className={`w-8 h-4 rounded-full transition-colors ${autoReadEnabled ? 'bg-green-300' : 'bg-white/30'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoReadEnabled ? 'translate-x-4' : ''}`} />
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24 min-h-screen flex items-center justify-center px-4" style={{ paddingTop: mode === 'read' ? '140px' : '110px' }}>
        <div className="w-full max-w-4xl">
          {/* Page Display */}
          <div
            className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-8 shadow-2xl transition-all duration-300"
            style={{
              boxShadow: settings.showShadow
                ? `0 25px 50px -12px rgba(0, 0, 0, ${settings.shadowOpacity})`
                : 'none'
            }}
          >
            {/* Image */}
            {currentPageData.image_url && (
              <div className="relative aspect-[4/3] w-full mb-4 rounded-2xl overflow-hidden">
                <Image
                  src={currentPageData.image_url}
                  alt={`Page ${currentPage + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority={currentPage === 0}
                  unoptimized
                />
              </div>
            )}

            {/* Text */}
            {currentPageData.text && (
              <div className={`text-white ${getFontSizeClass(settings.fontSize)} leading-relaxed text-center px-4 py-4`}>
                {currentPageData.text}
              </div>
            )}

            {/* Read Mode Audio Controls */}
            {mode === 'read' && (
              <div className="flex justify-center mt-4">
                {isPlaying ? (
                  <button
                    onClick={stopAudio}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => playPageAudio()}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-500/80 hover:bg-purple-500 text-white rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Read Aloud
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md safe-area-bottom">
        <div className="container mx-auto px-4 py-4">
          {mode === 'read' ? (
            /* Read Mode Navigation */
            <>
              <div className="flex items-center justify-between">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors touch-feedback min-h-[48px]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  aria-label="Next page"
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors touch-feedback min-h-[48px]"
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Mobile swipe hint */}
              <p className="text-center text-white/40 text-xs mt-2 sm:hidden">
                Swipe left/right to navigate
              </p>

              <div className="mt-2 sm:mt-3">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                    style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Auto-Play Mode Controls */
            <>
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleAutoPlay}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors touch-feedback min-h-[48px]"
                >
                  {autoPlayActive ? '⏸️' : '▶️'}
                  <span>{autoPlayActive ? 'Pause' : 'Play'}</span>
                </button>

                <span className="text-white/80 text-sm sm:text-base">
                  {formatTime(autoPlayCurrentTime)} / {formatTime(autoPlayTotalDuration)}
                </span>

                <span className="text-white/80 text-sm sm:text-base hidden sm:inline">
                  Page {currentPage + 1} of {totalPages}
                </span>
              </div>

              <div className="mt-3">
                <div
                  className="h-3 sm:h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer touch-feedback"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percentage = (e.clientX - rect.left) / rect.width;
                    const newTime = percentage * autoPlayTotalDuration;
                    setAutoPlayCurrentTime(newTime);
                    setAutoPlayProgress(percentage * 100);

                    // Find corresponding page
                    let cumTime = 0;
                    for (let i = 0; i < pages.length; i++) {
                      cumTime += pages[i].audio_duration || 4;
                      if (cumTime >= newTime) {
                        setCurrentPage(i);
                        break;
                      }
                    }
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-100"
                    style={{ width: `${autoPlayProgress}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </footer>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-gray-900/50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Jump to Page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jump to Page
                </label>
                <input
                  type="range"
                  min="1"
                  max={totalPages}
                  value={currentPage + 1}
                  onChange={(e) => goToPage(parseInt(e.target.value) - 1)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span className="font-medium text-purple-600">{currentPage + 1}</span>
                  <span>{totalPages}</span>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Size
                </label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                        settings.fontSize === size
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : ''}>
                        A
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Animation Speed: {settings.animationSpeed}ms
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="100"
                  value={settings.animationSpeed}
                  onChange={(e) => updateSettings({ animationSpeed: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Shadow */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Shadow</label>
                <button
                  onClick={() => updateSettings({ showShadow: !settings.showShadow })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showShadow ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                    settings.showShadow ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Shadow Opacity */}
              {settings.showShadow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shadow Opacity: {settings.shadowOpacity.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.shadowOpacity}
                    onChange={(e) => updateSettings({ shadowOpacity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Keyboard Shortcuts */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyboard Shortcuts</p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <li>→ or Space: Next page</li>
                  <li>←: Previous page</li>
                  <li>Esc: Go back / Close</li>
                </ul>
              </div>

              {/* Quality Check Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🔍 Premium Quality Check</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  AI analyzes all pages for missing characters and consistency issues
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setShowQualityCheck(true);
                      runQualityCheck(false);
                    }}
                    disabled={qualityCheckLoading}
                    className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    🔬 Check Quality
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setShowQualityCheck(true);
                      runQualityCheck(true);
                    }}
                    disabled={qualityCheckLoading}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    🔧 Check & Fix
                  </button>
                </div>
              </div>

              {/* Video Generation Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎬 Premium Video</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Create a shareable video slideshow with narration and music
                </p>

                {videoGenStatus?.status === 'complete' && videoGenStatus.videoUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <span>✅</span>
                      <span>Video ready!</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowSettings(false);
                          setShowVideoPlayer(true);
                        }}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors text-sm"
                      >
                        ▶️ Watch Video
                      </button>
                      <a
                        href={videoGenStatus.videoUrl}
                        download={`${book.title}.mp4`}
                        className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm text-center"
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  </div>
                ) : videoGenStatus?.status === 'queued' || videoGenStatus?.status === 'processing' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-600">
                        {videoGenStatus.status === 'queued' ? '⏳ Queued...' : '🎬 Generating...'}
                      </span>
                      <span className="text-gray-500">{videoGenStatus.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${videoGenStatus.progress}%` }}
                      />
                    </div>
                    <button
                      onClick={cancelVideoGeneration}
                      className="w-full py-2 px-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : videoGenStatus?.status === 'error' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <span>❌</span>
                      <span>{videoGenStatus.error || 'Generation failed'}</span>
                    </div>
                    <button
                      onClick={generateVideo}
                      disabled={videoGenerating}
                      className="w-full py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      🔄 Try Again
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateVideo}
                    disabled={videoGenerating || book.status !== 'complete'}
                    className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {videoGenerating ? '⏳ Starting...' : '🎬 Generate Video'}
                  </button>
                )}
              </div>

              {/* PDF Export Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📄 Export to PDF</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Download your story as a print-ready PDF with images and text
                </p>
                {pdfProgress ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-600 text-sm">
                      {pdfExporting && (
                        <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                      )}
                      <span>{pdfProgress}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      exportToPdf();
                    }}
                    disabled={pdfExporting || book.status !== 'complete'}
                    className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    📄 Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Check Modal */}
      {showQualityCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="quality-check-title">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-gray-900/50">
            <div className="flex items-center justify-between mb-4">
              <h2 id="quality-check-title" className="text-xl font-bold text-gray-900 dark:text-white">🔍 Quality Check</h2>
              <button
                onClick={() => setShowQualityCheck(false)}
                aria-label="Close quality check"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {qualityCheckLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Analyzing {totalPages} pages...</p>
                <p className="text-xs text-gray-400 mt-1">This may take 10-30 seconds</p>
              </div>
            ) : qualityCheckResult ? (
              <div>
                <div className={`p-4 rounded-lg mb-4 ${
                  qualityCheckResult.overallQuality === 'excellent' ? 'bg-green-50 dark:bg-green-950/30' :
                  qualityCheckResult.overallQuality === 'good' ? 'bg-blue-50 dark:bg-blue-950/30' :
                  qualityCheckResult.overallQuality === 'needs_work' ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-red-50 dark:bg-red-950/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {qualityCheckResult.overallQuality === 'excellent' ? '🌟' :
                       qualityCheckResult.overallQuality === 'good' ? '✅' :
                       qualityCheckResult.overallQuality === 'needs_work' ? '⚠️' : '❌'}
                    </span>
                    <span className="font-semibold capitalize">
                      {qualityCheckResult.overallQuality.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{qualityCheckResult.summary}</p>
                </div>

                {qualityCheckResult.pagesToRegenerate.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📋 {qualityCheckResult.pagesToRegenerate.length} page(s) need attention:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 max-h-40 overflow-y-auto">
                      {qualityCheckResult.pagesToRegenerate.map((page, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span>Page {page.pageNumber}: {page.issues.join(', ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {qualityCheckResult.coverIssues?.hasProblems && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-sm">
                    <span className="text-orange-600">⚠️ Cover has issues: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {qualityCheckResult.coverIssues.issues.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Click a button above to start quality check</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && videoGenStatus?.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">🎬 {book.title}</h2>
              <button
                onClick={() => setShowVideoPlayer(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                src={videoGenStatus.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
              <a
                href={videoGenStatus.videoUrl}
                download={`${book.title}.mp4`}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Video
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: book.title,
                      text: `Check out this storybook video: ${book.title}`,
                      url: videoGenStatus.videoUrl,
                    });
                  } else {
                    navigator.clipboard.writeText(videoGenStatus.videoUrl || '');
                    alert('Video link copied to clipboard!');
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

export function BookViewerSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="w-20 h-6 bg-white/20 rounded animate-pulse" />
            <div className="w-40 h-6 bg-white/20 rounded animate-pulse" />
            <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-24 h-10 bg-white/20 rounded-lg animate-pulse" />
            <div className="w-28 h-10 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-8 shadow-2xl">
            <div className="aspect-[4/3] w-full mb-4 rounded-2xl bg-white/20 animate-pulse" />
            <div className="space-y-3 px-4">
              <div className="h-6 bg-white/20 rounded animate-pulse" />
              <div className="h-6 bg-white/20 rounded animate-pulse w-3/4 mx-auto" />
            </div>
            <div className="flex justify-center mt-4">
              <div className="w-32 h-12 bg-purple-500/50 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="w-24 h-10 bg-white/20 rounded-lg animate-pulse" />
            <div className="w-32 h-6 bg-white/20 rounded animate-pulse" />
            <div className="w-24 h-10 bg-white/20 rounded-lg animate-pulse" />
          </div>
          <div className="mt-3 h-1 bg-white/20 rounded-full" />
        </div>
      </footer>
    </div>
  );
}
