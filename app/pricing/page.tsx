import Link from 'next/link';

export const metadata = { title: 'Pricing' };

const PLANS = [
  {
    name: 'Local',
    price: '¥0',
    period: '/ month',
    eyebrow: 'Free',
    featured: false,
    bullets: [
      'Local inference · no signup · core scoring',
      '5 outfit scores per day',
      '1.3B on-device vision model',
      'Basic silhouette / palette / occasion scores',
      '7-day outfit diary',
      'WebMCP agent access (read-only tools)'
    ],
    cta: 'Get started'
  },
  {
    name: 'Studio',
    price: '¥39',
    period: '/ month',
    eyebrow: 'Studio · most loved',
    featured: true,
    bullets: [
      'Unlimited outfit scores',
      '7B vision model in the cloud (login required)',
      'Multi-axis deep analysis · trend compare',
      'Permanent outfit diary',
      'Weekly wardrobe health report',
      'Style inspiration feed',
      'WebMCP agent access (read + write tools)'
    ],
    cta: 'Start free trial'
  },
  {
    name: 'Atelier',
    price: 'Custom',
    period: '/ by quote',
    eyebrow: 'Atelier',
    featured: false,
    bullets: [
      'For buyers, stylists, brands',
      'Team workspaces · multi-client profiles',
      'Private model fine-tune on your SKU',
      'API &amp; Shopify integration',
      'Dedicated stylist partner',
      'Customer data stays on-prem'
    ],
    cta: 'Talk to us'
  }
];

export default function Pricing() {
  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>// 06 · pricing</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        Free to start. <em>Upgrade when you&rsquo;re hooked.</em>
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 640, marginTop: 24 }}>
        The local engine is free forever. We charge for the deeper cloud model,
        team features, and bespoke fine-tunes.
      </p>

      <div className="pricing-grid" style={{ marginTop: 64 }}>
        {PLANS.map((plan) => (
          <div className={`plan${plan.featured ? ' featured' : ''}`} key={plan.name}>
            <div className="eyebrow">{plan.eyebrow}</div>
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">
              {plan.price} <small>{plan.period}</small>
            </div>
            <ul>
              {plan.bullets.map((b) => (
                <li key={b} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
            <Link href="/stylelab" className={`btn ${plan.featured ? 'btn-accent' : 'btn-ghost'}`} style={{ marginTop: 'auto' }}>
              {plan.cta} →
            </Link>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 96 }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>FAQ</h2>
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {[
            {
              q: 'Is my wardrobe really private?',
              a: 'Yes. The default scoring engine runs in your browser via WebGPU + WASM. We never see your images. Open DevTools and watch it not phone home.'
            },
            {
              q: 'Do I need an account?',
              a: 'No. The local engine works without signup. Studio (cloud) does require a login so we can sync your unlimited diary.'
            },
            {
              q: 'What is WebMCP?',
              a: 'A new browser standard that lets a page expose structured tools to AI agents. BAW uses it so any trusted agent can call list_wardrobe, analyze_outfit, propose_outfit, and friends — with your approval on every write.'
            },
            {
              q: 'Can I use BAW on mobile?',
              a: 'Yes. The 1.3B model fits on a modern phone NPU. Older devices fall back to a smaller quantised checkpoint.'
            }
          ].map((f) => (
            <div key={f.q}>
              <h3 style={{ fontSize: 22 }}>{f.q}</h3>
              <p style={{ color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
