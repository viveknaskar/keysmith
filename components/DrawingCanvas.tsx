"use client";

import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DrawingCanvasProps {
  entropyLevel: 'weak' | 'moderate' | 'strong';
  onEntropyChange: (entropy: number[]) => void;
}

export function DrawingCanvas({ entropyLevel, onEntropyChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [entropyData, setEntropyData] = useState<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Set drawing styles
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Add entropy data point
    const newEntropy = [...entropyData, x, y, Date.now() % 1000];
    setEntropyData(newEntropy);
    onEntropyChange(newEntropy);
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

    // Add entropy data point
    const newEntropy = [...entropyData, x, y, Date.now() % 1000];
    setEntropyData(newEntropy);
    onEntropyChange(newEntropy);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEntropyData([]);
    onEntropyChange([]);
  };

  const getBadgeVariant = (level: 'weak' | 'moderate' | 'strong') => {
    switch (level) {
      case 'strong': return 'default';
      case 'moderate': return 'secondary';
      case 'weak': return 'destructive';
      default: return 'secondary';
    }
  };

  const getBadgeColor = (level: 'weak' | 'moderate' | 'strong') => {
    switch (level) {
      case 'strong': return 'bg-green-900/30 text-green-400 hover:bg-green-900/30 border-green-700';
      case 'moderate': return 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/30 border-yellow-700';
      case 'weak': return 'bg-red-900/30 text-red-400 hover:bg-red-900/30 border-red-700';
      default: return '';
    }
  };

  return (
    <Card className="bg-slate-800 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Draw to Generate Entropy
        </CardTitle>
        <p className="text-sm text-slate-300">
          Draw freely to introduce user-specific randomness. This data will be used in password generation.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-75 border border-slate-600 rounded-lg bg-slate-900 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          {entropyData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-500">Start drawing...</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Entropy Level:</span>
            <Badge 
              variant={getBadgeVariant(entropyLevel)}
              className={getBadgeColor(entropyLevel)}
            >
              {entropyLevel.charAt(0).toUpperCase() + entropyLevel.slice(1)}
            </Badge>
          </div>
          
          <Button 
            variant="outline" 
            onClick={clearCanvas}
            disabled={entropyData.length === 0}
          >
            Clear Drawing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}