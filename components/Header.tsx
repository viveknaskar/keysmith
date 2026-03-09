"use client";

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="relative text-center py-12">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute right-0 top-4"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>

      <h1 className="text-4xl font-bold text-white mb-4">
        EntropyPass
      </h1>
      <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
        Generate secure, high-entropy passwords using real-world randomness like drawing input,
        device timing, and live weather data.
      </p>
      <p className="text-sm text-slate-400 mt-2">
        Smart Passwords from Real-World Entropy
      </p>
    </header>
  );
}
