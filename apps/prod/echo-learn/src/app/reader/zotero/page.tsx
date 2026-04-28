'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  Settings,
  ArrowLeft,
  PanelLeftClose,
  PanelRightClose,
  PanelLeft,
  PanelRight,
  Library,
  AlertCircle,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import ZoteroCollectionTree, { ZoteroCollection } from '@/components/reader/ZoteroCollectionTree';
import ZoteroPaperTable, { ZoteroPaper } from '@/components/reader/ZoteroPaperTable';
import ZoteroPaperDetails from '@/components/reader/ZoteroPaperDetails';
import type { PaperEnrichment } from '@/types/reader';

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
  libraryStats?: LibraryStats;
}

interface PaperWithDetails extends ZoteroPaper {
  abstract: string | null;
  doi: string | null;
  section_count?: number;
  is_linked?: boolean;
  echo_status?: string; // not_imported, importing, imported, linked
}

export default function ZoteroViewPage() {
  const router = useRouter();

  // Panel visibility
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Data state
  const [zoteroStatus, setZoteroStatus] = useState<ZoteroStatus | null>(null);
  const [collections, setCollections] = useState<ZoteroCollection[]>([]);
  const [papers, setPapers] = useState<PaperWithDetails[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Loading states
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Zotero status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/reader/zotero');
        const data = await response.json();
        setZoteroStatus(data);
      } catch (err) {
        console.error('Failed to fetch Zotero status:', err);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/reader/zotero/collections');
        if (response.ok) {
          const data = await response.json();
          setCollections(data.collections || []);
        }
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      }
    };

    if (zoteroStatus?.connected) {
      fetchCollections();
    }
  }, [zoteroStatus?.connected]);

  // Fetch papers - uses different API based on filter type
  const fetchPapers = useCallback(async () => {
    setIsLoadingPapers(true);
    setError(null);

    try {
      // Use Zotero items API for zotero-specific filters
      const zoteroFilters = ['zotero_only', 'in_echo', 'linked', 'all'];
      const isZoteroFilter = zoteroFilters.includes(activeFilter);

      if (isZoteroFilter && activeFilter !== 'all') {
        // Fetch from Zotero items API
        const params = new URLSearchParams();
        params.set('filter', activeFilter);

        if (selectedCollectionId) {
          params.set('collection', selectedCollectionId);
        }

        const response = await fetch(`/api/reader/zotero/items?${params.toString()}`);

        if (response.status === 401) {
          router.push('/login?redirect=/reader/zotero');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch Zotero items');
        }

        const data = await response.json();
        const mappedPapers: PaperWithDetails[] = (data.items || []).map((item: any) => ({
          paper_id: item.paperId || item.id, // Use paperId if linked, otherwise zotero item id
          title: item.title,
          authors: (item.authors || []).map((name: string) => ({ name, full_name: name })),
          publication_year: item.publicationYear,
          journal: item.journal,
          abstract: item.abstract,
          doi: item.doi,
          read_status: item.echo?.readStatus || 'unread',
          date_added: item.dateAdded || new Date().toISOString(),
          enrichment: item.echo ? {
            cited_by_count: item.echo.citedByCount,
            is_open_access: item.echo.isOpenAccess,
            field: item.echo.field,
          } : undefined,
          has_pdf: item.hasPdf || item.echo?.hasPdf,
          section_count: 0,
          is_linked: item.echoStatus === 'linked',
          zotero_key: item.zoteroKey,
          echo_status: item.echoStatus,
        }));

        setPapers(mappedPapers);
      } else {
        // Use papers API for standard queries
        const params = new URLSearchParams();
        params.set('source', 'zotero');

        if (selectedCollectionId) {
          params.set('collection', selectedCollectionId);
        }

        if (activeFilter === 'unread') {
          params.set('status', 'unread');
        } else if (activeFilter === 'recent') {
          params.set('sort', 'created_at');
          params.set('order', 'desc');
          params.set('limit', '50');
        }

        const response = await fetch(`/api/reader/papers?${params.toString()}`);

        if (response.status === 401) {
          router.push('/login?redirect=/reader/zotero');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch papers');
        }

        const data = await response.json();
        const mappedPapers: PaperWithDetails[] = (data.papers || []).map((p: any) => ({
          paper_id: p.paper_id,
          title: p.title,
          authors: p.authors || [],
          publication_year: p.publication_year,
          journal: p.journal,
          abstract: p.abstract,
          doi: p.doi,
          read_status: p.read_status || 'unread',
          date_added: p.upload_timestamp || new Date().toISOString(),
          enrichment: p.enrichment,
          has_pdf: !!p.pdf_url,
          section_count: p.section_count,
          is_linked: p.is_linked || false,
        }));

        setPapers(mappedPapers);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoadingPapers(false);
    }
  }, [router, selectedCollectionId, activeFilter]);

  useEffect(() => {
    if (zoteroStatus?.connected) {
      fetchPapers();
    }
  }, [zoteroStatus?.connected, fetchPapers]);

  // Handle collection/filter selection
  const handleSelectCollection = (collectionId: string | null, filter?: string) => {
    setSelectedCollectionId(collectionId);
    if (filter) {
      setActiveFilter(filter);
    } else {
      setActiveFilter('all');
    }
    setSelectedPaperId(null);
  };

  // Handle sync - metadata only (fast incremental)
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/reader/zotero/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'metadata' }),
      });

      const data = await response.json();

      if (response.ok) {
        const stats = data.stats;
        setSyncMessage(
          stats.totalItems > 0
            ? `Synced ${stats.totalItems} items (${stats.linkedToExisting} linked)`
            : 'Library is up to date'
        );
        // Refresh status with updated stats
        const statusResponse = await fetch('/api/reader/zotero');
        setZoteroStatus(await statusResponse.json());
        await fetchPapers();
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync library');
    } finally {
      setIsSyncing(false);
    }
  };

  // Selected paper details
  const selectedPaper = useMemo(() => {
    return papers.find((p) => p.paper_id === selectedPaperId) || null;
  }, [papers, selectedPaperId]);

  // Counts for filters
  const unreadCount = papers.filter((p) => p.read_status === 'unread').length;
  const recentCount = Math.min(papers.length, 50);

  // Not connected state
  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw size={32} className="text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!zoteroStatus?.connected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <Library size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Zotero Library View
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Zotero account to use this view
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={20} className="text-amber-500" />
              <p className="text-gray-700 dark:text-gray-300">
                You need to connect your Zotero account first to use this Zotero-style paper browser.
              </p>
            </div>

            <Link
              href="/reader/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Link2 size={18} />
              Connect Zotero in Settings
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/reader/library"
              className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top Bar */}
      <div className="flex-shrink-0 h-12 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/reader/library"
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Back to Library"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2">
            <Library size={20} className="text-red-600" />
            <h1 className="font-semibold text-gray-900 dark:text-white">
              Zotero View
            </h1>
            {zoteroStatus.username && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({zoteroStatus.username})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync message */}
          {syncMessage && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 mr-2">
              {syncMessage}
            </span>
          )}

          {/* Panel toggles */}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className={`p-1.5 rounded-lg transition-colors ${
              showLeftPanel
                ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={showLeftPanel ? 'Hide sidebar' : 'Show sidebar'}
          >
            {showLeftPanel ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={`p-1.5 rounded-lg transition-colors ${
              showRightPanel
                ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={showRightPanel ? 'Hide details' : 'Show details'}
          >
            {showRightPanel ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>

          {/* Settings */}
          <Link
            href="/reader/settings"
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Main 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Collection Tree */}
        {showLeftPanel && (
          <div className="w-64 flex-shrink-0 overflow-hidden">
            <ZoteroCollectionTree
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={handleSelectCollection}
              totalPapers={papers.length}
              unreadCount={unreadCount}
              recentCount={recentCount}
              libraryStats={zoteroStatus?.libraryStats}
            />
          </div>
        )}

        {/* Center Panel - Paper Table */}
        <div className="flex-1 overflow-hidden">
          <ZoteroPaperTable
            papers={papers}
            selectedPaperId={selectedPaperId}
            onSelectPaper={setSelectedPaperId}
            onOpenPaper={(id) => router.push(`/reader/${id}`)}
            isLoading={isLoadingPapers}
          />
        </div>

        {/* Right Panel - Paper Details */}
        {showRightPanel && (
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <ZoteroPaperDetails paper={selectedPaper} />
          </div>
        )}
      </div>
    </div>
  );
}
