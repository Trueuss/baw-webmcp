import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120, textAlign: 'center' }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>// 404 · not in the wardrobe</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)' }}>
        Nothing <em>here</em>.
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
        The page you&rsquo;re looking for isn&rsquo;t part of the lookbook. Try
        one of the rooms that exist.
      </p>
      <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn-primary">Home</Link>
        <Link href="/stylelab" className="btn btn-ghost">Style Lab</Link>
        <Link href="/stylist" className="btn btn-ghost">Pair Stylist</Link>
      </div>
    </main>
  );
}
