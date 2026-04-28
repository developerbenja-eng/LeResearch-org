'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import type { MusicConcept } from '@/types/music-hall';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from '@/types/music-hall';

interface ConceptNode {
  id: string;
  x: number;
  y: number;
  z: number;
  concept: MusicConcept;
}

interface Connection {
  from: string;
  to: string;
}

export default function GalaxyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [concepts, setConcepts] = useState<MusicConcept[]>([]);
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Fetch concepts
  useEffect(() => {
    async function fetchConcepts() {
      try {
        const res = await fetch('/api/music-hall/concepts');
        const data = await res.json();
        setConcepts(data.concepts || []);
      } catch (error) {
        console.error('Error fetching concepts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConcepts();
  }, []);

  // Generate 3D positions for concepts
  useEffect(() => {
    if (concepts.length === 0) return;

    const generatedNodes: ConceptNode[] = concepts.map((concept) => {
      // Position based on category (angle) and difficulty (radius)
      const categoryIndex = Object.keys(CATEGORY_METADATA).indexOf(concept.category);
      const angleBase = (categoryIndex / 5) * Math.PI * 2;
      const angle = angleBase + (Math.random() - 0.5) * 0.5;

      const difficultyRadius = concept.difficulty === 'beginner' ? 100 :
        concept.difficulty === 'intermediate' ? 180 : 260;
      const radius = difficultyRadius + (Math.random() - 0.5) * 40;

      return {
        id: concept.id,
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 100,
        z: Math.sin(angle) * radius,
        concept,
      };
    });

    // Generate connections based on related concepts
    const generatedConnections: Connection[] = [];
    concepts.forEach((concept) => {
      concept.relatedConcepts?.forEach((relatedId) => {
        if (concepts.find((c) => c.id === relatedId)) {
          generatedConnections.push({ from: concept.id, to: relatedId });
        }
      });
    });

    setNodes(generatedNodes);
    setConnections(generatedConnections);
  }, [concepts]);

  // Draw galaxy
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear
    ctx.fillStyle = '#0a0f14';
    ctx.fillRect(0, 0, width, height);

    // Draw stars background
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Project 3D to 2D
    const project = (x: number, y: number, z: number) => {
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Rotate around Y axis
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const scale = 500 / (500 + z2);
      return {
        x: centerX + x1 * scale * zoom,
        y: centerY + y1 * scale * zoom,
        scale,
        z: z2,
      };
    };

    // Sort nodes by Z for proper layering
    const sortedNodes = [...nodes].sort((a, b) => {
      const projA = project(a.x, a.y, a.z);
      const projB = project(b.x, b.y, b.z);
      return projA.z - projB.z;
    });

    // Draw connections
    ctx.lineWidth = 1;
    connections.forEach((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.from);
      const toNode = nodes.find((n) => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const from = project(fromNode.x, fromNode.y, fromNode.z);
      const to = project(toNode.x, toNode.y, toNode.z);

      const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
      const fromColor = CATEGORY_METADATA[fromNode.concept.category]?.color || '#06b6d4';
      const toColor = CATEGORY_METADATA[toNode.concept.category]?.color || '#06b6d4';
      gradient.addColorStop(0, `${fromColor}40`);
      gradient.addColorStop(1, `${toColor}40`);

      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    // Draw nodes
    sortedNodes.forEach((node) => {
      const proj = project(node.x, node.y, node.z);
      const color = CATEGORY_METADATA[node.concept.category]?.color || '#06b6d4';
      const baseSize = node.concept.difficulty === 'beginner' ? 15 :
        node.concept.difficulty === 'intermediate' ? 12 : 10;
      const size = baseSize * proj.scale * zoom;

      // Glow effect
      const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, size * 2);
      gradient.addColorStop(0, `${color}60`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Node
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Selected highlight
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label for closer nodes
      if (proj.scale > 0.6) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${12 * proj.scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.concept.emoji + ' ' + node.concept.name, proj.x, proj.y + size + 16);
      }
    });
  }, [nodes, connections, rotation, zoom, selectedNode]);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setRotation((prev) => ({
      x: prev.x + deltaY * 0.005,
      y: prev.y + deltaX * 0.005,
    }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Find clicked node
    for (const node of nodes) {
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);

      const x1 = node.x * cosY - node.z * sinY;
      const z1 = node.x * sinY + node.z * cosY;
      const y1 = node.y * cosX - z1 * sinX;
      const z2 = node.y * sinX + z1 * cosX;

      const scale = 500 / (500 + z2);
      const projX = centerX + x1 * scale * zoom;
      const projY = centerY + y1 * scale * zoom;

      const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
      if (dist < 20) {
        setSelectedNode(node);
        return;
      }
    }
    setSelectedNode(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 p-6 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-1">
              Music Galaxy
            </h1>
            <p className="text-music-dim">
              Explore the universe of music concepts
            </p>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2"
      >
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
          className="p-3 bg-music-surface/80 backdrop-blur rounded-lg hover:bg-music-surface transition-colors"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.2, 0.3))}
          className="p-3 bg-music-surface/80 backdrop-blur rounded-lg hover:bg-music-surface transition-colors"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => {
            setRotation({ x: 0, y: 0 });
            setZoom(1);
          }}
          className="p-3 bg-music-surface/80 backdrop-blur rounded-lg hover:bg-music-surface transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 bg-music-surface/80 backdrop-blur rounded-xl p-4"
      >
        <h3 className="text-sm font-medium text-white mb-3">Categories</h3>
        <div className="space-y-2">
          {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-sm text-music-dim">
                {meta.emoji} {meta.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Selected Node Info */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-6 right-6 w-80 bg-music-surface/90 backdrop-blur rounded-xl p-5 border border-white/10"
        >
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-3 right-3 p-1 hover:bg-music-surface-light rounded"
          >
            <X className="w-4 h-4 text-music-dim" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{selectedNode.concept.emoji}</span>
            <div>
              <h3 className="font-semibold text-white">{selectedNode.concept.name}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${CATEGORY_METADATA[selectedNode.concept.category].color}20`,
                    color: CATEGORY_METADATA[selectedNode.concept.category].color,
                  }}
                >
                  {CATEGORY_METADATA[selectedNode.concept.category].label}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${DIFFICULTY_METADATA[selectedNode.concept.difficulty].color}20`,
                    color: DIFFICULTY_METADATA[selectedNode.concept.difficulty].color,
                  }}
                >
                  {DIFFICULTY_METADATA[selectedNode.concept.difficulty].label}
                </span>
              </div>
            </div>
          </div>

          <p className="text-music-dim text-sm mb-4">
            {selectedNode.concept.description}
          </p>

          <Link
            href={`/learn/music/concepts/${selectedNode.concept.id}`}
            className="block w-full text-center py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Explore Concept
          </Link>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-music-bg">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">🌌</div>
            <p className="text-music-dim">Loading galaxy...</p>
          </div>
        </div>
      )}
    </div>
  );
}
