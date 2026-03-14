"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const STRONG_THRESHOLD = 120;

interface DrawingCanvasProps {
  entropyLevel: 'weak' | 'moderate' | 'strong';
  onEntropyChange: (entropy: number[]) => void;
}

const levelConfig = {
  weak:     { label: 'No entropy',  color: '#ef4444', bar: '#ef4444', bg: 'rgba(239,68,68,0.08)',     border: 'rgba(239,68,68,0.2)' },
  moderate: { label: 'Moderate',    color: '#f59e0b', bar: '#f59e0b', bg: 'rgba(245,158,11,0.08)',    border: 'rgba(245,158,11,0.2)' },
  strong:   { label: 'Strong',      color: '#22c55e', bar: '#22c55e', bg: 'rgba(34,197,94,0.08)',     border: 'rgba(34,197,94,0.2)' },
};

export function DrawingCanvas({ entropyLevel, onEntropyChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const entropyDataRef = useRef<number[]>([]);
  const [entropyCount, setEntropyCount] = useState(0);

  const addEntropyPoint = useCallback((x: number, y: number) => {
    entropyDataRef.current.push(x, y, Date.now() % 10000, performance.now() % 10000);
    setEntropyCount(entropyDataRef.current.length);
    onEntropyChange(entropyDataRef.current);
  }, [onEntropyChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 280;
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    addEntropyPoint(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    addEntropyPoint(x, y);
  };

  const stopDrawing = () => setIsDrawing(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    addEntropyPoint(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    addEntropyPoint(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    entropyDataRef.current = [];
    setEntropyCount(0);
    onEntropyChange([]);
  };

  const cfg = levelConfig[entropyLevel];
  const pointsCollected = Math.floor(entropyCount / 4);
  const pointsTarget = Math.floor(STRONG_THRESHOLD / 4);
  const progressValue = Math.min((entropyCount / STRONG_THRESHOLD) * 100, 100);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: '#0a0a0a',
        border: `1px solid ${isDrawing ? '#00d4ff40' : '#1a1a1a'}`,
        boxShadow: isDrawing ? '0 0 30px rgba(0,212,255,0.08)' : 'none',
      }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-white mb-1">Draw to Generate Entropy</h2>
          <p className="text-sm text-zinc-500">
            Draw freely on the canvas below — mouse or touch supported.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCanvas}
          disabled={entropyCount === 0}
          className="text-zinc-600 hover:text-red-400 hover:bg-red-950/30 h-8 gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>

      {/* Canvas area */}
      <div className="relative mx-6 mb-4 rounded-lg overflow-hidden"
        style={{ border: '1px solid #161616', background: '#050505' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height: 280, touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
        {entropyCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <p className="text-sm text-zinc-600">Draw anything to start collecting entropy</p>
          </div>
        )}
      </div>

      {/* Progress & status */}
      <div className="px-6 pb-5 space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-600">Entropy collected</span>
            <span className="text-xs font-mono" style={{ color: cfg.color }}>
              {pointsCollected} / {pointsTarget} points
            </span>
          </div>
          <div className="h-1 rounded-full w-full" style={{ background: '#1a1a1a' }}>
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: `${progressValue}%`,
                background: cfg.bar,
                boxShadow: progressValue > 0 ? `0 0 10px ${cfg.bar}60` : 'none',
              }}
            />
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600">Status:</span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: cfg.color, boxShadow: entropyLevel === 'strong' ? `0 0 6px ${cfg.color}` : 'none' }}
            />
            {cfg.label}
          </span>
          {entropyLevel === 'strong' && (
            <span className="text-xs text-zinc-600">— ready to generate</span>
          )}
        </div>
      </div>
    </div>
  );
}
