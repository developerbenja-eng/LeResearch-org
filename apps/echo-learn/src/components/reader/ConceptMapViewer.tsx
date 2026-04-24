'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Network,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Loader2,
  X,
} from 'lucide-react';

interface ConceptNode {
  id: string;
  label: string;
  type: 'main' | 'supporting' | 'detail';
  definition?: string;
}

interface ConceptEdge {
  source: string;
  target: string;
  relationship: string;
}

interface ConceptMap {
  map_id: string;
  title: string;
  paper_id?: string;
  paper_title?: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  central_concept: string;
  generated_at: string;
}

interface ConceptMapViewerProps {
  paperId: string;
  compact?: boolean;
}

const NODE_COLORS = {
  main: {
    bg: 'fill-violet-500',
    stroke: 'stroke-violet-600',
    text: 'fill-white',
  },
  supporting: {
    bg: 'fill-blue-400',
    stroke: 'stroke-blue-500',
    text: 'fill-white',
  },
  detail: {
    bg: 'fill-gray-300 dark:fill-gray-600',
    stroke: 'stroke-gray-400 dark:stroke-gray-500',
    text: 'fill-gray-800 dark:fill-white',
  },
};

export default function ConceptMapViewer({ paperId, compact = false }: ConceptMapViewerProps) {
  const [maps, setMaps] = useState<ConceptMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<ConceptMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 600, height: 400 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track container size for responsive SVG
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: Math.max(rect.width, 200),
          height: Math.max(rect.height, 200),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isExpanded, isFullscreen]);

  const fetchMaps = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reader/study/concepts?paperId=${paperId}`);
      const data = await response.json();
      setMaps(data.maps || []);

      if (data.maps?.length > 0) {
        // Fetch full map details
        const mapResponse = await fetch(`/api/reader/study/concepts?mapId=${data.maps[0].map_id}`);
        const mapData = await mapResponse.json();
        setSelectedMap(mapData);
      }
    } catch (error) {
      console.error('Failed to fetch concept maps:', error);
    } finally {
      setIsLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    if (isExpanded) {
      fetchMaps();
    }
  }, [fetchMaps, isExpanded]);

  const generateMap = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reader/study/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId }),
      });

      const data = await response.json();
      if (data.map_id) {
        setSelectedMap(data);
        setMaps((prev) => [data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to generate concept map:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate node positions using force-directed-like layout
  const calculateLayout = useCallback((nodes: ConceptNode[], edges: ConceptEdge[], width: number, height: number) => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = width / 2;
    const centerY = height / 2;

    // Scale radii based on container size
    const minDimension = Math.min(width, height);
    const supportingRadius = minDimension * 0.3;
    const detailRadius = minDimension * 0.45;

    // Find central node
    const centralNode = nodes.find((n) => n.type === 'main') || nodes[0];
    if (centralNode) {
      positions[centralNode.id] = { x: centerX, y: centerY };
    }

    // Position supporting nodes in a circle around center
    const supportingNodes = nodes.filter((n) => n.type === 'supporting');
    supportingNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / supportingNodes.length - Math.PI / 2;
      positions[node.id] = {
        x: centerX + supportingRadius * Math.cos(angle),
        y: centerY + supportingRadius * Math.sin(angle),
      };
    });

    // Position detail nodes further out
    const detailNodes = nodes.filter((n) => n.type === 'detail');
    detailNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / detailNodes.length + Math.PI / detailNodes.length;
      positions[node.id] = {
        x: centerX + detailRadius * Math.cos(angle),
        y: centerY + detailRadius * Math.sin(angle),
      };
    });

    return positions;
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `concept-map-${selectedMap?.map_id || 'export'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderMap = () => {
    if (!selectedMap?.nodes?.length) return null;

    const { width, height } = containerSize;
    const positions = calculateLayout(selectedMap.nodes, selectedMap.edges, width, height);

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges */}
        {selectedMap.edges.map((edge, i) => {
          const source = positions[edge.source];
          const target = positions[edge.target];
          if (!source || !target) return null;

          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          return (
            <g key={i}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                className="opacity-60"
              />
              <text
                x={midX}
                y={midY - 5}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400 text-[10px]"
              >
                {edge.relationship}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {selectedMap.nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;

          const colors = NODE_COLORS[node.type];
          const isSelected = selectedNode?.id === node.id;
          const nodeWidth = node.type === 'main' ? 120 : node.type === 'supporting' ? 100 : 80;
          const nodeHeight = node.type === 'main' ? 50 : node.type === 'supporting' ? 40 : 32;

          return (
            <g
              key={node.id}
              onClick={() => setSelectedNode(isSelected ? null : node)}
              className="cursor-pointer"
            >
              <rect
                x={pos.x - nodeWidth / 2}
                y={pos.y - nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx={8}
                className={`${colors.bg} ${isSelected ? 'stroke-2 stroke-yellow-400' : colors.stroke} transition-all`}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`${colors.text} text-xs font-medium pointer-events-none`}
              >
                {node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const mapContent = (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <span className="px-2 py-1 text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={downloadSvg}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
        style={{ height: compact ? 200 : 300 }}
      >
        {renderMap()}
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
          <div className="flex items-start justify-between">
            <div>
              <span className={`px-2 py-0.5 text-xs rounded ${
                selectedNode.type === 'main'
                  ? 'bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300'
                  : selectedNode.type === 'supporting'
                  ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {selectedNode.type}
              </span>
              <h4 className="font-medium text-gray-900 dark:text-white mt-1">{selectedNode.label}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
          {selectedNode.definition && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{selectedNode.definition}</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-violet-500" />
          Main Concept
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-400" />
          Supporting
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-400" />
          Detail
        </div>
      </div>

      {/* Regenerate */}
      <button
        onClick={generateMap}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors disabled:opacity-50"
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        Regenerate
      </button>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            compact ? 'px-3 py-2.5' : 'px-4 py-3'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center ${
              compact ? 'w-8 h-8' : 'w-8 h-8'
            }`}>
              <Network size={16} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-sm'}`}>
                Concept Map
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {maps.length > 0 ? `${selectedMap?.nodes?.length || 0} concepts mapped` : 'Visualize key concepts'}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp size={compact ? 16 : 18} className="text-gray-400" />
          ) : (
            <ChevronDown size={compact ? 16 : 18} className="text-gray-400" />
          )}
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className={`border-t border-gray-100 dark:border-gray-800 ${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={24} className="text-cyan-500 animate-spin" />
              </div>
            ) : !selectedMap?.nodes?.length ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 flex items-center justify-center">
                  <Network size={28} className="text-cyan-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Generate a visual map of key concepts and their relationships.
                </p>
                <button
                  onClick={generateMap}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Concept Map
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-3">{mapContent}</div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && selectedMap && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedMap.title}
              </h3>
              <div className="h-[calc(100%-60px)]">
                {mapContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
