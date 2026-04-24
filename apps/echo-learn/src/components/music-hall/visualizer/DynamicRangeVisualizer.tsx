'use client';

import { useEffect, useRef } from 'react';

interface DynamicRangeVisualizerProps {
  threshold: number;
  ratio: number;
  knee: number;
  gainReduction?: number;
  height?: number;
}

export function DynamicRangeVisualizer({
  threshold,
  ratio,
  knee,
  gainReduction = 0,
  height = 150,
}: DynamicRangeVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = 30;
    const plotW = w - padding * 2;
    const plotH = h - padding * 2;

    // dB range: -60 to 0
    const minDB = -60;
    const maxDB = 0;
    const dbRange = maxDB - minDB;

    const dbToX = (db: number) => padding + ((db - minDB) / dbRange) * plotW;
    const dbToY = (db: number) => padding + plotH - ((db - minDB) / dbRange) * plotH;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let db = -60; db <= 0; db += 12) {
      const x = dbToX(db);
      const y = dbToY(db);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, h - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // 1:1 reference line (no compression)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(dbToX(minDB), dbToY(minDB));
    ctx.lineTo(dbToX(maxDB), dbToY(maxDB));
    ctx.stroke();
    ctx.setLineDash([]);

    // Compression curve
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let inputDB = minDB; inputDB <= maxDB; inputDB += 0.5) {
      let outputDB: number;

      if (inputDB < threshold - knee / 2) {
        // Below threshold: 1:1
        outputDB = inputDB;
      } else if (inputDB < threshold + knee / 2) {
        // Knee region: smooth transition
        const kneeRange = inputDB - (threshold - knee / 2);
        const kneeRatio = kneeRange / knee;
        const effectiveRatio = 1 + (ratio - 1) * kneeRatio;
        outputDB = threshold - knee / 2 + kneeRange / effectiveRatio;
      } else {
        // Above threshold: compressed
        outputDB = threshold + (inputDB - threshold) / ratio;
      }

      const x = dbToX(inputDB);
      const y = dbToY(outputDB);

      if (inputDB === minDB) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Threshold indicator
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    const threshX = dbToX(threshold);
    ctx.beginPath();
    ctx.moveTo(threshX, padding);
    ctx.lineTo(threshX, h - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Input (dB)', w / 2, h - 4);
    ctx.save();
    ctx.translate(10, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Output (dB)', 0, 0);
    ctx.restore();

    // Gain reduction meter
    if (gainReduction < 0) {
      const meterX = w - 20;
      const meterH = plotH;
      const meterY = padding;
      const reductionHeight = Math.min(Math.abs(gainReduction) / 30, 1) * meterH;

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(meterX, meterY, 8, meterH);

      ctx.fillStyle = '#ef444480';
      ctx.fillRect(meterX, meterY, 8, reductionHeight);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px ui-monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GR', meterX + 4, meterY - 4);
    }
  }, [threshold, ratio, knee, gainReduction, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg"
      style={{ display: 'block', height }}
    />
  );
}
