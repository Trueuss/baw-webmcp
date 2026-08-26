'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Cmd {
  id: string;
  label: string;
  hint: string;
  run: (router: ReturnType<typeof useRouter>) => void;
}

const CMDS: Cmd[] = [
  {
    id: 'home',
    label: 'Go home',
    hint: '↩',
    run: (r) => r.push('/')
  },
  {
    id: 'lab',
    label: 'Open Style Lab',
    hint: 'L',
    run: (r) => r.push('/stylelab')
  },
  {
    id: 'stylist',
    label: 'Open Pair Stylist',
    hint: 'A',
    run: (r) => r.push('/stylist')
  },
  {
    id: 'how',
    label: 'How it works',
    hint: '?',
    run: (r) => r.push('/how')
  },
  {
    id: 'privacy',
    label: 'Privacy',
    hint: 'P',
    run: (r) => r.push('/privacy')
  },
  {
    id: 'tools',
    label: 'Tools for agents',
    hint: 'T',
    run: (r) => r.push('/tools')
  },
  {
    id: 'lookbook',
    label: 'Lookbook',
    hint: 'B',
    run: (r) => r.push('/lookbook')
  },
  {
    id: 'pricing',
    label: 'Pricing',
    hint: '$',
    run: (r) => r.push('/pricing')
  }
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

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

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filtered = CMDS.filter((c) =>
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
          placeholder="Type a command — or hit ⌘K from anywhere"
          className="cmd-input"
        />
        <div className="cmd-list">
          {filtered.length === 0 ? (
            <div className="cmd-empty">No matches. Try &ldquo;lab&rdquo; or &ldquo;stylist&rdquo;.</div>
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
                <span className="cmd-hint">{c.hint}</span>
              </button>
            ))
          )}
        </div>
        <div className="cmd-foot">
          <span>esc to close</span>
          <span>↵ to run</span>
        </div>
      </div>
    </div>
  );
}
