'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The LeDesign mycelium — shared background for every app in the family.
 *
 * Same jittered-grid mesh + tinted dots + soft connecting filaments as the
 * 3D SiloAnimation on the landing page, distilled to a calm 2D canvas.
 * The mycelium is the motif that visibly links every surface in the
 * LeDesign ecosystem — landing, auth, every product's login and empty
 * states — so users feel they've stayed inside the same organism as
 * they move between apps.
 *
 * Tints are fixed across apps on purpose: echo violet + le blue + a
 * bridge hue. The apps-specific brand color should come through the
 * content, not the background; the mycelium is what's *shared*.
 */

type Tint = 'echo' | 'le' | 'bridge';

const TINTS: Record<Tint, [number, number, number]> = {
  echo: [167, 139, 250],
  le: [96, 165, 250],
  bridge: [210, 180, 240],
};

interface Point {
  nx: number;
  ny: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  tint: Tint;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function tintForX(nx: number): Tint {
  if (nx < 0.42) return 'echo';
  if (nx > 0.58) return 'le';
  return 'bridge';
}

const POINT_COUNT = 80;
const LINE_DISTANCE = 0.18;
const MAX_LINES_PER_POINT = 3;

export interface MyceliumBackgroundProps {
  className?: string;
  /** 0..1 — scales dot and line alpha. Default 0.85. */
  intensity?: number;
  /** Disable the soft radial washes behind the canvas. */
  hideGlows?: boolean;
}

export function MyceliumBackground({
  className = '',
  intensity = 0.85,
  hideGlows = false,
}: MyceliumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const rng = mulberry32(20260419);
    const cols = 11;
    const rows = 8;
    const points: Point[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const baseNx = (c + 0.5) / cols;
        const baseNy = (r + 0.5) / rows;
        const nx = Math.min(0.98, Math.max(0.02, baseNx + (rng() - 0.5) * 0.7 / cols));
        const ny = Math.min(0.98, Math.max(0.02, baseNy + (rng() - 0.5) * 0.7 / rows));
        points.push({
          nx,
          ny,
          ox: 0,
          oy: 0,
          vx: (rng() - 0.5) * 0.0004,
          vy: (rng() - 0.5) * 0.0004,
          size: 1.1 + rng() * 1.6,
          phase: rng() * Math.PI * 2,
          tint: tintForX(nx),
        });
      }
    }
    while (points.length > POINT_COUNT) {
      points.splice(Math.floor(rng() * points.length), 1);
    }
    pointsRef.current = points;
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    const handle = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = !!mql?.matches;
    let framesPainted = 0;

    const render = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      ctx.clearRect(0, 0, size.w, size.h);

      const points = pointsRef.current;

      for (const p of points) {
        p.ox += p.vx;
        p.oy += p.vy;
        if (Math.abs(p.ox) > 0.04) p.vx *= -1;
        if (Math.abs(p.oy) > 0.04) p.vy *= -1;
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const ax = (a.nx + a.ox) * size.w;
        const ay = (a.ny + a.oy) * size.h;
        let linked = 0;
        for (let j = i + 1; j < points.length && linked < MAX_LINES_PER_POINT; j++) {
          const b = points[j];
          const dx = a.nx - b.nx;
          const dy = a.ny - b.ny;
          const d = Math.hypot(dx, dy);
          if (d > LINE_DISTANCE) continue;
          const bx = (b.nx + b.ox) * size.w;
          const by = (b.ny + b.oy) * size.h;
          const falloff = 1 - d / LINE_DISTANCE;
          const alpha = 0.11 * falloff * intensity;
          const [ar, ag, ab] = TINTS[a.tint];
          const [br, bg, bb] = TINTS[b.tint];
          const r = Math.round((ar + br) / 2);
          const g = Math.round((ag + bg) / 2);
          const bl = Math.round((ab + bb) / 2);
          ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
          linked++;
        }
      }

      for (const p of points) {
        const x = (p.nx + p.ox) * size.w;
        const y = (p.ny + p.oy) * size.h;
        const pulse = 0.75 + 0.25 * Math.sin(elapsed * 0.8 + p.phase);
        const [r, g, b] = TINTS[p.tint];
        const baseAlpha = 0.42 * pulse * intensity;
        ctx.fillStyle = `rgba(${r},${g},${b},${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${r},${g},${b},${0.08 * pulse * intensity})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      framesPainted++;
      if (reduce && framesPainted >= 1) return;
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, intensity]);

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {!hideGlows && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '-8rem',
              width: '40rem',
              height: '40rem',
              borderRadius: '9999px',
              opacity: 0.25,
              filter: 'blur(64px)',
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.45) 0%, transparent 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              right: '-8rem',
              width: '40rem',
              height: '40rem',
              borderRadius: '9999px',
              opacity: 0.2,
              filter: 'blur(64px)',
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.45) 0%, transparent 70%)',
            }}
          />
        </>
      )}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0 }}
      />
    </div>
  );
}
