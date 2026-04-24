'use client';

import { useMemo, useCallback, useRef, useState } from 'react';
import type { AutomationLane, AutomationPoint } from '@/types/producer';
import { AUTOMATABLE_PARAMS, type AutomatableParam } from '@/lib/audio/automation';

interface AutomationLaneEditorProps {
  lanes: AutomationLane[];
  currentStep: number;
  isPlaying: boolean;
  onLanesChange: (lanes: AutomationLane[]) => void;
}

const LANE_WIDTH = 640; // 16 steps * 40px
const LANE_HEIGHT = 60;
const STEP_WIDTH = 40;
const POINT_RADIUS = 5;

function LaneRow({
  lane,
  param,
  currentStep,
  isPlaying,
  onChange,
  onRemove,
}: {
  lane: AutomationLane;
  param: AutomatableParam;
  currentStep: number;
  isPlaying: boolean;
  onChange: (points: AutomationPoint[]) => void;
  onRemove: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const sortedPoints = useMemo(
    () => [...lane.points].sort((a, b) => a.step - b.step),
    [lane.points],
  );

  const stepToX = (step: number) => step * STEP_WIDTH + STEP_WIDTH / 2;
  const valueToY = (value: number) => LANE_HEIGHT - value * LANE_HEIGHT;
  const xToStep = (x: number) => Math.max(0, Math.min(15, Math.round((x - STEP_WIDTH / 2) / STEP_WIDTH)));
  const yToValue = (y: number) => Math.max(0, Math.min(1, 1 - y / LANE_HEIGHT));

  const pathD = useMemo(() => {
    if (sortedPoints.length === 0) return '';
    const pts = sortedPoints.map((p) => `${stepToX(p.step)},${valueToY(p.value)}`);
    return `M${pts.join(' L')}`;
  }, [sortedPoints]);

  const getSVGCoords = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (draggingIdx !== null) return;
    const { x, y } = getSVGCoords(e);
    const step = xToStep(x);
    const value = yToValue(y);

    // Check if clicking near an existing point
    const existingIdx = sortedPoints.findIndex(
      (p) => Math.abs(stepToX(p.step) - x) < 10 && Math.abs(valueToY(p.value) - y) < 10,
    );
    if (existingIdx >= 0) return; // handled by mousedown on circle

    // Add new point (or update existing on same step)
    const existingStepIdx = sortedPoints.findIndex((p) => p.step === step);
    if (existingStepIdx >= 0) {
      const updated = [...sortedPoints];
      updated[existingStepIdx] = { step, value };
      onChange(updated);
    } else {
      onChange([...sortedPoints, { step, value }]);
    }
  }, [draggingIdx, getSVGCoords, sortedPoints, onChange]);

  const handlePointMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setDraggingIdx(idx);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingIdx === null) return;
    const { x, y } = getSVGCoords(e);
    const step = xToStep(x);
    const value = yToValue(y);
    const updated = [...sortedPoints];
    updated[draggingIdx] = { step, value };
    onChange(updated);
  }, [draggingIdx, getSVGCoords, sortedPoints, onChange]);

  const handleMouseUp = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = getSVGCoords(e);
    // Find point near click
    const idx = sortedPoints.findIndex(
      (p) => Math.abs(stepToX(p.step) - x) < 10 && Math.abs(valueToY(p.value) - y) < 10,
    );
    if (idx >= 0) {
      const updated = sortedPoints.filter((_, i) => i !== idx);
      onChange(updated);
    }
  }, [getSVGCoords, sortedPoints, onChange]);

  return (
    <div className="flex items-start gap-2">
      {/* Label */}
      <div className="flex-shrink-0 w-28 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-music-dim/60 uppercase tracking-wider">{param.group}</span>
        </div>
        <div className="text-sm text-music-text">{param.name}</div>
        <button
          onClick={onRemove}
          className="text-[10px] text-red-400/60 hover:text-red-400 mt-1 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* SVG Lane */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <svg
          ref={svgRef}
          width={LANE_WIDTH}
          height={LANE_HEIGHT}
          className="bg-white/[0.02] rounded border border-white/5 cursor-crosshair"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          {/* Grid lines */}
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={i}
              x1={i * STEP_WIDTH}
              y1={0}
              x2={i * STEP_WIDTH}
              y2={LANE_HEIGHT}
              stroke={i % 4 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
            />
          ))}
          {/* Center line */}
          <line
            x1={0} y1={LANE_HEIGHT / 2}
            x2={LANE_WIDTH} y2={LANE_HEIGHT / 2}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />

          {/* Automation curve */}
          {pathD && (
            <path d={pathD} fill="none" stroke="rgb(34,211,238)" strokeWidth={1.5} opacity={0.7} />
          )}

          {/* Fill area under curve */}
          {sortedPoints.length >= 2 && (
            <path
              d={`${pathD} L${stepToX(sortedPoints[sortedPoints.length - 1].step)},${LANE_HEIGHT} L${stepToX(sortedPoints[0].step)},${LANE_HEIGHT} Z`}
              fill="rgb(34,211,238)"
              opacity={0.06}
            />
          )}

          {/* Points */}
          {sortedPoints.map((p, i) => (
            <circle
              key={i}
              cx={stepToX(p.step)}
              cy={valueToY(p.value)}
              r={POINT_RADIUS}
              fill={draggingIdx === i ? 'rgb(34,211,238)' : 'rgb(22,78,99)'}
              stroke="rgb(34,211,238)"
              strokeWidth={1.5}
              className="cursor-grab"
              onMouseDown={(e) => handlePointMouseDown(e, i)}
            />
          ))}

          {/* Playhead */}
          {isPlaying && (
            <line
              x1={currentStep * STEP_WIDTH + STEP_WIDTH / 2}
              y1={0}
              x2={currentStep * STEP_WIDTH + STEP_WIDTH / 2}
              y2={LANE_HEIGHT}
              stroke="rgba(34,211,238,0.5)"
              strokeWidth={2}
            />
          )}
        </svg>
      </div>
    </div>
  );
}

export function AutomationLaneEditor({
  lanes,
  currentStep,
  isPlaying,
  onLanesChange,
}: AutomationLaneEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Parameters already used
  const usedParamIds = useMemo(() => new Set(lanes.map((l) => l.parameterId)), [lanes]);

  // Available parameters to add
  const availableParams = useMemo(
    () => AUTOMATABLE_PARAMS.filter((p) => !usedParamIds.has(p.id)),
    [usedParamIds],
  );

  const handleAddLane = useCallback((paramId: string) => {
    onLanesChange([...lanes, { parameterId: paramId, points: [] }]);
  }, [lanes, onLanesChange]);

  const handleRemoveLane = useCallback((paramId: string) => {
    onLanesChange(lanes.filter((l) => l.parameterId !== paramId));
  }, [lanes, onLanesChange]);

  const handlePointsChange = useCallback((paramId: string, points: AutomationPoint[]) => {
    onLanesChange(
      lanes.map((l) => (l.parameterId === paramId ? { ...l, points } : l)),
    );
  }, [lanes, onLanesChange]);

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm font-medium text-music-text hover:text-white transition-colors"
        >
          <svg
            width={12} height={12} viewBox="0 0 12 12"
            className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
          >
            <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth={1.5} />
          </svg>
          Automation
          {lanes.length > 0 && (
            <span className="text-xs text-cyan-400/60 font-normal">({lanes.length})</span>
          )}
        </button>

        {!isCollapsed && availableParams.length > 0 && (
          <div className="relative group">
            <button className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-colors">
              + Add Lane
            </button>
            <div className="absolute right-0 top-full mt-1 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-30 hidden group-hover:block min-w-[160px]">
              {availableParams.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAddLane(p.id)}
                  className="block w-full text-left px-3 py-1.5 text-xs text-music-dim hover:text-white hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="text-music-dim/50">{p.group}</span> {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {!isCollapsed && lanes.length === 0 && (
        <p className="text-[10px] text-music-dim/50">
          Add automation lanes to control parameters over time. Click the curve to add points.
        </p>
      )}

      {/* Lanes */}
      {!isCollapsed && lanes.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] text-music-dim/50">
            Click to add points &bull; Drag to adjust &bull; Double-click to delete
          </p>
          {lanes.map((lane) => {
            const param = AUTOMATABLE_PARAMS.find((p) => p.id === lane.parameterId);
            if (!param) return null;
            return (
              <LaneRow
                key={lane.parameterId}
                lane={lane}
                param={param}
                currentStep={currentStep}
                isPlaying={isPlaying}
                onChange={(points) => handlePointsChange(lane.parameterId, points)}
                onRemove={() => handleRemoveLane(lane.parameterId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
