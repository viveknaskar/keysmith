import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// GitHub Pages project site served from https://viveknaskar.github.io/keysmith/.
// Next does NOT apply basePath to metadata icon/OG-image URLs, so we prefix them
// ourselves. basePath is empty in dev so local URLs stay at the root.
const basePath = process.env.NODE_ENV === 'production' ? '/keysmith' : '';
const siteOrigin = 'https://viveknaskar.github.io';
const siteUrl = `${siteOrigin}${basePath}`;
const ogImage = `${siteUrl}/og.png`;
const title = 'Keysmith: Strong Passwords, Generated In Your Browser';
const description =
  'Generate strong, high-entropy passwords and passphrases entirely in your browser using the Web Crypto CSPRNG. No network requests, nothing stored.';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  keywords: ['password generator', 'passphrase', 'entropy', 'CSPRNG', 'security', 'privacy'],
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Keysmith',
    title,
    description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} style={{ background: '#050505' }}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          {children}
          <Toaster
            position="bottom-center"
            theme="dark"
            richColors
            toastOptions={{
              style: {
                background: '#111',
                border: '1px solid #222',
                color: '#fff',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
