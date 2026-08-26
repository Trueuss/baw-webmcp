'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const LOCALES = ['zh', 'en'] as const;
type Locale = (typeof LOCALES)[number];

const LABELS: Record<Locale, string> = {
  zh: '中',
  en: 'EN'
};

const FULL: Record<Locale, string> = {
  zh: '中文',
  en: 'English'
};

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [isPending, startTransition] = useTransition();

  function onChange(next: Locale) {
    if (next === currentLocale) return;
    startTransition(() => {
      // Strip the current locale prefix (if any), then prepend the next one.
      // /stylelab     -> /en/stylelab     (switch to en)
      // /en/stylelab  -> /stylelab        (switch to zh, default)
      // /en           -> /                (en -> zh)
      const stripped = pathname.replace(/^\/(en|zh)(?=\/|$)/, '') || '/';
      const target =
        next === 'zh'
          ? stripped === '/'
            ? '/'
            : stripped
          : stripped === '/'
            ? '/en'
            : `/${next}${stripped}`;
      router.push(target);
    });
  }

  return (
    <div
      className="locale-switcher"
      role="group"
      aria-label="Language switcher"
    >
      {LOCALES.map((loc) => {
        const active = loc === currentLocale;
        return (
          <button
            key={loc}
            onClick={() => onChange(loc)}
            disabled={isPending || active}
            aria-pressed={active}
            title={FULL[loc]}
            data-active={active ? 'true' : 'false'}
          >
            {LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
