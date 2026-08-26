import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PricingInner />;
}

function PricingInner() {
  const t = useTranslations('pricing');
  const plans = [
    { key: 'plan_free',    featured: false, bulletsKey: 'plan_free_bullets',    ctaKey: 'plan_free_cta' },
    { key: 'plan_studio',  featured: true,  bulletsKey: 'plan_studio_bullets',  ctaKey: 'plan_studio_cta' },
    { key: 'plan_atelier', featured: false, bulletsKey: 'plan_atelier_bullets', ctaKey: 'plan_atelier_cta' }
  ];
  const faqs = ['faq_1', 'faq_2', 'faq_3', 'faq_4'];

  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>{t('eyebrow')}</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        {t('title')}{' '}
        <em>{t('title_emph')}</em>
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 640, marginTop: 24 }}>
        {t('lead')}
      </p>

      <div className="pricing-grid" style={{ marginTop: 64 }}>
        {plans.map((plan) => {
          const bullets = t.raw(plan.bulletsKey) as string[];
          return (
            <div className={`plan${plan.featured ? ' featured' : ''}`} key={plan.key}>
              <div className="eyebrow">{t(`${plan.key}_eyebrow`)}</div>
              <div className="plan-name">{t(`${plan.key}_name`)}</div>
              <div className="plan-price">
                {t(`${plan.key}_price`)} <small>{t(`${plan.key}_period`)}</small>
              </div>
              <ul>{bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <Link href="/stylelab" className={`btn ${plan.featured ? 'btn-accent' : 'btn-ghost'}`} style={{ marginTop: 'auto' }}>
                {t(plan.ctaKey)} →
              </Link>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 96 }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>{t('faq_title')}</h2>
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {faqs.map((f) => (
            <div key={f}>
              <h3 style={{ fontSize: 22 }}>{t(`${f}_q`)}</h3>
              <p style={{ color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>{t(`${f}_a`)}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
