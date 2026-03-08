"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const STRONG_THRESHOLD = 120;

interface DrawingCanvasProps {
  entropyLevel: 'weak' | 'moderate' | 'strong';
  onEntropyChange: (entropy: number[]) => void;
}

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
    canvas.height = 300;

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Mouse handlers
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

  // Touch handlers
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

  const badgeColor: Record<'weak' | 'moderate' | 'strong', string> = {
    strong:   'bg-green-900/30 text-green-400 hover:bg-green-900/30 border-green-700',
    moderate: 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/30 border-yellow-700',
    weak:     'bg-red-900/30 text-red-400 hover:bg-red-900/30 border-red-700',
  };

  const progressColor: Record<'weak' | 'moderate' | 'strong', string> = {
    strong:   '[&>div]:bg-green-500',
    moderate: '[&>div]:bg-yellow-500',
    weak:     '[&>div]:bg-red-500',
  };

  const pointsCollected = Math.floor(entropyCount / 4);
  const pointsTarget = Math.floor(STRONG_THRESHOLD / 4);
  const progressValue = Math.min((entropyCount / STRONG_THRESHOLD) * 100, 100);

  return (
    <Card className="bg-slate-800 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Draw to Generate Entropy
        </CardTitle>
        <p className="text-sm text-slate-300">
          Draw freely to introduce user-specific randomness. Works with mouse and touch.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full border border-slate-600 rounded-lg bg-slate-900 cursor-crosshair"
            style={{ height: 300, touchAction: 'none' }}
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-500">Start drawing...</p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Entropy collected</span>
            <span>{pointsCollected} / {pointsTarget} points</span>
          </div>
          <Progress
            value={progressValue}
            className={`h-2 bg-slate-700 ${progressColor[entropyLevel]}`}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Entropy Level:</span>
            <Badge className={badgeColor[entropyLevel]}>
              {entropyLevel.charAt(0).toUpperCase() + entropyLevel.slice(1)}
            </Badge>
          </div>

          <Button
            variant="outline"
            onClick={clearCanvas}
            disabled={entropyCount === 0}
          >
            Clear Drawing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
