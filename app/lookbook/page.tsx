import Link from 'next/link';

export const metadata = { title: 'Lookbook' };

const LOOKS = [
  { id: '042', name: 'oversized blazer · cropped trouser · white leather sneaker', score: 9.2, items: 'FLATLAY · 3 ITEMS', tag: 'creative' },
  { id: '017', name: 'white oxford · raw denim · chelsea boot', score: 8.8, items: 'BUSINESS-CASUAL', tag: 'business-casual' },
  { id: '009', name: 'black turtleneck · black trouser · white sneaker', score: 7.4, items: 'TOTAL WHITE EDITION', tag: 'minimal' },
  { id: '028', name: 'stripe contrast blazer · black trouser', score: 9.0, items: 'EVENING', tag: 'formal' },
  { id: '033', name: 'oversized blazer · merino turtleneck · cropped trouser', score: 8.4, items: 'SMART-CASUAL', tag: 'creative' },
  { id: '045', name: 'white oxford · raw denim · white leather sneaker', score: 8.1, items: 'WEEKEND', tag: 'casual' },
  { id: '019', name: 'turtleneck · raw denim · chelsea boot', score: 8.6, items: 'EVENING', tag: 'formal' },
  { id: '051', name: 'oversized blazer · cropped trouser · chelsea', score: 9.4, items: 'BUSINESS-CASUAL', tag: 'business-casual' }
];

export default function Lookbook() {
  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>// 05 · lookbook</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        A style diary, <em>written in black &amp; white.</em>
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 640, marginTop: 24 }}>
        Every look below was scored by the on-device model. Tap a card to see
        the full four-axis breakdown and the per-piece silhouette trace.
      </p>

      <div className="showcase-grid" style={{ marginTop: 64 }}>
        {LOOKS.map((look) => (
          <Link key={look.id} href={`/stylelab?look=${look.id}`} className="look">
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

      <div style={{ marginTop: 96, padding: 40, background: 'var(--paper-2)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
          Your wardrobe is the <em>real</em> lookbook.
        </h2>
        <p style={{ color: 'var(--muted)', maxWidth: 520, margin: '20px auto 0' }}>
          Add your pieces, score an outfit, and start your own diary. The lookbook
          below will keep growing as you do.
        </p>
        <Link href="/stylelab" className="btn btn-primary" style={{ marginTop: 24 }}>
          Open the Style Lab →
        </Link>
      </div>
    </main>
  );
}
