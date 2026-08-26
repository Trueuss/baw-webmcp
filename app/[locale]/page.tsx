import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '../../i18n/routing';
import { InviteForm } from '@/components/brand/InviteForm';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeInner />;
}

function HomeInner() {
  const t = useTranslations('home');
  const tp = useTranslations('pricing');
  const tc = useTranslations('common');
  const tn = useTranslations('nav');
  const tf = useTranslations('footer');

  const marquee = t.raw('marquee') as string[];

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container-x">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">{t('meta_eyebrow')}</div>
              <h1>
                {t('hero_title')}{' '}
                <em>{t('hero_title_emph')}</em>
              </h1>
              <p className="hero-tag">{t('hero_subtitle')}</p>
              <div className="hero-cta">
                <Link href="/stylelab" className="btn btn-primary">
                  {t('hero_cta_primary')} →
                </Link>
                <Link href="/stylist" className="btn btn-ghost">
                  {t('hero_cta_secondary')}
                </Link>
              </div>
              <div className="hero-meta">
                <span>{t('hero_meta_1')}</span>
                <span>{t('hero_meta_2')}</span>
                <span>{t('hero_meta_3')}</span>
              </div>
            </div>
            <div className="hero-side">
              <div className="hero-side-text">
                <h3>{t('hero_card_label')}</h3>
                <p className="mono" style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  {t('hero_card_caption')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {marquee.concat(marquee).map((m, i) => (
            <span key={i}>{i === marquee.length * 2 - 1 ? <em>{m}</em> : m}</span>
          ))}
        </div>
      </div>

      {/* DEMO */}
      <section className="section demo-wrap" id="demo">
        <div className="container-x">
          <div className="section-head">
            <span className="num">{t('demo_eyebrow')}</span>
            <h2>
              {t('demo_title')}{' '}
              <em>{t('demo_title_emph')}</em>
            </h2>
          </div>
          <p style={{ maxWidth: 640, color: 'var(--muted)', fontSize: 18, lineHeight: 1.6 }}>
            {t('demo_blurb')}
          </p>
          <div className="demo">
            <div className="demo-left">
              <h3>{t('demo_left_title')}</h3>
              <p className="mono" style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                {t('demo_left_chip')}
              </p>
              <div className="demo-actions">
                <div className="demo-drop">
                  <div className="drop-icon">⌬</div>
                  <div className="drop-text">
                    <strong>{t('demo_drop_garment_title')}</strong>
                    <span>{t('demo_drop_garment_sub')}</span>
                  </div>
                </div>
                <div className="demo-drop">
                  <div className="drop-icon">◉</div>
                  <div className="drop-text">
                    <strong>{t('demo_drop_selfie_title')}</strong>
                    <span>{t('demo_drop_selfie_sub')}</span>
                  </div>
                </div>
                <Link href="/stylelab" className="btn btn-primary" style={{ marginTop: 12 }}>
                  {t('demo_analyze_cta')} →
                </Link>
                <p className="mono" style={{ color: 'var(--muted-2)', fontSize: 12 }}>
                  {t('demo_caption')}
                </p>
              </div>
            </div>
            <div className="demo-right">
              <div className="demo-result">
                <div className="result-head">
                  <h4>{t('demo_result_title')}</h4>
                  <div className="overall">
                    8.6 <small>{t('demo_result_score')}</small>
                  </div>
                </div>
                {[
                  { l: t('axis_silhouette'), v: 87 },
                  { l: t('axis_palette'), v: 92 },
                  { l: t('axis_texture'), v: 78 },
                  { l: t('axis_occasion'), v: 86 }
                ].map((row) => (
                  <div className="score-row" key={row.l}>
                    <span className="label">{row.l}</span>
                    <span className="bar"><i style={{ width: `${row.v}%` }} /></span>
                    <span className="num">{(row.v / 10).toFixed(1)}</span>
                  </div>
                ))}
                <div className="result-notes">
                  <p>
                    <strong>Silhouette.</strong> {t('demo_note_silhouette')}
                  </p>
                  <p>
                    <strong>Palette.</strong> {t('demo_note_palette')}
                  </p>
                  <p>
                    <strong>Next time.</strong> {t('demo_note_next')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="section" id="how">
        <div className="container-x">
          <div className="section-head">
            <span className="num">{t('pillars_eyebrow')}</span>
            <h2>
              {t('pillars_title')}{' '}
              <em>{t('pillars_title_emph')}</em>
            </h2>
          </div>
          <div className="pillars">
            {[
              { num: t('pillar_1_num'), title: t('pillar_1_title'), body: t('pillar_1_body'), meta: t('pillar_1_meta') },
              { num: t('pillar_2_num'), title: t('pillar_2_title'), body: t('pillar_2_body'), meta: t('pillar_2_meta') },
              { num: t('pillar_3_num'), title: t('pillar_3_title'), body: t('pillar_3_body'), meta: t('pillar_3_meta') }
            ].map((p, i) => (
              <div className="pillar" key={i}>
                <div className="pp-num">{p.num}</div>
                <h3 dangerouslySetInnerHTML={{ __html: p.title }} />
                <p>{p.body}</p>
                <div className="pp-meta">
                  <span className="bar" /> {p.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="section privacy" id="privacy">
        <div className="container-x">
          <div className="section-head">
            <span className="num">{t('privacy_eyebrow')}</span>
            <h2>
              {t('privacy_title')}{' '}
              <em>{t('privacy_title_emph')}</em>
            </h2>
          </div>
          <div className="privacy-grid">
            <div>
              <p style={{ color: '#b4b4b4', fontSize: 18, lineHeight: 1.7, maxWidth: 460 }}>
                {t('privacy_blurb')}
              </p>
              <div className="privacy-callout">
                <pre style={{ margin: 0, fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12.5, color: '#d6d6d6', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {t('privacy_trace')}
                </pre>
              </div>
            </div>
            <div className="privacy-points">
              {[
                { num: t('privacy_1_num'), title: t('privacy_1_title'), body: t('privacy_1_body') },
                { num: t('privacy_2_num'), title: t('privacy_2_title'), body: t('privacy_2_body') },
                { num: t('privacy_3_num'), title: t('privacy_3_title'), body: t('privacy_3_body') }
              ].map((p, i) => (
                <div className="pp" key={i}>
                  <div className="pp-num">{p.num}</div>
                  <h4>{p.title}</h4>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RITUAL */}
      <section className="section" id="ritual">
        <div className="container-x">
          <div className="section-head">
            <span className="num">{t('ritual_eyebrow')}</span>
            <h2>
              {t('ritual_title')}{' '}
              <em>{t('ritual_title_emph')}</em>
            </h2>
          </div>
          <div className="steps">
            {[
              { num: t('ritual_1_num'), title: t('ritual_1_title'), body: t('ritual_1_body'), meta: t('ritual_1_meta') },
              { num: t('ritual_2_num'), title: t('ritual_2_title'), body: t('ritual_2_body'), meta: t('ritual_2_meta') },
              { num: t('ritual_3_num'), title: t('ritual_3_title'), body: t('ritual_3_body'), meta: t('ritual_3_meta') }
            ].map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{s.num}</div>
                <h3 dangerouslySetInnerHTML={{ __html: s.title }} />
                <p>{s.body}</p>
                <div className="step-meta">
                  <i /> {s.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOOKBOOK preview */}
      <section className="section" id="lookbook-preview">
        <div className="container-x">
          <div className="section-head">
            <span className="num">{t('lookbook_eyebrow')}</span>
            <h2>
              {t('lookbook_title')}{' '}
              <em>{t('lookbook_title_emph')}</em>
            </h2>
          </div>
          <div className="showcase-grid">
            {[
              { id: '042', name: 'oversized blazer · cropped trouser · white leather sneaker', score: '9.2', items: 'FLATLAY · 3 ITEMS' },
              { id: '017', name: 'white oxford · raw denim · chelsea boot', score: '8.8', items: 'BUSINESS-CASUAL' },
              { id: '009', name: 'black turtleneck · black trouser · white sneaker', score: '7.4', items: 'TOTAL WHITE' },
              { id: '028', name: 'stripe contrast blazer · black trouser', score: '9.0', items: 'EVENING' }
            ].map((look) => (
              <Link key={look.id} href="/lookbook" className="look">
                <div className="look-img" />
                <div className="look-meta">
                  <strong>look no. {look.id}</strong>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>{look.name}</div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small>{look.items}</small>
                    <small style={{ color: 'var(--ink)' }}>{look.score}/10</small>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/lookbook" className="btn btn-ghost">{t('lookbook_link')}</Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="container-x">
          <div className="section-head">
            <span className="num">{t('pricing_eyebrow')}</span>
            <h2>
              {t('pricing_title')}{' '}
              <em>{t('pricing_title_emph')}</em>
            </h2>
          </div>
          <div className="pricing-grid">
            {[
              { key: 'plan_free', featured: false, bulletsKey: 'plan_free_bullets', ctaKey: 'plan_free_cta' },
              { key: 'plan_studio', featured: true,  bulletsKey: 'plan_studio_bullets', ctaKey: 'plan_studio_cta' },
              { key: 'plan_atelier', featured: false, bulletsKey: 'plan_atelier_bullets', ctaKey: 'plan_atelier_cta' }
            ].map((plan) => {
              const bullets = tp.raw(plan.bulletsKey) as string[];
              return (
                <div className={`plan${plan.featured ? ' featured' : ''}`} key={plan.key}>
                  <div className="eyebrow">{tp(`${plan.key}_eyebrow`)}</div>
                  <div className="plan-name">{tp(`${plan.key}_name`)}</div>
                  <div className="plan-price">
                    {tp(`${plan.key}_price`)} <small>{tp(`${plan.key}_period`)}</small>
                  </div>
                  <ul>
                    {bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                  <Link href="/stylelab" className={`btn ${plan.featured ? 'btn-accent' : 'btn-ghost'}`} style={{ marginTop: 'auto' }}>
                    {tp(plan.ctaKey)} →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-strip">
        <div className="container-x">
          <h2>
            {t('cta_title')}{' '}
            <em>{t('cta_title_emph')}</em>{' '}
            {t('cta_title_suffix')}
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: 540, margin: '20px auto 0' }}>
            {t('cta_blurb')}
          </p>
          <InviteForm />
          <small>{t('cta_meta')}</small>
        </div>
      </section>
    </main>
  );
}
