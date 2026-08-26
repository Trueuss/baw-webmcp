'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('BAW route error', error);
  }, [error]);

  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120, textAlign: 'center' }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>{t('eyebrow')}</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)' }}>
        {t('title')}{' '}
        <em>{t('title_emph')}</em>
      </h1>
      <p
        style={{
          color: 'var(--muted)',
          maxWidth: 540,
          margin: '24px auto 0',
          fontSize: 17,
          lineHeight: 1.6
        }}
      >
        {t('body')}
      </p>
      {error.digest && (
        <p className="mono" style={{ marginTop: 18, fontSize: 12, color: 'var(--muted-2)' }}>
          {t('digest')} · {error.digest}
        </p>
      )}
      <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={reset} className="btn btn-primary">{t('retry')}</button>
        <Link href="/" className="btn btn-ghost">{t('home')}</Link>
      </div>
    </main>
  );
}
