'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notfound');
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
      <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn-primary">{t('home')}</Link>
        <Link href="/stylelab" className="btn btn-ghost">{t('lab')}</Link>
        <Link href="/stylist" className="btn btn-ghost">{t('stylist')}</Link>
      </div>
    </main>
  );
}
