import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function How({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HowInner />;
}

function HowInner() {
  const t = useTranslations('how');
  const loopItems = t.raw('loop_items') as string[];
  const notItems = t.raw('not_items') as string[];

  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>{t('eyebrow')}</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        {t('title')}{' '}
        <em>{t('title_emph')}</em>{' '}
        {t('title_suffix')}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 640, marginTop: 24 }}>
        {t('lead')}
      </p>

      <div className="prose-baw" style={{ marginTop: 64 }}>
        <h2>{t('h_signal')}</h2>
        <p>{t('p_signal')}</p>

        <h2>{t('h_privacy')}</h2>
        <p>{t('p_privacy')}</p>

        <h2>{t('h_webmcp')}</h2>
        <p>{t('p_webmcp')}</p>

        <h2>{t('h_loop')}</h2>
        <ul>
          {loopItems.map((it) => <li key={it}>{it}</li>)}
        </ul>

        <h2>{t('h_not')}</h2>
        <ul>
          {notItems.map((it) => <li key={it}>{it}</li>)}
        </ul>

        <div style={{ marginTop: 56, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/stylelab" className="btn btn-primary">{t('cta_lab')}</Link>
          <Link href="/stylist" className="btn btn-ghost">{t('cta_stylist')}</Link>
        </div>
      </div>
    </main>
  );
}
