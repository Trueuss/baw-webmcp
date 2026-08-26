import Link from 'next/link';

export const metadata = { title: 'How it works' };

export default function How() {
  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>// 01 · how it works</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        Three minutes, <em>on-device</em>, no uploads.
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 640, marginTop: 24 }}>
        BAW runs a 1.3B-parameter vision-language model in WebGPU + WASM, right
        in your browser. The model loads once, then every outfit scoring call is
        local — no API key, no cloud round-trip, no privacy footprint.
      </p>

      <div className="prose-baw" style={{ marginTop: 64 }}>
        <h2>The signal</h2>
        <p>
          Two images go in. The model outputs a four-axis vector — silhouette,
          palette, texture, occasion fit — plus an overall score 0-10. Every
          comment is generated against a fashion-specific prompt library we
          curated with stylists and buyers.
        </p>

        <h2>The privacy</h2>
        <p>
          We treat your wardrobe the way a good tailor treats your measurements.
          We don&rsquo;t store them, log them, or upload them. Open DevTools while
          you score an outfit: zero outbound requests. That&rsquo;s the bar.
        </p>

        <h2>The WebMCP layer</h2>
        <p>
          The same wardrobe, the same scoring engine — but exposed as native
          browser tools. An agent you trust can call <code>list_wardrobe</code>,
          <code> analyze_outfit</code>, <code>propose_outfit</code>, and friends
          through <code>document.modelContext</code>. You stay in the loop on
          every destructive call.
        </p>

        <h2>The loop</h2>
        <ul>
          <li>Day 1: Add the pieces you actually wear.</li>
          <li>Day 7: BAW spots the over-wearers and the sleeping giants.</li>
          <li>Day 30: Utilisation up, decisions faster, &ldquo;what do I wear&rdquo; is no longer a 20-minute problem.</li>
        </ul>

        <h2>What it isn&rsquo;t</h2>
        <ul>
          <li>It&rsquo;s not a shopping tool. We don&rsquo;t link to SKUs.</li>
          <li>It&rsquo;s not a social feed. Your looks are yours.</li>
          <li>It&rsquo;s not a fashion model. It&rsquo;s a stylist — quiet, specific, accountable.</li>
        </ul>

        <div style={{ marginTop: 56, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/stylelab" className="btn btn-primary">Open the Style Lab →</Link>
          <Link href="/stylist" className="btn btn-ghost">Meet the Pair Stylist</Link>
        </div>
      </div>
    </main>
  );
}
