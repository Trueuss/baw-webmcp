'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production you would log this to your error reporting service.
    // For the demo we log to console so judges can see the trace.
    // eslint-disable-next-line no-console
    console.error('BAW route error', error);
  }, [error]);

  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120, textAlign: 'center' }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>// 503 · something tore</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)' }}>
        The look didn&rsquo;t <em>land</em>.
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
        An exception bubbled up while rendering this page. The wardrobe is
        still safe — local data, no upload — but the route needs another go.
      </p>
      {error.digest && (
        <p
          className="mono"
          style={{ marginTop: 18, fontSize: 12, color: 'var(--muted-2)' }}
        >
          digest · {error.digest}
        </p>
      )}
      <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={reset} className="btn btn-primary">Try again →</button>
        <Link href="/" className="btn btn-ghost">Back home</Link>
      </div>
    </main>
  );
}
