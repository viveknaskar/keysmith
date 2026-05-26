import { Dices, Scale, ScanSearch, WifiOff } from 'lucide-react';

const features = [
  {
    icon: Dices,
    title: 'Browser CSPRNG',
    description: 'Every character comes from crypto.getRandomValues, the browser\'s cryptographically secure RNG.',
  },
  {
    icon: Scale,
    title: 'Unbiased Selection',
    description: 'Rejection sampling discards skewed values, so no character is more likely than any other.',
  },
  {
    icon: ScanSearch,
    title: 'Strength Analysis',
    description: 'Live entropy estimate and zxcvbn pattern detection score every password you generate.',
  },
  {
    icon: WifiOff,
    title: '100% Client-Side',
    description: 'No network requests, no analytics, no storage. Passwords never leave your browser tab.',
  },
];

export function FeatureOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {features.map((feature, index) => (
        <div
          key={index}
          className="group rounded-xl p-5 transition-colors duration-200"
          style={{ background: '#141417', border: '1px solid #26262b' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#34343c';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#26262b';
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
            style={{ background: '#1a1a1e', border: '1px solid #26262b' }}
          >
            <feature.icon className="w-4.5 h-4.5" style={{ color: '#7aa2f7' }} />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1.5">{feature.title}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
