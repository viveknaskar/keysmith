import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EntropyPass — Strong Passwords, Generated In Your Browser',
  description: 'Generate strong, high-entropy passwords and passphrases entirely in your browser using the Web Crypto CSPRNG. No network requests, nothing stored.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
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
