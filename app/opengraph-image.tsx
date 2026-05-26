import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'EntropyPass: strong passwords generated in your browser';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0b0b0d',
          backgroundImage:
            'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(122,162,247,0.16) 0%, transparent 70%)',
          color: '#f4f4f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#141417',
              border: '1px solid #26262b',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7aa2f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: '#a1a1aa' }}>EntropyPass</div>
        </div>

        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
          Strong passwords, generated in your browser.
        </div>

        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 32, maxWidth: 860 }}>
          High-entropy passwords and passphrases from the Web Crypto CSPRNG. No network requests, nothing stored.
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
          {['100% client-side', 'Zero data stored', 'Open source'].map(tag => (
            <div
              key={tag}
              style={{
                fontSize: 24,
                color: '#7aa2f7',
                padding: '10px 22px',
                borderRadius: 999,
                background: 'rgba(122,162,247,0.10)',
                border: '1px solid rgba(122,162,247,0.25)',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
