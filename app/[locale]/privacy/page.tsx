import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyInner />;
}

function PrivacyInner() {
  const t = useTranslations('privacy');
  const items6 = t.raw('items_6') as string[];

  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>{t('eyebrow')}</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        {t('title')}{' '}
        <em>{t('title_emph')}</em>
      </h1>

      <div className="prose-baw" style={{ marginTop: 64 }}>
        <p style={{ fontSize: 20, color: 'var(--ink-soft)' }}>{t('lead')}</p>

        <h2>{t('h_1')}</h2>
        <p>{t('p_1')}</p>

        <h2>{t('h_2')}</h2>
        <p>{t('p_2')}</p>

        <h2>{t('h_3')}</h2>
        <p>{t('p_3')}</p>

        <h2>{t('h_4')}</h2>
        <p>{t('p_4')}</p>

        <h2>{t('h_5')}</h2>
        <p>{t('p_5')}</p>

        <h2>{t('h_6')}</h2>
        <ul>{items6.map((it) => <li key={it}>{it}</li>)}</ul>

        <div style={{ marginTop: 56, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/stylelab" className="btn btn-primary">{t('cta_lab')}</Link>
          <Link href="/how" className="btn btn-ghost">{t('cta_how')}</Link>
        </div>
      </div>
    </main>
  );
}
