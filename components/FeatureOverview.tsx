import { PenTool, Cloud, Lock, Cpu } from 'lucide-react';

const features = [
  {
    icon: PenTool,
    title: 'Canvas Entropy',
    description: 'Your drawing patterns introduce unpredictable, human-sourced randomness.',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.12)',
  },
  {
    icon: Cloud,
    title: 'Weather Data',
    description: 'Live atmospheric readings add real-world, external entropy to every password.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.12)',
  },
  {
    icon: Cpu,
    title: 'Device Timing',
    description: 'Sub-millisecond timing and hardware fingerprint data amplify unpredictability.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.12)',
  },
  {
    icon: Lock,
    title: 'HKDF SHA-256',
    description: 'All entropy sources are cryptographically mixed via HKDF with SHA-256.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
  },
];

export function FeatureOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((feature, index) => (
        <div
          key={index}
          className="group relative rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = feature.color + '40';
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${feature.glow}`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
            style={{
              background: feature.glow,
              border: `1px solid ${feature.color}30`,
            }}
          >
            <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1.5">{feature.title}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
