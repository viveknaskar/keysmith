import { ExternalLink, CheckCircle2 } from 'lucide-react';

const features = [
  'Password complexity & entropy analysis',
  'Dictionary & pattern attack resistance',
  'Time-to-crack estimates',
  'Common substitution detection',
];

export function PasswordStrengthTester() {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-white mb-1.5">Verify with an External Tool</h2>
          <p className="text-sm text-zinc-500 mb-4">
            Use Bitwarden's security analysis to independently verify your password strength.
          </p>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-500">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#22c55e' }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0">
          <a
            href="https://bitwarden.com/password-strength/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: '#111',
              border: '1px solid #222',
              color: '#999',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#333';
              (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222';
              (e.currentTarget as HTMLAnchorElement).style.color = '#999';
            }}
          >
            Open Bitwarden
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
