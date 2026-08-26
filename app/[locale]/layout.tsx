import type { Metadata, Viewport } from 'next';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { WebMCPBanner } from '@/components/brand/WebMCPBanner';
import { Nav } from '@/components/brand/Nav';
import { Footer } from '@/components/brand/Footer';
import { CommandPalette } from '@/components/brand/CommandPalette';
import { WebMCPProvider } from '@/lib/webmcp/provider';
import { routing } from '@/i18n/routing';
import '../globals.css';

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
    title: 'BAW · Pair Stylist — A privacy-first AI stylist for humans and agents.',
    description:
      'A privacy-first AI stylist that lives in your browser. 12 WebMCP tools let any agent collaborate with you on what you wear.',
    type: 'website',
    siteName: 'BAW',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'BAW · Black and White, dressed by intelligence.'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BAW · Pair Stylist',
    description: 'A privacy-first AI stylist that lives in your browser, with WebMCP tools for any agent.',
    images: ['/opengraph-image']
  }
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a'
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'nav' });
  const navLabels = {
    home: t('home'),
    how: t('how'),
    stylelab: t('stylelab'),
    stylist: t('stylist'),
    tools: t('tools'),
    lookbook: t('lookbook'),
    pricing: t('pricing'),
    try_demo: t('try_demo')
  };

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <WebMCPProvider />
          <WebMCPBanner />
          <Nav labels={navLabels} locale={locale} />
          <CommandPalette />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
