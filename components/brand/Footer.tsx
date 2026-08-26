import Link from 'next/link';

export function Footer() {
  return (
    <footer className="foot">
      <div className="container-x">
        <div className="foot-big">
          Black. White. <em>You.</em>
        </div>
        <div className="foot-meta">
          <div>
            BAW · Black and White. Dressed by intelligence. <br />
            Built for the WebMCP Challenge 2026.
          </div>
          <div>
            v0.1.0 · private beta ·{' '}
            <Link href="/stylelab" style={{ textDecoration: 'underline' }}>
              try the demo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
