import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// TODO: set this to your real deployed URL before launch so share cards resolve.
const siteUrl = 'https://entropypass.app';
const title = 'EntropyPass: Strong Passwords, Generated In Your Browser';
const description =
  'Generate strong, high-entropy passwords and passphrases entirely in your browser using the Web Crypto CSPRNG. No network requests, nothing stored.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: ['password generator', 'passphrase', 'entropy', 'CSPRNG', 'security', 'privacy'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'EntropyPass',
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
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
