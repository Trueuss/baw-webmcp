import Link from 'next/link';

export const metadata = { title: 'Privacy' };

export default function Privacy() {
  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>// 03 · privacy by design</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        Your wardrobe. Your face. <em>Only yours.</em>
      </h1>

      <div className="prose-baw" style={{ marginTop: 64 }}>
        <p style={{ fontSize: 20, color: 'var(--ink-soft)' }}>
          The single product principle at BAW: <em>nothing leaves the device unless you send it.</em>
        </p>

        <h2>1 · On-device by default</h2>
        <p>
          The default scoring engine is a 1.3B-parameter vision-language model
          that runs in WebGPU + WASM, with a quantised checkpoint that fits on
          a modern phone NPU. The model loads once, then every inference is
          local. There is no server-side scoring path in the default config.
        </p>

        <h2>2 · Zero retention</h2>
        <p>
          We do not retain thumbnails, embeddings, intermediate tensors, or
          &ldquo;service improvement&rdquo; copies of any image. The wardrobe and
          history stores live in your browser&rsquo;s local storage and
          IndexedDB. They evaporate with the tab.
        </p>

        <h2>3 · Verifiable</h2>
        <p>
          The client is open source. Open DevTools → Network while you score
          an outfit. Count the outbound requests. We will send a year of
          Studio to anyone who finds a single unexpected one.
        </p>

        <h2>4 · The WebMCP surface</h2>
        <p>
          When you give an agent access to your BAW, that agent can call
          tools like <code>list_wardrobe</code>, <code>analyze_outfit</code>,
          and <code>propose_outfit</code> — but only against the wardrobe
          that lives in your browser. The agent does not get a copy of
          your data, only callable handles.
        </p>

        <h2>5 · When you choose to upgrade</h2>
        <p>
          The optional Studio tier uses a stronger 7B vision model in the
          cloud for richer analysis. When you opt in, BAW sends a single
          request per scoring call, with explicit user confirmation each
          time, and never trains on your images.
        </p>

        <h2>6 · What we do collect</h2>
        <ul>
          <li>Anonymous usage of the marketing site (no third-party trackers).</li>
          <li>Crash reports, only with your explicit opt-in.</li>
          <li>Beta email addresses, only to send you an invite.</li>
        </ul>

        <div style={{ marginTop: 56, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/stylelab" className="btn btn-primary">Try the local model →</Link>
          <Link href="/how" className="btn btn-ghost">How the model works</Link>
        </div>
      </div>
    </main>
  );
}
