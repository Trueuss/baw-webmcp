'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/how', label: 'How it works' },
  { href: '/stylelab', label: 'Style Lab' },
  { href: '/stylist', label: 'Pair Stylist' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/pricing', label: 'Pricing' }
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="brand" aria-label="BAW home">
        <span className="brand-mark">B</span>
        <span className="brand-mark">A</span>
        <span className="brand-mark">W</span>
      </Link>
      <div className="nav-links">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
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
      <Link href="/stylelab" className="nav-cta">
        Try the demo →
      </Link>
    </nav>
  );
}
