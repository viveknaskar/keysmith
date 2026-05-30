import { ShieldCheck, Activity, Eye, Ban } from 'lucide-react';

const points = [
  {
    icon: Activity,
    title: 'Entropy estimate',
    text: 'Bits of entropy from your chosen length and character set. The more bits, the more guesses an attacker needs.',
  },
  {
    icon: Eye,
    title: 'zxcvbn pattern analysis',
    text: 'Detects dictionary words, keyboard walks, repeats, and common substitutions that raw entropy alone misses.',
  },
  {
    icon: ShieldCheck,
    title: 'Crack-time estimate',
    text: 'How long a sustained 1-trillion-guess-per-second attack would take, on average, to find your password.',
  },
];

export function PasswordStrengthTester() {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#141417', border: '1px solid #26262b' }}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white mb-1.5">Strength is analyzed right here</h2>
        <p className="text-sm text-zinc-500">
          Every password is scored locally in your browser, with no need to test it anywhere else.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {points.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-lg p-4"
            style={{ background: '#1a1a1e', border: '1px solid #222227' }}
          >
            <Icon className="w-4 h-4 mb-2.5" style={{ color: '#7aa2f7' }} />
            <div className="text-sm font-medium text-white mb-1">{title}</div>
            <p className="text-xs text-zinc-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div
        className="flex items-start gap-2.5 rounded-lg px-3.5 py-3"
        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <Ban className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-600/90 leading-relaxed">
          <span className="font-medium text-amber-500">Never paste a real password into any website</span>{' '}
          to &ldquo;check&rdquo; it, including ones that claim to run locally. A password you intend to use should only
          ever be typed into the account it belongs to. The analysis above happens entirely in this tab and is never sent anywhere.
        </p>
      </div>
    </div>
  );
}
