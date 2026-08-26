'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const CMDS = (labels: { how: string; lab: string; stylist: string; tools: string; privacy: string; lookbook: string; pricing: string }) => [
  { id: 'home', label: labels.how ? 'Go home' : '首页', run: (r: ReturnType<typeof useRouter>) => r.push('/') },
  { id: 'lab', label: labels.lab, run: (r: ReturnType<typeof useRouter>) => r.push('/stylelab') },
  { id: 'stylist', label: labels.stylist, run: (r: ReturnType<typeof useRouter>) => r.push('/stylist') },
  { id: 'how', label: labels.how, run: (r: ReturnType<typeof useRouter>) => r.push('/how') },
  { id: 'privacy', label: labels.privacy, run: (r: ReturnType<typeof useRouter>) => r.push('/privacy') },
  { id: 'tools', label: labels.tools, run: (r: ReturnType<typeof useRouter>) => r.push('/tools') },
  { id: 'lookbook', label: labels.lookbook, run: (r: ReturnType<typeof useRouter>) => r.push('/lookbook') },
  { id: 'pricing', label: labels.pricing, run: (r: ReturnType<typeof useRouter>) => r.push('/pricing') }
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('command_palette');
  const tn = useTranslations('nav');

  const labels = {
    how: tn('how'),
    lab: tn('stylelab'),
    stylist: tn('stylist'),
    tools: tn('tools'),
    privacy: 'Privacy',
    lookbook: tn('lookbook'),
    pricing: tn('pricing')
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const cmds = CMDS(labels);
  const filtered = cmds.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="cmd-overlay"
      role="dialog"
      aria-modal
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="cmd-panel">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          className="cmd-input"
        />
        <div className="cmd-list">
          {filtered.length === 0 ? (
            <div className="cmd-empty">{t('empty')}</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                className="cmd-item"
                onClick={() => {
                  c.run(router);
                  setOpen(false);
                }}
              >
                <span>{c.label}</span>
                <span className="cmd-hint">↵</span>
              </button>
            ))
          )}
        </div>
        <div className="cmd-foot">
          <span>{t('esc')}</span>
          <span>{t('enter')}</span>
        </div>
      </div>
    </div>
  );
}
