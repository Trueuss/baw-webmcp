'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from './LocaleSwitcher';

interface Labels {
  home: string;
  how: string;
  stylelab: string;
  stylist: string;
  tools: string;
  lookbook: string;
  pricing: string;
  try_demo: string;
}

export function Nav({ labels, locale }: { labels: Labels; locale: string }) {
  const pathname = usePathname() || '/';

  // Strip the locale prefix so internal links work without it (as-needed mode).
  const stripped = pathname.replace(/^\/(en|zh)(?=\/|$)/, '') || '/';

  const links = [
    { href: '/how', label: labels.how },
    { href: '/stylelab', label: labels.stylelab },
    { href: '/stylist', label: labels.stylist },
    { href: '/tools', label: labels.tools },
    { href: '/lookbook', label: labels.lookbook },
    { href: '/pricing', label: labels.pricing }
  ] as const;

  return (
    <nav className="nav">
      <Link href="/" className="brand" aria-label="BAW home">
        <span className="brand-mark">B</span>
        <span className="brand-mark">A</span>
        <span className="brand-mark">W</span>
      </Link>
      <div className="nav-links">
        {links.map((l) => {
          const active = stripped === l.href || stripped.startsWith(l.href + '/');
          return (
            <Link
              key={l.href}
              href={l.href}
              style={active ? { color: 'var(--ink)' } : undefined}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
      <div className="nav-actions">
        <LocaleSwitcher currentLocale={locale} />
        <Link href="/stylelab" className="nav-cta">
          {labels.try_demo}
        </Link>
      </div>
    </nav>
  );
}
