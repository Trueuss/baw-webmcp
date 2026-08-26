import type { Metadata, Viewport } from 'next';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { WebMCPBanner } from '@/components/brand/WebMCPBanner';
import { Nav } from '@/components/brand/Nav';
import { Footer } from '@/components/brand/Footer';
import { WebMCPProvider } from '@/lib/webmcp/provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap'
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://baw-webmcp.vercel.app'),
  title: {
    default: 'BAW — Black and White. Dressed by intelligence.',
    template: '%s · BAW'
  },
  description:
    'BAW is a privacy-first AI stylist that lives entirely in your browser, with WebMCP tools so any agent can collaborate with you on dressing better.',
  applicationName: 'BAW',
  keywords: [
    'AI stylist',
    'outfit',
    'fashion',
    'WebMCP',
    'MCP',
    'agent',
    'privacy',
    'on-device',
    'browser AI'
  ],
  authors: [{ name: 'BAW' }],
  openGraph: {
    title: 'BAW — Black and White. Dressed by intelligence.',
    description:
      'A privacy-first AI stylist that lives entirely in your browser, with WebMCP tools for any agent to collaborate with you.',
    type: 'website',
    siteName: 'BAW'
  },
  twitter: { card: 'summary_large_image', title: 'BAW' }
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <WebMCPProvider />
        <WebMCPBanner />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
