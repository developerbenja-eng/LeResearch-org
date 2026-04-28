'use client';

import { useState } from 'react';
import {
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Library,
  FileText,
  Clock,
  Star,
  Trash2,
  Link2,
  Upload,
  BookOpen,
} from 'lucide-react';

export interface ZoteroCollection {
  id: string;
  zotero_key: string;
  name: string;
  parent_key: string | null;
  paper_count?: number;
  children?: ZoteroCollection[];
}

interface LibraryStats {
  totalZoteroItems: number;
  linkedToEcho: number;
  importedToEcho: number;
  zoteroOnly: number;
  echoOnly: number;
  collections: number;
}

interface ZoteroCollectionTreeProps {
  collections: ZoteroCollection[];
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string | null, filter?: string) => void;
  totalPapers: number;
  unreadCount?: number;
  recentCount?: number;
  libraryStats?: LibraryStats;
}

// Build tree structure from flat list
function buildCollectionTree(collections: ZoteroCollection[]): ZoteroCollection[] {
  const map = new Map<string, ZoteroCollection>();
  const roots: ZoteroCollection[] = [];

  // First pass: create lookup map
  collections.forEach(c => {
    map.set(c.zotero_key, { ...c, children: [] });
  });

  // Second pass: build tree
  collections.forEach(c => {
    const node = map.get(c.zotero_key)!;
    if (c.parent_key && map.has(c.parent_key)) {
      map.get(c.parent_key)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort alphabetically
  const sortNodes = (nodes: ZoteroCollection[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(n => n.children && sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

function CollectionNode({
  collection,
  level,
  selectedId,
  onSelect,
}: {
  collection: ZoteroCollection;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = collection.children && collection.children.length > 0;
  const isSelected = selectedId === collection.id;

  return (
    <div>
      <button
        onClick={() => onSelect(collection.id)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
          isSelected
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-gray-400" />
            ) : (
              <ChevronRight size={14} className="text-gray-400" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {isExpanded && hasChildren ? (
          <FolderOpen size={16} className="text-amber-500 flex-shrink-0" />
        ) : (
          <Folder size={16} className="text-amber-500 flex-shrink-0" />
        )}

        <span className="truncate flex-1 text-left">{collection.name}</span>

        {collection.paper_count !== undefined && collection.paper_count > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {collection.paper_count}
          </span>
        )}
      </button>

      {isExpanded && hasChildren && (
        <div>
          {collection.children!.map(child => (
            <CollectionNode
              key={child.id}
              collection={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ZoteroCollectionTree({
  collections,
  selectedCollectionId,
  onSelectCollection,
  totalPapers,
  unreadCount = 0,
  recentCount = 0,
  libraryStats,
}: ZoteroCollectionTreeProps) {
  const tree = buildCollectionTree(collections);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    onSelectCollection(null, filter);
  };

  const handleCollectionSelect = (id: string) => {
    setActiveFilter(null);
    onSelectCollection(id);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Library size={18} className="text-red-600" />
          Zotero Library
        </h2>
      </div>

      {/* Source Filters - Zotero vs Echo */}
      {libraryStats && (
        <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-800">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-1">
            Library Source
          </div>

          <button
            onClick={() => handleFilterSelect('all')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FileText size={16} className="text-gray-400" />
            <span className="flex-1 text-left">All Items</span>
            <span className="text-xs text-gray-400">{libraryStats.totalZoteroItems}</span>
          </button>

          <button
            onClick={() => handleFilterSelect('zotero_only')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'zotero_only'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Library size={16} className="text-red-500" />
            <span className="flex-1 text-left">Zotero Only</span>
            <span className="text-xs text-gray-400">{libraryStats.zoteroOnly}</span>
          </button>

          <button
            onClick={() => handleFilterSelect('in_echo')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'in_echo'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <BookOpen size={16} className="text-purple-500" />
            <span className="flex-1 text-left">In Echo</span>
            <span className="text-xs text-gray-400">{libraryStats.linkedToEcho + libraryStats.importedToEcho}</span>
          </button>

          <button
            onClick={() => handleFilterSelect('linked')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'linked'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Link2 size={16} className="text-blue-500" />
            <span className="flex-1 text-left">Linked (Duplicates)</span>
            <span className="text-xs text-gray-400">{libraryStats.linkedToEcho}</span>
          </button>
        </div>
      )}

      {/* Quick Filters */}
      <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-1">
          Quick Filters
        </div>

        {!libraryStats && (
          <button
            onClick={() => handleFilterSelect('all')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FileText size={16} className="text-gray-400" />
            <span className="flex-1 text-left">All Papers</span>
            <span className="text-xs text-gray-400">{totalPapers}</span>
          </button>
        )}

        <button
          onClick={() => handleFilterSelect('unread')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
            activeFilter === 'unread'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Circle size={16} className="text-gray-400" />
          <span className="flex-1 text-left">Unread</span>
          <span className="text-xs text-gray-400">{unreadCount}</span>
        </button>

        <button
          onClick={() => handleFilterSelect('recent')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
            activeFilter === 'recent'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Clock size={16} className="text-blue-400" />
          <span className="flex-1 text-left">Recently Added</span>
          <span className="text-xs text-gray-400">{recentCount}</span>
        </button>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-1">
          Collections
        </div>

        {tree.length === 0 ? (
          <div className="px-2 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            No collections yet
          </div>
        ) : (
          tree.map(collection => (
            <CollectionNode
              key={collection.id}
              collection={collection}
              level={0}
              selectedId={selectedCollectionId}
              onSelect={handleCollectionSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Circle icon for unread
function Circle({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
